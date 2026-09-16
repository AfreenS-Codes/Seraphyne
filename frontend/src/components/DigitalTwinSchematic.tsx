import { useState } from "react";
import { Activity, AlertCircle, CheckCircle, ShieldAlert, Sparkles } from "lucide-react";

export type OrganSystemId =
  | "cardiovascular"
  | "respiratory"
  | "renal"
  | "hepatic"
  | "neurological"
  | "metabolic";

export interface OrganStatus {
  id: OrganSystemId;
  name: string;
  status: "stable" | "watch" | "critical";
  cx: number;
  cy: number;
  r: number;
  interactsWith: string;
  finding: string;
  vitalsNote?: string;
}

const DEFAULT_ORGANS: Record<OrganSystemId, OrganStatus> = {
  neurological: {
    id: "neurological",
    name: "Neurological",
    status: "stable",
    cx: 100,
    cy: 42,
    r: 10,
    interactsWith: "Respiratory",
    finding: "GCS 15, oriented x3. Cranial nerves intact. No focal neurological deficits at this simulation step.",
    vitalsNote: "Intracranial pressure stable, perfusion pressure adequate",
  },
  cardiovascular: {
    id: "cardiovascular",
    name: "Cardiovascular",
    status: "watch",
    cx: 100,
    cy: 88,
    r: 12,
    interactsWith: "Respiratory, Renal",
    finding: "Tachycardic, S1/S2 present, no S3 gallop. ST segment shifts noted in anterolateral leads. Elevated pre-test coronary risk.",
    vitalsNote: "HR 104 bpm (sinus tachycardia), BP 146/92 mmHg, MAP 110",
  },
  respiratory: {
    id: "respiratory",
    name: "Respiratory",
    status: "critical",
    cx: 100,
    cy: 70,
    r: 11,
    interactsWith: "Cardiovascular, Neurological",
    finding: "Tachypnea, bilateral basilar crackles, reduced oxygen saturation on room air. Escalation threshold exceeded.",
    vitalsNote: "RR 26/min, SpO2 91% on room air. Work of breathing markedly increased.",
  },
  hepatic: {
    id: "hepatic",
    name: "Hepatic",
    status: "watch",
    cx: 118,
    cy: 115,
    r: 9,
    interactsWith: "Metabolic, Renal",
    finding: "Mild right upper quadrant fullness, no jaundice, bilirubin borderline normal. Preserved synthetic liver profile.",
    vitalsNote: "ALT/AST marginally elevated; no coagulopathy",
  },
  renal: {
    id: "renal",
    name: "Renal",
    status: "stable",
    cx: 82,
    cy: 125,
    r: 8,
    interactsWith: "Cardiovascular, Metabolic",
    finding: "Adequate urine output (>0.5 mL/kg/h). Serum creatinine slightly elevated at 1.8 mg/dL with baseline ~1.2 mg/dL.",
    vitalsNote: "eGFR 48 mL/min/1.73m²; watch contrast administration",
  },
  metabolic: {
    id: "metabolic",
    name: "Metabolic",
    status: "stable",
    cx: 100,
    cy: 148,
    r: 8,
    interactsWith: "Renal, Cardiovascular",
    finding: "Mild lactic elevation (2.2 mmol/L), serum glucose 168 mg/dL. Electrolytes within acceptable compensatory limits.",
    vitalsNote: "Anion gap 14; base deficit -2.5 mEq/L",
  },
};

interface DigitalTwinProps {
  patientInfo?: {
    id: string;
    age: number;
    sex: string;
    caseTitle: string;
    simTime: string;
  };
  customOrganStatus?: Partial<Record<OrganSystemId, Partial<OrganStatus>>>;
  onSelectOrgan?: (organ: OrganStatus) => void;
}

