import type { Evaluation, RoutingDecision } from "@/lib/types";

/**
 * Deliberately pure: given the same evaluation and threshold, it always makes
 * the same decision. This keeps policy testable and independent of the UI/API.
 */
export function routeEvaluation(
  evaluation: Evaluation,
  threshold: number,
): RoutingDecision {
  const { categoryConfidence, urgencyConfidence, urgency, category } =
    evaluation;

  if (categoryConfidence === undefined || urgencyConfidence === undefined) {
    return {
      destination: "Human review",
      team: category,
      reason: "A required confidence value is unavailable.",
    };
  }

  if (categoryConfidence < threshold || urgencyConfidence < threshold) {
    return {
      destination: "Human review",
      team: category,
      reason: `At least one confidence value is below the ${threshold}% threshold.`,
    };
  }

  if (urgency === "Urgent") {
    return {
      destination: "Priority queue",
      team: category,
      reason:
        "Both answers meet the confidence threshold and urgency is urgent.",
    };
  }

  return {
    destination: "Standard queue",
    team: category,
    reason: "Both answers meet the confidence threshold and urgency is normal.",
  };
}
