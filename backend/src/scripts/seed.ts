/**
 * Seeds a demo account so the app opens into a populated state.
 *
 * Usage: npm run seed  (with the backend and clinical-engine both running)
 *
 * This inserts data through the real HTTP API (not by writing to the DB
 * directly), so it exercises exactly the same code path a real student
 * would — the "demo data" is a real completed session, not a fabricated
 * display value.
 */
import axios from "axios";

const BASE = process.env.SEED_BASE_URL || "http://localhost:4000/api/v1";
const DEMO_EMAIL = "demo@seraphyne.app";
const DEMO_PASSWORD = "seraphyne-demo-2026";

async function main() {
  console.log(`[seed] Target: ${BASE}`);
  let token: string;
  try {
    const signup = await axios.post(`${BASE}/auth/signup`, {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      name: "Demo Student",
    });
    token = signup.data.token;
    console.log("[seed] Created demo account:", DEMO_EMAIL);
  } catch (err: any) {
    if (err.response?.status === 409) {
      const login = await axios.post(`${BASE}/auth/login`, { email: DEMO_EMAIL, password: DEMO_PASSWORD });
      token = login.data.token;
      console.log("[seed] Demo account already exists, logged in instead.");
    } else {
      throw err;
    }
  }

  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // Run one complete, good-reasoning session on the flagship ACS case so
  // the dashboard/analytics/mistake-memory screens have real, non-empty data.
  const session = (await axios.post(`${BASE}/sessions/start`, { caseId: "acs-001" }, auth)).data;
  const sid = session._id;

  const history = ["h_onset", "h_radiation", "h_associated", "h_exertion", "h_risk_smoking", "h_risk_diabetes"];
  for (const id of history) {
    await axios.post(`${BASE}/sessions/${sid}/actions`, { actionType: "history", itemId: id }, auth);
  }
  await axios.post(`${BASE}/sessions/${sid}/actions`, { actionType: "examination", itemId: "e_pulses" }, auth);
  for (const id of ["i_ecg", "i_troponin_0h", "i_troponin_3h"]) {
    await axios.post(`${BASE}/sessions/${sid}/actions`, { actionType: "investigation", itemId: id }, auth);
  }
  await axios.post(`${BASE}/sessions/${sid}/differentials`, { differentialIds: ["nstemi", "stable_angina"] }, auth);
  await axios.post(`${BASE}/sessions/${sid}/bayesian`, {}, auth);
  await axios.post(`${BASE}/sessions/${sid}/decision`, { decisionId: "d_acs_pathway" }, auth);

  console.log("[seed] Completed one demo session on acs-001 (good-reasoning path).");
  console.log(`[seed] Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error("[seed] Failed:", err?.response?.data || err.message);
  process.exit(1);
});
