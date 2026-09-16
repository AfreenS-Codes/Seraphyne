import { useState } from "react";
import { X, ArrowRight, GitCompare, Activity, ShieldCheck, AlertTriangle } from "lucide-react";

interface CaseDetail {
  id: string;
  title: string;
  system: string;
  difficulty: "Intermediate" | "Advanced" | "Expert";
  patient: {
    age: number;
    sex: string;
    occupation: string;
  };
  complaint: string;
  vitals: {
    hr: number;
    bp: string;
    rr: number;
    spo2: number;
    temp: number;
  };
  dominantOrgan: { name: string; status: "Critical" | "Watch" | "Stable" };
  primaryDifferential: string;
  bayesianCertainty: number;
  mlRiskScore: number;
  optimalIntervention: string;
  counterfactualLesson: string;
}

const COMPARISON_CASES: CaseDetail[] = [
  {
    id: "acs-001",
    title: "Acute Coronary Syndrome (NSTEMI)",
    system: "Cardiovascular",
    difficulty: "Advanced",
    patient: { age: 58, sex: "Male", occupation: "Taxi driver" },
    complaint: "Sudden onset central chest heaviness for 90 minutes with radiation to the left arm and diaphoresis.",
    vitals: { hr: 96, bp: "148/92", rr: 20, spo2: 96, temp: 37.1 },
    dominantOrgan: { name: "Cardiovascular", status: "Critical" },
    primaryDifferential: "Non-ST Elevation Myocardial Infarction (NSTEMI)",
    bayesianCertainty: 94.8,
    mlRiskScore: 89.2,
    optimalIntervention: "Aspirin 300mg + Ticagrelor 180mg + Subcutaneous Enoxaparin + Urgent Angiography",
    counterfactualLesson: "Delayed antiplatelet administration past 30 min increases ischemic extension by 40%.",
  },
  {
    id: "resp-1187",
    title: "Acute Respiratory Deterioration",
    system: "Respiratory",
    difficulty: "Advanced",
    patient: { age: 56, sex: "Male", occupation: "Post-operative" },
    complaint: "Rapid post-operative desaturation, tachypnea, and accessory muscle use after abdominal surgery.",
    vitals: { hr: 104, bp: "146/92", rr: 26, spo2: 91, temp: 38.4 },
    dominantOrgan: { name: "Respiratory", status: "Critical" },
    primaryDifferential: "Acute Pulmonary Atelectasis / Impending ARDS",
    bayesianCertainty: 88.5,
    mlRiskScore: 78.4,
    optimalIntervention: "High-flow nasal cannula (HFNC) + Arterial Blood Gas + Upright positioning",
    counterfactualLesson: "Awaiting arterial blood gas prior to escalating oxygen leads to hypoxic cardiac strain.",
  },
  {
    id: "cr-2211",
    title: "Cardio-Renal Interaction",
    system: "Cardiovascular / Renal",
    difficulty: "Advanced",
    patient: { age: 67, sex: "Female", occupation: "Retired" },
    complaint: "Bilateral leg swelling, progressive orthopnea, and doubling of serum creatinine during diuresis.",
    vitals: { hr: 82, bp: "112/68", rr: 22, spo2: 93, temp: 36.8 },
    dominantOrgan: { name: "Renal", status: "Watch" },
    primaryDifferential: "Type 1 Cardiorenal Syndrome (Decompensated HF with AKI)",
    bayesianCertainty: 91.2,
    mlRiskScore: 82.6,
    optimalIntervention: "Judicious Loop Diuretic titration + Hemodynamic monitoring + Stop NSAIDs",
    counterfactualLesson: "Aggressive ultrafiltration without assessing perfusion leads to acute tubular injury.",
  },
  {
    id: "sepsis-0933",
    title: "Sepsis Progression",
    system: "Multi-system",
    difficulty: "Expert",
    patient: { age: 63, sex: "Male", occupation: "Factory worker" },
    complaint: "Fever, acute confusion, rigors, and hypotension secondary to urinary tract infection.",
    vitals: { hr: 122, bp: "88/54", rr: 28, spo2: 94, temp: 39.2 },
    dominantOrgan: { name: "Metabolic / Vasomotor", status: "Critical" },
    primaryDifferential: "Septic Shock with Vasomotor Collapse",
    bayesianCertainty: 96.0,
    mlRiskScore: 93.5,
    optimalIntervention: "Hour-1 Sepsis Bundle: 30mL/kg Crystalloid + Blood Cultures + Broad-Spectrum Antibiotics",
    counterfactualLesson: "Each hour of antibiotic delay past presentation increases septic mortality by 7.6%.",
  },
];

interface CaseComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CaseComparisonModal({ isOpen, onClose }: CaseComparisonModalProps) {
  const [caseAId, setCaseAId] = useState<string>("acs-001");
  const [caseBId, setCaseBId] = useState<string>("resp-1187");

