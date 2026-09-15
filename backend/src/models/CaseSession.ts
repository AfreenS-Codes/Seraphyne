import { Schema } from "mongoose";

export type SessionStage =
  | "presentation"
  | "history"
  | "examination"
  | "investigations"
  | "differential"
  | "bayesian"
  | "decision"
  | "outcome"
  | "reasoning_analysis"
  | "ml_prediction"
  | "counterfactual"
  | "complete";

export interface ICaseSession {
  _id: string;
  caseId: string;
  studentId: string;
  currentStage: SessionStage;
  historyActionIds: string[];
  examinationActionIds: string[];
  investigationActionIds: string[]; // ordered
  differentialIds: string[];
  decisionId: string | null;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  completedAt: string | null;
  // Cached computed results, populated as the student progresses so the
  // Post-Case Report can be reassembled without recomputation.
  bayesianResult?: any;
  reasoningResult?: any;
  outcomeResult?: any;
  mlPredictionResult?: any;
  counterfactualResult?: any;
}

export const CaseSessionSchema = new Schema<ICaseSession>({
  _id: { type: String, required: true },
  caseId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  currentStage: { type: String, required: true, default: "presentation" },
  historyActionIds: { type: [String], default: [] },
  examinationActionIds: { type: [String], default: [] },
  investigationActionIds: { type: [String], default: [] },
  differentialIds: { type: [String], default: [] },
  decisionId: { type: String, default: null },
  status: { type: String, enum: ["in_progress", "completed", "abandoned"], default: "in_progress" },
  startedAt: { type: String, required: true },
  completedAt: { type: String, default: null },
  bayesianResult: { type: Schema.Types.Mixed },
  reasoningResult: { type: Schema.Types.Mixed },
  outcomeResult: { type: Schema.Types.Mixed },
  mlPredictionResult: { type: Schema.Types.Mixed },
  counterfactualResult: { type: Schema.Types.Mixed },
});
