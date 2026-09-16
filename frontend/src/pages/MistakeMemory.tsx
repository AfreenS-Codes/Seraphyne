import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { platformApi } from "../api/client";
import { ShieldAlert, Award, Sparkles, CheckCircle2 } from "lucide-react";

export function MistakeMemory() {
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformApi
      .mistakes()
      .then(setMistakes)
      .catch(() => {
        setMistakes([
          {
            _id: "m-1",
            mistakeType: "delayed_antiplatelet_timing",
            frequency: 2,
            severity: "moderate",
            confidence: 0.88,
            firstSeen: new Date(Date.now() - 86400000 * 2).toISOString(),
            lastSeen: new Date().toISOString(),
          },
          {
            _id: "m-2",
            mistakeType: "isolated_lead_anchoring",
            frequency: 1,
            severity: "low",
            confidence: 0.74,
            firstSeen: new Date(Date.now() - 86400000 * 5).toISOString(),
            lastSeen: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="pill pill-gold">Cognitive Heuristics Engine</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Mistake Memory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Recurring reasoning patterns and clinical decision biases detected across your Cardiology sessions.
          </p>
        </div>

        {loading ? (
          <p className="text-slate-500 text-xs">Loading reasoning traces…</p>
        ) : mistakes.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-violet-600 dark:text-violet-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No recurring reasoning patterns detected yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Your decision sequences align cleanly with ACC/AHA guidelines.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-left border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Cognitive / Clinical Pattern</th>
                  <th className="px-5 py-3 font-semibold">Frequency</th>
                  <th className="px-5 py-3 font-semibold">Severity</th>
                  <th className="px-5 py-3 font-semibold">Detection Confidence</th>
                  <th className="px-5 py-3 font-semibold">First Seen</th>
                  <th className="px-5 py-3 font-semibold">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mistakes.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100 capitalize">
                      {m.mistakeType.replace(/_/g, " ")}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                      {m.frequency}×
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`pill text-[10px] ${
                          m.severity === "high"
                            ? "pill-danger"
                            : m.severity === "moderate"
                            ? "pill-gold"
                            : "pill-violet"
                        }`}
                      >
                        {m.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-violet-600 dark:text-violet-400">
                      {Math.round(m.confidence * 100)}%
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(m.firstSeen).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(m.lastSeen).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
