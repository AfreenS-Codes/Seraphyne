import axios from "axios";
import { config } from "../config/env";

export interface AICompanionResult {
  available: boolean;
  answer?: string;
  sources?: any[];
  error?: string;
}

/**
 * Server-to-server integration with the separately-built SERAPHYNE AI Study
 * Companion service (see /mnt/user-data/outputs/seraphyne-llm.zip delivered
 * earlier — POST /api/v1/learning/chat). This adapter:
 *   - never exposes AI_SERVICE_API_KEY to the frontend (it's only read here,
 *     server-side, and attached to the outbound request)
 *   - degrades gracefully: if the AI service is unreachable/unconfigured,
 *     core SERAPHYNE (case simulation, Bayesian, ML, reasoning, mistakes,
 *     recommendations) continues to work; this adapter just reports
 *     unavailability rather than throwing.
 * This file does NOT implement an LLM or re-build the AI service — it only
 * calls it over HTTP.
 */
export async function askStudyCompanion(params: {
  sessionId: string;
  studentId: string;
  domain: string;
  subject?: string;
  topic?: string;
  studentLevel?: string;
  message: string;
}): Promise<AICompanionResult> {
  if (!config.aiServiceBaseUrl) {
    return { available: false, error: "AI Study Companion is not configured on this deployment." };
  }
  try {
    const res = await axios.post(
      `${config.aiServiceBaseUrl}/api/v1/learning/chat`,
      {
        session_id: params.sessionId,
        student_id: params.studentId,
        domain: params.domain,
        subject: params.subject,
        topic: params.topic,
        student_level: params.studentLevel || "intermediate",
        message: params.message,
      },
      {
        timeout: 20000,
        headers: config.aiServiceApiKey ? { Authorization: `Bearer ${config.aiServiceApiKey}` } : {},
      }
    );
    return { available: true, answer: res.data.answer, sources: res.data.sources || [] };
  } catch (err: any) {
    return {
      available: false,
      error: "AI Study Companion is temporarily unavailable. Your simulation progress is safe.",
    };
  }
}

export async function checkStudyCompanionHealth(): Promise<boolean> {
  if (!config.aiServiceBaseUrl) return false;
  try {
    await axios.get(`${config.aiServiceBaseUrl}/health`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
