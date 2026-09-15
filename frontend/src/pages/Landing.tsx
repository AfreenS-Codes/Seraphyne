import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-softblue to-white flex flex-col">
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-medblue-600 flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-semibold text-slate-800 tracking-tight text-lg">SERAPHYNE</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-secondary">Log in</Link>
          <Link to="/signup" className="btn-primary">Sign up</Link>
        </div>
      </header>
      <div className="flex-1 max-w-4xl mx-auto px-6 py-20 text-center">
        <span className="pill bg-teal-500/10 text-teal-600 mb-6">Cardiology · MVP</span>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
          Clinical reasoning practice, built for MBBS students
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          Work through realistic cardiology cases, see your diagnostic probabilities update in real
          time with a Bayesian evidence engine, and get explainable feedback on your clinical
          reasoning — not just whether you got the diagnosis right.
        </p>
        <Link to="/signup" className="btn-primary text-base px-6 py-3">Start the flagship case</Link>
      </div>
      <div className="max-w-5xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        {[
          { title: "Realistic simulation", body: "History, examination, and investigations — you choose what to gather, in what order." },
          { title: "Bayesian reasoning", body: "Watch diagnostic probabilities update step by step as evidence arrives, fully labeled as an educational model." },
          { title: "Mistake Memory", body: "Recurring reasoning patterns are tracked across sessions and turned into targeted practice recommendations." },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
            <p className="text-sm text-slate-600">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
