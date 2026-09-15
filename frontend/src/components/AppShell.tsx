import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-medblue-600 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="font-semibold text-slate-800 tracking-tight">SERAPHYNE</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-slate-600">
            <Link to="/dashboard" className="hover:text-medblue-700">Dashboard</Link>
            <Link to="/domains" className="hover:text-medblue-700">Domains</Link>
            <Link to="/mistakes" className="hover:text-medblue-700">Mistake Memory</Link>
            <Link to="/analytics" className="hover:text-medblue-700">Analytics</Link>
            {user && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <span className="text-slate-500">{user.name}</span>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="text-medblue-700 hover:underline"
                >
                  Log out
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
