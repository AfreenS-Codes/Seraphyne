import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, History, Award, CheckCircle2, AlertCircle, ArrowRight, Calendar, Clock } from "lucide-react";
import { platformApi } from "../api/client";

export interface CaseSessionRecord {
  id: string;
  caseId: string;
  caseTitle: string;
  date: string;
  duration: string;
  score: number;
  accuracy: number;
  outcome: "favorable" | "suboptimal";
  decisionLabel: string;
  mistakesDetected: string[];
}

const DEFAULT_HISTORY: CaseSessionRecord[] = [
  {
    id: "sess-8941",
    caseId: "acs-001",
    caseTitle: "58M with Acute Central Chest Pain (NSTEMI)",
    date: "Today, 06:15",
    duration: "18 mins",
    score: 88,
    accuracy: 94,
    outcome: "favorable",
    decisionLabel: "Initiate Dual Antiplatelet + Heparin + Urgent Cath Lab",
    mistakesDetected: [],
  },
  {
    id: "sess-8210",
    caseId: "acs-001",
    caseTitle: "58M with Acute Central Chest Pain (Flagship)",
    date: "Yesterday, 14:20",
    duration: "24 mins",
    score: 72,
    accuracy: 80,
    outcome: "suboptimal",
    decisionLabel: "Awaited 3-hour Troponin before initiating anticoagulation",
    mistakesDetected: ["premature_closure_troponin", "delayed_antiplatelet"],
  },
  {
    id: "sess-7740",
    caseId: "afib-001",
    caseTitle: "72F with Rapid Atrial Fibrillation & Hypotension",
    date: "Sep 12, 11:05",
    duration: "15 mins",
    score: 85,
    accuracy: 90,
    outcome: "favorable",
    decisionLabel: "Synchronized DC Cardioversion + Anticoagulation",
    mistakesDetected: [],
  },
  {
    id: "sess-6912",
    caseId: "hf-001",
    caseTitle: "65M with Decompensated Heart Failure & Orthopnea",
    date: "Sep 10, 09:30",
    duration: "22 mins",
    score: 76,
    accuracy: 78,
    outcome: "suboptimal",
    decisionLabel: "Aggressive IV Fluid Bolus administered prior to lung auscultation",
    mistakesDetected: ["fluid_overload_in_heart_failure"],
  },
];

interface CaseHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CaseHistoryDrawer({ isOpen, onClose }: CaseHistoryDrawerProps) {
  const [sessions, setSessions] = useState<CaseSessionRecord[]>(DEFAULT_HISTORY);
  const [filter, setFilter] = useState<"all" | "favorable" | "suboptimal">("all");

  useEffect(() => {
    // Attempt to load live sessions if available
    platformApi
      .dashboard()
      .then((data) => {
        if (data && data.recentSessions && data.recentSessions.length > 0) {
          // Can enrich from data
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) => {
    if (filter === "favorable") return s.outcome === "favorable";
    if (filter === "suboptimal") return s.outcome === "suboptimal";
    return true;
  });

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-200 dark:border-violet-800">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
              Case History & Audit
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Past clinical sessions, reasoning traces & outcomes
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

      {/* Filter Tabs */}
      <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex gap-2 text-xs">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full font-medium transition-colors ${
            filter === "all"
              ? "bg-slate-800 text-white dark:bg-violet-600 dark:text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          All Cases ({sessions.length})
        </button>
        <button
          onClick={() => setFilter("favorable")}
          className={`px-3 py-1 rounded-full font-medium transition-colors ${
            filter === "favorable"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
          }`}
        >
          Favorable
        </button>
        <button
          onClick={() => setFilter("suboptimal")}
          className={`px-3 py-1 rounded-full font-medium transition-colors ${
            filter === "suboptimal"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
          }`}
        >
          Suboptimal
        </button>
      </div>

      {/* List of Sessions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 hover:border-violet-500/40 transition-all space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`pill text-[10px] ${
                    session.outcome === "favorable" ? "pill-violet" : "pill-gold"
                  }`}
                >
                  {session.outcome === "favorable" ? "Favorable Outcome" : "Suboptimal Timing"}
                </span>
                <h4 className="font-display font-semibold text-xs text-slate-800 dark:text-slate-100 mt-1">
                  {session.caseTitle}
                </h4>
              </div>
              <div className="text-right">
                <span className="font-display font-bold text-sm text-violet-600 dark:text-violet-400">
                  {session.score}%
                </span>
                <span className="block text-[9px] text-slate-400">Score</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 dark:text-slate-400 block text-[10px]">
                Decision:
              </span>
              {session.decisionLabel}
            </div>

            {session.mistakesDetected.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {session.mistakesDetected.map((m) => (
                  <span
                    key={m}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50"
                  >
                    ⚠ {m.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {session.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {session.duration}
                </span>
              </div>
              <Link
                to={`/simulation/new/${session.caseId}`}
                onClick={onClose}
                className="text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-0.5"
              >
                Replay <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
