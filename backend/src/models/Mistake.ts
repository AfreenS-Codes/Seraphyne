import { Schema } from "mongoose";

/**
 * Persistent Mistake Memory: tracks a student's recurring educational
 * reasoning-error patterns across sessions (see clinical-engine's
 * reasoning-error catalog for the pattern taxonomy). Frequency/confidence
 * increase as the same pattern is detected in more sessions.
 */
export interface IMistake {
  _id: string;
  studentId: string;
  mistakeType: string; // e.g. "anchoring", "premature_closure"
  domain: string;
  topic: string;
  frequency: number;
  severity: "low" | "moderate" | "high";
  confidence: number; // 0-1, increases with repeated detection
  firstSeen: string;
  lastSeen: string;
  resolved: boolean;
  supportingSessions: string[];
}

export const MistakeSchema = new Schema<IMistake>({
  _id: { type: String, required: true },
  studentId: { type: String, required: true, index: true },
  mistakeType: { type: String, required: true },
  domain: { type: String, required: true },
  topic: { type: String, required: true },
  frequency: { type: Number, default: 1 },
  severity: { type: String, enum: ["low", "moderate", "high"], default: "low" },
  confidence: { type: Number, default: 0.5 },
  firstSeen: { type: String, required: true },
  lastSeen: { type: String, required: true },
  resolved: { type: Boolean, default: false },
  supportingSessions: { type: [String], default: [] },
});
