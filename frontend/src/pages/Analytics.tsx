import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AppShell } from "../components/AppShell";
import { platformApi } from "../api/client";

export function Analytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    platformApi.dashboard().then(setData);
  }, []);

  if (!data) {
    return (
      <AppShell>
        <p className="text-slate-500">Loading…</p>
      </AppShell>
    );
  }

  const trend = (data.improvementTrend || []).map((t: any, idx: number) => ({
    session: `#${idx + 1}`,
    score: t.score,
  }));

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold text-slate-800 mb-1">Analytics</h1>
      <p className="text-slate-500 text-sm mb-8">Your reasoning-score trend across completed sessions.</p>

      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-slate-800 mb-4">Reasoning score over time</h3>
        {trend.length === 0 ? (
          <p className="text-sm text-slate-500">Complete a case to start seeing your trend.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="session" stroke="#64748b" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6">
          <p className="text-sm text-slate-500 mb-1">Competency score</p>
          <p className="text-3xl font-semibold text-slate-800">{data.competencyScore}/100</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-500 mb-1">Reasoning score</p>
          <p className="text-3xl font-semibold text-slate-800">{data.reasoningScore}/100</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-500 mb-1">Cases completed</p>
          <p className="text-3xl font-semibold text-slate-800">{data.casesCompleted}</p>
        </div>
      </div>
    </AppShell>
  );
}
