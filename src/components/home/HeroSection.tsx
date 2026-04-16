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
    <section
      className="relative overflow-hidden"
      style={{
        background: "#1A1008",
        minHeight: 720,
        height: "100vh",
      }}
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,105,20,0.08), transparent)"
      }} />

      <div
        className="relative h-full"
        style={{ zIndex: 10 }}
      >
        {/* Desktop: grid, Mobile: flex column */}
        <div
          className="hidden md:grid h-full items-center"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            padding: "0 96px",
          }}
        >
          <LeftColumn />
          <RightColumn
            displayedMsgs={displayedMsgs}
            showTyping={showTyping}
            showSuggestions={showSuggestions}
            showFollowUp={showFollowUp}
            demoComplete={demoComplete}
            handleSuggestion={handleSuggestion}
            runDemo={runDemo}
          />
        </div>

        {/* Mobile */}
        <div
          className="flex md:hidden flex-col justify-center"
          style={{ padding: "80px 24px 48px", minHeight: "100vh" }}
        >
          <LeftColumn />
          <div className="mt-10">
            <RightColumn
              displayedMsgs={displayedMsgs}
              showTyping={showTyping}
              showSuggestions={showSuggestions}
              showFollowUp={showFollowUp}
              demoComplete={demoComplete}
              handleSuggestion={handleSuggestion}
              runDemo={runDemo}
              mobile
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce" style={{ bottom: 32, color: "rgba(255,255,255,0.3)" }}>
        <span style={{ fontSize: 12 }}>Explore FynHelp</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
    </section>
  );
}

