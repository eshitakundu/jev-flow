import { requestSchema, MAX_BODY_BYTES } from "@/lib/validation";
import { evaluateJev, JevError } from "@/lib/jev.server";

export const runtime = "nodejs";
const error = (message: string, status: number) =>
  Response.json({ error: message }, { status });
export async function POST(request: Request) {
  if (process.env.ENABLE_LIVE_JEV !== "true")
    return error(
      "Live Jev is disabled. Set ENABLE_LIVE_JEV=true and OPENCODE_API_KEY locally, then restart. Sample mode is always free.",
      403,
    );
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES)
    return error("Request is too large.", 413);
  try {
    // Enforce the limit while streaming, including requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return error("A JSON request body is required.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return error("Request is too large.", 413);
      }
      chunks.push(value);
    }
    let body: unknown;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return error("Send valid JSON.", 400);
    }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success)
      return error(
        "Use a message of 1–4,000 characters and four category descriptions of 1–300 characters each.",
        400,
      );
    return Response.json(await evaluateJev(parsed.data));
  } catch (err) {
    return err instanceof JevError
      ? error(err.message, err.status)
      : error(
          "The request could not be completed. No automatic retry was made.",
          502,
        );
  }
}
