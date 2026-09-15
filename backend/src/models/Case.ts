import { Schema } from "mongoose";

/**
 * Lightweight, student-VISIBLE case metadata mirrored from the clinical-
 * engine (the source of truth for full case content, including hidden
 * ground truth — see clinical-engine/app/cases/*.json). This model exists
 * so the main platform can list/filter cases by domain/difficulty in
 * MongoDB without re-implementing clinical content here, and to record
 * which cases belong to which domain/institution catalog.
 */
export interface ICase {
  _id: string; // matches the clinical-engine case id, e.g. "acs-001"
  domain: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  isFlagship: boolean;
  syncedAt: string;
}

export const CaseSchema = new Schema<ICase>({
  _id: { type: String, required: true },
  domain: { type: String, required: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
  isFlagship: { type: Boolean, default: false },
  syncedAt: { type: String, required: true },
});
