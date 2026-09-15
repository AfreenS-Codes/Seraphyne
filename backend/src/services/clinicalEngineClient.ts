import axios from "axios";
import { config } from "../config/env";
import { HttpError } from "../middleware/errorHandler";

const client = axios.create({ baseURL: config.clinicalEngineBaseUrl, timeout: 15000 });

async function call<T>(fn: () => Promise<{ data: T }>): Promise<T> {
  try {
    const res = await fn();
    return res.data;
  } catch (err: any) {
    if (err.response) {
      throw new HttpError(
        err.response.status === 404 ? 404 : 502,
        err.response.data?.detail || "Clinical engine request failed",
        "clinical_engine_error"
      );
    }
    throw new HttpError(503, "Clinical engine is unavailable.", "clinical_engine_unavailable");
  }
}

export const clinicalEngineClient = {
  listCases: () => call<any[]>(() => client.get("/api/v1/cases")),
  getCase: (caseId: string) => call<any>(() => client.get(`/api/v1/cases/${caseId}`)),
  revealFinding: (caseId: string, actionType: string, itemId: string) =>
    call<any>(() => client.get(`/api/v1/cases/${caseId}/${actionType}/${itemId}`)),
  bayesianUpdate: (payload: any) => call<any>(() => client.post("/api/v1/bayesian/update", payload)),
  analyzeReasoning: (payload: any) => call<any>(() => client.post("/api/v1/reasoning/analyze", payload)),
  resolveOutcome: (payload: any) => call<any>(() => client.post("/api/v1/outcome/resolve", payload)),
  counterfactual: (payload: any) => call<any>(() => client.post("/api/v1/counterfactual", payload)),
  mlPredict: (payload: any) => call<any>(() => client.post("/api/v1/ml/predict", payload)),
  health: () => call<any>(() => client.get("/health")),
};
