import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { caseApi, sessionApi } from "../api/client";
import { DigitalTwinSchematic } from "../components/DigitalTwinSchematic";
import { ModelConfidenceCard } from "../components/ModelConfidenceCard";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Stethoscope,
  Activity,
  FileText,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

type Revealed = { label: string; finding: string; detail?: string; critical?: boolean };

interface TimelineStep {
  label: string;
  time: string;
  status: "completed" | "current" | "pending";
}

export function Simulation() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [revealedHistory, setRevealedHistory] = useState<Record<string, Revealed>>({});
  const [revealedExam, setRevealedExam] = useState<Record<string, Revealed>>({});
  const [revealedInv, setRevealedInv] = useState<Record<string, Revealed>>({});
  const [selectedDifferentials, setSelectedDifferentials] = useState<string[]>([]);
  const [bayesian, setBayesian] = useState<any>(null);
  const [decision, setDecision] = useState<string>("d_acs_pathway");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [timelineStep, setTimelineStep] = useState(4); // Intervention 2

  const timeline: TimelineStep[] = [
    { label: "Patient Arrival", time: "00:00", status: "completed" },
    { label: "Initial Assessment", time: "00:06", status: "completed" },
    { label: "Lab Results", time: "00:22", status: "completed" },
    { label: "Intervention 1", time: "00:31", status: "completed" },
    { label: "Physiological Response", time: "00:38", status: "completed" },
    { label: "Intervention 2", time: "00:45", status: "current" },
  ];

  useEffect(() => {
    if (!caseId) return;
    Promise.all([
      caseApi.get(caseId).catch(() => null),
      sessionApi.start(caseId).catch(() => null),
    ])
      .then(([c, s]) => {
        if (c) setCaseData(c);
        if (s) setSession(s);
      })
      .finally(() => setLoading(false));
  }, [caseId]);

  async function doAction(actionType: "history" | "examination" | "investigation", itemId: string) {
    if (!session) {
      // Offline fallback mock
      const item =
        actionType === "history"
          ? caseData?.history_menu?.find((h: any) => h.id === itemId)
          : actionType === "examination"
          ? caseData?.examination_menu?.find((e: any) => e.id === itemId)
          : caseData?.investigation_menu?.find((i: any) => i.id === itemId);

      const mockRevealed = {
        label: item?.label || "Finding",
        finding: item?.finding || "Clinical finding evaluated and documented.",
        detail: item?.detail,
        critical: item?.critical,
      };

      if (actionType === "history") setRevealedHistory((p) => ({ ...p, [itemId]: mockRevealed }));
      if (actionType === "examination") setRevealedExam((p) => ({ ...p, [itemId]: mockRevealed }));
      if (actionType === "investigation") setRevealedInv((p) => ({ ...p, [itemId]: mockRevealed }));
      return;
    }

    try {
      const { session: updated, revealed } = await sessionApi.recordAction(session._id, actionType, itemId);
      setSession(updated);
      if (actionType === "history") setRevealedHistory((p) => ({ ...p, [itemId]: revealed }));
      if (actionType === "examination") setRevealedExam((p) => ({ ...p, [itemId]: revealed }));
      if (actionType === "investigation") setRevealedInv((p) => ({ ...p, [itemId]: revealed }));
    } catch {
      // offline fallback
    }
  }

  function toggleDifferential(id: string) {
    setSelectedDifferentials((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function saveDifferentials() {
    if (session) {
      try {
        const updated = await sessionApi.updateDifferentials(session._id, selectedDifferentials);
        setSession(updated);
      } catch {}
    }
  }

  async function runBayesian() {
    if (session) {
      try {
        const result = await sessionApi.runBayesian(session._id);
        setBayesian(result);
        return;
      } catch {}
    }
    // Fallback display
    setBayesian({
      final_probabilities: {
        nstemi: 0.948,
        stable_angina: 0.036,
        gerd: 0.012,
        aortic_dissection: 0.004,
      },
    });
  }

  async function submitDecision() {
    if (!decision) return;
    setSubmitting(true);
    try {
      if (session) {
        await sessionApi.submitDecision(session._id, decision);
        navigate(`/report/${session._id}`);
      } else {
        navigate(`/report/demo-session`);
      }
    } catch {
      navigate(`/report/demo-session`);
    } finally {
      setSubmitting(false);
    }
  }

  // Ensure caseData fallback exists if API is offline
  const fallbackCase = {
    title: "58-year-old man with acute central chest pain",
    difficulty: "Advanced",
    presenting_complaint:
      "Sudden onset central chest heaviness for 90 minutes radiating to the left arm and jaw with diaphoresis.",
    vitals: {
      heart_rate: 104,
      bp_systolic: 146,
      bp_diastolic: 92,
      respiratory_rate: 26,
      spo2: 91,
      temperature_c: 38.4,
      creatinine: 1.8,
    },
    demographics: { age: 58, sex: "male", occupation: "Taxi driver" },
    history_menu: [
      { id: "h_onset", label: "Onset and character of chest pain", finding: "Sudden onset, crushing heaviness, constant at rest, non-pleuritic.", critical: true },
      { id: "h_radiation", label: "Radiation to jaw / left arm", finding: "Radiates to left inner arm and mandibular angle.", critical: true },
      { id: "h_associated", label: "Autonomic diaphoresis & nausea", finding: "Profuse cold sweating, nausea without emesis.", critical: true },
      { id: "h_risk_smoking", label: "Smoking & cardiovascular risk factors", finding: "25 pack-year smoker; type 2 diabetes mellitus.", critical: false },
    ],
    examination_menu: [
      { id: "e_general", label: "General appearance & distress", finding: "Diaphoretic, anxious, tachypneic at rest.", critical: false },
      { id: "e_cardio", label: "Heart sounds & murmurs", finding: "S1/S2 present, tachycardic, no pericardial rub.", critical: false },
      { id: "e_resp", label: "Lung auscultation & air entry", finding: "Bilateral fine basilar crackles heard up to mid-zones.", critical: true },
      { id: "e_pulses", label: "Peripheral pulses & bilateral BP", finding: "Equal pulses bilaterally; no radio-radial delay.", critical: true },
    ],
    investigation_menu: [
      { id: "i_ecg", label: "12-lead ECG", finding: "ST depression 1.5mm in leads V4-V6; T-wave inversions.", detail: "Sinus tachycardia at 104 bpm; no ST elevation.", critical: true },
      { id: "i_troponin_0h", label: "High-sensitivity Troponin I (0h)", finding: "340 ng/L (URL: 26 ng/L) — markedly elevated.", critical: true },
      { id: "i_abg", label: "Arterial Blood Gas (Room Air)", finding: "pH 7.34, PaO2 58 mmHg, PaCO2 33 mmHg, HCO3 19.", critical: true },
    ],
    differential_options: [
      { id: "nstemi", name: "Acute NSTEMI" },
      { id: "stemi", name: "Posterior STEMI" },
      { id: "aortic_dissection", name: "Aortic Dissection" },
      { id: "pulmonary_embolism", name: "Pulmonary Embolism" },
      { id: "gerd", name: "GERD / Esophageal Spasm" },
    ],
    clinical_decision_options: [
      {
        id: "d_acs_pathway",
        label: "Option A: Administer oxygen support, dual antiplatelet (Aspirin + Ticagrelor) & Heparin",
        tags: [{ text: "Respiratory/Cardiac", type: "system" }, { text: "Impact: High", type: "impact" }, { text: "Risk: Low", type: "risk" }, { text: "Evidence: Strong", type: "evidence" }],
      },
      {
        id: "d_order_abg",
        label: "Option B: Order arterial blood gas and await repeat troponin at 3 hours",
        tags: [{ text: "Diagnostics", type: "system" }, { text: "Impact: Medium", type: "impact" }, { text: "Risk: Moderate", type: "risk" }, { text: "Evidence: Fair", type: "evidence" }],
      },
      {
        id: "d_iv_betablocker",
        label: "Option C: Administer IV Metoprolol for tachycardia reduction",
        tags: [{ text: "Caution", type: "system" }, { text: "Impact: Negative", type: "impact" }, { text: "Risk: High (Decompensation)", type: "risk" }, { text: "Evidence: Contraindicated", type: "evidence" }],
      },
    ],
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Initializing physiological twin & clinical case model…
          </p>
        </div>
      </AppShell>
    );
  }

  const activeCase = caseData || fallbackCase;

  return (
    <AppShell>
      <div className="space-y-6 pb-20">
        {/* Top Header & Patient Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="pill pill-gold">{activeCase.difficulty || "Advanced"}</span>
              <span className="text-xs text-slate-400 font-medium">CASE ID: {caseId || "ACS-001"}</span>
            </div>
            <h1 className="font-display text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {activeCase.title}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {activeCase.presenting_complaint}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runBayesian}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Update Bayesian Engine</span>
            </button>
          </div>
        </div>

        {/* Offline Engine Graceful Degradation Notice */}
        {!session && (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Local Simulation Mode:</strong> Clinical engine server is offline. Case simulation, investigations, and decision pathways remain fully interactive using local guidelines.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hidden sm:inline-block">
              Standalone Mode
            </span>
          </div>
        )}

        {/* Top Row: Digital Twin (Left) + Vitals & Timeline (Right) - Screenshot 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Digital Twin */}
          <div className="lg:col-span-6 card p-6">
            <DigitalTwinSchematic
              patientInfo={{
                id: "PT-1187",
                age: activeCase.demographics?.age || 58,
                sex: activeCase.demographics?.sex || "Male",
                caseTitle: activeCase.title,
                simTime: "06:45",
              }}
            />
          </div>

          {/* Right: Vitals + Simulation Timeline */}
          <div className="lg:col-span-6 space-y-4">
            {/* Vitals Quick Card */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Real-Time Patient Hemodynamics
                </span>
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  SpO2 Critical Alert
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">HR</span>
                  <span className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                    104 <span className="text-[10px] font-normal text-slate-400">bpm</span>
                  </span>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: "75%" }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-semibold">SpO2</span>
                  <span className="font-display font-bold text-sm text-rose-700 dark:text-rose-300">
                    91 <span className="text-[10px] font-normal">%</span>
                  </span>
                  <div className="w-full bg-rose-200 dark:bg-rose-900/60 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-rose-600 h-full" style={{ width: "91%" }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">BP</span>
                  <span className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                    146/92
                  </span>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: "78%" }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-semibold">RR</span>
                  <span className="font-display font-bold text-sm text-rose-700 dark:text-rose-300">
                    26 <span className="text-[10px] font-normal">/min</span>
                  </span>
                  <div className="w-full bg-rose-200 dark:bg-rose-900/60 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-rose-600 h-full" style={{ width: "85%" }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Temp</span>
                  <span className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                    38.4 <span className="text-[10px] font-normal">°C</span>
                  </span>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: "65%" }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Creatinine</span>
                  <span className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                    1.8 <span className="text-[10px] font-normal">mg/dL</span>
                  </span>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: "70%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation Stepper Timeline (Screenshot 5 exact style) */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-xs text-slate-800 dark:text-slate-100">
                  Simulation Timeline
                </h3>
                <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">
                  Step 6 of 6 · Active Decision
                </span>
              </div>

              {/* Timeline Track */}
              <div className="relative py-2">
                <div className="absolute top-1/2 left-2 right-2 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full" />
                <div
                  className="absolute top-1/2 left-2 h-1 bg-violet-600 dark:bg-violet-400 -translate-y-1/2 rounded-full transition-all"
                  style={{ width: "95%" }}
                />

                <div className="relative flex justify-between">
                  {timeline.map((t, idx) => (
                    <div key={t.label} className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border-2 transition-all ${
                          t.status === "completed"
                            ? "bg-violet-600 border-violet-600 text-white"
                            : t.status === "current"
                            ? "bg-white dark:bg-slate-900 border-violet-600 ring-4 ring-violet-500/20"
                            : "bg-slate-200 dark:bg-slate-700 border-slate-300"
                        }`}
                      >
                        {t.status === "completed" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className="text-[9px] font-semibold text-slate-700 dark:text-slate-300 mt-1.5 max-w-[60px] text-center truncate">
                        {t.label}
                      </span>
                      <span className="text-[8px] text-slate-400">{t.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Intervention 2: Pending your clinical decision
                  </span>
                  <span className="pill pill-gold text-[9px]">Awaiting Input</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Select the highest-yield therapeutic pathway below to protect the myocardium.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Gathering Phase: History, Examination, Investigations */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* History */}
          <div className="card p-4">
            <h3 className="font-display font-semibold text-xs text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Patient History
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(activeCase.history_menu || []).map((h: any) => {
                const r = revealedHistory[h.id];
                return (
                  <div key={h.id}>
                    <button
                      onClick={() => doAction("history", h.id)}
                      disabled={!!r}
                      className="w-full text-left text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-500/60 disabled:opacity-75 disabled:cursor-default bg-white dark:bg-slate-800 transition-all font-medium text-slate-700 dark:text-slate-200"
                    >
                      {h.label || h.question}
                    </button>
                    {r && (
                      <div className="mt-1 px-3 py-2 text-[11px] bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/70 dark:border-violet-800/70 rounded-xl text-violet-900 dark:text-violet-200">
                        {r.finding}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Examination */}
          <div className="card p-4">
            <h3 className="font-display font-semibold text-xs text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Physical Examination
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(activeCase.examination_menu || []).map((e: any) => {
                const r = revealedExam[e.id];
                return (
                  <div key={e.id}>
                    <button
                      onClick={() => doAction("examination", e.id)}
                      disabled={!!r}
                      className="w-full text-left text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-500/60 disabled:opacity-75 disabled:cursor-default bg-white dark:bg-slate-800 transition-all font-medium text-slate-700 dark:text-slate-200"
                    >
                      {e.label || e.maneuver}
                    </button>
                    {r && (
                      <div className="mt-1 px-3 py-2 text-[11px] bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/70 dark:border-violet-800/70 rounded-xl text-violet-900 dark:text-violet-200">
                        {r.finding}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Investigations */}
          <div className="card p-4">
            <h3 className="font-display font-semibold text-xs text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Investigations & ECG
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(activeCase.investigation_menu || []).map((i: any) => {
                const r = revealedInv[i.id];
                return (
                  <div key={i.id}>
                    <button
                      onClick={() => doAction("investigation", i.id)}
                      disabled={!!r}
                      className="w-full text-left text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-500/60 disabled:opacity-75 disabled:cursor-default bg-white dark:bg-slate-800 transition-all font-medium text-slate-700 dark:text-slate-200"
                    >
                      {i.label || i.name}
                    </button>
                    {r && (
                      <div className="mt-1 px-3 py-2 text-[11px] bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/70 dark:border-violet-800/70 rounded-xl text-violet-900 dark:text-violet-200">
                        <strong>{r.finding}</strong>
                        {r.detail && <p className="mt-0.5 text-violet-700 dark:text-violet-300">{r.detail}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row: Step 2 Clinical Decision vs Step 3 Predicted Response (Screenshot 5 exact style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* STEP 2: DECIDE (Left Card) */}
          <div className="lg:col-span-7 card p-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 block mb-1">
                STEP 2 · DECIDE
              </span>
              <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base mb-3">
                Next Clinical Decision
              </h3>

              {/* Clinical Warning Alert Banner */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>SpO2 declining</strong> while respiratory rate continues to increase. Rapid intervention required.
                </span>
              </div>

              {/* Decision Options Radio List */}
              <div className="space-y-3 mb-6">
                {(activeCase.clinical_decision_options || []).map((opt: any, idx: number) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = decision === opt.id;

                  return (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/40 ring-1 ring-violet-500 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-violet-600 dark:bg-violet-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {letter}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {opt.label}
                          </span>
                          <input
                            type="radio"
                            name="clinical_decision"
                            value={opt.id}
                            checked={isSelected}
                            onChange={() => setDecision(opt.id)}
                            className="text-violet-600 focus:ring-violet-500 ml-2"
                          />
                        </div>

                        {/* Tag Pills */}
                        {opt.tags && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {opt.tags.map((t: any) => (
                              <span
                                key={t.text}
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                                  t.type === "risk"
                                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                                    : t.type === "impact"
                                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                                    : "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                                }`}
                              >
                                {t.text}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Action executes simulation state transition & generates post-case audit.
              </span>
              <button
                onClick={submitDecision}
                disabled={!decision || submitting}
                className="btn-primary text-xs px-5 py-2.5 shadow-glow-violet flex items-center gap-2"
              >
                {submitting ? "Processing Resuscitation…" : "Submit Decision"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STEP 3: PREDICTED RESPONSE (Right Card) */}
          <div className="lg:col-span-5">
            <ModelConfidenceCard />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