export function DigitalTwinSchematic({
  patientInfo = {
    id: "PT-1187",
    age: 56,
    sex: "Male",
    caseTitle: "Acute Coronary Syndrome & Respiratory Deterioration",
    simTime: "06:42",
  },
  customOrganStatus,
  onSelectOrgan,
}: DigitalTwinProps) {
  const [selectedId, setSelectedId] = useState<OrganSystemId>("cardiovascular");

  const organs: Record<OrganSystemId, OrganStatus> = {
    ...DEFAULT_ORGANS,
    ...(customOrganStatus
      ? Object.entries(customOrganStatus).reduce((acc, [k, v]) => {
          acc[k as OrganSystemId] = { ...DEFAULT_ORGANS[k as OrganSystemId], ...v };
          return acc;
        }, {} as Record<OrganSystemId, OrganStatus>)
      : {}),
  };

  const selectedOrgan = organs[selectedId];

  const handleSelect = (id: OrganSystemId) => {
    setSelectedId(id);
    if (onSelectOrgan) onSelectOrgan(organs[id]);
  };

  const getStatusBadge = (status: "stable" | "watch" | "critical") => {
    switch (status) {
      case "critical":
        return {
          color: "fill-rose-500 stroke-rose-300 dark:stroke-rose-700",
          text: "Critical",
          badge: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
          dot: "bg-rose-500",
        };
      case "watch":
        return {
          color: "fill-amber-500 stroke-amber-300 dark:stroke-amber-700",
          text: "Watch",
          badge: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
          dot: "bg-amber-500",
        };
      case "stable":
      default:
        return {
          color: "fill-emerald-500 stroke-emerald-300 dark:stroke-emerald-700",
          text: "Stable",
          badge: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          dot: "bg-emerald-500",
        };
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="heading-gradient font-display font-bold text-base">
              Central Patient Model
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200/70 dark:border-violet-800/70 floating-bob">
              <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              Probabilistic Digital Twin
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active Multi-Organ Real-Time Interaction Network
          </p>
        </div>
      </div>

      {/* Main Body Schematic + Organ List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-auto">
        {/* SVG Human Body Representation */}
        <div className="md:col-span-5 flex justify-center py-2 relative">
          <div className="relative w-48 h-64 flex items-center justify-center">
            <svg
              viewBox="0 0 200 240"
              className="w-full h-full drop-shadow-sm select-none"
            >
              <defs>
                <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ede9fe" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="bodyGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2b224c" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#1c1533" stopOpacity="0.5" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Stylized Human Silhouette */}
              {/* Head */}
              <circle
                cx="100"
                cy="38"
                r="18"
                className="fill-slate-200/80 dark:fill-slate-800/80 stroke-slate-300 dark:stroke-slate-700"
                strokeWidth="1.5"
              />
              {/* Neck */}
              <rect
                x="94"
                y="54"
                width="12"
                height="10"
                className="fill-slate-200/80 dark:fill-slate-800/80"
              />
              {/* Torso */}
              <path
                d="M 68 70 C 68 64, 132 64, 132 70 L 126 135 C 126 142, 115 152, 100 152 C 85 152, 74 142, 74 135 Z"
                className="fill-slate-200/60 dark:fill-slate-800/60 stroke-slate-300/80 dark:stroke-slate-700"
                strokeWidth="1.5"
              />
              {/* Left Arm */}
              <path
                d="M 66 70 C 58 75, 48 95, 46 130 C 44 145, 52 145, 54 132 L 64 90"
                className="stroke-slate-300 dark:stroke-slate-700 fill-none"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Right Arm */}
              <path
                d="M 134 70 C 142 75, 152 95, 154 130 C 156 145, 148 145, 146 132 L 136 90"
                className="stroke-slate-300 dark:stroke-slate-700 fill-none"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Left Leg */}
              <path
                d="M 86 150 L 82 220"
                className="stroke-slate-300 dark:stroke-slate-700 fill-none"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Right Leg */}
              <path
                d="M 114 150 L 118 220"
                className="stroke-slate-300 dark:stroke-slate-700 fill-none"
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Organ Interactive Nodes */}
              {Object.values(organs).map((organ) => {
                const isSelected = selectedId === organ.id;
                const statusStyle = getStatusBadge(organ.status);

                return (
                  <g
                    key={organ.id}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => handleSelect(organ.id)}
                  >
                    {/* Pulsing ring for critical/selected */}
                    {(organ.status === "critical" || isSelected) && (
                      <circle
                        cx={organ.cx}
                        cy={organ.cy}
                        r={organ.r + 5}
                        className={`${
                          organ.status === "critical"
                            ? "stroke-rose-500/60 dark:stroke-rose-400/70"
                            : "stroke-violet-500/60 dark:stroke-violet-400/70"
                        } fill-none animate-ping`}
                        strokeWidth="1.5"
                        style={{ animationDuration: "2.4s" }}
                      />
                    )}
                    {/* Outer glow ring */}
                    <circle
                      cx={organ.cx}
                      cy={organ.cy}
                      r={organ.r + 3}
                      className={`${
                        isSelected
                          ? "stroke-violet-500 dark:stroke-violet-400 stroke-2 fill-violet-500/20"
                          : "stroke-transparent fill-none"
                      }`}
                    />
                    {/* Organ Node */}
                    <circle
                      cx={organ.cx}
                      cy={organ.cy}
                      r={organ.r}
                      className={`${statusStyle.color} stroke-2 transition-all`}
                    />
                    {/* Center Core */}
                    <circle
                      cx={organ.cx}
                      cy={organ.cy}
                      r={3}
                      className="fill-white"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Organ Status Interactive Selector Grid */}
        <div className="md:col-span-7 flex flex-col gap-1.5">
          {Object.values(organs).map((organ) => {
            const isSelected = selectedId === organ.id;
            const statusStyle = getStatusBadge(organ.status);

            return (
              <button
                key={organ.id}
                onClick={() => handleSelect(organ.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                  isSelected
                    ? "bg-violet-50/80 dark:bg-violet-950/50 border border-violet-500/40 shadow-sm"
                    : "hover:bg-violet-50/30 dark:hover:bg-[#130e26]/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot}`} />
                  <span
                    className={`text-xs font-medium ${
                      isSelected
                        ? "text-violet-950 dark:text-violet-100 font-bold"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {organ.name}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle.badge}`}
                >
                  • {statusStyle.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Organ Context Card (Image 5 style) */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${getStatusBadge(selectedOrgan.status).dot}`}
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {selectedOrgan.name}
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                getStatusBadge(selectedOrgan.status).badge
              }`}
            >
              {getStatusBadge(selectedOrgan.status).text}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Interacts with: <strong className="text-slate-600 dark:text-slate-400 font-medium">{selectedOrgan.interactsWith}</strong>
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          {selectedOrgan.finding}
        </p>
      </div>

      {/* Patient Demographic Footer Banner */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-5 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
        <div>
          <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-normal">Patient ID</span>
          <span className="text-slate-800 dark:text-slate-200">{patientInfo.id}</span>
        </div>
        <div>
          <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-normal">Age</span>
          <span className="text-slate-800 dark:text-slate-200">{patientInfo.age}</span>
        </div>
        <div>
          <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-normal">Sex</span>
          <span className="text-slate-800 dark:text-slate-200">{patientInfo.sex}</span>
        </div>
        <div className="col-span-1">
          <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-normal">Sim. Time</span>
          <span className="text-violet-600 dark:text-violet-400 font-bold">{patientInfo.simTime}</span>
        </div>
        <div>
          <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-normal">Status</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">Unstable</span>
        </div>
      </div>
    </div>
  );
}
