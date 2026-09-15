import { randomUUID } from "crypto";
import { createRepository } from "../repositories/createRepository";
import { CaseSessionSchema, ICaseSession } from "../models/CaseSession";
import { StudentActionSchema, IStudentAction } from "../models/StudentAction";
import { DifferentialSchema, IDifferential } from "../models/Differential";
import { BayesianEvidenceSchema, IBayesianEvidence } from "../models/BayesianEvidence";
import { clinicalEngineClient } from "./clinicalEngineClient";
import { HttpError } from "../middleware/errorHandler";
import { recordMistakesFromReasoning } from "./mistakeMemoryService";
import { updateCompetencyAfterSession } from "./competencyService";

const sessions = createRepository<ICaseSession>("CaseSession", CaseSessionSchema);
const actions = createRepository<IStudentAction>("StudentAction", StudentActionSchema);
const differentials = createRepository<IDifferential>("Differential", DifferentialSchema);
const bayesianEvidence = createRepository<IBayesianEvidence>("BayesianEvidence", BayesianEvidenceSchema);

export async function startSession(studentId: string, caseId: string) {
  // Confirms the case exists (via clinical-engine) before creating a session.
  await clinicalEngineClient.getCase(caseId);
  const session = await sessions.create({
    _id: randomUUID(),
    caseId,
    studentId,
    currentStage: "presentation",
    historyActionIds: [],
    examinationActionIds: [],
    investigationActionIds: [],
    differentialIds: [],
    decisionId: null,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    completedAt: null,
  });
  return session;
}

async function getOwnedSession(sessionId: string, studentId: string): Promise<ICaseSession> {
  const session = await sessions.findById(sessionId);
  if (!session) throw new HttpError(404, "Session not found.", "session_not_found");
  if (session.studentId !== studentId) {
    throw new HttpError(403, "This session does not belong to you.", "forbidden");
  }
  return session;
}

export async function recordAction(
  sessionId: string,
  studentId: string,
  actionType: "history" | "examination" | "investigation",
  itemId: string,
  label?: string
) {
  const session = await getOwnedSession(sessionId, studentId);
  const listField =
    actionType === "history"
      ? "historyActionIds"
      : actionType === "examination"
      ? "examinationActionIds"
      : "investigationActionIds";
  const list = (session as any)[listField] as string[];
  const alreadyTaken = list.includes(itemId);
  if (!alreadyTaken) list.push(itemId);

  const revealed = await clinicalEngineClient.revealFinding(session.caseId, actionType, itemId);

  if (!alreadyTaken) {
    const seq =
      session.historyActionIds.length + session.examinationActionIds.length + session.investigationActionIds.length;
    await actions.create({
      _id: randomUUID(),
      sessionId,
      studentId,
      actionType,
      itemId,
      label: label || revealed.label,
      timestamp: new Date().toISOString(),
      sequenceIndex: seq,
    });
  }

  const nextStage =
    actionType === "investigation" && list.length > 0 ? "investigations" : (actionType as any);
  const updatedSession = await sessions.updateById(sessionId, {
    [listField]: list,
    currentStage: nextStage,
  } as any);
  return { session: updatedSession, revealed };
}

export async function updateDifferentials(sessionId: string, studentId: string, differentialIds: string[]) {
  const session = await getOwnedSession(sessionId, studentId);
  const caseData = await clinicalEngineClient.getCase(session.caseId);
  const nameById = new Map<string, string>(
    caseData.differential_options.map((d: any) => [d.id, d.name])
  );

  for (const diagnosisId of differentialIds) {
    if (!session.differentialIds.includes(diagnosisId)) {
      await differentials.create({
        _id: randomUUID(),
        sessionId,
        studentId,
        caseId: session.caseId,
        diagnosisId,
        diagnosisName: nameById.get(diagnosisId) || diagnosisId,
        selectedAt: new Date().toISOString(),
        wasGroundTruth: false, // ground truth is hidden; resolved later in reasoning analysis
      });
    }
  }
  return sessions.updateById(sessionId, { differentialIds, currentStage: "differential" });
}

export async function runBayesianUpdate(sessionId: string, studentId: string) {
  const session = await getOwnedSession(sessionId, studentId);
  const riskFactorHistoryIds = session.historyActionIds.filter((id) => id.startsWith("h_risk_"));
  const result = await clinicalEngineClient.bayesianUpdate({
    case_id: session.caseId,
    session_id: sessionId,
    ordered_investigation_ids: session.investigationActionIds,
    risk_factor_history_ids: riskFactorHistoryIds,
  });
  await bayesianEvidence.create({
    _id: randomUUID(),
    sessionId,
    caseId: session.caseId,
    studentId,
    trajectory: result.trajectory,
    finalProbabilities: result.final_probabilities,
    mostLikelyDiagnosis: result.most_likely_diagnosis,
    computedAt: new Date().toISOString(),
  });
  await sessions.updateById(sessionId, { bayesianResult: result, currentStage: "bayesian" });
  return result;
}

export async function submitDecision(sessionId: string, studentId: string, decisionId: string) {
  const session = await getOwnedSession(sessionId, studentId);
  await actions.create({
    _id: randomUUID(),
    sessionId,
    studentId,
    actionType: "decision",
    itemId: decisionId,
    timestamp: new Date().toISOString(),
    sequenceIndex:
      session.historyActionIds.length +
      session.examinationActionIds.length +
      session.investigationActionIds.length +
      1,
  });

  const outcome = await clinicalEngineClient.resolveOutcome({ case_id: session.caseId, decision_id: decisionId });

  const reasoning = await clinicalEngineClient.analyzeReasoning({
    case_id: session.caseId,
    session_id: sessionId,
    history_ids: session.historyActionIds,
    examination_ids: session.examinationActionIds,
    investigation_ids_in_order: session.investigationActionIds,
    differential_ids_selected: session.differentialIds,
    decision_id: decisionId,
  });

  let mlPrediction = null;
  try {
    mlPrediction = await clinicalEngineClient.mlPredict({ case_id: session.caseId, session_id: sessionId });
  } catch {
    mlPrediction = null; // ML unavailable shouldn't block the rest of the journey
  }

  const counterfactual = await clinicalEngineClient.counterfactual({
    case_id: session.caseId,
    session_id: sessionId,
    actual_investigation_ids: session.investigationActionIds,
  });

  const updated = await sessions.updateById(sessionId, {
    decisionId,
    outcomeResult: outcome,
    reasoningResult: reasoning,
    mlPredictionResult: mlPrediction,
    counterfactualResult: counterfactual,
    status: "completed",
    completedAt: new Date().toISOString(),
    currentStage: "complete",
  });

  await recordMistakesFromReasoning(studentId, session.caseId, sessionId, reasoning);
  await updateCompetencyAfterSession(studentId, session.caseId, sessionId, reasoning);

  return { session: updated, outcome, reasoning, mlPrediction, counterfactual };
}

export async function getSession(sessionId: string, studentId: string) {
  return getOwnedSession(sessionId, studentId);
}

export async function listSessionsForStudent(studentId: string) {
  return sessions.find({ studentId } as Partial<ICaseSession>, { sort: "startedAt", sortDir: -1 });
}

export { sessions as caseSessionRepository };