  if (!isOpen) return null;

  const caseA = COMPARISON_CASES.find((c) => c.id === caseAId) || COMPARISON_CASES[0];
  const caseB = COMPARISON_CASES.find((c) => c.id === caseBId) || COMPARISON_CASES[1];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 flex items-center justify-center">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">
                Case Comparison Analyzer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Side-by-side diagnostic, hemodynamic, and counterfactual differential audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Case Selectors */}
        <div className="grid grid-cols-2 gap-4 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
              Case A (Primary)
            </label>
            <select
              value={caseAId}
              onChange={(e) => setCaseAId(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-violet-500"
            >
              {COMPARISON_CASES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.system})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
              Case B (Comparator)
            </label>
            <select
              value={caseBId}
              onChange={(e) => setCaseBId(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-violet-500"
            >
              {COMPARISON_CASES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.system})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-Side Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Case Titles & Demographics */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-violet-50/30 dark:bg-slate-800/50 border border-violet-200/50 dark:border-slate-700">
              <span className="pill pill-violet mb-2">{caseA.difficulty}</span>
              <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm">
                {caseA.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {caseA.patient.age}y {caseA.patient.sex} · {caseA.patient.occupation}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                "{caseA.complaint}"
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="pill pill-gold mb-2">{caseB.difficulty}</span>
              <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm">
                {caseB.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {caseB.patient.age}y {caseB.patient.sex} · {caseB.patient.occupation}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                "{caseB.complaint}"
              </p>
            </div>
          </div>

          {/* Vitals Delta Comparison */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Hemodynamic & Vital Signs Comparison
            </h4>
            <div className="grid grid-cols-5 gap-3 text-center">
              {[
                { label: "Heart Rate", valA: `${caseA.vitals.hr} bpm`, valB: `${caseB.vitals.hr} bpm`, higher: caseA.vitals.hr > caseB.vitals.hr ? "A" : "B" },
                { label: "Blood Pressure", valA: caseA.vitals.bp, valB: caseB.vitals.bp, higher: "A" },
                { label: "Respiratory Rate", valA: `${caseA.vitals.rr} /min`, valB: `${caseB.vitals.rr} /min`, higher: caseA.vitals.rr > caseB.vitals.rr ? "A" : "B" },
                { label: "SpO2 Saturation", valA: `${caseA.vitals.spo2}%`, valB: `${caseB.vitals.spo2}%`, higher: caseA.vitals.spo2 > caseB.vitals.spo2 ? "A" : "B" },
                { label: "Temperature", valA: `${caseA.vitals.temp} °C`, valB: `${caseB.vitals.temp} °C`, higher: caseA.vitals.temp > caseB.vitals.temp ? "A" : "B" },
              ].map((v) => (
                <div key={v.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block mb-1">{v.label}</span>
                  <div className="flex items-center justify-between text-xs font-semibold px-1">
                    <span className="text-violet-600 dark:text-violet-400">{v.valA}</span>
                    <span className="text-slate-300 dark:text-slate-600">vs</span>
                    <span className="text-slate-700 dark:text-slate-300">{v.valB}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Probabilities & Model Confidence Breakdown */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Case A Metrics & ML Risk
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Bayesian Certainty</span>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">{caseA.bayesianCertainty}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-2 rounded-full transition-all" style={{ width: `${caseA.bayesianCertainty}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-300">ML Model Predicted Risk</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">{caseA.mlRiskScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full transition-all" style={{ width: `${caseA.mlRiskScore}%` }} />
                  </div>
                </div>
              </div>
              <div className="text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Primary Diagnosis:</span>
                <span className="text-violet-700 dark:text-violet-300 font-medium">{caseA.primaryDifferential}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Case B Metrics & ML Risk
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Bayesian Certainty</span>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">{caseB.bayesianCertainty}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-2 rounded-full transition-all" style={{ width: `${caseB.bayesianCertainty}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-300">ML Model Predicted Risk</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">{caseB.mlRiskScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full transition-all" style={{ width: `${caseB.mlRiskScore}%` }} />
                  </div>
                </div>
              </div>
              <div className="text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Primary Diagnosis:</span>
                <span className="text-amber-700 dark:text-amber-300 font-medium">{caseB.primaryDifferential}</span>
              </div>
            </div>
          </div>

          {/* Optimal Resuscitation & Counterfactual Pathway */}
          <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide block mb-1">
                Case A Gold Standard Decision
              </span>
              <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                {caseA.optimalIntervention}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-2 italic">
                {caseA.counterfactualLesson}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide block mb-1">
                Case B Gold Standard Decision
              </span>
              <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                {caseB.optimalIntervention}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-2 italic">
                {caseB.counterfactualLesson}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900">
          <button onClick={onClose} className="btn-secondary text-xs px-4 py-2">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
