import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { caseApi, sessionApi } from "../api/client";

type Revealed = { label: string; finding: string; detail?: string; critical?: boolean };

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
  const [decision, setDecision] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caseId) return;
    Promise.all([caseApi.get(caseId), sessionApi.start(caseId)])
      .then(([c, s]) => {
        setCaseData(c);
        setSession(s);
      })
      .finally(() => setLoading(false));
  }, [caseId]);

  async function doAction(actionType: "history" | "examination" | "investigation", itemId: string) {
    const { session: updated, revealed } = await sessionApi.recordAction(session._id, actionType, itemId);
    setSession(updated);
    if (actionType === "history") setRevealedHistory((p) => ({ ...p, [itemId]: revealed }));
    if (actionType === "examination") setRevealedExam((p) => ({ ...p, [itemId]: revealed }));
    if (actionType === "investigation") setRevealedInv((p) => ({ ...p, [itemId]: revealed }));
  }

  function toggleDifferential(id: string) {
    setSelectedDifferentials((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function saveDifferentials() {
    const updated = await sessionApi.updateDifferentials(session._id, selectedDifferentials);
    setSession(updated);
  }

  async function runBayesian() {
    const result = await sessionApi.runBayesian(session._id);
    setBayesian(result);
  }

  async function submitDecision() {
    if (!decision) return;
    setSubmitting(true);
    try {
      await sessionApi.submitDecision(session._id, decision);
      navigate(`/report/${session._id}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !caseData || !session) {
    return (
      <AppShell>
        <p className="text-slate-500">Loading case…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <span className="pill bg-medblue-100 text-medblue-700 mb-2">{caseData.difficulty}</span>
        <h1 className="text-2xl font-semibold text-slate-800">{caseData.title}</h1>
        <p className="text-slate-600 mt-2">{caseData.presenting_complaint}</p>
      </div>

      <div className="card p-4 mb-6 grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
        <Vital label="HR" value={`${caseData.vitals.heart_rate}/min`} />
        <Vital label="BP" value={`${caseData.vitals.bp_systolic}/${caseData.vitals.bp_diastolic}`} />
        <Vital label="RR" value={`${caseData.vitals.respiratory_rate}/min`} />
        <Vital label="SpO2" value={`${caseData.vitals.spo2}%`} />
        <Vital label="Temp" value={`${caseData.vitals.temperature_c}°C`} />
        <Vital label="Age/Sex" value={`${caseData.demographics.age}/${caseData.demographics.sex[0].toUpperCase()}`} />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <ActionPanel
          title="History"
          items={caseData.history_menu.map((h: any) => ({ id: h.id, label: h.question }))}
          revealed={revealedHistory}
          onAction={(id) => doAction("history", id)}
        />
        <ActionPanel
          title="Examination"
          items={caseData.examination_menu.map((e: any) => ({ id: e.id, label: e.maneuver }))}
          revealed={revealedExam}
          onAction={(id) => doAction("examination", id)}
        />
        <ActionPanel
          title="Investigations"
          items={caseData.investigation_menu.map((i: any) => ({ id: i.id, label: `${i.name} (${i.cost_time_minutes}min)` }))}
          revealed={revealedInv}
          onAction={(id) => doAction("investigation", id)}
          showDetail
        />
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-slate-800 mb-3">Differential diagnosis</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {caseData.differential_options.map((d: any) => (
            <button
              key={d.id}
              onClick={() => toggleDifferential(d.id)}
              className={`pill border ${
                selectedDifferentials.includes(d.id)
                  ? "bg-medblue-600 text-white border-medblue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-medblue-300"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
        <button className="btn-secondary" onClick={saveDifferentials} disabled={selectedDifferentials.length === 0}>
          Save differentials
        </button>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800">Bayesian probability update</h3>
          <button className="btn-secondary" onClick={runBayesian}>
            Run Bayesian update
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Educational model output — not a real-world clinical probability.
        </p>
        {bayesian && (
          <div className="space-y-3">
            {Object.entries(bayesian.final_probabilities)
              .sort((a: any, b: any) => b[1] - a[1])
              .map(([dx, p]: any) => (
                <div key={dx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{dx}</span>
                    <span className="text-slate-500">{(p * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${p * 100}%` }} />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-800 mb-3">Clinical decision</h3>
        <div className="space-y-2 mb-4">
          {caseData.clinical_decision_options.map((d: any) => (
            <label
              key={d.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer text-sm ${
                decision === d.id ? "border-medblue-500 bg-medblue-50" : "border-slate-200"
              }`}
            >
              <input
                type="radio"
                name="decision"
                className="mt-1"
                checked={decision === d.id}
                onChange={() => setDecision(d.id)}
              />
              <span className="text-slate-700">{d.label}</span>
            </label>
          ))}
        </div>
        <button className="btn-primary" onClick={submitDecision} disabled={!decision || submitting}>
          {submitting ? "Submitting…" : "Submit decision"}
        </button>
      </div>
    </AppShell>
  );
}

function Vital({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-slate-800 font-medium">{value}</p>
    </div>
  );
}

function ActionPanel({
  title,
  items,
  revealed,
  onAction,
  showDetail,
}: {
  title: string;
  items: { id: string; label: string }[];
  revealed: Record<string, Revealed>;
  onAction: (id: string) => void;
  showDetail?: boolean;
}) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold text-slate-800 mb-3 text-sm">{title}</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.map((item) => {
          const r = revealed[item.id];
          return (
            <div key={item.id}>
              <button
                onClick={() => onAction(item.id)}
                disabled={!!r}
                className="w-full text-left text-sm px-3 py-2 rounded-lg border border-slate-200 hover:border-medblue-300 disabled:opacity-60 disabled:cursor-default bg-white"
              >
                {item.label}
              </button>
              {r && (
                <div className="mt-1 mb-2 px-3 py-2 text-xs bg-teal-50 border border-teal-100 rounded-lg text-teal-900">
                  {r.finding}
                  {showDetail && r.detail && <p className="text-teal-700 mt-1">{r.detail}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
