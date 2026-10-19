import type { Evaluation } from "@/lib/types";

export type SampleFixture = {
  id: string;
  label: string;
  message: string;
  evaluation: Evaluation;
};

export const sampleFixtures: SampleFixture[] = [
  {
    id: "normal-billing",
    label: "Confident normal request",
    message: "Could you send me a copy of my last billing invoice?",
    evaluation: {
      category: "Billing",
      urgency: "Normal",
      categoryConfidence: 96,
      urgencyConfidence: 92,
      source: "sample",
    },
  },
  {
    id: "urgent-access",
    label: "Confident urgent request",
    message:
      "I am locked out of my account and need access before my presentation in an hour.",
    evaluation: {
      category: "Account access",
      urgency: "Urgent",
      categoryConfidence: 94,
      urgencyConfidence: 91,
      source: "sample",
    },
  },
  {
    id: "ambiguous",
    label: "Ambiguous request",
    message:
      "Something seems wrong with my plan. Can somebody check it when possible?",
    evaluation: {
      category: "General question",
      urgency: "Normal",
      categoryConfidence: 68,
      urgencyConfidence: 74,
      source: "sample",
    },
  },
];
