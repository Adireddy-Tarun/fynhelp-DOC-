import { useState, useEffect } from "react";

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden flex items-center"
      style={{
        background: "#1A1008",
        minHeight: "100vh",
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(139,105,20,0.10), transparent)",
        }}
      />

      <div
        className="relative w-full"
        style={{ zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "120px 24px 80px" }}
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <LeftColumn />
          <NidhiShowcase />
        </div>
      </div>
    </section>
  );
}

/* ── Left Column (Copy) ── */
function LeftColumn() {
  return (
    <div className="flex flex-col items-start text-left" style={{ position: "relative", zIndex: 10 }}>
      {/* Eyebrow pill */}
      <div
        className="inline-flex items-center gap-2 rounded-full animate-fade-in font-bold"
        style={{
          border: "1px solid rgba(139,105,20,0.4)",
          padding: "6px 16px",
          background: "rgba(139,105,20,0.08)",
        }}
      >
        <span className="rounded-full pulse-ring" style={{ width: 6, height: 6, background: "#22C55E" }} />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "#FFFFFF",
            textTransform: "uppercase" as const,
          }}
        >
          India's Virtual CFO Platform
        </span>
      </div>

      {/* Headline */}
      <h1
        className="animate-fade-in"
        style={{
          animationDelay: "150ms",
          animationFillMode: "both",
          fontWeight: 700,
          fontSize: "clamp(40px, 4.6vw, 64px)",
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
          animationDelay: "300ms",
          animationFillMode: "both",
          fontFamily: "'Roboto', sans-serif",
          fontWeight: 400,
          fontSize: 18,
          color: "rgba(255,255,255,0.72)",
          lineHeight: 1.7,
          maxWidth: 560,
          marginTop: 24,
        }}
      >
        Meet AI CFO Nidhi — the AI CFO built for Indian business. She monitors your cash,
        protects your GST, predicts your risks, and tells you exactly what to do — in your
        language, every morning.
      </p>

      {/* 10 Intelligence Suites callout */}
      <p
        className="animate-fade-in"
        style={{
          animationDelay: "380ms",
          animationFillMode: "both",
          fontFamily: "'Roboto', sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: "rgba(255,255,255,0.85)",
          marginTop: 22,
        }}
      >
        <span style={{ color: "#FFFFFF", fontWeight: 700 }}>10 Intelligence Suites</span>
        <span style={{ color: "rgba(255,255,255,0.55)" }}>
          {" "}· Liquidity Intelligence available now. 9 additional suites in active development.
        </span>
      </p>

      {/* Language pills */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: "500ms", animationFillMode: "both", marginTop: 32 }}
      >
        <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
          <span
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontWeight: 400,
              fontSize: 13,
              color: "rgba(255,255,255,0.60)",
            }}
          >
            AI CFO Nidhi speaks:
          </span>
          {["हिंदी", "English", "తెలుగు", "தமிழ்", "ಕನ್ನಡ"].map((lang) => (
            <span
              key={lang}
              style={{
                border: "1px solid rgba(139,105,20,0.3)",
                borderRadius: 100,
                padding: "4px 12px",
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: 500,
                fontSize: 12,
                color: "#FFFFFF",
                background: "rgba(139,105,20,0.08)",
              }}
            >
              {lang}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Right Column: Meet Your AI CFO Showcase ── */
function NidhiShowcase() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const metrics = [
    { label: "Cash today", value: "₹12.4L", color: "#1A6B3C", trend: "+₹1.2L" },
    { label: "Runway", value: "52 days", color: "#8B5A00", trend: "−8d" },
    { label: "ITC at risk", value: "₹3.2L", color: "#C41E1E", trend: "Apr 20" },
  ];

  return (
    <div
      className="liquid-float animate-fade-in"
      style={{
        animationDelay: "200ms",
        animationFillMode: "both",
        position: "relative",
        zIndex: 10,
        width: "100%",
      }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(196,30,30,0.18), transparent 70%)",
          filter: "blur(40px)",
          transform: "scale(1.05)",
        }}
      />

      {/* Eyebrow label */}
      <div
        className="flex items-center gap-2 mb-3"
        style={{ position: "relative" }}
      >
        <span
          style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(196,30,30,0.95)",
          }}
        >
          ◆ Meet Your AI CFO
        </span>
      </div>

      <div
        className="shadow-2xl relative"
        style={{
          background: "linear-gradient(180deg, #1F1610 0%, #15100A 100%)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow:
            "0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,30,30,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Top bar with persona */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background:
              "linear-gradient(180deg, rgba(196,30,30,0.08) 0%, transparent 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Nidhi avatar */}
            <div
              className="flex items-center justify-center relative"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #C41E1E 0%, #8B1414 100%)",
                boxShadow: "0 0 0 2px rgba(196,30,30,0.25), 0 0 20px rgba(196,30,30,0.4)",
              }}
            >
              <span
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                N
              </span>
              <span
                className="pulse-ring absolute"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#22C55E",
                  border: "2px solid #1F1610",
                  bottom: -2,
                  right: -2,
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  letterSpacing: "0.02em",
                }}
              >
                AI CFO Nidhi
              </div>
              <div
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 11,
                  color: "rgba(34,197,94,0.9)",
                  fontWeight: 500,
                }}
              >
                Online · Analyzing your books
              </div>
            </div>
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
            }}
          >
            FynHelp Cockpit
          </div>
        </div>

        {/* Metrics dashboard background */}
        <div className="grid grid-cols-3 gap-2" style={{ padding: "14px 14px 8px" }}>
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="animate-fade-in"
              style={{
                animationDelay: `${400 + i * 120}ms`,
                animationFillMode: "both",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: m.color,
                  }}
                />
                <span
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {m.label}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  {m.value}
                </span>
                <span
                  style={{
                    color: m.color,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  {m.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Conversation */}
        <div
          className="space-y-2"
          style={{ padding: "8px 16px 18px", minHeight: 280 }}
        >
          {/* User question */}
          {step >= 1 && (
            <div
              className="slide-up-bounce flex justify-end"
              style={{ marginTop: 8 }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  background: "rgba(196,30,30,0.12)",
                  border: "1px solid rgba(196,30,30,0.25)",
                  borderRadius: "12px 12px 4px 12px",
                  padding: "10px 14px",
                }}
              >
                <p
                  style={{
                    color: "rgba(255,255,255,0.92)",
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: 13,
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  Nidhi, what should I do today?
                </p>
              </div>
            </div>
          )}

          {/* Nidhi response */}
          {step >= 2 && (
            <div className="slide-up-bounce" style={{ marginTop: 12 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px 12px 12px 4px",
                  padding: "12px 14px",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#C41E1E",
                    }}
                  >
                    <span
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    >
                      N
                    </span>
                  </div>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "'Work Sans', sans-serif",
                      fontSize: 10,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    AI CFO Nidhi
                  </span>
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: 13,
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  Your cash runway is{" "}
                  <span style={{ color: "#FFFFFF", fontWeight: 600 }}>52 days</span>.
                  Three actions with highest impact today:
                </p>

                {step >= 3 && (
                  <div className="mt-3 space-y-2 slide-up-bounce">
                    {[
                      {
                        n: "1",
                        text: "Chase ABC Electronics — ₹8.4L overdue, adds 15 days runway.",
                        tag: "Receivables",
                        color: "#1A6B3C",
                      },
                      {
                        n: "2",
                        text: "File GSTR-3B before Apr 20 — ₹3.2L ITC at risk.",
                        tag: "GST",
                        color: "#C41E1E",
                      },
                      {
                        n: "3",
                        text: "Hold 3 new hires till May — saves ₹5.25L next quarter.",
                        tag: "Burn",
                        color: "#8B5A00",
                      },
                    ].map((a) => (
                      <div
                        key={a.n}
                        className="flex items-start gap-2.5"
                        style={{
                          padding: "8px 10px",
                          background: "rgba(0,0,0,0.25)",
                          borderLeft: `2px solid ${a.color}`,
                          borderRadius: "4px 6px 6px 4px",
                        }}
                      >
                        <span
                          style={{
                            color: a.color,
                            fontFamily: "'Oswald', sans-serif",
                            fontSize: 13,
                            fontWeight: 700,
                            lineHeight: 1.4,
                          }}
                        >
                          {a.n}
                        </span>
                        <div className="flex-1">
                          <p
                            style={{
                              color: "rgba(255,255,255,0.85)",
                              fontFamily: "'Roboto', sans-serif",
                              fontSize: 12,
                              lineHeight: 1.5,
                              margin: 0,
                            }}
                          >
                            {a.text}
                          </p>
                        </div>
                        <span
                          style={{
                            fontFamily: "'Work Sans', sans-serif",
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: a.color,
                            background: `${a.color}1A`,
                            padding: "2px 6px",
                            borderRadius: 3,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {a.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div
            className="flex items-center gap-2 mt-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 100,
              padding: "8px 8px 8px 16px",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.35)",
                fontFamily: "'Roboto', sans-serif",
                fontSize: 12,
                flex: 1,
              }}
            >
              Ask Nidhi anything about your business…
            </span>
            <div
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#C41E1E",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 8h12M9 3l5 5-5 5"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
