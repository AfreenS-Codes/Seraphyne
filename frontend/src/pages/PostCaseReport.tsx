import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { sessionApi, platformApi } from "../api/client";

export function PostCaseReport() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<any>(null);
  const [companion, setCompanion] = useState<{ available: boolean; answer?: string; error?: string } | null>(null);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    sessionApi.get(sessionId).then(setSession);
  }, [sessionId]);

  async function askCompanion() {
    if (!question.trim() || !session) return;
    setAsking(true);
    try {
      const result = await platformApi.askCompanion({
        sessionId: session._id,
        domain: "Cardiology",
        message: question,
      });
      setCompanion(result);
    } finally {
      setAsking(false);
    }
  }

  if (!session) {
    return (
      <AppShell>
        <p className="text-slate-500">Loading report…</p>
      </AppShell>
    );
  }

  const outcome = session.outcomeResult;
  const reasoning = session.reasoningResult;
  const ml = session.mlPredictionResult;
  const cf = session.counterfactualResult;

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold text-slate-800 mb-1">Post-Case Report</h1>
      <p className="text-slate-500 text-sm mb-8">Session {session._id.slice(0, 8)} · {session.status}</p>

      {outcome && (
        <div className={`card p-6 mb-6 border-l-4 ${outcome.favorable ? "border-l-teal-500" : "border-l-amber-500"}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`pill ${outcome.favorable ? "bg-teal-500/10 text-teal-600" : "bg-amber-100 text-amber-700"}`}>
              {outcome.favorable ? "Favorable outcome" : "Suboptimal outcome"}
            </span>
            <h3 className="font-semibold text-slate-800">{outcome.title}</h3>
          </div>
          <p className="text-sm text-slate-700 mb-3">{outcome.narrative}</p>
          <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{outcome.educational_explanation}</p>
          <p className="text-xs text-slate-400 mt-3">Ground truth diagnosis: {outcome.ground_truth_diagnosis}</p>
        </div>
      )}

      {reasoning && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-3">Reasoning analysis</h3>
          <div className="flex gap-4 mb-4">
            <Badge ok={reasoning.correct_diagnosis} label="Correct diagnosis" />
            <Badge ok={reasoning.good_reasoning_process} label="Good reasoning process" />
          </div>
          <p className="text-sm text-slate-600 mb-4">{reasoning.summary}</p>
          <div className="space-y-2">
            {reasoning.flags
              .filter((f: any) => f.detected)
              .map((f: any) => (
                <div key={f.id} className="text-sm bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <span className="font-medium text-amber-800">{f.label}</span>
                  <p className="text-amber-700 mt-1">{f.explanation}</p>
                </div>
              ))}
            {reasoning.flags.every((f: any) => !f.detected) && (
              <p className="text-sm text-teal-700 bg-teal-50 rounded-lg p-3">No reasoning-error patterns detected in this session.</p>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {ml && (
          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 mb-3">ML prediction</h3>
            <p className="text-2xl font-semibold text-slate-800 mb-1 capitalize">
              {ml.predicted_label?.replace(/_/g, " ")}
            </p>
            <p className="text-sm text-slate-500 mb-3">
              Probability of disease: {(ml.probability_disease * 100).toFixed(1)}% ({ml.model})
            </p>
            <p className="text-xs text-slate-400">{ml.disclaimer}</p>
          </div>
        )}

        {cf && (
          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 mb-3">Counterfactual analysis</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cf.items.map((item: any) => (
                <div key={item.id} className="text-sm border-l-2 border-medblue-200 pl-3">
                  <p className="font-medium text-slate-700">{item.alternative_action_label}</p>
                  <p className="text-slate-500 mt-1">{item.reasoning_lesson}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-slate-800 mb-3">AI Study Companion</h3>
        <p className="text-xs text-slate-500 mb-4">
          Ask a follow-up question about this case's concepts. Separately-integrated external service.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. Why does troponin rise in NSTEMI?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button className="btn-primary" onClick={askCompanion} disabled={asking}>
            {asking ? "Asking…" : "Ask"}
          </button>
        </div>
        {companion && (
          <div className="text-sm bg-slate-50 rounded-lg p-3">
            {companion.available ? (
              <p className="text-slate-700">{companion.answer}</p>
            ) : (
              <p className="text-slate-500">
                AI Study Companion is temporarily unavailable. Your simulation progress is safe.
                {companion.error ? ` (${companion.error})` : ""}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link to="/dashboard" className="btn-secondary">Back to dashboard</Link>
        <Link to="/mistakes" className="btn-secondary">View Mistake Memory</Link>
        <Link to="/cardiology" className="btn-primary">Practice another case</Link>
      </div>
    </AppShell>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`pill ${ok ? "bg-teal-500/10 text-teal-600" : "bg-red-50 text-red-600"}`}>
      {ok ? "✓" : "✗"} {label}
    </span>
  );
}
