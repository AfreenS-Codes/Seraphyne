import { Schema } from "mongoose";

/**
 * Cached per-student analytics snapshot, refreshed whenever a session
 * completes. The dashboard reads this rather than recomputing aggregates
 * on every request; it is still always derived from CaseSession/Mistake/
 * Competency data, never fabricated.
 */
export interface IAnalytics {
  _id: string;
  studentId: string;
  casesCompleted: number;
  averageReasoningScore: number;
  domainProgress: Record<string, number>;
  commonMistakes: { mistakeType: string; frequency: number }[];
  improvementTrend: { date: string; score: number }[];
  updatedAt: string;
}

export const AnalyticsSchema = new Schema<IAnalytics>({
  _id: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  casesCompleted: { type: Number, default: 0 },
  averageReasoningScore: { type: Number, default: 0 },
  domainProgress: { type: Schema.Types.Mixed, default: {} },
  commonMistakes: { type: [Schema.Types.Mixed], default: [] } as any,
  improvementTrend: { type: [Schema.Types.Mixed], default: [] } as any,
  updatedAt: { type: String, required: true },
});
