import {
  responseSchema,
  buildQuestions,
  type EvaluationInput,
} from "./validation";
import type { Evaluation } from "./types";

// Fixed endpoint and free model: clients cannot substitute a paid model.
export const FREE_MODEL = "jev-1.13-free";
export class JevError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}
export async function evaluateJev(input: EvaluationInput): Promise<Evaluation> {
  const key = process.env.OPENCODE_API_KEY;
  if (!key)
    throw new JevError(
      "Add OPENCODE_API_KEY to web/.env.local, then restart the server. Never paste the key into chat.",
      503,
    );
  const started = performance.now();
  let response: Response;
  try {
    response = await fetch(
      "https://opencode.ai/inference/systemone/v1/systemone",
      {
        method: "POST",
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: FREE_MODEL,
          state: input.message,
          questions: buildQuestions(input.descriptions),
        }),
      },
    );
  } catch {
    throw new JevError(
      "Jev could not be reached within 20 seconds. No automatic retry was made.",
    );
  }
  if (!response.ok) {
    const retryAfter = response.headers.get("retry-after");
    const retryMinutes =
      retryAfter && /^\d+$/.test(retryAfter)
        ? Math.ceil(Number(retryAfter) / 60)
        : null;
    const message =
      response.status === 401 || response.status === 403
        ? "OpenCode rejected access. Check your local API key and free-model access."
        : response.status === 429
          ? retryMinutes && retryMinutes > 5
            ? `OpenCode's free usage allowance has been reached. The provider asks you to try again in about ${retryMinutes} minutes. No paid fallback was called. Sample mode is available now.`
            : "OpenCode's free model is rate limited. Wait before trying again. No paid fallback was called."
          : response.status === 402
            ? "Free Jev access is unavailable for this account. No paid model was called. Use sample mode."
            : "OpenCode's free Jev request failed. No paid fallback or automatic retry was made.";
    throw new JevError(message, response.status === 429 ? 429 : 502);
  }
  const parsed = responseSchema.safeParse(await response.json());
  if (!parsed.success)
    throw new JevError(
      "Jev returned an unsupported response. No sample result was substituted.",
    );
  const { category, urgency } = parsed.data.answers;
  return {
    category: category.choice,
    urgency: urgency.choice,
    categoryConfidence:
      category.probabilities?.[category.choice] === undefined
        ? undefined
        : category.probabilities[category.choice] * 100,
    urgencyConfidence:
      urgency.probabilities?.[urgency.choice] === undefined
        ? undefined
        : urgency.probabilities[urgency.choice] * 100,
    source: "live",
    latencyMs: Math.round(performance.now() - started),
    providerResponse: parsed.data,
  };
}
