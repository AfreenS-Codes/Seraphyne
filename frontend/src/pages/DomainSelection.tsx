import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";

const DOMAINS = [
  { slug: "cardiology", name: "Cardiology", status: "active", desc: "Acute coronary syndrome, heart failure, arrhythmias, hypertensive emergencies." },
  { slug: "pulmonology", name: "Pulmonology", status: "coming_soon" },
  { slug: "neurology", name: "Neurology", status: "coming_soon" },
  { slug: "nephrology", name: "Nephrology", status: "coming_soon" },
  { slug: "urology", name: "Urology", status: "coming_soon" },
  { slug: "gastroenterology", name: "Gastroenterology", status: "coming_soon" },
];

export function DomainSelection() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold text-slate-800 mb-1">Choose a domain</h1>
      <p className="text-slate-500 text-sm mb-8">Cardiology is fully active in this MVP. Other domains are coming soon.</p>
      <div className="grid md:grid-cols-3 gap-6">
        {DOMAINS.map((d) =>
          d.status === "active" ? (
            <Link key={d.slug} to="/cardiology" className="card p-6 hover:shadow-md transition-shadow border-medblue-200">
              <div className="w-10 h-10 rounded-lg bg-medblue-100 text-medblue-700 flex items-center justify-center mb-4 font-semibold">
                ♥
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{d.name}</h3>
              <p className="text-sm text-slate-600">{d.desc}</p>
              <span className="pill bg-teal-500/10 text-teal-600 mt-4">Active</span>
            </Link>
          ) : (
            <div key={d.slug} className="card p-6 opacity-60">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mb-4 font-semibold">
                •
              </div>
              <h3 className="font-semibold text-slate-500 mb-1">{d.name}</h3>
              <span className="pill bg-slate-100 text-slate-500 mt-2">Coming Soon</span>
            </div>
          )
        )}
      </div>
    </AppShell>
  );
}
