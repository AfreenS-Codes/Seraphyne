import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { platformApi } from "../api/client";

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformApi
      .dashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Your clinical reasoning progress at a glance.</p>
        </div>
        <Link
          to="/golden-hour"
          className="btn-primary px-5 py-3 text-base shadow-md shadow-medblue-600/20"
        >
          ⏱ Golden Hour
        </Link>
      </div>

      {loading || !data ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard label="Competency score" value={`${data.competencyScore}/100`} />
          <StatCard label="Reasoning score" value={`${data.reasoningScore}/100`} />
          <StatCard label="Cases completed" value={data.casesCompleted} />

          <div className="card p-6 md:col-span-2">
            <h3 className="font-semibold text-slate-800 mb-4">Recommended next case</h3>
            {data.recommendedCase ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-800">{data.recommendedCase.case?.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{data.recommendedCase.reason}</p>
                </div>
                <Link
                  to={`/simulation/new/${data.recommendedCase.recommendedCaseId}`}
                  className="btn-primary whitespace-nowrap"
                >
                  Start case
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No recommendation yet — complete a case to get one.</p>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Common mistakes</h3>
            {data.commonMistakes?.length ? (
              <ul className="space-y-2">
                {data.commonMistakes.map((m: any) => (
                  <li key={m._id} className="flex justify-between text-sm">
                    <span className="text-slate-700 capitalize">{m.mistakeType.replace(/_/g, " ")}</span>
                    <span className="pill bg-amber-100 text-amber-700">{m.frequency}×</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">None detected yet — great start.</p>
            )}
          </div>

          <div className="card p-6 md:col-span-3">
            <h3 className="font-semibold text-slate-800 mb-4">Cardiology progress</h3>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div
                className="bg-teal-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(100, data.cardiologyProgress * 20)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">{data.cardiologyProgress} of 5 Cardiology cases completed</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-semibold text-slate-800">{value}</p>
    </div>
  );
}
