import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Activity,
  LayoutDashboard,
  Stethoscope,
  Heart,
  TrendingUp,
  Award,
  History,
  Bot,
  Compass,
  FileText,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  Search,
  Bell,
  Sparkles,
  GitCompare,
  Menu,
  X,
} from "lucide-react";
import { AskSeraphyneDrawer } from "./AskSeraphyneDrawer";
import { CaseComparisonModal } from "./CaseComparisonModal";
import { CaseHistoryDrawer } from "./CaseHistoryDrawer";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [askDrawerOpen, setAskDrawerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Clinical Simulations", to: "/cardiology", icon: Stethoscope },
    { label: "Patient Digital Twins", to: "/dashboard#digital-twin", icon: Heart },
    { label: "My Performance", to: "/analytics", icon: TrendingUp },
    { label: "Competencies", to: "/mistakes", icon: Award },
    { label: "Golden Hour Resuscitation", to: "/golden-hour", icon: Activity },
    { label: "Guidelines & Evidence", to: "/domains", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-clinical-bg dark:bg-clinical-darkBg text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200 relative overflow-hidden">
      {/* Ambient Floating Orbs (Purely atmospheric, slow drift) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute w-[520px] h-[520px] -top-32 -left-20 bg-violet-400/10 dark:bg-violet-600/15 rounded-full blur-3xl animate-ambient-drift" />
        <div className="absolute w-[460px] h-[460px] top-1/3 -right-24 bg-fuchsia-400/10 dark:bg-purple-600/12 rounded-full blur-3xl animate-ambient-drift [animation-delay:6s]" />
        <div className="absolute w-[420px] h-[420px] -bottom-24 left-1/3 bg-violet-500/8 dark:bg-indigo-700/15 rounded-full blur-3xl animate-ambient-drift [animation-delay:12s]" />
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-[#e9e5fb] dark:border-[#2b224c] bg-white/90 dark:bg-[#1c1533]/90 backdrop-blur-md sticky top-0 h-screen z-30 transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-[#e9e5fb] dark:border-[#2b224c] flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-glow-violet group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="font-display font-extrabold text-slate-900 dark:text-slate-100 tracking-tight text-base block leading-none">
                  SERAPHYNE
                </span>
                <span className="text-[10.5px] uppercase tracking-wider font-semibold text-violet-600 dark:text-violet-400 block mt-1">
                  Clinical Reasoning
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              (item.to.includes("#") && location.pathname === "/dashboard");

            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                  isActive
                    ? "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-semibold border border-violet-200/60 dark:border-violet-800/60 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400"
                  }`}
                />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Quick Trigger for Compare & History */}
          <div className="pt-3 mt-3 border-t border-[#e9e5fb] dark:border-[#2b224c] space-y-1">
            <button
              onClick={() => setCompareOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-slate-600 dark:text-slate-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 hover:text-slate-900 dark:hover:text-slate-100 transition-all text-left"
            >
              <GitCompare className="w-4 h-4 text-slate-400" />
              {!sidebarCollapsed && <span>Case Comparison</span>}
            </button>
            <button
              onClick={() => setHistoryOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-slate-600 dark:text-slate-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 hover:text-slate-900 dark:hover:text-slate-100 transition-all text-left"
            >
              <History className="w-4 h-4 text-slate-400" />
              {!sidebarCollapsed && <span>Case Audit History</span>}
            </button>
          </div>
        </nav>

        {/* Sidebar Footer User Area */}
        <div className="p-4 border-t border-[#e9e5fb] dark:border-[#2b224c] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-700 to-purple-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              AR
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || "Aanya Rao"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  MBBS · Year 4 (Cardiology)
                </p>
              </div>
            )}
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Log out"
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative z-10">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 border-b border-[#e9e5fb] dark:border-[#2b224c] bg-white/85 dark:bg-[#1c1533]/85 backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-violet-50 dark:hover:bg-violet-950/40"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb / Title */}
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-slate-900 dark:text-slate-100 text-[15.5px]">
                Clinical Learning Dashboard
              </h1>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                Adaptive clinical reasoning & physiological twins overview
              </p>
            </div>

            {/* Online Simulation Engine Status Pill (Status colors UNCHANGED) */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-[12px] font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Simulation Engine: Online</span>
            </div>
          </div>

          {/* Search bar & Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="hidden md:flex items-center gap-2 bg-white/80 dark:bg-[#130e26]/70 border border-[#e9e5fb] dark:border-[#2b224c] px-3 py-1.5 rounded-xl text-xs text-slate-500 focus-within:ring-2 focus-within:ring-violet-500 w-56 shadow-xs">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search cases, competencies…"
                className="bg-transparent text-xs w-full focus:outline-none dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl border border-[#e9e5fb] dark:border-[#2b224c] bg-white dark:bg-[#1c1533] text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 flex items-center justify-center transition-all shadow-xs hover:shadow-soft"
              aria-label="Toggle Light/Dark Theme"
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-slate-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Ask Seraphyne Button (Refined Violet / Golden Accent) */}
            <button
              onClick={() => setAskDrawerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold shadow-soft hover:shadow-glow-violet transition-all duration-200 border border-amber-400/40 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Ask Seraphyne</span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded">
                AI
              </span>
            </button>

            {/* Download Project Description (.DOCX) */}
            <a
              href="/seraphyne_project_description.docx"
              download="seraphyne_project_description.docx"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-200 dark:border-violet-800/80 bg-violet-50/70 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-medium hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors"
              title="Download Project Description DOCX"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>DOCX Report</span>
            </a>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#e9e5fb] dark:border-[#2b224c] bg-white dark:bg-[#1c1533] p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40"
              >
                <item.icon className="w-4 h-4 text-violet-600" />
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="pt-2 border-t border-[#e9e5fb] dark:border-[#2b224c] flex gap-2">
              <button
                onClick={() => {
                  setCompareOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 btn-secondary text-xs py-2"
              >
                Compare Cases
              </button>
              <button
                onClick={() => {
                  setHistoryOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 btn-secondary text-xs py-2"
              >
                History Audit
              </button>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
          {children}
        </main>
      </div>

      {/* Global Interactive Drawers & Modals */}
      <AskSeraphyneDrawer
        isOpen={askDrawerOpen}
        onClose={() => setAskDrawerOpen(false)}
      />
      <CaseComparisonModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
      />
      <CaseHistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
}
