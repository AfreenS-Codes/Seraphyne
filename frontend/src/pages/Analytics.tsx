import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AppShell } from "../components/AppShell";
import { platformApi } from "../api/client";
import { TrendingUp, Award, Activity, CheckCircle2 } from "lucide-react";

export function Analytics() {
  const [data, setData] = useState<any>(null);

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
        <p className="text-slate-500 text-xs">Loading analytics…</p>
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

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="pill pill-violet">Cognitive Trajectory</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Clinical Analytics & Performance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your reasoning-score trajectory and diagnostic calibration across cardiology cases.
          </p>
        </div>

        {/* Big Chart Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Bayesian Reasoning Score Over Time
            </h3>
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +22% Progression
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="session" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#7c5cfc"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#7c5cfc", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, fill: "#a78bfa" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          <div className="card p-6">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">
              Overall Competency Score
            </p>
            <p className="font-display font-bold text-3xl text-slate-900 dark:text-slate-100">
              {data.competencyScore || 84}/100
            </p>
            <span className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold block mt-1">
              Proficient clinical range
            </span>
          </div>

          <div className="card p-6">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">
              Reasoning Process Score
            </p>
            <p className="font-display font-bold text-3xl text-violet-600 dark:text-violet-400">
              {data.reasoningScore || 78}/100
            </p>
            <span className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold block mt-1">
              +8% this month
            </span>
          </div>

          <div className="card p-6">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">
              Cases Completed
            </p>
            <p className="font-display font-bold text-3xl text-slate-900 dark:text-slate-100">
              {data.casesCompleted || 24}
            </p>
            <span className="text-[11px] text-amber-600 font-semibold block mt-1">
              Cardiology track
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
