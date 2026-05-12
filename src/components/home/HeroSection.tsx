import { useState, useRef, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip, Mic, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-dashboard-bg.jpg";

const SAMPLE_QUESTIONS = [
  "What's my current runway?",
  "When is my next GST deadline?",
  "Can I afford to hire right now?",
  "Should I extend credit to this customer?",
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [tooltip, setTooltip] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const goToWaitlist = (q?: string) => {
    const text = (q ?? value).trim();
    const url = text ? `/waitlist?question=${encodeURIComponent(text)}` : "/waitlist";
    navigate(url);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToWaitlist();
    }
  };

  const fillQuestion = (q: string) => {
    setValue(q);
    inputRef.current?.focus();
  };

  const showTip = (msg: string) => {
    setTooltip(msg);
    setTimeout(() => setTooltip(null), 2000);
  };

  return (
    <section
      className="relative overflow-hidden flex items-center justify-center"
      style={{ minHeight: "100vh", background: "#1A1008" }}
    >
      {/* Blurred background image */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px)",
          transform: "scale(1.1)",
          opacity: 0.55,
        }}
      />
      {/* Dark overlay + vignette */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(26,16,8,0.45) 0%, rgba(26,16,8,0.85) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.45)" }}
      />

      <div
        className="relative w-full flex flex-col items-center"
        style={{ zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "120px 24px 80px" }}
      >
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full animate-fade-in"
          style={{
            border: "1px solid rgba(139,105,20,0.4)",
            padding: "6px 16px",
            background: "rgba(139,105,20,0.12)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span
            className="rounded-full pulse-ring"
            style={{ width: 6, height: 6, background: "#22C55E" }}
          />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: 12,
              letterSpacing: "0.1em",
              color: "#FFFFFF",
              textTransform: "uppercase",
            }}
          >
            India's Virtual CFO Platform
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in text-center"
          style={{
            animationDelay: "120ms",
            animationFillMode: "both",
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(40px, 6vw, 72px)",
            lineHeight: 1.2,
            color: "#FFFFFF",
            maxWidth: 900,
            marginTop: 48,
          }}
        >
          Don't just track your data.{" "}
          <span style={{ color: "#FF6B6B" }}>Interrogate it.</span>
        </h1>

        {/* Description */}
        <p
          className="animate-fade-in text-center"
          style={{
            animationDelay: "220ms",
            animationFillMode: "both",
            fontFamily: "'Roboto', sans-serif",
            fontSize: "clamp(18px, 1.7vw, 22px)",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.9)",
            maxWidth: 760,
            marginTop: 32,
          }}
        >
          Meet CFO Fynny — stop running your business on gut feeling. Start running it on intelligence.
          <br /><br />
          <span style={{ fontSize: "clamp(16px, 1.5vw, 20px)" }}>
            While other tools build board decks, Fynny provides the strategy. Upload any model or connect your stack to get predictive 'What-If' scenarios and instant financial clarity.
          </span>
        </p>

        {/* Chat Widget */}
        <div
          className="animate-fade-in w-full"
          style={{
            animationDelay: "500ms",
            animationFillMode: "both",
            marginTop: 48,
            maxWidth: 600,
            background: "#FAFAF8",
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between"
            style={{
              background: "#F3F4F6",
              padding: "16px 20px",
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#C41E1E",
                  color: "#FFFFFF",
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                N
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Raleway', sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#1A1A1A",
                  }}
                >
                  CFO Fynny
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#22C55E",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: 12,
                      color: "#6B7280",
                    }}
                  >
                    Online
                  </span>
                </div>
              </div>
            </div>
            <span
              className="hidden sm:block"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: 12,
                color: "#9CA3AF",
              }}
            >
              FynHelp Cockpit
            </span>
          </div>

          {/* Sample Questions */}
          <div style={{ padding: 20, background: "#FFFFFF" }}>
            <div
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                color: "#6B7280",
                marginBottom: 12,
              }}
            >
              💡 Try asking:
            </div>
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => fillQuestion(q)}
                  className="transition-colors"
                  style={{
                    background: "#F3F4F6",
                    padding: "10px 16px",
                    borderRadius: 20,
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: 14,
                    color: "#1A1A1A",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#E5E7EB")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div
            style={{
              padding: "0 20px 20px",
              background: "#FFFFFF",
              borderTop: "1px solid #F0F0F0",
            }}
          >
            <div
              className="flex items-center focus-within:!border-[#C41E1E] transition-colors"
              style={{
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: "8px 12px",
                marginTop: 16,
                gap: 8,
              }}
            >
              <button
                aria-label="Upload file"
                onClick={() => showTip("Sign up to upload files and documents")}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                style={{ color: "#6B7280" }}
              >
                <Paperclip size={20} />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask Fynny anything about your business..."
                aria-label="Ask Fynny a question"
                className="flex-1 bg-transparent outline-none border-0"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 15,
                  color: "#1A1A1A",
                  padding: "6px 0",
                }}
              />
              <button
                aria-label="Voice input"
                onClick={() => showTip("Voice input available in dashboard")}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                style={{ color: "#6B7280" }}
              >
                <Mic size={20} />
              </button>
              <button
                aria-label="Send message"
                onClick={() => goToWaitlist()}
                className="flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
                style={{
                  width: 36,
                  height: 36,
                  background: "#C41E1E",
                  color: "#FFFFFF",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  marginLeft: 4,
                }}
              >
                <ArrowRight size={18} />
              </button>
            </div>

            {tooltip && (
              <div
                role="status"
                className="animate-fade-in"
                style={{
                  marginTop: 10,
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 12,
                  color: "#6B7280",
                  textAlign: "center",
                }}
              >
                {tooltip}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="animate-fade-in text-center"
          style={{
            animationDelay: "650ms",
            animationFillMode: "both",
            marginTop: 16,
            fontFamily: "'Roboto', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Powered by FYNHelp Intelligence · Trained on 500+ CA-verified SME scenarios
        </div>
      </div>
    </section>
  );
}
