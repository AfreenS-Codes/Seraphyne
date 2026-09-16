import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Activity, Clock, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

export function GoldenHour() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto py-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Golden Hour Protocol · Active Emergency</span>
        </div>

        <h1 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          A patient just arrived with acute central chest pain.
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          The clock is ticking. You have 60 minutes of biological survival window to triage, obtain targeted
          history, examine, analyze the 12-lead ECG and Troponin kinetics, and execute coronary reperfusion.
        </p>

        <div className="card p-6 max-w-xl mx-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Simulation Parameters</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Flagship Case</span>
              <strong className="text-slate-800 dark:text-slate-200">ACS-001 (NSTEMI)</strong>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Resuscitation Window</span>
              <strong className="text-violet-600 dark:text-violet-400">60 Minutes</strong>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Reasoning Target</span>
              <strong className="text-amber-600 dark:text-amber-400">&gt;85% Score</strong>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate("/simulation/new/acs-001")}
            className="btn-primary text-sm px-8 py-3.5 shadow-glow-violet font-display font-bold inline-flex items-center gap-2"
          >
            <span>Begin Golden Hour Simulation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
