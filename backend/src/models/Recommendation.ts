import { Schema } from "mongoose";

export interface IRecommendation {
  _id: string;
  studentId: string;
  recommendedCaseId: string;
  reason: string;
  basedOnMistakeIds: string[];
  createdAt: string;
  dismissed: boolean;
}

export const RecommendationSchema = new Schema<IRecommendation>({
  _id: { type: String, required: true },
  studentId: { type: String, required: true, index: true },
  recommendedCaseId: { type: String, required: true },
  reason: { type: String, required: true },
  basedOnMistakeIds: { type: [String], default: [] },
  createdAt: { type: String, required: true },
  dismissed: { type: Boolean, default: false },
});
