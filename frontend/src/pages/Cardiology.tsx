import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { caseApi } from "../api/client";

export function Cardiology() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    caseApi
      .list()
      .then(setCases)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold text-slate-800 mb-1">Cardiology case library</h1>
      <p className="text-slate-500 text-sm mb-8">5 structured cases, including the flagship Acute Coronary Syndrome case.</p>
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <Link
              key={c.id}
              to={`/simulation/new/${c.id}`}
              className="card p-6 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="pill bg-medblue-100 text-medblue-700 capitalize">{c.difficulty}</span>
                {c.id === "acs-001" && <span className="pill bg-amber-100 text-amber-700">Flagship</span>}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{c.title}</h3>
              <p className="text-sm text-slate-600 mb-4">{c.presenting_complaint}</p>
              <span className="text-sm text-medblue-700 font-medium mt-auto">Start case →</span>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
