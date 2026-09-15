import { Schema } from "mongoose";

/**
 * Records a student's differential-diagnosis selection during a session
 * (a normalized, queryable log — CaseSession also keeps the current
 * differentialIds array for quick access during an active session).
 */
export interface IDifferential {
  _id: string;
  sessionId: string;
  studentId: string;
  caseId: string;
  diagnosisId: string;
  diagnosisName: string;
  selectedAt: string;
  wasGroundTruth: boolean;
}

export const DifferentialSchema = new Schema<IDifferential>({
  _id: { type: String, required: true },
  sessionId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  caseId: { type: String, required: true },
  diagnosisId: { type: String, required: true },
  diagnosisName: { type: String, required: true },
  selectedAt: { type: String, required: true },
  wasGroundTruth: { type: Boolean, required: true },
});
