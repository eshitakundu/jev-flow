export const categories = [
  "Billing",
  "Account access",
  "Technical issue",
  "General question",
] as const;

export const urgencies = ["Urgent", "Normal"] as const;

export type Category = (typeof categories)[number];
export type Urgency = (typeof urgencies)[number];
export type Destination = "Human review" | "Priority queue" | "Standard queue";

export type Evaluation = {
  category: Category;
  urgency: Urgency;
  categoryConfidence?: number;
  urgencyConfidence?: number;
  source: "sample" | "live";
  latencyMs?: number;
  providerResponse?: unknown;
};

export type RoutingDecision = {
  destination: Destination;
  team: Category;
  reason: string;
};
