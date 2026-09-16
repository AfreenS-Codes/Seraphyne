import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Heart, Wind, Brain, Droplets, Zap, ShieldAlert, ArrowRight } from "lucide-react";

const DOMAINS = [
  {
    slug: "cardiology",
    name: "Cardiology & Vascular",
    status: "active",
    desc: "Acute coronary syndromes, decompensated heart failure, malignant arrhythmias, hypertensive emergencies.",
    icon: Heart,
    casesCount: 9,
  },
  {
    slug: "pulmonology",
    name: "Pulmonology",
    status: "coming_soon",
    desc: "Acute respiratory distress syndrome, severe status asthmaticus, massive pulmonary embolism, tension pneumothorax.",
    icon: Wind,
    casesCount: 6,
  },
  {
    slug: "neurology",
    name: "Neurology & Neurovascular",
    status: "coming_soon",
    desc: "Acute ischemic stroke, status epilepticus, subarachnoid hemorrhage, intracranial hypertension.",
    icon: Brain,
    casesCount: 5,
  },
  {
    slug: "nephrology",
    name: "Nephrology & Renal",
    status: "coming_soon",
    desc: "Acute kidney injury, hyperkalemia emergencies, cardiorenal syndrome, glomerulonephritis flares.",
    icon: Droplets,
    casesCount: 4,
  },
  {
    slug: "critical-care",
    name: "Resuscitation & Sepsis",
    status: "coming_soon",
    desc: "Septic shock Hour-1 bundles, anaphylaxis, undifferentiated circulatory collapse, multi-organ failure.",
    icon: Zap,
    casesCount: 7,
  },
  {
    slug: "gastroenterology",
    name: "Gastroenterology & Hepatic",
    status: "coming_soon",
    desc: "Upper GI bleeding, acute liver failure, variceal bleeding, acute pancreatitis with necrosis.",
    icon: ShieldAlert,
    casesCount: 4,
  },
];

export function DomainSelection() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="pill pill-violet eyebrow-tag">Specialty Curricula</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1.5 leading-tight">
            Choose a Clinical Domain
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Cardiology is fully active and validated in this clinical reasoning engine. Other tracks are in authoring.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {DOMAINS.map((d) => {
            const Icon = d.icon;
            const isActive = d.status === "active";

            return isActive ? (
              <Link
                key={d.slug}
                to="/cardiology"
                className="card p-6 card-hover border-violet-500/40 bg-gradient-to-br from-white to-violet-50/20 dark:from-slate-900 dark:to-violet-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="pill pill-violet">Active MVP</span>
                  </div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base mb-1">
                    {d.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {d.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-violet-600 dark:text-violet-400 font-semibold">
                  <span>{d.casesCount} Structured Cases</span>
                  <span className="flex items-center gap-1">Enter Library <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </Link>
            ) : (
              <div
                key={d.slug}
                className="card p-6 opacity-60 dark:opacity-50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="pill bg-slate-100 dark:bg-slate-800 text-slate-500">
                      In Authoring
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-slate-600 dark:text-slate-300 text-base mb-1">
                    {d.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {d.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  <span>{d.casesCount} Cases planned</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
