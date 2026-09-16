import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/client";
import { Heart, GraduationCap, Stethoscope, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<"student" | "educator">("student");
  const [fullName, setFullName] = useState("Aanya Rao");
  const [studentId, setStudentId] = useState("MED-2027-114");
  const [institution, setInstitution] = useState("AIIMS New Delhi");
  const [yearBatch, setYearBatch] = useState("MBBS · Year 4");

  const [email, setEmail] = useState("demo@seraphyne.app");
  const [password, setPassword] = useState("seraphyne-demo-2026");
  const [showAdvancedAuth, setShowAdvancedAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      try {
        const res = await authApi.signup(email, password, fullName);
        localStorage.setItem("seraphyne_token", res.token);
        navigate("/dashboard");
      } catch {
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Hero Pane (Screenshot 1 Exact Aesthetic) */}
      <div className="md:w-1/2 bg-gradient-to-br from-[#06182c] via-[#09223e] to-[#040e1b] text-white p-8 md:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-400">
            <Heart className="w-5 h-5 fill-violet-400 text-violet-400" />
          </div>
          <div>
            <span className="font-display font-extrabold text-white tracking-wider text-base block">
              SERAPHYNE
            </span>
          </div>
        </div>

        {/* Hero Value Proposition */}
        <div className="my-auto py-12 relative z-10 max-w-lg">
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400 block mb-3">
            CLINICAL REASONING ENGINE
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
            Train clinical judgment on cases that respond like real patients.
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Probabilistic multi-organ digital twins, adaptive case difficulty, and
            explainable AI feedback on every decision you make.
          </p>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="pt-8 border-t border-slate-700/40 grid grid-cols-3 gap-6 relative z-10">
          <div>
            <span className="font-display font-extrabold text-2xl text-white block">
              1,240+
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Simulated cases
            </span>
          </div>
          <div>
            <span className="font-display font-extrabold text-2xl text-violet-400 block">
              89%
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Model confidence
            </span>
          </div>
          <div>
            <span className="font-display font-extrabold text-2xl text-white block">
              6
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Organ systems modeled
            </span>
          </div>
        </div>
      </div>

      {/* Right Sign-In Pane */}
      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-14 bg-white dark:bg-slate-900">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 block mb-1">
              SIGN IN
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Welcome to Seraphyne
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Tell us who's logging in to load the right learning path.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Role Selection Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  role === "student"
                    ? "bg-violet-50/70 dark:bg-violet-950/40 border-violet-500 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <GraduationCap
                  className={`w-5 h-5 mb-1.5 ${
                    role === "student" ? "text-violet-600 dark:text-violet-400" : "text-slate-400"
                  }`}
                />
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                  I am a student
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Adaptive simulation track
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("educator")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  role === "educator"
                    ? "bg-violet-50/70 dark:bg-violet-950/40 border-violet-500 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <Stethoscope
                  className={`w-5 h-5 mb-1.5 ${
                    role === "educator" ? "text-violet-600 dark:text-violet-400" : "text-slate-400"
                  }`}
                />
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                  I am an educator
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Case authoring & review
                </span>
              </button>
            </div>

            {/* Student Profile Inputs */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Year / Batch
              </label>
              <select
                value={yearBatch}
                onChange={(e) => setYearBatch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="MBBS · Year 4">MBBS · Year 4</option>
                <option value="MBBS · Year 3">MBBS · Year 3</option>
                <option value="Internal Medicine Resident">Internal Medicine Resident</option>
                <option value="Cardiology Fellow">Cardiology Fellow</option>
              </select>
            </div>

            {/* Toggle Advanced / Password credentials */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedAuth(!showAdvancedAuth)}
                className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 font-medium"
              >
                {showAdvancedAuth ? "Hide system credentials" : "Show server credentials"}
              </button>
            </div>

            {showAdvancedAuth && (
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 shadow-soft hover:shadow-glow-violet transition-all disabled:opacity-50"
            >
              {loading ? "Authenticating simulation profile…" : "Continue to case selection"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Educational Disclaimer */}
          <div className="pt-4 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Educational simulation platform. No real patient data is used or stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
