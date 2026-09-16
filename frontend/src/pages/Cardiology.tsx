import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { caseApi } from "../api/client";
import { Search, Filter, Clock, Activity, ArrowRight, Sparkles, Check, CheckCircle2 } from "lucide-react";

interface CaseItem {
  id: string;
  title: string;
  description: string;
  system: string;
  difficulty: "Intermediate" | "Advanced" | "Expert";
  duration: string;
  patientCode: string;
  flagship?: boolean;
}

const CLINICAL_CASES: CaseItem[] = [
  {
    id: "acs-001",
    title: "Acute Coronary Syndrome (NSTEMI)",
    description: "58M with acute crushing central chest pain radiating to the left arm and diaphoresis — flag-ship Bayesian reasoning simulation.",
    system: "Cardiovascular",
    difficulty: "Advanced",
    duration: "20 min",
    patientCode: "ACS-001",
    flagship: true,
  },
  {
    id: "resp-1187",
    title: "Acute Respiratory Deterioration",
    description: "Rapid desaturation in a post-operative patient. Practice escalation timing and avoid hypoxic myocardial strain.",
    system: "Respiratory",
    difficulty: "Advanced",
    duration: "30 min",
    patientCode: "PT-1187",
  },
  {
    id: "syst-2048",
    title: "Acute systemic deterioration",
    description: "56M with progressive dyspnea, tachycardia and rising creatinine — track cardio-respiratory-renal interaction.",
    system: "Multi-system",
    difficulty: "Advanced",
    duration: "40 min",
    patientCode: "PT-2048",
  },
  {
    id: "cr-2211",
    title: "Cardio-Renal Interaction",
    description: "Heart failure with worsening renal function — balance diuresis against perfusion in cardiorenal syndrome.",
    system: "Cardiovascular",
    difficulty: "Advanced",
    duration: "35 min",
    patientCode: "PT-2211",
  },
  {
    id: "sepsis-0933",
    title: "Sepsis Progression",
    description: "Early sepsis recognition and the Hour-1 bundle under time pressure — prevent multi-organ failure.",
    system: "Multi-system",
    difficulty: "Expert",
    duration: "45 min",
    patientCode: "PT-0933",
  },
  {
    id: "renal-1654",
    title: "Drug-Induced Renal Dysfunction",
    description: "Identify the nephrotoxic culprit and adjust the medication regimen safely.",
    system: "Renal",
    difficulty: "Intermediate",
    duration: "25 min",
    patientCode: "PT-1654",
  },
  {
    id: "shock-3302",
    title: "Multi-organ Shock",
    description: "Undifferentiated shock — narrow the differential using serial hemodynamic markers and ultrasound.",
    system: "Multi-system",
    difficulty: "Expert",
    duration: "50 min",
    patientCode: "PT-3302",
  },
  {
    id: "dka-0871",
    title: "Diabetic Ketoacidosis",
    description: "Fluid, insulin and electrolyte sequencing in a young adult with new-onset DKA.",
    system: "Metabolic",
    difficulty: "Intermediate",
    duration: "30 min",
    patientCode: "PT-0871",
  },
  {
    id: "he-1420",
    title: "Hepatic Encephalopathy Flare",
    description: "Cirrhotic patient with worsening confusion — find the precipitant and restore ammonia clearance.",
    system: "Hepatic",
    difficulty: "Advanced",
    duration: "35 min",
    patientCode: "PT-1420",
  },
];

export function Cardiology() {
  const navigate = useNavigate();
  const [selectedCaseId, setSelectedCaseId] = useState<string>("acs-001");
  const [searchQuery, setSearchQuery] = useState("");
  const [systemFilter, setSystemFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");

  const filteredCases = CLINICAL_CASES.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = systemFilter === "All" || c.system === systemFilter;
    const matchesLevel = levelFilter === "All" || c.difficulty === levelFilter;
    return matchesSearch && matchesSystem && matchesLevel;
  });

  const handleEnterSimulation = () => {
    navigate(`/simulation/new/${selectedCaseId}`);
  };

  const getBadgeClass = (difficulty: "Intermediate" | "Advanced" | "Expert") => {
    switch (difficulty) {
      case "Expert":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "Advanced":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "Intermediate":
      default:
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Page Title Header (Screenshot 2 exact style) */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Choose a case study
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search or filter the case library, then select one to enter its simulation dashboard.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case studies, keywords, patient codes…"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xs"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-violet-500 shadow-xs"
            >
              <option value="All">All systems</option>
              <option value="Cardiovascular">Cardiovascular</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Multi-system">Multi-system</option>
              <option value="Renal">Renal</option>
              <option value="Metabolic">Metabolic</option>
              <option value="Hepatic">Hepatic</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-violet-500 shadow-xs"
            >
              <option value="All">All levels</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>

        {/* 2-Column Cases Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredCases.map((c) => {
            const isSelected = selectedCaseId === c.id;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`card p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "border-violet-500/80 bg-violet-50/20 dark:bg-violet-950/20 shadow-soft ring-1 ring-violet-500"
                    : "hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                        {c.title}
                      </h3>
                      {c.flagship && (
                        <span className="golden-badge text-[9px] py-0">
                          Flagship
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeClass(
                        c.difficulty
                      )}`}
                    >
                      {c.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {c.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                      {c.system}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {c.duration}
                    </span>
                    <span>{c.patientCode}</span>
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4" /> Selected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Bottom Sticky Enter Action (Screenshot 2 bottom center button) */}
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-20 pointer-events-none">
          <button
            onClick={handleEnterSimulation}
            className="pointer-events-auto px-8 py-3 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-display font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-violet-700/30 hover:shadow-violet-700/50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span>Enter Simulation Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
