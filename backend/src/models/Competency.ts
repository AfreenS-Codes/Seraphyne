import { Schema } from "mongoose";

export interface ICompetency {
  _id: string;
  studentId: string;
  domain: string;
  competencyScore: number; // 0-100
  reasoningScore: number; // 0-100
  casesCompleted: number;
  history: { sessionId: string; date: string; score: number }[];
  updatedAt: string;
}

export const CompetencySchema = new Schema<ICompetency>({
  _id: { type: String, required: true },
  studentId: { type: String, required: true, index: true },
  domain: { type: String, required: true },
  competencyScore: { type: Number, default: 0 },
  reasoningScore: { type: Number, default: 0 },
  casesCompleted: { type: Number, default: 0 },
  history: { type: [Schema.Types.Mixed], default: [] } as any,
  updatedAt: { type: String, required: true },
});
