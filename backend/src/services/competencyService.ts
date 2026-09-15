import { randomUUID } from "crypto";
import { createRepository } from "../repositories/createRepository";
import { ICompetency, CompetencySchema } from "../models/Competency";

const competencies = createRepository<ICompetency>("Competency", CompetencySchema);

export async function updateCompetencyAfterSession(
  studentId: string,
  caseId: string,
  sessionId: string,
  reasoning: { correct_diagnosis: boolean; good_reasoning_process: boolean; flags: { detected: boolean }[] }
) {
  const domain = "Cardiology";
  const now = new Date().toISOString();

  const flagCount = reasoning.flags.length || 1;
  const detectedCount = reasoning.flags.filter((f) => f.detected).length;
  // Reasoning score: 100 minus a penalty per detected flag, floored at 0.
  const reasoningScoreThisSession = Math.max(0, Math.round(100 - (detectedCount / flagCount) * 100));
  const diagnosisBonus = reasoning.correct_diagnosis ? 10 : 0;

  let record = (await competencies.find({ studentId, domain } as Partial<ICompetency>))[0];

  if (!record) {
    record = await competencies.create({
      _id: randomUUID(),
      studentId,
      domain,
      competencyScore: Math.min(100, reasoningScoreThisSession + diagnosisBonus) / 2,
      reasoningScore: reasoningScoreThisSession,
      casesCompleted: 1,
      history: [{ sessionId, date: now, score: reasoningScoreThisSession }],
      updatedAt: now,
    });
    return record;
  }

  const newCasesCompleted = record.casesCompleted + 1;
  // Running average, weighted toward recent performance (simple EWMA-style blend).
  const newReasoningScore = Math.round(record.reasoningScore * 0.7 + reasoningScoreThisSession * 0.3);
  const newCompetencyScore = Math.round(
    Math.min(100, record.competencyScore * 0.7 + (reasoningScoreThisSession + diagnosisBonus) * 0.3)
  );

  return competencies.updateById(record._id, {
    reasoningScore: newReasoningScore,
    competencyScore: newCompetencyScore,
    casesCompleted: newCasesCompleted,
    history: [...record.history, { sessionId, date: now, score: reasoningScoreThisSession }],
    updatedAt: now,
  });
}

export async function getCompetency(studentId: string, domain = "Cardiology") {
  return (await competencies.find({ studentId, domain } as Partial<ICompetency>))[0] || null;
}

export { competencies as competencyRepository };
