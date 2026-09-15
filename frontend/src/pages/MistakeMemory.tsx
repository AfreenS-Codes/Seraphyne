import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { platformApi } from "../api/client";

export function MistakeMemory() {
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformApi.mistakes().then(setMistakes).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold text-slate-800 mb-1">Mistake Memory</h1>
      <p className="text-slate-500 text-sm mb-8">
        Recurring reasoning patterns detected across your Cardiology sessions. Educational patterns, not clinical psychological diagnoses.
      </p>
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : mistakes.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">No recurring reasoning patterns detected yet.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-softblue text-slate-600 text-left">
              <tr>
                <th className="px-4 py-3">Pattern</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">First seen</th>
                <th className="px-4 py-3">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {mistakes.map((m) => (
                <tr key={m._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800 capitalize">{m.mistakeType.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">{m.frequency}×</td>
                  <td className="px-4 py-3">
                    <span
                      className={`pill ${
                        m.severity === "high"
                          ? "bg-red-50 text-red-600"
                          : m.severity === "moderate"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {m.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">{Math.round(m.confidence * 100)}%</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(m.firstSeen).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(m.lastSeen).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
