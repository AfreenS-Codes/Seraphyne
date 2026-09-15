import { Schema } from "mongoose";

/**
 * Stores the Bayesian evidence-update trajectory computed by the
 * clinical-engine for a given session, so it can be replayed in the
 * Post-Case Report / Bayesian Analysis screen without recomputation.
 */
export interface IBayesianEvidence {
  _id: string;
  sessionId: string;
  caseId: string;
  studentId: string;
  trajectory: any[];
  finalProbabilities: Record<string, number>;
  mostLikelyDiagnosis: string;
  computedAt: string;
}

export const BayesianEvidenceSchema = new Schema<IBayesianEvidence>({
  _id: { type: String, required: true },
  sessionId: { type: String, required: true, index: true },
  caseId: { type: String, required: true },
  studentId: { type: String, required: true, index: true },
  trajectory: { type: [Schema.Types.Mixed], default: [] } as any,
  finalProbabilities: { type: Schema.Types.Mixed, default: {} },
  mostLikelyDiagnosis: { type: String, required: true },
  computedAt: { type: String, required: true },
});
