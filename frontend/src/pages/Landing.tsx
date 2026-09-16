import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useTheme } from "../context/ThemeContext";
import {
  Heart,
  Activity,
  Brain,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileText,
  Download,
  Sun,
  Moon,
  Layers,
  CheckCircle2,
  GitFork,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

export function Landing() {
  const { theme, toggleTheme } = useTheme();

  const heroRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const featuresRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const techRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const interactiveRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div className="min-h-screen bg-clinical-bg dark:bg-clinical-darkBg text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-violet-500/20 selection:text-violet-900 transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl w-full mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-soft">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-display font-extrabold text-slate-900 dark:text-slate-100 tracking-tight text-base block leading-none">
                SERAPHYNE
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-violet-600 dark:text-violet-400 block mt-0.5">
                Clinical Reasoning Engine
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#overview" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              Platform
            </a>
            <a href="#features" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              Features
            </a>
            <a href="#technologies" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              Tech Stack
            </a>
            <a href="#download-docx" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Project Report DOCX</span>
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-violet-600"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            <Link to="/login" className="btn-secondary text-xs px-3.5 py-2">
              Log in
            </Link>
            <Link to="/cardiology" className="btn-primary text-xs px-4 py-2 shadow-soft">
              Start Simulation
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="flex-1 max-w-5xl mx-auto px-6 pt-16 pb-20 text-center relative overflow-hidden">
        <div ref={heroRef} className="reveal-on-scroll space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Cardiology & Resuscitation Reasoning · Clinical Aesthetic MVP</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight max-w-4xl mx-auto leading-tight">
            Train clinical judgment on cases that{" "}
            <span className="heading-gradient underline decoration-violet-500/30">
              respond like real patients
            </span>.
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Work through realistic cardiology emergencies, see your diagnostic probabilities update in
            real time with a Bayesian evidence engine, explore multi-organ digital twins, and receive
            explainable AI feedback on your resuscitation pathways.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/cardiology"
              className="btn-primary text-sm px-6 py-3 shadow-glow-violet font-display font-bold flex items-center gap-2"
            >
              <span>Launch Clinical Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="/seraphyne_project_description.docx"
              download="seraphyne_project_description.docx"
              className="btn-secondary text-sm px-5 py-3 flex items-center gap-2 font-semibold"
            >
              <Download className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Download Project Description (.DOCX)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200/80 dark:border-slate-800/80">
        <div ref={featuresRef} className="reveal-on-scroll space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 block mb-1">
              CLINICAL ARCHITECTURE
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Engineered for High-Yield Clinical Mastery
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6 card-hover flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
                  Multi-Organ Digital Twin
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Interactive biological schematic tracking 6 vital organ systems simultaneously with
                  real-time physiological feedback and critical warning thresholds.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 mt-4">
                Cardio-Respiratory-Renal Interplay →
              </span>
            </div>

            <div className="card p-6 card-hover flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
                  Ask Seraphyne AI with Golden Words
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Context-aware assistant highlighting essential resuscitation pearls and high-yield
                  physiological insights in glowing golden clinical typography.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-amber-600 mt-4">
                Golden Pearls & Resuscitation Rules →
              </span>
            </div>

            <div className="card p-6 card-hover flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                  <GitFork className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
                  Counterfactual Resuscitation Bar
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Analyze alternative decision branches against the gold-standard resuscitation path to
                  discover how earlier interventions alter survival and ischemic burdens.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-sky-600 mt-4">
                What-If Decision Simulator →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies & Concepts Section (From Project Description) */}
      <section id="technologies" className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200/80 dark:border-slate-800/80">
        <div ref={techRef} className="reveal-on-scroll space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 block mb-1">
              ENGINEERING FOUNDATION
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Technologies & Concepts Applied
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "HTML5 & Semantic Sections", desc: "Structured layouts with accessible clinical components and navigation flows." },
              { title: "CSS3 & Tailwind Layouts", desc: "Custom clinical theme variables, Flexbox, Grid, rounded 12-16px cards, and soft shadows." },
              { title: "JavaScript & TypeScript", desc: "Interactive Bayesian engine, digital twin state management, and type safety." },
              { title: "Intersection Observer API", desc: "High-performance scroll-reveal animations with zero event polling overhead." },
              { title: "CSS Transitions & Keyframes", desc: "Subtle, purposeful micro-effects on vital signs, confidence bars, and buttons." },
              { title: "Light & Dark Mode Gravity", desc: "Dual themes engineered for clinical clarity and reduced nighttime eye-strain." },
            ].map((t) => (
              <div key={t.title} className="card p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                  <h4 className="font-display font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {t.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable DOCX Banner */}
      <section id="download-docx" className="max-w-5xl mx-auto px-6 py-12 mb-12">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0a192f] via-navy-900 to-[#0c243f] text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700/50">
          <div className="space-y-2 text-center md:text-left">
            <span className="golden-badge text-[10px]">
              ✦ Editable Documentation Artifact
            </span>
            <h3 className="font-display text-xl md:text-2xl font-bold text-white">
              Download the Complete Seraphyne Project Description
            </h3>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl">
              Contains the polished prose formatted for project reports, presentations, and technical documentation.
            </p>
          </div>

          <a
            href="/seraphyne_project_description.docx"
            download="seraphyne_project_description.docx"
            className="btn-gold text-xs md:text-sm px-6 py-3 whitespace-nowrap flex items-center gap-2 shrink-0 font-bold"
          >
            <Download className="w-4 h-4" />
            <span>Download .DOCX</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 py-8 bg-white dark:bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white">
              <Heart className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              SERAPHYNE
            </span>
            <span>· Cardiology Clinical Reasoning Engine</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Educational clinical simulation platform · MBBS curriculum standard
          </p>
        </div>
      </footer>
    </div>
  );
}
