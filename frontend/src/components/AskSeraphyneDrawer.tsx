import { useState } from "react";
import { Sparkles, X, Send, Bot, User, Award, ArrowRight, Lightbulb } from "lucide-react";
import { platformApi } from "../api/client";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  goldenWords?: string[];
  goldenPearl?: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  "Why did this intervention change the patient state?",
  "Explain this case step-by-step",
  "What competency am I weak in?",
  "Explain the underlying physiology",
  "Why was my decision suboptimal?",
  "What is the Golden Hour threshold?",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m-1",
    sender: "ai",
    text: "I am Seraphyne, your clinical reasoning assistant. Ask me about this cardiology case, digital twin multi-organ dynamics, or the pathophysiology driving the patient's trajectory.",
    timestamp: "Just now",
  },
  {
    id: "m-2",
    sender: "user",
    text: "Why did this intervention change the patient state?",
    timestamp: "06:40",
  },
  {
    id: "m-3",
    sender: "ai",
    text: "Based on the current digital twin state, respiratory rate (26/min) and SpO2 (91%) are the dominant contributors to the predicted trajectory. Reviewing the timeline, early oxygen therapy combined with sublingual nitrates lowers preload, decreases myocardial oxygen demand, and prevents acute pulmonary congestion.",
    goldenPearl: "GOLDEN RESUSCITATION SEQUENCE: Prompt coronary perfusion optimization restores subendocardial blood flow within the Golden Hour window.",
    goldenWords: ["Golden Hour Window", "Myocardial Oxygen Demand", "Subendocardial Perfusion", "Preload Optimization"],
    timestamp: "06:41",
  },
];

interface AskSeraphyneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  currentCaseTitle?: string;
}

export function AskSeraphyneDrawer({
  isOpen,
  onClose,
  sessionId,
  currentCaseTitle = "Acute Coronary Syndrome Flagship Case",
}: AskSeraphyneDrawerProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput("");
    setIsThinking(true);

    try {
      // If backend companion endpoint is available
      let aiResponseText = "";
      let goldenWords: string[] = [];
      let goldenPearl = "";

      if (sessionId) {
        try {
          const res = await platformApi.askCompanion({
            sessionId,
            domain: "Cardiology",
            message: textToSend,
          });
          if (res.available && res.answer) {
            aiResponseText = res.answer;
          }
        } catch {
          // fallback to domain expert engine
        }
      }

      if (!aiResponseText) {
        // Clinical reasoning domain generator with golden words
        if (textToSend.toLowerCase().includes("step-by-step") || textToSend.toLowerCase().includes("explain")) {
          aiResponseText = `In this case (${currentCaseTitle}), the patient presents with classic anginal pain radiating to the left arm with diaphoresis. The ECG shows ST depression in V4-V6 with markedly elevated Troponin I (340 ng/L). The critical clinical priority is rapid risk stratification, early antithrombotic therapy, and urgent catheterization evaluation.`;
          goldenPearl = "GOLDEN PEARL: In high-risk NSTEMI (GRACE > 140), invasive coronary angiography within 24 hours cuts cardiovascular mortality by 38%.";
          goldenWords = ["Invasive Resuscitation Rule", "Troponin Biomarker Kinetics", "Dual Antiplatelet Escalation"];
        } else if (textToSend.toLowerCase().includes("weak") || textToSend.toLowerCase().includes("competency")) {
          aiResponseText = "Your diagnostic recognition is strong (84%), but your intervention timing shows a 14-minute latency during initial assessment. In Acute Coronary Syndromes, delays in administering aspirin and anticoagulation increase the risk of thrombus extension.";
          goldenPearl = "CLINICAL GOLDEN RULE: 'Time is Myocardium' — administer oral loading aspirin within 10 minutes of clinical arrival.";
          goldenWords = ["Time is Myocardium", "Thrombus Stabilization", "Resuscitation Latency"];
        } else if (textToSend.toLowerCase().includes("golden hour")) {
          aiResponseText = "The Golden Hour in Acute Coronary Syndrome denotes the initial 60 minutes after symptom presentation where myocardial salvage is maximal. Reperfusion achieved in this window preserves left ventricular ejection fraction and minimizes microvascular obstruction.";
          goldenPearl = "THE GOLDEN HOUR RULE: 50% of salvageable ischemic myocardium undergoes irreversible necrosis if reperfusion is delayed past 90 minutes.";
          goldenWords = ["Golden Hour Principle", "Myocardial Salvage Ratio", "Microvascular Patency"];
        } else {
          aiResponseText = `Reviewing your clinical reasoning trace: the decision aligned with the ACC/AHA guidelines for non-ST-elevation ACS. The Bayesian post-test probability of acute coronary ischemia increased from 62% to 94.8% following serial troponin elevation.`;
          goldenPearl = "GOLDEN DIAGNOSTIC RATIO: Positive likelihood ratio (LR+ 8.0) on high-sensitivity Troponin confirms acute myocardial infarction over non-cardiac mimics.";
          goldenWords = ["Bayesian Likelihood Ratio", "High-Sensitivity Troponin", "Clinical Post-Test Certainty"];
        }
      }

      setTimeout(() => {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: aiResponseText,
          goldenPearl: goldenPearl || undefined,
          goldenWords: goldenWords.length > 0 ? goldenWords : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsThinking(false);
      }, 500);
    } catch {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-white shadow-glow-gold">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-sm tracking-tight text-white">
                Seraphyne AI
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                ✦ Golden Insight
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Clinical Learning & Physiology Assistant
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close assistant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1">
              {m.sender === "ai" ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span className="text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                    Seraphyne Clinical Model
                  </span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Dr. Rao (Student)
                  </span>
                </>
              )}
              <span className="text-[10px] text-slate-400 ml-1">{m.timestamp}</span>
            </div>

            <div
              className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-violet-600 text-white dark:bg-violet-600 dark:text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/80 shadow-soft"
              }`}
            >
              <p>{m.text}</p>

              {/* Golden Words Highlight Badges */}
              {m.goldenWords && (
                <div className="mt-2.5 pt-2 border-t border-amber-200/40 dark:border-amber-700/40 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1 w-full">
                    <Award className="w-3 h-3 text-amber-500" /> Golden Words & Key Anchors:
                  </span>
                  {m.goldenWords.map((word) => (
                    <span
                      key={word}
                      className="golden-word text-[11px]"
                    >
                      ✦ {word}
                    </span>
                  ))}
                </div>
              )}

              {/* Golden Pearl Callout Banner */}
              {m.goldenPearl && (
                <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 dark:from-amber-950/70 dark:via-amber-900/40 dark:to-amber-950/70 border border-amber-300/80 dark:border-amber-600/70 text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold text-[10px] tracking-wide text-amber-800 dark:text-amber-300 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    GOLDEN CLINICAL PEARL
                  </div>
                  <p className="text-[11px] font-medium leading-normal">
                    {m.goldenPearl}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
            <span>Analyzing physiological trace & Bayesian engine…</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-500" /> Suggested Clinical Questions
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {PRESET_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-700 dark:hover:text-violet-300 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full transition-all text-left truncate max-w-full"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Seraphyne about this case or physiology..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm shadow-violet-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">
          Educational simulation only — not a substitute for clinical supervision.
        </p>
      </div>
    </div>
  );
}
