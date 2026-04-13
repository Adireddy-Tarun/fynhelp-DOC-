import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const messages = [
  { role: "nidhi", text: "Good morning. Let me tell you about your business today.", delay: 500 },
  { role: "nidhi", text: "Your cash runway is 52 days at ₹23,846 daily burn. That's 8 days less than last week — burn accelerated due to Diwali advance payments to suppliers.", delay: 1800 },
];

const suggestions = [
  "Why did burn increase?",
  "Show me my receivables",
  "What should I do today?",
];

const followUp = {
  role: "nidhi" as const,
  text: "Three actions with highest impact:\n1. Chase ABC Electronics (₹8.4L, 62 days) — adds 15 days runway.\n2. File GSTR-3B before Apr 20 — ₹3.2L ITC at risk if delayed.\n3. Hold the 3 new hires until May — saves ₹5.25L burn next quarter.",
};

const TypingIndicator = () => (
  <div className="flex gap-1.5 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="w-2 h-2 rounded-full bg-white/40 typing-dot" />
    ))}
  </div>
);

interface Msg { role: string; text: string }

export default function HeroSection() {
  const [displayedMsgs, setDisplayedMsgs] = useState<Msg[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [demoComplete, setDemoComplete] = useState(false);

  const runDemo = useCallback(() => {
    setDisplayedMsgs([]);
    setShowTyping(false);
    setShowSuggestions(false);
    setShowFollowUp(false);
    setDemoComplete(false);

    let cumDelay = 0;
    messages.forEach((msg, i) => {
      cumDelay += msg.delay;
      const typeDelay = cumDelay;
      const showDelay = typeDelay + 600;

      setTimeout(() => setShowTyping(true), typeDelay);
      setTimeout(() => {
        setShowTyping(false);
        setDisplayedMsgs((prev) => [...prev, { role: msg.role, text: msg.text }]);
        if (i === messages.length - 1) {
          setTimeout(() => setShowSuggestions(true), 400);
        }
      }, showDelay);
      cumDelay = showDelay;
    });
  }, []);

  useEffect(() => { runDemo(); }, [runDemo]);

  const handleSuggestion = (s: string) => {
    if (s !== "What should I do today?") return;
    setShowSuggestions(false);
    setDisplayedMsgs((prev) => [...prev, { role: "user", text: s }]);
    setTimeout(() => setShowTyping(true), 300);
    setTimeout(() => {
      setShowTyping(false);
      setShowFollowUp(true);
      setDemoComplete(true);
    }, 1500);
  };

  return (
    <section className="bg-fyn-ink min-h-screen flex flex-col justify-center relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,105,20,0.08), transparent)"
      }} />

      <div className="fyn-container relative z-10 py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-72px)]">
          {/* Left — Copy */}
          <div className="max-w-[640px]">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-fyn-gold/30 mb-8 reveal-up">
              <span className="w-2 h-2 rounded-full bg-fyn-success pulse-dot" />
              <span className="fyn-caption text-fyn-gold text-[11px]">India's Virtual CFO Platform</span>
            </div>

            <h1 className="fyn-display text-[48px] md:text-[56px] lg:text-[72px] text-white mb-6 reveal-up" style={{ animationDelay: "100ms" }}>
              Every Indian SME<br />
              <span className="text-fyn-red relative">
                deserves a CFO.
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 8 C60 2, 120 10, 180 4 S260 8, 298 6" stroke="#C41E1E" strokeWidth="2" strokeLinecap="round" fill="none"
                    strokeDasharray="300" strokeDashoffset="300"
                    style={{ animation: "draw-line 800ms ease-out 1.2s forwards" }} />
                </svg>
              </span>
              <br />Now they have one.
            </h1>

            <p className="text-white/65 text-lg lg:text-xl leading-relaxed max-w-[520px] mb-8 reveal-up" style={{ animationDelay: "200ms" }}>
              Meet Nidhi — the AI CFO built for Indian business. She monitors your cash, protects your GST,
              predicts your risks, and tells you exactly what to do — in plain Hindi, English, Gujarati,
              Tamil, or Marathi. Every morning at 8 AM, before you finish your chai.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-5 reveal-up" style={{ animationDelay: "300ms" }}>
              <Link to="/signup" className="bg-fyn-red text-white font-semibold px-8 py-3.5 rounded-lg text-base hover-btn-primary text-center">
                Start Your 15-Day Free Trial →
              </Link>
              <button className="text-white/80 hover:text-white font-medium px-6 py-3.5 flex items-center gap-2 justify-center transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M8 6.5l5 3.5-5 3.5z" fill="currentColor"/></svg>
                Watch Nidhi in action
              </button>
            </div>

            <p className="text-white/40 text-sm italic mb-8 reveal-up" style={{ animationDelay: "350ms" }}>
              Setup in 10 min · No credit card · Works with Tally + all Indian banks
            </p>

            <div className="reveal-up" style={{ animationDelay: "400ms" }}>
              <p className="text-white/30 text-xs mb-2">Nidhi speaks:</p>
              <div className="flex gap-2 flex-wrap">
                {["हिंदी", "English", "ગુજરાતી", "தமிழ்", "मराठी"].map((lang) => (
                  <span key={lang} className="text-fyn-gold text-xs px-3 py-1.5 rounded border border-fyn-gold/20 bg-white/5">{lang}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Product Mockup */}
          <div className="float-gentle">
            <div className="bg-fyn-ink border border-white/10 rounded-xl overflow-hidden shadow-2xl max-w-[520px] ml-auto">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-fyn-red/60" />
                <div className="w-3 h-3 rounded-full bg-fyn-warning/60" />
                <div className="w-3 h-3 rounded-full bg-fyn-success/60" />
                <span className="text-white/30 text-xs ml-2 font-sans">FynHelp · Nidhi Cockpit</span>
              </div>

              {/* Mini metrics */}
              <div className="grid grid-cols-3 gap-2 p-3">
                {[
                  { label: "Cash today", value: "₹12.4L", color: "bg-fyn-success" },
                  { label: "Runway", value: "52 days", color: "bg-fyn-warning" },
                  { label: "ITC at risk", value: "₹3.2L", color: "bg-fyn-red" },
                ].map((m) => (
                  <div key={m.label} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${m.color}`} />
                      <span className="text-white/40 text-[10px]">{m.label}</span>
                    </div>
                    <p className="text-white fyn-metric text-lg">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Chat */}
              <div className="px-3 pb-3 space-y-2 min-h-[220px]">
                {displayedMsgs.map((msg, i) => (
                  <div key={i} className={`slide-up-bounce ${msg.role === "user" ? "ml-8" : ""}`}>
                    <div className={`rounded-lg p-3 text-sm ${
                      msg.role === "user"
                        ? "bg-fyn-red-tint ml-auto"
                        : "bg-white/5"
                    }`}>
                      {msg.role === "nidhi" && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-5 h-5 rounded-full bg-fyn-red flex items-center justify-center">
                            <span className="text-white text-[9px] font-bold">N</span>
                          </div>
                          <span className="text-white/30 text-[10px]">Nidhi</span>
                        </div>
                      )}
                      <p className="text-white/80 text-[13px] leading-relaxed whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {showTyping && <TypingIndicator />}

                {showFollowUp && (
                  <div className="slide-up-bounce bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-full bg-fyn-red flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">N</span>
                      </div>
                      <span className="text-white/30 text-[10px]">Nidhi</span>
                    </div>
                    <p className="text-white/80 text-[13px] leading-relaxed whitespace-pre-line">{followUp.text}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-[11px] bg-fyn-red/20 text-fyn-red px-2 py-1 rounded cursor-pointer hover:bg-fyn-red/30 transition-colors">Draft chase message</span>
                      <span className="text-[11px] bg-white/10 text-white/60 px-2 py-1 rounded cursor-pointer hover:bg-white/15 transition-colors">Open GST</span>
                    </div>
                  </div>
                )}

                {showSuggestions && !showFollowUp && (
                  <div className="flex flex-wrap gap-2 pt-1 slide-up-bounce">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="text-[11px] border border-white/15 text-white/60 px-3 py-1.5 rounded-full hover:border-fyn-red hover:text-fyn-red transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {demoComplete && (
                  <button onClick={runDemo} className="text-fyn-gold text-xs hover:underline mt-2">
                    ↻ Restart demo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
        <span className="text-xs">Explore FynHelp</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
    </section>
  );
}
