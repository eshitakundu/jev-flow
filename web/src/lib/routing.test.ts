import { describe, expect, it } from "vitest";
import { routeEvaluation } from "@/lib/routing";
import type { Evaluation } from "@/lib/types";

const base: Evaluation = {
  category: "Billing",
  urgency: "Normal",
  categoryConfidence: 90,
  urgencyConfidence: 90,
  source: "sample",
};

describe("routeEvaluation", () => {
  it("checks urgency confidence independently", () => {
    expect(
      routeEvaluation({ ...base, urgencyConfidence: 79 }, 80).destination,
    ).toBe("Human review");
  });
  it("routes missing category confidence to review even for urgent requests", () => {
    expect(
      routeEvaluation(
        { ...base, categoryConfidence: undefined, urgency: "Urgent" },
        80,
      ).destination,
    ).toBe("Human review");
  });
  it("reroutes the same result when policy changes", () => {
    expect(routeEvaluation(base, 89).destination).toBe("Standard queue");
    expect(routeEvaluation(base, 91).destination).toBe("Human review");
    expect(base.categoryConfidence).toBe(90);
  });
  it("sends missing confidence to human review", () => {
    expect(
      routeEvaluation({ ...base, urgencyConfidence: undefined }, 80)
        .destination,
    ).toBe("Human review");
  });

  it("sends below-threshold confidence to human review", () => {
    expect(
      routeEvaluation({ ...base, categoryConfidence: 79 }, 80).destination,
    ).toBe("Human review");
  });

  it("treats the threshold boundary as passing", () => {
    expect(
      routeEvaluation(
        { ...base, categoryConfidence: 80, urgencyConfidence: 80 },
        80,
      ).destination,
    ).toBe("Standard queue");
  });

  it("sends a confident urgent request to priority", () => {
    expect(
      routeEvaluation({ ...base, urgency: "Urgent" }, 80).destination,
    ).toBe("Priority queue");
  });
});
