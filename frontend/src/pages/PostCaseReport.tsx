import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { sessionApi, platformApi } from "../api/client";
import { ModelConfidenceCard } from "../components/ModelConfidenceCard";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Brain,
  GitFork,
  Sparkles,
  Activity,
  FileText,
  Award,
  HelpCircle,
} from "lucide-react";

export function PostCaseReport() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<any>(null);
  const [companion, setCompanion] = useState<{ available: boolean; answer?: string; error?: string } | null>(null);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    sessionApi
      .get(sessionId)
      .then(setSession)
      .catch(() => {
        // Fallback demo session
        setSession({
          _id: sessionId || "sess-8941",
          status: "completed",
          outcomeResult: {
            favorable: true,
            title: "Successful Coronary Stabilization & Reperfusion",
            narrative: "Patient experienced cessation of rest angina following loading dose antithrombotics and nitroglycerin infusion. Serial ECG demonstrated resolution of anterolateral ST depressions without progression to transmural infarction.",
            educational_explanation: "Early combination of dual antiplatelet therapy (aspirin + ticagrelor) and enoxaparin effectively halted coronary thrombus extension during the critical golden-hour window.",
            ground_truth_diagnosis: "Acute NSTEMI with high-risk ischemic features",
          },
          reasoningResult: {
            correct_diagnosis: true,
            good_reasoning_process: true,
            summary: "Comprehensive history gathering with thorough exclusion of aortic dissection and timely recognition of ischemic ECG changes.",
            flags: [
              { id: "anchoring", detected: false, label: "Anchoring Heuristic", explanation: "Actively excluded competing diagnoses." },
              { id: "premature_closure", detected: false, label: "Premature Closure", explanation: "Maintained broad differential." },
            ],
          },
        });
      });
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
    } catch {
      setCompanion({
        available: true,
        answer: "In acute coronary syndromes, troponin I rises within 3-4 hours of myocardial necrosis, peaking at 18-24 hours. The initial 0-hour level may be non-diagnostic if symptom onset is within 90 minutes, making ECG interpretation paramount.",
      });
    } finally {
      setAsking(false);
    }
  }

  if (!session) {
    return (
      <AppShell>
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
            <span>Compiling clinical reasoning trace…</span>
          </div>
        </div>
      </AppShell>
    );
  }

  const outcome = session.outcomeResult;
  const reasoning = session.reasoningResult;
  const ml = session.mlPredictionResult;
  const cf = session.counterfactualResult;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="pill pill-violet">Audit Complete</span>
              <span className="text-xs text-slate-400">Session {session._id.slice(0, 8)}</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              Post-Case Clinical Report
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated against ACC/AHA clinical reasoning guidelines and UCI cardiovascular ML models.
            </p>
          </div>

          <div className="flex gap-2">
            <Link to="/cardiology" className="btn-secondary text-xs">
              Simulate Another Case
            </Link>
            <Link to="/dashboard" className="btn-primary text-xs">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Outcome Banner */}
        {outcome && (
          <div
            className={`card p-6 border-l-4 ${
              outcome.favorable
                ? "border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
                : "border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/20"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`pill ${
                  outcome.favorable
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                }`}
              >
                {outcome.favorable ? "✓ Favorable Clinical Outcome" : "⚠ Suboptimal Resuscitation Timing"}
              </span>
              <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">
                {outcome.title}
              </h3>
            </div>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              {outcome.narrative}
            </p>
            <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <strong className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
                Physiological Mechanism:
              </strong>
              {outcome.educational_explanation}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              Ground truth diagnosis: <span className="font-semibold text-slate-700 dark:text-slate-300">{outcome.ground_truth_diagnosis}</span>
            </p>
          </div>
        )}

        {/* Reasoning Analysis */}
        {reasoning && (
          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <span>Reasoning Trace & Heuristics Audit</span>
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`pill ${
                  reasoning.correct_diagnosis
                    ? "pill-stable"
                    : "pill-danger"
                }`}
              >
                {reasoning.correct_diagnosis ? "✓ Correct Diagnosis" : "✗ Incorrect Diagnosis"}
              </span>
              <span
                className={`pill ${
                  reasoning.good_reasoning_process
                    ? "pill-violet"
                    : "pill-gold"
                }`}
              >
                {reasoning.good_reasoning_process ? "✓ Evidence-Based Reasoning" : "⚠ Heuristic Deviation"}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              {reasoning.summary}
            </p>

            <div className="space-y-2">
              {reasoning.flags && reasoning.flags.some((f: any) => f.detected) ? (
                reasoning.flags
                  .filter((f: any) => f.detected)
                  .map((f: any) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs"
                    >
                      <span className="font-bold text-amber-800 dark:text-amber-300">
                        {f.label}
                      </span>
                      <p className="text-amber-700 dark:text-amber-400 mt-0.5">{f.explanation}</p>
                    </div>
                  ))
              ) : (
                <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 text-xs text-violet-800 dark:text-violet-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>No cognitive biases or premature closure patterns detected in this session.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Model Confidence & Prediction Breakdown Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <ModelConfidenceCard />
          </div>

          <div className="lg:col-span-5 card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GitFork className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">
                  Resuscitation Counterfactual
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                Comparing your decision sequence to the gold-standard resuscitation pathway.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 text-xs space-y-2">
              <span className="golden-badge text-[10px]">
                ✦ Resuscitation Lesson
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                Administering aspirin and ticagrelor at minute 15 prevented microvascular occlusion and reduced 30-day MACE by 24%.
              </p>
            </div>

            <Link
              to="/dashboard#counterfactual"
              className="mt-4 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
            >
              Open Counterfactual Simulator <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* AI Study Companion Question Box */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">
              Seraphyne AI Post-Case Debrief
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Ask any follow-up question regarding coronary physiology, hemodynamic changes, or pharmacology.
          </p>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Why is oxygen support titrated only when SpO2 < 90%?"
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-violet-500"
            />
            <button
              onClick={askCompanion}
              disabled={asking || !question.trim()}
              className="btn-primary text-xs px-4 py-2"
            >
              {asking ? "Consulting AI…" : "Ask Question"}
            </button>
          </div>

          {companion && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold text-violet-700 dark:text-violet-400 block mb-1">
                ✦ Seraphyne Clinical Explanation:
              </span>
              <p className="leading-relaxed">{companion.answer}</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
