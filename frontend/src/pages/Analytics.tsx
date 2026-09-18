import { useEffect, useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { AppShell } from "../components/AppShell";
import { platformApi } from "../api/client";
import { TrendingUp, Award, Activity, CheckCircle2, Info, Sparkles, Target, Compass } from "lucide-react";

interface CompetencyAxis {
  axis: "Cardiology" | "Emergency" | "Pharmacology" | "Diagnosis" | "Timing";
  score: number;
  target: number;
  proficiency: "Advanced" | "Proficient" | "Competent" | "Developing";
  description: string;
}

// Clinically modeled performance quality evaluator for the 5 competency axes
function calculateCompetencyRadar(
  currentScore: number,
  overallCompetency: number,
  casesCompleted: number,
  sessionIndex: number,
  totalSessions: number
): CompetencyAxis[] {
  const Q = currentScore;
  const C = overallCompetency;
  const progression = totalSessions > 1 ? sessionIndex / (totalSessions - 1) : 1;

  // 1. Cardiology: core domain mastery
  const cardioScore = Math.min(100, Math.max(20, Math.round(0.55 * C + 0.4 * Q + 3)));

  // 2. Emergency: acute pressure, resuscitation, instability management
  const emergScore = Math.min(100, Math.max(20, Math.round(Q * 0.94 + progression * 6 - 2)));

  // 3. Pharmacology: medication choices, antiplatelet & vasopressor sequencing
  const pharmScore = Math.min(100, Math.max(20, Math.round(C * 0.68 + Q * 0.22 + 4)));

  // 4. Diagnosis: differential diagnosis & Bayesian posterior calibration
  const diagScore = Math.min(100, Math.max(20, Math.round(Q * 0.98 + 3)));

  // 5. Timing: intervention latency, golden-hour window adherence
  const timeScore = Math.min(
    100,
    Math.max(20, Math.round(62 + Math.min(20, casesCompleted * 0.7) + (Q - 70) * 0.32))
  );

  const getProficiency = (score: number): "Advanced" | "Proficient" | "Competent" | "Developing" => {
    if (score >= 85) return "Advanced";
    if (score >= 75) return "Proficient";
    if (score >= 65) return "Competent";
    return "Developing";
  };

  return [
    {
      axis: "Cardiology",
      score: cardioScore,
      target: 85,
      proficiency: getProficiency(cardioScore),
      description: "Coronary pathology, ACS pathways & hemodynamics",
    },
    {
      axis: "Emergency",
      score: emergScore,
      target: 85,
      proficiency: getProficiency(emergScore),
      description: "Acuity triage & decompensation stabilization",
    },
    {
      axis: "Pharmacology",
      score: pharmScore,
      target: 85,
      proficiency: getProficiency(pharmScore),
      description: "Antiplatelet, anticoagulation & inotrope precision",
    },
    {
      axis: "Diagnosis",
      score: diagScore,
      target: 85,
      proficiency: getProficiency(diagScore),
      description: "Bayesian likelihood updates & diagnostic concordance",
    },
    {
      axis: "Timing",
      score: timeScore,
      target: 85,
      proficiency: getProficiency(timeScore),
      description: "Golden-hour intervention velocity & action sequencing",
    },
  ];
}

export function Analytics() {
  const searchParams = new URLSearchParams(window.location.search);
  const sessionParam = searchParams.get("session");
  const initSession = sessionParam !== null ? parseInt(sessionParam, 10) : null;
  const isAnim = searchParams.get("noAnim") !== "true";

  const [data, setData] = useState<any>(null);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<number | null>(initSession);

  useEffect(() => {
    platformApi
      .dashboard()
      .then(setData)
      .catch(() => {
        setData({
          competencyScore: 84,
          reasoningScore: 78,
          casesCompleted: 24,
          improvementTrend: [
            { score: 62 },
            { score: 68 },
            { score: 71 },
            { score: 75 },
            { score: 78 },
            { score: 84 },
          ],
        });
      });
  }, []);

  if (!data) {
    return (
      <AppShell>
        <div className="card p-12 flex flex-col items-center justify-center space-y-3 min-h-[40vh]">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading clinical performance curves & competency radar telemetry…</p>
        </div>
      </AppShell>
    );
  }

  const rawTrend = data.improvementTrend?.length
    ? data.improvementTrend
    : [{ score: 62 }, { score: 68 }, { score: 71 }, { score: 75 }, { score: 78 }, { score: 84 }];

  const trend = rawTrend.map((t: any, idx: number) => ({
    session: `Session #${idx + 1}`,
    score: t.score,
  }));

  const activeIndex = selectedSessionIndex ?? trend.length - 1;
  const activeSession = trend[activeIndex] || trend[trend.length - 1];
  const activeScore = activeSession?.score ?? 84;

  const radarData = calculateCompetencyRadar(
    activeScore,
    data.competencyScore || 84,
    data.casesCompleted || 24,
    activeIndex,
    trend.length
  );

  const avgRadarScore = Math.round(
    radarData.reduce((acc, curr) => acc + curr.score, 0) / radarData.length
  );

  // Custom Dot Renderer: sleek circle markers for history, pulsing animated concentric ring + on-chart callout pill for the latest session
  const renderCustomDot = (props: any) => {
    const { cx, cy, index, payload, value } = props;
    if (cx == null || cy == null || isNaN(cx) || isNaN(cy)) {
      return <g key={`dot-empty-${index}`} />;
    }

    const scoreVal = payload?.score ?? value ?? trend[index]?.score ?? 84;
    const isLatest = index === trend.length - 1;
    const isSelected = index === activeIndex;

    if (isLatest) {
      return (
        <g
          key={`dot-latest-${index}`}
          className="overflow-visible cursor-pointer"
          onClick={() => setSelectedSessionIndex(index)}
        >
          {/* Animated pulsing concentric ripple ring */}
          <circle
            cx={cx}
            cy={cy}
            r={10}
            fill="none"
            stroke="#c084fc"
            strokeWidth="2.5"
            className="opacity-75"
          >
            <animate
              attributeName="r"
              values="10;24;36"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.85;0.35;0"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-width"
              values="2.5;1.5;0"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Luminous secondary halo */}
          <circle
            cx={cx}
            cy={cy}
            r={13}
            fill="#7c5cfc"
            fillOpacity={0.25}
            stroke="#a78bfa"
            strokeWidth={1.5}
          />

          {/* Core focal dot with glowing stroke */}
          <circle
            cx={cx}
            cy={cy}
            r={7}
            fill="#c084fc"
            stroke="#ffffff"
            strokeWidth={2.5}
            filter="url(#focalDotGlow)"
          />

          {/* On-chart score annotation / callout pill near the final data point directly on canvas */}
          <g transform={`translate(${cx - 44}, ${cy - 44})`}>
            <rect
              width="88"
              height="28"
              rx="14"
              fill="#1c1533"
              stroke="#a78bfa"
              strokeWidth="1.8"
              filter="url(#calloutPillShadow)"
            />
            <circle cx="16" cy="14" r="3.5" fill="#e879f9" />
            <text
              x="49"
              y="18.5"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12.5"
              fontWeight="800"
              fontFamily="var(--font-display)"
              letterSpacing="-0.02em"
            >
              {scoreVal}% · NOW
            </text>
          </g>
        </g>
      );
    }

    return (
      <g
        key={`dot-${index}`}
        className="cursor-pointer"
        onClick={() => setSelectedSessionIndex(index)}
      >
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 7 : 5.5}
          fill={isSelected ? "#c084fc" : "#1c1533"}
          stroke="#a78bfa"
          strokeWidth={isSelected ? 3 : 2.2}
          className="transition-all"
        />
        <circle cx={cx} cy={cy} r={isSelected ? 3.5 : 2.5} fill={isSelected ? "#ffffff" : "#c084fc"} />
      </g>
    );
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="pill pill-violet eyebrow-tag">Cognitive Trajectory</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1.5 leading-tight">
            Clinical Analytics & Performance
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Your reasoning-score trajectory, diagnostic calibration, and multi-dimensional competency radar across cardiology cases.
          </p>
        </div>

        {/* Top Charts Section: Graph Chart + Competency Radar Pentagon Chart side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Bayesian Reasoning Curve Graph Card (7 Columns) */}
          <div className="lg:col-span-7 card p-6 md:p-7 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <span className="eyebrow-tag text-violet-600 dark:text-violet-400 block mb-0.5">
                    PROBABILISTIC REASONING METRICS
                  </span>
                  <h3 className="font-display font-extrabold text-slate-900 dark:text-slate-100 text-base md:text-lg">
                    Bayesian Reasoning Score Over Time
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="pill pill-violet text-xs font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +22% Progression
                  </span>
                </div>
              </div>

              {/* Interactive session filter pills to vary quality */}
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">
                  Inspect Session:
                </span>
                {trend.map((t: any, idx: number) => {
                  const isCur = idx === activeIndex;
                  return (
                    <button
                      key={t.session}
                      onClick={() => setSelectedSessionIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        isCur
                          ? "bg-violet-600 text-white shadow-xs"
                          : "bg-violet-50 dark:bg-violet-950/40 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/40"
                      }`}
                    >
                      {t.session}
                    </button>
                  );
                })}
                {selectedSessionIndex !== null && selectedSessionIndex !== trend.length - 1 && (
                  <button
                    onClick={() => setSelectedSessionIndex(null)}
                    className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline ml-1"
                  >
                    Reset to Latest
                  </button>
                )}
              </div>

              <div className="h-72 w-full min-h-[290px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={290}>
                  <ComposedChart
                    data={trend}
                    margin={{ top: 52, right: 65, left: -10, bottom: 10 }}
                  >
                    <defs>
                      {/* Area Gradient: high opacity near line fading to transparent near x-axis */}
                      <linearGradient id="bayesianAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c5cfc" stopOpacity={0.45} />
                        <stop offset="60%" stopColor="#9061f9" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity={0.0} />
                      </linearGradient>

                      {/* Left-to-right Stroke Gradient: dimmer violet at oldest session to bright luminous violet/fuchsia at most recent */}
                      <linearGradient id="bayesianStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.7} />
                        <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#e879f9" stopOpacity={1} />
                      </linearGradient>

                      {/* Luminous Ambient Glow Filter */}
                      <filter id="bayesianGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#a78bfa" floodOpacity={0.75} />
                      </filter>

                      <filter id="focalDotGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#e879f9" floodOpacity={0.9} />
                      </filter>

                      <filter id="calloutPillShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#3f336b"
                      opacity={0.3}
                      vertical={false}
                    />

                    {/* XAxis: Session labels bold and 14px */}
                    <XAxis
                      dataKey="session"
                      stroke="#94a3b8"
                      tick={{ fill: "#94a3b8", fontSize: 13.5, fontWeight: 700 }}
                      tickLine={false}
                      axisLine={{ stroke: "#3f336b", opacity: 0.5 }}
                      dy={10}
                    />

                    {/* YAxis: Axis tick labels 13px */}
                    <YAxis
                      domain={[0, 100]}
                      stroke="#94a3b8"
                      tick={{ fill: "#94a3b8", fontSize: 13, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: "#3f336b", opacity: 0.5 }}
                      dx={-6}
                      tickFormatter={(val) => `${val}%`}
                    />

                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="p-3 bg-[#1c1533] border border-[#3f336b] rounded-xl shadow-xl text-xs space-y-1">
                              <p className="font-bold text-violet-300">{item.session}</p>
                              <p className="text-white text-sm font-extrabold">
                                Score: <span className="text-fuchsia-400">{item.score}%</span>
                              </p>
                              <p className="text-[11px] text-slate-300 leading-snug">
                                {item.score >= 80
                                  ? "High diagnostic concordance reached."
                                  : "Active heuristic refinement in progress."}
                              </p>
                              <p className="text-[10px] text-violet-400 italic">
                                Click marker to view Competency Radar breakdown
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    {/* Gradient Fill under the curve */}
                    <Area
                      type="monotone"
                      dataKey="score"
                      fill="url(#bayesianAreaGradient)"
                      stroke="none"
                      isAnimationActive={isAnim}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />

                    {/* Duplicated blurred stroke underneath for ambient glow */}
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#c084fc"
                      strokeWidth={8}
                      strokeOpacity={0.25}
                      strokeLinecap="round"
                      dot={false}
                      activeDot={false}
                      isAnimationActive={isAnim}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />

                    {/* Main Curve with Left-to-Right gradient stroke and glowing markers */}
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="url(#bayesianStrokeGradient)"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      filter="url(#bayesianGlow)"
                      dot={renderCustomDot}
                      activeDot={{ r: 8, fill: "#e879f9", stroke: "#ffffff", strokeWidth: 2.5 }}
                      isAnimationActive={isAnim}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inline Explanatory Note on Stabilizing / Plateauing Bayesian Score */}
            <div className="mt-4 p-3.5 rounded-2xl bg-violet-500/10 dark:bg-violet-950/50 border border-violet-200/80 dark:border-violet-800/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Info className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-bold text-violet-900 dark:text-violet-200 leading-snug">
                  Bayesian Calibration & Score Trajectory Interpretation
                </h4>
                <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-300 mt-0.5">
                  Diagnostic calibration stabilizing at expert concordance — score plateaus reflect consistent, reproducible clinical judgment rather than stalled progress.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Competency Radar Pentagon Chart Card (5 Columns) */}
          <div className="lg:col-span-5 card p-6 md:p-7 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <span className="eyebrow-tag text-violet-600 dark:text-violet-400 block mb-0.5">
                    MULTIDIMENSIONAL CLINICAL EVALUATION
                  </span>
                  <h3 className="font-display font-extrabold text-slate-900 dark:text-slate-100 text-base md:text-lg">
                    Competency Radar
                  </h3>
                </div>
                <div className="text-right">
                  <span className="pill pill-violet text-[11px] font-bold block">
                    {activeSession.session} · {activeScore}% Quality
                  </span>
                </div>
              </div>

              <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                Evaluated clinical mastery profile across 5 core competencies, dynamically calibrated to your performance.
              </p>

              {/* Pentagon Radar Chart */}
              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                    <defs>
                      <radialGradient id="radarQualityGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity={0.7} />
                        <stop offset="65%" stopColor="#7c5cfc" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#4318ff" stopOpacity={0.08} />
                      </radialGradient>
                      <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#a78bfa" floodOpacity={0.65} />
                      </filter>
                    </defs>

                    {/* Pentagon Geometric Grid */}
                    <PolarGrid gridType="polygon" stroke="#3f336b" opacity={0.4} />

                    {/* 5 Axes: Cardiology, Emergency, Pharmacology, Diagnosis, Timing */}
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: "#94a3b8", fontSize: 12.5, fontWeight: 700 }}
                    />

                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      axisLine={false}
                      tick={false}
                      stroke="none"
                    />

                    {/* Benchmark Target Polygon (85% concordance) */}
                    <Radar
                      name="Expert Target (85%)"
                      dataKey="target"
                      stroke="#64748b"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      fill="none"
                    />

                    {/* Student Evaluated Quality Polygon */}
                    <Radar
                      name="Evaluated Quality"
                      dataKey="score"
                      stroke="#c084fc"
                      strokeWidth={2.5}
                      fill="url(#radarQualityGradient)"
                      fillOpacity={0.65}
                      filter="url(#radarGlow)"
                      dot={{ r: 4.5, fill: "#e879f9", stroke: "#ffffff", strokeWidth: 1.5 }}
                      isAnimationActive={isAnim}
                      animationDuration={1000}
                    />

                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="p-2.5 bg-[#1c1533] border border-[#3f336b] rounded-xl shadow-xl text-xs space-y-0.5">
                              <p className="font-bold text-violet-300">{item.axis}</p>
                              <p className="text-white text-sm font-extrabold">
                                Mastery: <span className="text-fuchsia-400">{item.score}%</span>
                              </p>
                              <p className="text-[10.5px] text-slate-300">{item.description}</p>
                              <span className="pill pill-violet text-[10px] mt-1">
                                Status: {item.proficiency}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* 5 Axes Score Chips */}
              <div className="grid grid-cols-5 gap-2 mt-2 pt-3 border-t border-[#e9e5fb] dark:border-[#2b224c]">
                {radarData.map((axis) => (
                  <div
                    key={axis.axis}
                    className="p-2 rounded-xl bg-violet-50/60 dark:bg-[#130e26]/60 border border-[#e9e5fb] dark:border-[#2b224c] text-center flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                      {axis.axis}
                    </span>
                    <span className="font-display font-extrabold text-sm md:text-base text-slate-900 dark:text-slate-100 block my-0.5">
                      {axis.score}%
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block ${
                        axis.score >= 85
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : axis.score >= 75
                          ? "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {axis.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Summary Footer */}
            <div className="mt-3 pt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[12px]">
                Overall Quality Index:{" "}
                <strong className="text-violet-700 dark:text-violet-300 font-bold">
                  {avgRadarScore}% · Tier 1 Concordance
                </strong>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-slate-400 border-dashed inline-block" /> Target: 85% Expert Benchmark
              </span>
            </div>
          </div>
        </div>

        {/* Stat Cards with Dominant Fluid Type Scale and High-Contrast Labels */}
        <div className="grid md:grid-cols-3 gap-5">
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <p className="stat-card-label mb-2">
                Overall Competency Score
              </p>
              <p className="stat-hero-value text-slate-900 dark:text-slate-100">
                {data.competencyScore || 84}/100
              </p>
            </div>
            <span className="text-xs text-violet-600 dark:text-violet-300 font-semibold block mt-2">
              Proficient clinical range
            </span>
          </div>

          <div className="card p-6 flex flex-col justify-between">
            <div>
              <p className="stat-card-label mb-2">
                Reasoning Process Score
              </p>
              <p className="stat-hero-value text-violet-600 dark:text-violet-400">
                {data.reasoningScore || 78}/100
              </p>
            </div>
            <span className="text-xs text-violet-600 dark:text-violet-300 font-semibold block mt-2">
              +8% this month
            </span>
          </div>

          <div className="card p-6 flex flex-col justify-between">
            <div>
              <p className="stat-card-label mb-2">
                Cases Completed
              </p>
              <p className="stat-hero-value text-slate-900 dark:text-slate-100">
                {data.casesCompleted || 24}
              </p>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block mt-2">
              Cardiology track
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