/* ── Left Column ── */
function LeftColumn() {
  return (
    <div style={{ maxWidth: 640, position: "relative", zIndex: 10 }}>
      {/* Eyebrow pill */}
      <div
        className="inline-flex items-center gap-2 rounded-full animate-fade-in"
        style={{
          border: "1px solid rgba(139,105,20,0.4)",
          padding: "6px 16px",
          background: "rgba(139,105,20,0.08)",
        }}
      >
        <span className="rounded-full pulse-ring" style={{ width: 6, height: 6, background: "#22C55E" }} />
        <span style={{
          fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 11,
          letterSpacing: "0.1em", color: "#8B6914", textTransform: "uppercase" as const,
        }}>
          India's Virtual CFO Platform
        </span>
      </div>

      {/* Headline */}
      <h1
        className="animate-fade-in"
        style={{
          animationDelay: "150ms", animationFillMode: "both",
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 700,
          fontSize: "clamp(44px, 5vw, 68px)",
          lineHeight: 1.1,
          marginTop: 24,
          marginBottom: 0,
        }}
      >
        <span style={{ display: "block", color: "#FFFFFF" }}>Every Indian SME</span>
        <span style={{ display: "block", color: "#C41E1E" }}>deserves a CFO.</span>
        <span style={{ display: "block", color: "#FFFFFF" }}>Now they have one.</span>
      </h1>

      {/* Subheadline */}
      <p
        className="animate-fade-in"
        style={{
          animationDelay: "300ms", animationFillMode: "both",
          fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 18,
          color: "rgba(255,255,255,0.70)", lineHeight: 1.75, maxWidth: 500, marginTop: 24,
        }}
      >
        Meet Nidhi — the AI CFO built for Indian business. She monitors your cash, protects your GST,
        predicts your risks, and tells you exactly what to do — in your language, every morning.
      </p>

      {/* CTAs */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center animate-fade-in"
        style={{ gap: 16, marginTop: 36, animationDelay: "450ms", animationFillMode: "both" }}
      >
        <Link
          to="/signup"
          style={{
            background: "#C41E1E", color: "#FFFFFF", padding: "14px 28px", borderRadius: 6,
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15,
            border: "none", cursor: "pointer", display: "inline-block", textDecoration: "none",
            transition: "all 250ms cubic-bezier(0.25, 0.1, 0.25, 1)",
          }}
        >
          Start Your 15-Day Free Trial →
        </Link>
        <button style={{
          background: "transparent", color: "#FFFFFF",
          border: "1.5px solid rgba(255,255,255,0.3)", padding: "14px 28px",
          borderRadius: 6, fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 15,
          cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
          transition: "all 250ms cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}>
          Watch Nidhi in action
        </button>
      </div>

      {/* Trust line */}
      <p
        className="animate-fade-in"
        style={{
          animationDelay: "500ms", animationFillMode: "both",
          fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12,
          color: "rgba(255,255,255,0.40)", marginTop: 12,
        }}
      >
        No credit card · Setup in 10 min · Works with Tally
      </p>

      {/* Language pills */}
      <div className="animate-fade-in" style={{ animationDelay: "600ms", animationFillMode: "both", marginTop: 28 }}>
        <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.40)" }}>
            Nidhi speaks:
          </span>
          {["हिंदी", "English", "ગુજરાતી", "தமிழ்", "मराठी"].map((lang) => (
            <span key={lang} style={{
              border: "1px solid rgba(139,105,20,0.3)", borderRadius: 100, padding: "4px 12px",
              fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 12, color: "#8B6914",
              background: "rgba(139,105,20,0.08)",
            }}>{lang}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Right Column (Nidhi mockup) ── */
interface RightColumnProps {
  displayedMsgs: Msg[];
  showTyping: boolean;
  showSuggestions: boolean;
  showFollowUp: boolean;
  demoComplete: boolean;
  handleSuggestion: (s: string) => void;
  runDemo: () => void;
  mobile?: boolean;
}

function RightColumn({ displayedMsgs, showTyping, showSuggestions, showFollowUp, demoComplete, handleSuggestion, runDemo, mobile }: RightColumnProps) {
  return (
    <div
      className="liquid-float"
      style={{
        position: "relative", zIndex: 10,
        ...(mobile ? { maxWidth: 380, margin: "0 auto", width: "100%" } : {}),
      }}
    >
      <div className="shadow-2xl" style={{
        background: "hsl(24 53% 7%)", border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 12, overflow: "hidden",
        ...(mobile ? {} : { maxWidth: 520, marginLeft: "auto" }),
      }}>
        {/* Title bar */}
        <div className="flex items-center gap-2" style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(196,30,30,0.6)" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(139,90,0,0.6)" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(26,107,60,0.6)" }} />
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginLeft: 8, fontFamily: "'Inter', sans-serif" }}>FynHelp · Nidhi Cockpit</span>
        </div>

        {/* Mini metrics */}
        <div className="grid grid-cols-3 gap-2 p-3">
          {[
            { label: "Cash today", value: "₹12.4L", color: "hsl(150 60% 26%)" },
            { label: "Runway", value: "52 days", color: "hsl(38 100% 27%)" },
            { label: "ITC at risk", value: "₹3.2L", color: "hsl(0 73% 44%)" },
          ].map((m) => (
            <div key={m.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 12 }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }} />
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{m.label}</span>
              </div>
              <p className="fyn-metric" style={{ color: "#FFFFFF", fontSize: 18 }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Chat */}
        <div className="space-y-2" style={{ padding: "0 12px 12px", minHeight: 220 }}>
          {displayedMsgs.map((msg, i) => (
            <div key={i} className={`slide-up-bounce ${msg.role === "user" ? "ml-8" : ""}`}>
              <div style={{
                borderRadius: 8, padding: 12, fontSize: 13,
                background: msg.role === "user" ? "rgba(196,30,30,0.08)" : "rgba(255,255,255,0.05)"
              }}>
                {msg.role === "nidhi" && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: "50%", background: "#C41E1E" }}>
                      <span style={{ color: "#FFFFFF", fontSize: 9, fontWeight: 700 }}>N</span>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Nidhi</span>
                  </div>
                )}
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line" }}>{msg.text}</p>
              </div>
            </div>
          ))}

          {showTyping && <TypingIndicator />}

          {showFollowUp && (
            <div className="slide-up-bounce" style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 12 }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: "50%", background: "#C41E1E" }}>
                  <span style={{ color: "#FFFFFF", fontSize: 9, fontWeight: 700 }}>N</span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Nidhi</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line" }}>{followUp.text}</p>
              <div className="flex gap-2 mt-3">
                <span style={{ fontSize: 11, background: "rgba(196,30,30,0.2)", color: "#C41E1E", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>Draft chase message</span>
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>Open GST</span>
              </div>
            </div>
          )}

          {showSuggestions && !showFollowUp && (
            <div className="flex flex-wrap gap-2 pt-1 slide-up-bounce">
              {suggestions.map((s) => (
                <button key={s} onClick={() => handleSuggestion(s)}
                  style={{
                    fontSize: 11, border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)",
                    padding: "6px 12px", borderRadius: 100, background: "transparent", cursor: "pointer",
                    transition: "all 250ms cubic-bezier(0.25, 0.1, 0.25, 1)",
                  }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {demoComplete && (
            <button onClick={runDemo} style={{ color: "#8B6914", fontSize: 12, background: "transparent", border: "none", cursor: "pointer", marginTop: 8 }}>
              ↻ Restart demo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
