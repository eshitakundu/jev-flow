import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { defaultDescriptions, MAX_BODY_BYTES } from "@/lib/validation";
const input = {
  message: "Please send my invoice.",
  descriptions: defaultDescriptions,
};
const request = (body: unknown) =>
  new Request("http://localhost/api/evaluate", {
    method: "POST",
    body: JSON.stringify(body),
  });
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("evaluate endpoint", () => {
  it("never calls a provider when disabled, even with a key", async () => {
    vi.stubEnv("ENABLE_LIVE_JEV", "false");
    vi.stubEnv("OPENCODE_API_KEY", "test");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await POST(request(input))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    { ...input, message: " " },
    { ...input, message: "x".repeat(4001) },
    { ...input, descriptions: {} },
    {
      ...input,
      descriptions: { ...defaultDescriptions, Billing: "x".repeat(301) },
    },
    { ...input, model: "paid-model" },
  ])("rejects invalid input before calling the provider", async (body) => {
    vi.stubEnv("ENABLE_LIVE_JEV", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await POST(request(body))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("limits bodies without a content-length header", async () => {
    vi.stubEnv("ENABLE_LIVE_JEV", "true");
    expect((await POST(request("x".repeat(MAX_BODY_BYTES + 1)))).status).toBe(
      413,
    );
  });
  it("rejects malformed JSON", async () => {
    vi.stubEnv("ENABLE_LIVE_JEV", "true");
    expect(
      (
        await POST(
          new Request("http://localhost", { method: "POST", body: "{" }),
        )
      ).status,
    ).toBe(400);
  });
  it("uses exactly the free model and maps selected probabilities to percent", async () => {
    vi.stubEnv("ENABLE_LIVE_JEV", "true");
    vi.stubEnv("OPENCODE_API_KEY", "test-secret");
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        model: "jev-1.13-free",
        answers: {
          category: {
            type: "choice",
            choice: "Billing",
            probabilities: { Billing: 0.95 },
          },
          urgency: {
            type: "choice",
            choice: "Normal",
            probabilities: { Normal: 0.91 },
          },
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request(input));
    const data = await response.json();
    expect(data.categoryConfidence).toBe(95);
    expect(data.urgencyConfidence).toBe(91);
    expect(data.source).toBe("live");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.model).toBe("jev-1.13-free");
    expect(Object.keys(sent.questions)).toEqual(["category", "urgency"]);
    expect(JSON.stringify(data)).not.toContain("test-secret");
  });
  it("does not fabricate missing confidence", async () => {
    vi.stubEnv("ENABLE_LIVE_JEV", "true");
    vi.stubEnv("OPENCODE_API_KEY", "test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          answers: {
            category: { type: "choice", choice: "Billing" },
            urgency: { type: "choice", choice: "Normal" },
          },
        }),
      ),
    );
    expect(
      (await (await POST(request(input))).json()).categoryConfidence,
    ).toBeUndefined();
  });
  it("sanitizes failures without retries or sample fallback", async () => {
    vi.stubEnv("ENABLE_LIVE_JEV", "true");
    vi.stubEnv("OPENCODE_API_KEY", "test");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response("private upstream details", { status: 402 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request(input));
    const text = await response.text();
    expect(response.status).toBe(502);
    expect(text).not.toContain("private upstream");
    expect(text).toContain("No paid model");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("explains a free-allowance limit using the provider retry header", async () => {
    vi.stubEnv("ENABLE_LIVE_JEV", "true");
    vi.stubEnv("OPENCODE_API_KEY", "test");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("private upstream details", {
        status: 429,
        headers: { "Retry-After": "7524" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request(input));
    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toContain("free usage allowance");
    expect(data.error).toContain("126 minutes");
    expect(data.error).not.toContain("private upstream");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
