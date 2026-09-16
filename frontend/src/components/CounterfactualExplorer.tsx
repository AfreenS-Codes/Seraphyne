import { useState } from "react";
import { GitFork, ArrowUpRight, AlertTriangle, CheckCircle, HelpCircle, Sparkles } from "lucide-react";

interface CounterfactualScenario {
  id: string;
  actionTaken: string;
  counterfactualAlternative: string;
  timing: string;
  predictedOutcome: "Substantially Better" | "Marginally Better" | "Detrimental";
  survivalDelta: number; // in %
  ischemicDelta: number; // in %
  clinicalExplanation: string;
  goldenRule: string;
}

const DEFAULT_SCENARIOS: CounterfactualScenario[] = [
  {
    id: "cf-1",
    actionTaken: "Awaited 3-hour high-sensitivity troponin confirmation before initiating anticoagulation.",
    counterfactualAlternative: "Administered weight-adjusted Enoxaparin & Aspirin at 00:15 upon ECG ST depression recognition.",
    timing: "Resuscitation Step 2 (00:15 vs 01:00)",
    predictedOutcome: "Substantially Better",
    survivalDelta: +34.5,
    ischemicDelta: -52.0,
    clinicalExplanation: "In high-risk ACS with dynamic ECG ischemic changes, thrombus propagation continues unabated during biomarker turnaround. Immediate antithrombotic therapy halts intracoronary platelet aggregation.",
    goldenRule: "GOLDEN PATHWAY: Treat the ECG and patient hemodynamics — do not delay initial antithrombotics for serial lab confirmation.",
  },
  {
    id: "cf-2",
    actionTaken: "Administered 10mg IV Metoprolol immediately upon noting sinus tachycardia of 104 bpm.",
    counterfactualAlternative: "Checked bilateral lung auscultation first to rule out acute cardiogenic pulmonary congestion.",
    timing: "Resuscitation Step 3 (00:25)",
    predictedOutcome: "Detrimental",
    survivalDelta: -28.0,
    ischemicDelta: +35.0,
    clinicalExplanation: "The tachycardia was compensatory for acute left ventricular dysfunction (Killip class II). Administering negative inotropes in undifferentiated pulmonary congestion precipitates acute cardiogenic shock.",
    goldenRule: "GOLDEN CONTRAINDICATION: Never administer IV beta-blockers in ACS patients exhibiting basal lung crackles or signs of hemodynamic compromise.",
  },
  {
    id: "cf-3",
    actionTaken: "Ordered standard 12-lead ECG without posterior leads (V7–V9).",
    counterfactualAlternative: "Acquired 15-lead ECG including posterior leads (V7–V9) and right-sided leads (V4R).",
    timing: "Initial Assessment (00:08)",
    predictedOutcome: "Substantially Better",
    survivalDelta: +18.0,
    ischemicDelta: -30.0,
    clinicalExplanation: "Isolated posterior STEMI manifests solely as ST depression in V1-V3. Adding posterior leads unmasks true ST elevation and triggers immediate primary percutaneous coronary intervention (PPCI).",
    goldenRule: "GOLDEN DIAGNOSTIC STEP: True posterior infarction is the great STEMI mimic. Always inspect V1–V3 reciprocal depressions.",
  },
];

export function CounterfactualExplorer() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const scenario = DEFAULT_SCENARIOS[selectedIdx];

  return (
    <div className="card p-6 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/80 shadow-soft">
      {/* Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-glow-violet">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">
                Counterfactual Resuscitation Bar
              </h3>
              <span className="golden-badge text-[10px] py-0.5">
                ✦ Optimal Trajectory Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulating alternative clinical decision branches against the gold-standard resuscitation pathway
            </p>
          </div>
        </div>

        {/* Scenario Selector Pills */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          {DEFAULT_SCENARIOS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedIdx === idx
                  ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Scenario #{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Counterfactual Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: What Was Done vs Alternative */}
        <div className="md:col-span-7 space-y-3.5">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Observed Action Taken (Actual Route)
            </div>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 pl-4">
              "{scenario.actionTaken}"
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60">
            <div className="flex items-center gap-2 mb-1 text-violet-700 dark:text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              Counterfactual Alternative (Better Case Pathway)
            </div>
            <p className="text-xs font-semibold text-violet-950 dark:text-violet-100 pl-4">
              "{scenario.counterfactualAlternative}"
            </p>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <strong className="text-slate-800 dark:text-slate-200 font-semibold block mb-1">
              Physiological Rationale:
            </strong>
            {scenario.clinicalExplanation}
          </p>
        </div>

        {/* Right: Outcome Deltas & Golden Rule */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                Myocardial Salvage Delta
              </span>
              <span className="font-display font-extrabold text-xl text-emerald-600 dark:text-emerald-300">
                {scenario.survivalDelta > 0 ? `+${scenario.survivalDelta}%` : `${scenario.survivalDelta}%`}
              </span>
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400 block mt-0.5">
                Stabilization probability
              </span>
            </div>

            <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-center">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-sky-700 dark:text-sky-400 block mb-0.5">
                Ischemic Extension Risk
              </span>
              <span className="font-display font-extrabold text-xl text-sky-600 dark:text-sky-300">
                {scenario.ischemicDelta}%
              </span>
              <span className="text-[10px] text-sky-700/80 dark:text-sky-400 block mt-0.5">
                Reduced necrotic burden
              </span>
            </div>
          </div>

          {/* Golden Rule Callout */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100/50 to-amber-50 dark:from-amber-950/60 dark:via-amber-900/30 dark:to-amber-950/60 border border-amber-300/80 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-amber-800 dark:text-amber-300 mb-1 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Resuscitation Crucible Rule
            </div>
            <p className="text-xs font-medium leading-relaxed">
              {scenario.goldenRule}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
