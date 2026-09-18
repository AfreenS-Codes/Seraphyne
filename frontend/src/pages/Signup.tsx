import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, password, name);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-6">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 mb-1">Create your account</h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6">Start with the flagship Acute Coronary Syndrome case.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-name" className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Name</label>
            <input
              id="signup-name"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Email</label>
            <input
              id="signup-email"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Password (min 8 characters)</label>
            <input
              id="signup-password"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
          <button className="btn-primary w-full text-xs md:text-sm py-2.5" disabled={loading} type="submit">
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
