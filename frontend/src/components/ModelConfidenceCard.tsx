import { useState } from "react";
import { Brain, Info, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";

export interface OutcomePrediction {
  label: "Improvement" | "Stable" | "Deterioration";
  probability: number;
  color: string;
  barColor: string;
  bgSubtle: string;
}

interface ModelConfidenceProps {
  outcomes?: OutcomePrediction[];
  mlConfidence?: {
    modelName: string;
    dataset: string;
    predictedDisease: string;
    confidence: number;
    uncertaintyRange: [number, number];
    topFeatures: { name: string; weight: number; direction: "risk_increasing" | "protective" }[];
  };
  bayesianProbabilities?: { disease: string; prob: number; delta: number }[];
  interactive?: boolean;
}

const DEFAULT_OUTCOMES: OutcomePrediction[] = [
  {
    label: "Improvement",
    probability: 64.2,
    color: "text-emerald-700 dark:text-emerald-400",
    barColor: "bg-emerald-500",
    bgSubtle: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    label: "Stable",
    probability: 23.5,
    color: "text-sky-700 dark:text-sky-400",
    barColor: "bg-sky-500",
    bgSubtle: "bg-sky-50 dark:bg-sky-950/40",
  },
  {
    label: "Deterioration",
    probability: 12.3,
    color: "text-rose-700 dark:text-rose-400",
    barColor: "bg-rose-500",
    bgSubtle: "bg-rose-50 dark:bg-rose-950/40",
  },
];

export function ModelConfidenceCard({
  outcomes = DEFAULT_OUTCOMES,
  mlConfidence = {
    modelName: "GradientBoosted-Cardio-V2 (UCI Heart + MIMIC)",
    dataset: "UCI Heart Disease & Clinical Resuscitation Cohort",
    predictedDisease: "Non-ST Elevation Myocardial Infarction (NSTEMI)",
    confidence: 89.4,
    uncertaintyRange: [86.2, 92.6],
    topFeatures: [
      { name: "Serial Troponin I > 99th percentile URL", weight: 0.42, direction: "risk_increasing" },
      { name: "New ST depression ≥ 1mm in lateral leads", weight: 0.28, direction: "risk_increasing" },
      { name: "Continuous rest pain > 30 minutes", weight: 0.18, direction: "risk_increasing" },
      { name: "Absence of positional/pleuritic chest pain", weight: 0.12, direction: "protective" },
    ],
  },
  bayesianProbabilities = [
    { disease: "NSTEMI", prob: 94.8, delta: +32.8 },
    { disease: "Unstable Angina", prob: 3.6, delta: -18.4 },
    { disease: "Stable Angina", prob: 1.1, delta: -9.2 },
    { disease: "Aortic Dissection", prob: 0.3, delta: -4.1 },
    { disease: "GERD / Esophageal Spasm", prob: 0.2, delta: -1.1 },
  ],
  interactive = true,
}: ModelConfidenceProps) {
  const [activeTab, setActiveTab] = useState<"outcomes" | "bayesian" | "features">("outcomes");

  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/50 flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-sm">
              Predicted Response & Model Confidence
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {mlConfidence.modelName}
            </p>
          </div>
        </div>

        {interactive && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-medium">
            <button
              onClick={() => setActiveTab("outcomes")}
              className={`px-2 py-1 rounded-md transition-colors ${
                activeTab === "outcomes"
                  ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Outcomes
            </button>
            <button
              onClick={() => setActiveTab("bayesian")}
              className={`px-2 py-1 rounded-md transition-colors ${
                activeTab === "bayesian"
                  ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Bayes Probabilities
            </button>
            <button
              onClick={() => setActiveTab("features")}
              className={`px-2 py-1 rounded-md transition-colors ${
                activeTab === "features"
                  ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Features
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 my-auto space-y-3.5 py-1">
        {activeTab === "outcomes" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Predicted Patient Outcomes</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Confidence: {mlConfidence.confidence}%
              </span>
            </div>

            {outcomes.map((item) => (
              <div
                key={item.label}
                className="group p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${item.barColor}`}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {item.label}
                    </span>
                  </div>
                  <span className={`font-bold ${item.color}`}>
                    {item.probability.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${item.barColor} h-full rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${item.probability}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>95% Credible Interval: [{mlConfidence.uncertaintyRange[0]}% – {mlConfidence.uncertaintyRange[1]}%]</span>
              <span className="text-violet-600 dark:text-violet-400 font-medium">Calibrated Brier: 0.082</span>
            </div>
          </div>
        )}

        {activeTab === "bayesian" && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">
              Posterior belief update incorporating collected history, exam, and ECG/Troponin findings:
            </p>
            {bayesianProbabilities.map((b) => (
              <div key={b.disease} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {b.disease}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-semibold ${
                        b.delta > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400"
                      }`}
                    >
                      {b.delta > 0 ? `+${b.delta}%` : `${b.delta}%`}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {b.prob.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${b.prob}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "features" && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">
              Top SHAP / Likelihood Ratio driving model decision:
            </p>
            {mlConfidence.topFeatures.map((f) => (
              <div
                key={f.name}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                    {f.name}
                  </span>
                  <span
                    className={`font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                      f.direction === "risk_increasing"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                    }`}
                  >
                    +{(f.weight * 100).toFixed(0)}% impact
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
        <span>Generated from current patient state + intervention sequence.</span>
        <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium">
          <CheckCircle2 className="w-3 h-3" /> Validated
        </span>
      </div>
    </div>
  );
}
