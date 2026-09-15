import { randomUUID } from "crypto";
import { createRepository } from "../repositories/createRepository";
import { IMistake, MistakeSchema } from "../models/Mistake";

const mistakes = createRepository<IMistake>("Mistake", MistakeSchema);

/**
 * Given the clinical-engine's reasoning-analysis result for a completed
 * session, updates the student's persistent Mistake Memory: increments
 * frequency/confidence for patterns seen before, or creates a new record
 * for a pattern seen for the first time.
 */
export async function recordMistakesFromReasoning(
  studentId: string,
  caseId: string,
  sessionId: string,
  reasoning: { flags: { id: string; label: string; detected: boolean }[] }
) {
  const domain = "Cardiology"; // MVP: single active domain
  const now = new Date().toISOString();

  for (const flag of reasoning.flags) {
    if (!flag.detected) continue;

    const existing = (
      await mistakes.find({ studentId, mistakeType: flag.id } as Partial<IMistake>)
    )[0];

    if (existing) {
      const newFrequency = existing.frequency + 1;
      await mistakes.updateById(existing._id, {
        frequency: newFrequency,
        confidence: Math.min(0.95, existing.confidence + 0.15),
        severity: newFrequency >= 3 ? "high" : newFrequency === 2 ? "moderate" : "low",
        lastSeen: now,
        supportingSessions: [...existing.supportingSessions, sessionId],
        resolved: false,
      });
    } else {
      await mistakes.create({
        _id: randomUUID(),
        studentId,
        mistakeType: flag.id,
        domain,
        topic: caseId,
        frequency: 1,
        severity: "low",
        confidence: 0.5,
        firstSeen: now,
        lastSeen: now,
        resolved: false,
        supportingSessions: [sessionId],
      });
    }
  }
}

export async function getMistakesForStudent(studentId: string) {
  return mistakes.find({ studentId } as Partial<IMistake>, { sort: "frequency", sortDir: -1 });
}

export { mistakes as mistakeRepository };
