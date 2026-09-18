import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { platformApi } from "../api/client";
import { DigitalTwinSchematic, OrganStatus } from "../components/DigitalTwinSchematic";
import { CounterfactualExplorer } from "../components/CounterfactualExplorer";
import { ModelConfidenceCard } from "../components/ModelConfidenceCard";
import { useTheme } from "../context/ThemeContext";
import {
  Activity,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Heart,
  Clock,
  Zap,
  ShieldAlert,
  GitCompare,
  History,
  FileText,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";

export function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrganInfo, setSelectedOrganInfo] = useState<OrganStatus | null>(null);

  const statsSectionRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const digitalTwinSectionRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const counterfactualSectionRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  useEffect(() => {
    platformApi
      .dashboard()
      .then(setData)
      .catch(() => {
        setData({
          competencyScore: 84,
          reasoningScore: 78,
          casesCompleted: 24,
          cardiologyProgress: 4,
          recommendedCase: {
            recommendedCaseId: "acs-001",
            reason: "Practice early antithrombotic timing in acute coronary syndromes.",
            case: { title: "Cardio-respiratory cascade (ACS-001)" },
          },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    {
      label: "Clinical Reasoning",
      value: "78%",
      delta: "+8% this month",
      trend: "up",
      points: [62, 65, 70, 72, 75, 78],
    },
    {
      label: "Diagnostic Accuracy",
      value: "84%",
      delta: "+5% this month",
      trend: "up",
      points: [74, 78, 80, 81, 82, 84],
    },
    {
      label: "Intervention Timing",
      value: "81%",
      delta: "Strong",
      trend: "up",
      points: [70, 72, 74, 78, 80, 81],
    },
    {
      label: "Decision Efficiency",
      value: "76%",
      delta: "Improving",
      trend: "up",
      points: [65, 68, 70, 71, 74, 76],
    },
    {
      label: "Cases Completed",
      value: "24",
      delta: "6 this week",
      trend: "up",
      points: [10, 14, 16, 18, 20, 24],
    },
  ];

  const vitals = [
    {
      label: "Heart Rate",
      value: "104",
      unit: "bpm",
      ref: "Ref: 60-100 bpm",
      status: "watch",
      percent: 75,
      delta: "↗",
    },
    {
      label: "SpO2",
      value: "91",
      unit: "%",
      ref: "Ref: 95-100 %",
      status: "critical",
      percent: 91,
      delta: "↘",
    },
    {
      label: "Blood Pressure",
      value: "146/92",
      unit: "mmHg",
      ref: "Ref: 90-120 mmHg",
      status: "watch",
      percent: 78,
      delta: "↗",
    },
    {
      label: "Respiratory Rate",
      value: "26",
      unit: "/min",
      ref: "Ref: 12-20 /min",
      status: "critical",
      percent: 85,
      delta: "↗",
    },
    {
      label: "Temperature",
      value: "38.4",
      unit: "°C",
      ref: "Ref: 36.5-37.5 °C",
      status: "watch",
      percent: 65,
      delta: "↗",
    },
    {
      label: "Creatinine",
      value: "1.8",
      unit: "mg/dL",
      ref: "Ref: 0.7-1.3 mg/dL",
      status: "watch",
      percent: 70,
      delta: "↗",
    },
  ];

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Loading clinical performance & digital twin telemetry…
          </p>
        </div>
      </AppShell>
    );
  }

  const sparklineStroke = theme === "dark" ? "#a78bfa" : "#7c5cfc";

  return (
    <AppShell>
      <div className="space-y-6 pb-16 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/cardiology"
            className="text-xs text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 font-medium flex items-center gap-1 transition-colors"
          >
            ← Back to case selection
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Jump to section:</span>
            <a href="#digital-twin" className="text-[11px] text-violet-600 dark:text-violet-400 font-medium hover:underline">
              Digital Twin
            </a>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <a href="#predictions" className="text-[11px] text-violet-600 dark:text-violet-400 font-medium hover:underline">
              Confidence & Predictions
            </a>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <a href="#counterfactual" className="text-[11px] text-violet-600 dark:text-violet-400 font-medium hover:underline">
              Counterfactuals
            </a>
          </div>
        </div>

        {/* Hero Banner Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Welcome Card (Secondary soft pink-violet gradient atmosphere) */}
          <div className="lg:col-span-8 p-7 rounded-3xl bg-gradient-to-br from-[#1e1338] via-[#2d1854] to-[#3b185f] dark:from-[#17102e] dark:via-[#211540] dark:to-[#2b1752] text-white shadow-elevated border border-violet-500/20 relative overflow-hidden flex flex-col justify-between">
            {/* Ambient inner glow */}
            <div className="absolute right-0 bottom-0 w-96 h-96 bg-gradient-to-tl from-fuchsia-500/20 via-violet-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <span className="eyebrow-tag text-violet-300 block mb-2">
                WELCOME BACK
              </span>
              <h2 className="heading-gradient text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Good evening, Dr. Rao
              </h2>
              <p className="text-violet-100/90 text-[13.5px] md:text-[14.5px] mt-2 max-w-xl leading-relaxed">
                Your clinical reasoning is improving across acute cardiology simulations. Continue your
                adaptive learning pathway or explore the multi-organ digital twin below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6 relative z-10">
              <Link
                to="/simulation/new/acs-001"
                className="btn-primary text-xs px-5 py-2.5 shadow-glow-violet flex items-center gap-2 font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start New Simulation</span>
              </Link>
              <Link
                to="/golden-hour"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-violet-300/20 text-white font-semibold text-xs flex items-center gap-2 transition-colors backdrop-blur-sm"
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Golden Hour Resuscitation</span>
              </Link>
            </div>
          </div>

          {/* Today's Focus Card (Subtle floating bob applied) */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#1c1533]/90 border border-[#e9e5fb] dark:border-[#2b224c] shadow-card flex flex-col justify-between floating-bob">
            <div>
              <span className="eyebrow-tag text-violet-600 dark:text-violet-400 block mb-1.5">
                TODAY'S FOCUS
              </span>
              <h3 className="font-display font-extrabold text-slate-900 dark:text-slate-100 text-lg md:text-xl leading-snug">
                Multi-organ instability
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Cardio-respiratory cascade management
              </p>
            </div>

            <div className="my-4 pt-3 border-t border-[#e9e5fb] dark:border-[#2b224c] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Recommended Case</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {data?.recommendedCase?.case?.title || "Acute Coronary Syndrome (ACS-001)"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Duration</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ~25 min
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block">Focus Rationale</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {data?.recommendedCase?.reason || "Practice early antithrombotic timing and Bayesian updates."}
                </span>
              </div>
            </div>

            <Link
              to={`/simulation/new/${data?.recommendedCase?.recommendedCaseId || "acs-001"}`}
              className="w-full btn-secondary text-xs py-2 text-center"
            >
              Start Recommended Case →
            </Link>
          </div>
        </div>

        {/* 5 KPI Metric Sparkline Cards with Stat Value Emphasis */}
        <div
          ref={statsSectionRef}
          className="reveal-on-scroll grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          {kpis.map((kpi, idx) => (
            <div
              key={kpi.label}
              className={`card p-4 flex flex-col justify-between ${
                idx === 4 ? "col-span-2 md:col-span-1" : ""
              }`}
            >
              <div>
                <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 block mb-1.5 leading-snug">
                  {kpi.label}
                </span>
                <span className="stat-value-emphasis text-slate-900 dark:text-slate-100 block">
                  {kpi.value}
                </span>
              </div>

              {/* Sparkline SVG with refined violet accent stroke */}
              <div className="my-2 h-6 flex items-center">
                <svg className="w-full h-full" viewBox="0 0 100 24">
                  <path
                    d={`M 0 ${24 - (kpi.points[0] / 100) * 20} Q 25 ${
                      24 - (kpi.points[2] / 100) * 20
                    }, 50 ${24 - (kpi.points[3] / 100) * 20} T 100 ${
                      24 - (kpi.points[5] / 100) * 20
                    }`}
                    fill="none"
                    stroke={sparklineStroke}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-300 font-bold leading-normal">
                <TrendingUp className="w-3 h-3" />
                <span>{kpi.delta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Central Patient Model & Patient State Vitals Grid */}
        <div
          id="digital-twin"
          ref={digitalTwinSectionRef}
          className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-12 gap-5"
        >
          {/* Central Patient Model (Left Card) */}
          <div className="lg:col-span-7 card p-6">
            <DigitalTwinSchematic onSelectOrgan={(org) => setSelectedOrganInfo(org)} />
          </div>

          {/* Patient State Live Vitals (Right Card) */}
          <div className="lg:col-span-5 card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="heading-gradient font-display font-bold text-base">
                  Patient State
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  State updated 12 sec ago
                </p>
              </div>
              <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                Live Stream
              </span>
            </div>

            {/* Vitals Grid (Clinical status colors: green/amber/red strictly preserved) */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              {vitals.map((v) => (
                <div
                  key={v.label}
                  className="p-3 rounded-xl bg-violet-50/40 dark:bg-[#130e26]/60 border border-[#e9e5fb] dark:border-[#2b224c] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-[12px] font-medium text-slate-600 dark:text-slate-300">
                    <span>{v.label}</span>
                    <span
                      className={`font-bold ${
                        v.status === "critical"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {v.delta}
                    </span>
                  </div>

                  <div className="my-1">
                    <div className="flex items-baseline gap-1">
                      <span className="stat-value-emphasis text-2xl text-slate-900 dark:text-slate-100">
                        {v.value}
                      </span>
                      <span className="text-xs text-slate-400">{v.unit}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block">{v.ref}</span>
                  </div>

                  {/* Vitals Range Bar (Clinical Status: Red/Amber/Green preserved) */}
                  <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        v.status === "critical"
                          ? "bg-rose-500"
                          : v.status === "watch"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${v.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#e9e5fb] dark:border-[#2b224c] text-xs text-slate-500 flex items-center justify-between">
              <span>Simulation Status: Resuscitation Step 2</span>
              <Link
                to="/simulation/new/acs-001"
                className="text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1"
              >
                Go to simulation workspace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Section: Counterfactual Resuscitation Bar */}
        <div id="counterfactual" ref={counterfactualSectionRef} className="reveal-on-scroll">
          <CounterfactualExplorer />
        </div>

        {/* Section: Model Confidence & Prediction Breakdown */}
        <div id="predictions" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <ModelConfidenceCard />
          </div>

          <div className="lg:col-span-5 card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="heading-gradient font-display font-bold text-base">
                  Diagnostic Alert Radar
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Active clinical guardrails detecting cognitive heuristics and premature closure risks.
              </p>
            </div>

            <div className="space-y-2.5 my-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">
                  ⚠ Anchoring Heuristic Guardrail
                </span>
                <p className="text-amber-900/90 dark:text-amber-200">
                  Do not dismiss thoracic aortic dissection prior to confirming symmetric upper-extremity blood pressures.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 text-xs">
                <span className="font-bold text-violet-800 dark:text-violet-300 block mb-0.5">
                  ✦ Serial Troponin Biomarker Rule
                </span>
                <p className="text-violet-900/90 dark:text-violet-200">
                  A high-sensitivity troponin rise of {">"}20% at 3 hours confirms myocardial injury per 4th Universal Definition.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link to="/mistakes" className="btn-secondary text-xs flex-1 text-center">
                Review Mistake Memory
              </Link>
              <Link to="/cardiology" className="btn-primary text-xs flex-1 text-center">
                Simulate Cases
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
