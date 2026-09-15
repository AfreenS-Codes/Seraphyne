import { Schema } from "mongoose";

export interface IStudentAction {
  _id: string;
  sessionId: string;
  studentId: string;
  actionType: "history" | "examination" | "investigation" | "differential" | "decision";
  itemId: string;
  label?: string;
  timestamp: string;
  sequenceIndex: number;
}

export const StudentActionSchema = new Schema<IStudentAction>({
  _id: { type: String, required: true },
  sessionId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  actionType: {
    type: String,
    enum: ["history", "examination", "investigation", "differential", "decision"],
    required: true,
  },
  itemId: { type: String, required: true },
  label: { type: String },
  timestamp: { type: String, required: true },
  sequenceIndex: { type: Number, required: true },
});
