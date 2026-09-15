import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";

export function GoldenHour() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto text-center py-12">
        <span className="pill bg-medblue-100 text-medblue-700 mb-4">Golden Hour</span>
        <h1 className="text-3xl font-semibold text-slate-800 mb-4">
          A patient just walked in with chest pain.
        </h1>
        <p className="text-slate-600 mb-8">
          You have limited time to gather history, examine, order investigations, and make a
          decision — just like on the wards. Ready to begin the flagship Acute Coronary Syndrome
          case?
        </p>
        <button
          className="btn-primary text-base px-6 py-3"
          onClick={() => navigate("/simulation/new/acs-001")}
        >
          Begin simulation
        </button>
      </div>
    </AppShell>
  );
}
