import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("seraphyne_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string; role: string };
}

export const authApi = {
  signup: (email: string, password: string, name: string) =>
    api.post<AuthResponse>("/auth/signup", { email, password, name }).then((r) => r.data),
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};

export const caseApi = {
  list: () => api.get("/cases").then((r) => r.data),
  get: (caseId: string) => api.get(`/cases/${caseId}`).then((r) => r.data),
};

export const sessionApi = {
  start: (caseId: string) => api.post("/sessions/start", { caseId }).then((r) => r.data),
  get: (sessionId: string) => api.get(`/sessions/${sessionId}`).then((r) => r.data),
  recordAction: (sessionId: string, actionType: string, itemId: string, label?: string) =>
    api.post(`/sessions/${sessionId}/actions`, { actionType, itemId, label }).then((r) => r.data),
  updateDifferentials: (sessionId: string, differentialIds: string[]) =>
    api.post(`/sessions/${sessionId}/differentials`, { differentialIds }).then((r) => r.data),
  runBayesian: (sessionId: string) => api.post(`/sessions/${sessionId}/bayesian`).then((r) => r.data),
  submitDecision: (sessionId: string, decisionId: string) =>
    api.post(`/sessions/${sessionId}/decision`, { decisionId }).then((r) => r.data),
};

export const platformApi = {
  dashboard: () => api.get("/dashboard").then((r) => r.data),
  mistakes: () => api.get("/mistakes").then((r) => r.data),
  recommendations: () => api.get("/recommendations").then((r) => r.data),
  aiCompanionHealth: () => api.get("/ai-companion/health").then((r) => r.data),
  askCompanion: (payload: any) => api.post("/ai-companion/ask", payload).then((r) => r.data),
};
