import { randomUUID } from "crypto";
import { createRepository } from "../repositories/createRepository";
import { IRecommendation, RecommendationSchema } from "../models/Recommendation";
import { getMistakesForStudent } from "./mistakeMemoryService";
import { getCompetency } from "./competencyService";
import { clinicalEngineClient } from "./clinicalEngineClient";

const recommendations = createRepository<IRecommendation>("Recommendation", RecommendationSchema);

// Maps a reasoning-error pattern to the kind of case/skill practice that
// would challenge it, and to a human-readable explanation the student sees.
const MISTAKE_TO_FOCUS: Record<string, { skill: string; explanation: string }> = {
  premature_closure: {
    skill: "gathering both history/exam and key investigations before deciding",
    explanation: "You've repeatedly finalized a decision before reviewing the most discriminating investigations.",
  },
  anchoring: {
    skill: "updating your differential list as new evidence arrives",
    explanation: "You've tended to keep an early working diagnosis even after disconfirming evidence appeared.",
  },
  confirmation_bias: {
    skill: "actively seeking disconfirming evidence, not just supportive findings",
    explanation: "You've tended to skip history/exam items that could challenge your leading differential.",
  },
  failure_alternatives: {
    skill: "maintaining a broader differential diagnosis list",
    explanation: "You've tended to commit to very few differentials before deciding.",
  },
  evidence_misinterpretation: {
    skill: "interpreting investigation results correctly",
    explanation: "You've reviewed the right evidence but drawn an incorrect conclusion from it more than once.",
  },
  ignoring_red_flags: {
    skill: "selecting discriminating investigations",
    explanation: "You've repeatedly missed history or exam items that would have changed your management.",
  },
  poor_investigation_selection: {
    skill: "selecting discriminating investigations",
    explanation: "You've tended to order low-yield tests before the fast, discriminating ones.",
  },
  failure_to_update: {
    skill: "updating your management plan when evidence changes",
    explanation: "Your final decisions have sometimes not reflected the evidence you'd already gathered.",
  },
  incorrect_prioritization: {
    skill: "prioritizing high-yield actions first",
    explanation: "You've pursued lower-value pathways before quick, informative checks that would guide your plan.",
  },
};

export async function generateRecommendation(studentId: string) {
  const mistakes = await getMistakesForStudent(studentId);
  const competency = await getCompetency(studentId);
  let cases: any[] = [];
  try {
    cases = await clinicalEngineClient.listCases();
  } catch {
    cases = [];
  }

  if (!cases || cases.length === 0) {
    return null;
  }

  const topMistake = mistakes.filter((m) => !m.resolved).sort((a, b) => b.confidence - a.confidence)[0];

  let reason: string;
  let basedOnMistakeIds: string[] = [];
  let targetDifficulty: "beginner" | "intermediate" | "advanced" = "intermediate";

  if (topMistake) {
    const focus = MISTAKE_TO_FOCUS[topMistake.mistakeType] || {
      skill: "clinical reasoning",
      explanation: "A recurring reasoning pattern was detected across your recent sessions.",
    };
    reason =
      `${focus.explanation} Practice a Cardiology case focused on ${focus.skill} ` +
      `(detected ${topMistake.frequency}x, confidence ${(topMistake.confidence * 100).toFixed(0)}%).`;
    basedOnMistakeIds = [topMistake._id];
    targetDifficulty = topMistake.frequency >= 3 ? "advanced" : "intermediate";
  } else if (competency && competency.casesCompleted > 0) {
    reason = `Your reasoning score is ${competency.reasoningScore}/100 — practice another case to keep building consistency.`;
    targetDifficulty = competency.reasoningScore >= 80 ? "advanced" : "intermediate";
  } else {
    reason = "Start with the flagship Acute Coronary Syndrome case to establish your baseline.";
    targetDifficulty = "intermediate";
  }

  const candidateCases = cases.filter((c: any) => c.difficulty === targetDifficulty);
  const chosen = candidateCases[0] || cases[0];

  const record = await recommendations.create({
    _id: randomUUID(),
    studentId,
    recommendedCaseId: chosen.id,
    reason,
    basedOnMistakeIds,
    createdAt: new Date().toISOString(),
    dismissed: false,
  });

  return { ...record, case: chosen };
}

export { recommendations as recommendationRepository };
