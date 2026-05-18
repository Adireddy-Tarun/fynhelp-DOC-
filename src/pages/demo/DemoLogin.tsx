import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DEMO_PASSWORD = "fynhelp2026";

function DemoGate({ onAccess }: { onAccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"access" | "demo" | "waitlist">("access");
  const [formData, setFormData] = useState({ name: "", email: "", company: "", role: "" });
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAccess = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    if (password === DEMO_PASSWORD) {
      onAccess();
    } else {
      setError(true);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.company) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitted(true);
    setLoading(false);
  };

  const fadeStyle = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1A1008",
        color: "#F4EDDA",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        @keyframes cardDrift1 { 0%,100%{transform:translateY(0) rotate(-1.5deg)} 50%{transform:translateY(-10px) rotate(-1.5deg)} }
        @keyframes cardDrift2 { 0%,100%{transform:translateY(0) rotate(1deg)} 50%{transform:translateY(-14px) rotate(1deg)} }
        @keyframes cardDrift3 { 0%,100%{transform:translateY(0) rotate(-0.5deg)} 50%{transform:translateY(-8px) rotate(-0.5deg)} }
        @keyframes cardDrift4 { 0%,100%{transform:translateY(0) rotate(1.5deg)} 50%{transform:translateY(-12px) rotate(1.5deg)} }
        @keyframes gridScroll { from{transform:translateY(0)} to{transform:translateY(64px)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes shimmerBar { 0%{width:0%} 100%{width:68%} }

        .fyn-input, .fyn-select {
          width: 100%;
          padding: 13px 16px;
          background: rgba(244,237,218,0.04);
          border: 1px solid rgba(244,237,218,0.08);
          border-radius: 10px;
          color: #F4EDDA;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .fyn-input:focus, .fyn-select:focus {
          border-color: rgba(139,105,20,0.45);
          background: rgba(244,237,218,0.06);
          box-shadow: 0 0 0 3px rgba(139,105,20,0.1);
        }
        .fyn-input::placeholder { color: rgba(244,237,218,0.25); }
        .fyn-select { appearance: none; cursor: pointer; }
        .fyn-select option { background:#1A1008; color:#F4EDDA; }

        .fyn-btn-primary {
          width: 100%;
          padding: 14px;
          background: #C41E1E;
          border: none;
          border-radius: 10px;
          color: #F4EDDA;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: background .2s, transform .2s, box-shadow .2s;
        }
        .fyn-btn-primary:hover:not(:disabled) {
          background: #A01818;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(196,30,30,0.3);
        }
        .fyn-btn-primary:disabled { opacity: .4; cursor: not-allowed; }

        .fyn-tab {
          flex: 1;
          padding: 9px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all .2s;
          text-align: center;
          letter-spacing: 0.01em;
          background: transparent;
        }

        .fyn-stat {
          flex: 1;
          background: rgba(244,237,218,0.03);
          border: 1px solid rgba(244,237,218,0.06);
          border-radius: 12px;
          padding: 14px 10px;
          text-align: center;
          transition: all .2s;
        }
        .fyn-stat:hover {
          background: rgba(244,237,218,0.05);
          border-color: rgba(139,105,20,0.2);
          transform: translateY(-2px);
        }

        .fyn-float-card {
          background: rgba(244,237,218,0.04);
          border: 1px solid rgba(244,237,218,0.07);
          border-radius: 14px;
          padding: 16px 18px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: absolute;
          width: 220px;
        }

        .fyn-back {
          padding: 10px 16px;
          background: rgba(244,237,218,0.04);
          border: 1px solid rgba(244,237,218,0.08);
          border-radius: 10px;
          color: rgba(244,237,218,0.6);
          font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all .2s;
        }
        .fyn-back:hover { background: rgba(244,237,218,0.08); color:#F4EDDA; }

        .fyn-link {
          color: #8B6914;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        @media (max-width: 900px) {
          .fyn-float-card { display: none; }
        }
      `}</style>

      {/* Grid background */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(244,237,218,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(244,237,218,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          animation: "gridScroll 20s linear infinite",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Orbs */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,30,30,0.18), transparent 70%)",
          animation: "orbPulse 8s ease-in-out infinite",
          filter: "blur(40px)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,105,20,0.15), transparent 70%)",
          animation: "orbPulse 10s ease-in-out infinite",
          filter: "blur(40px)",
        }}
      />

      {/* Floating metric cards */}
      <div className="fyn-float-card" style={{ top: 120, left: 60, animation: "cardDrift1 7s ease-in-out infinite" }}>
        <div style={{ fontSize: 11, color: "rgba(244,237,218,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          Burn Rate
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F4EDDA" }}>
          ₹2.1L<span style={{ fontSize: 13, color: "rgba(244,237,218,0.5)" }}>/mo</span>
        </div>
        <div style={{ fontSize: 11, color: "#5FBF7F", marginTop: 6 }}>↓ 12% vs last month</div>
      </div>

      <div className="fyn-float-card" style={{ top: 360, left: 40, animation: "cardDrift2 9s ease-in-out infinite" }}>
        <div style={{ fontSize: 11, color: "rgba(244,237,218,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          Runway
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F4EDDA" }}>8.4 months</div>
        <div style={{ marginTop: 10 }}>
          <div style={{ height: 4, background: "rgba(244,237,218,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#8B6914", animation: "shimmerBar 2s ease-out forwards" }} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(244,237,218,0.45)", marginTop: 6 }}>Extended by 2.3 months</div>
        </div>
      </div>

      <div className="fyn-float-card" style={{ top: 140, right: 60, animation: "cardDrift3 8s ease-in-out infinite" }}>
        <div style={{ fontSize: 11, color: "rgba(244,237,218,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          GST Status
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: "#5FBF7F" }}>✓ Filed On Time</div>
        <div style={{ fontSize: 11, color: "rgba(244,237,218,0.45)", marginTop: 6 }}>GSTR-3B · Next: 20 Jun</div>
      </div>

      <div className="fyn-float-card" style={{ top: 380, right: 40, animation: "cardDrift4 7.5s ease-in-out infinite" }}>
        <div style={{ fontSize: 11, color: "rgba(244,237,218,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          MRR
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F4EDDA" }}>₹4.8L</div>
        <div style={{ fontSize: 11, color: "#5FBF7F", marginTop: 6 }}>↑ 23% MoM growth</div>
      </div>

      {/* Back to home */}
      <div style={{ position: "absolute", top: 24, left: 24, zIndex: 10 }}>
        <button className="fyn-back" onClick={() => (window.location.href = "/")}>
          ← Back to Home
        </button>
      </div>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          maxWidth: 480,
          margin: "0 auto",
          padding: "80px 24px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Logo badge */}
        <div style={fadeStyle(0)}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              background: "rgba(196,30,30,0.1)",
              border: "1px solid rgba(196,30,30,0.25)",
              borderRadius: 100,
              fontSize: 12,
              color: "#C41E1E",
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#C41E1E",
                animation: "blink 2s ease-in-out infinite",
              }}
            />
            FYNHELP
          </div>
        </div>

        {/* Headline */}
        <div style={{ ...fadeStyle(0.1), textAlign: "center", marginTop: 24 }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 38,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#F4EDDA",
              margin: 0,
            }}
          >
            CFO-Level Clarity.
            <br />
            <span style={{ color: "#C41E1E" }}>Not CFO-Level Cost.</span>
          </h1>
          <p
            style={{
              marginTop: 14,
              fontSize: 15,
              color: "rgba(244,237,218,0.55)",
              lineHeight: 1.5,
              maxWidth: 380,
              marginInline: "auto",
            }}
          >
            Built for Indian founders who need financial intelligence — not another spreadsheet.
          </p>
        </div>

        {/* Stats */}
        <div style={{ ...fadeStyle(0.2), display: "flex", gap: 10, width: "100%", marginTop: 28 }}>
          {[
            { value: "63M+", label: "Indian MSMEs" },
            { value: "5", label: "Intel Modules" },
            { value: "Free", label: "During Beta" },
          ].map((s) => (
            <div key={s.label} className="fyn-stat">
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#F4EDDA" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "rgba(244,237,218,0.45)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            ...fadeStyle(0.3),
            width: "100%",
            marginTop: 28,
            background: "rgba(244,237,218,0.03)",
            border: "1px solid rgba(244,237,218,0.08)",
            borderRadius: 18,
            padding: 22,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 6,
              padding: 4,
              background: "rgba(0,0,0,0.2)",
              borderRadius: 10,
              marginBottom: 22,
            }}
          >
            {(
              [
                { key: "access", label: "🔐 Access" },
                { key: "demo", label: "📅 Book Demo" },
                { key: "waitlist", label: "🚀 Waitlist" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                className="fyn-tab"
                onClick={() => {
                  setActiveTab(tab.key);
                  setSubmitted(false);
                }}
                style={{
                  background: activeTab === tab.key ? "rgba(196,30,30,0.12)" : "transparent",
                  borderColor: activeTab === tab.key ? "rgba(196,30,30,0.25)" : "transparent",
                  color: activeTab === tab.key ? "#C41E1E" : "rgba(244,237,218,0.5)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ACCESS */}
          {activeTab === "access" && !submitted && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h2
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#F4EDDA",
                    margin: 0,
                  }}
                >
                  Internal Access
                </h2>
                <p style={{ fontSize: 13, color: "rgba(244,237,218,0.5)", marginTop: 4 }}>
                  Password-protected internal demo
                </p>
              </div>

              <div>
                <input
                  type="password"
                  className="fyn-input"
                  placeholder="Enter access password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAccess()}
                  style={error ? { borderColor: "rgba(239,68,68,0.4)" } : undefined}
                  autoFocus
                />
                {error && (
                  <div style={{ fontSize: 12, color: "#EF4444", marginTop: 8 }}>
                    Incorrect password. Try again.
                  </div>
                )}
              </div>

              <button className="fyn-btn-primary" onClick={handleAccess} disabled={loading || !password}>
                {loading ? "Verifying..." : "Access Dashboard →"}
              </button>

              <div style={{ fontSize: 12, color: "rgba(244,237,218,0.45)", textAlign: "center" }}>
                No password?{" "}
                <span className="fyn-link" onClick={() => setActiveTab("demo")}>
                  Book a demo
                </span>{" "}
                or{" "}
                <span className="fyn-link" onClick={() => setActiveTab("waitlist")}>
                  join the waitlist
                </span>
              </div>
            </div>
          )}

          {/* DEMO */}
          {activeTab === "demo" && !submitted && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, margin: 0 }}>
                  Book a Live Demo
                </h2>
                <p style={{ fontSize: 13, color: "rgba(244,237,218,0.5)", marginTop: 4 }}>
                  See Nidhi AI answer your actual business questions live
                </p>
              </div>

              <input
                className="fyn-input"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                className="fyn-input"
                type="email"
                placeholder="Work email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                className="fyn-input"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
              <select
                className="fyn-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="">Your role</option>
                <option>Founder / Co-founder</option>
                <option>CFO / Finance Head</option>
                <option>Chartered Accountant</option>
                <option>Operations / Admin</option>
                <option>Other</option>
              </select>

              <button className="fyn-btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Booking..." : "Book My Demo →"}
              </button>

              <div style={{ display: "flex", gap: 8 }}>
                {["30-min session", "Live Q&A", "Free forever"].map((p) => (
                  <div
                    key={p}
                    style={{
                      flex: 1,
                      fontSize: 11,
                      color: "rgba(244,237,218,0.4)",
                      padding: "8px 6px",
                      background: "rgba(244,237,218,0.02)",
                      border: "1px solid rgba(244,237,218,0.05)",
                      borderRadius: 8,
                      textAlign: "center",
                    }}
                  >
                    ✓ {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WAITLIST */}
          {activeTab === "waitlist" && !submitted && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, margin: 0 }}>
                  Join the Waitlist
                </h2>
                <p style={{ fontSize: 13, color: "rgba(244,237,218,0.5)", marginTop: 4 }}>
                  First 1,000 users get 6 months free. No credit card.
                </p>
              </div>

              <input
                className="fyn-input"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                className="fyn-input"
                type="email"
                placeholder="Work email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                className="fyn-input"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: "rgba(139,105,20,0.08)",
                  border: "1px solid rgba(139,105,20,0.2)",
                  borderRadius: 10,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#8B6914",
                    animation: "blink 2s ease-in-out infinite",
                  }}
                />
                <div style={{ fontSize: 12, color: "rgba(244,237,218,0.7)" }}>
                  <strong style={{ color: "#F4EDDA" }}>247 founders</strong> already on the list
                  <span style={{ color: "rgba(244,237,218,0.45)" }}> · 753 spots left</span>
                </div>
              </div>

              <button className="fyn-btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Securing your spot..." : "Secure My Spot →"}
              </button>
            </div>
          )}

          {/* SUCCESS */}
          {submitted && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "16px 8px" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(95,191,127,0.12)",
                  border: "1px solid rgba(95,191,127,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                  color: "#5FBF7F",
                  fontSize: 28,
                }}
              >
                ✓
              </div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 600, margin: 0 }}>
                {activeTab === "demo" ? "Demo Booked!" : "You're on the list!"}
              </h2>
              <p style={{ fontSize: 13, color: "rgba(244,237,218,0.55)", marginTop: 8, maxWidth: 320 }}>
                {activeTab === "demo"
                  ? "We'll reach out within 24 hours to confirm your demo slot."
                  : "We'll notify you at launch. Early access means 6 months free."}
              </p>
              <button
                className="fyn-back"
                style={{ marginTop: 22 }}
                onClick={() => {
                  setSubmitted(false);
                  setActiveTab("access");
                }}
              >
                Have a password? Access demo
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ ...fadeStyle(0.4), marginTop: 28, fontSize: 11, color: "rgba(244,237,218,0.35)", textAlign: "center" }}>
          Built for Indian founders · AI-powered · Free during beta
        </div>
      </div>
    </div>
  );
}

export function DemoLogin() {
  const navigate = useNavigate();
  return (
    <DemoGate
      onAccess={() => {
        sessionStorage.setItem("demo_access", "true");
        navigate("/demo/onboarding");
      }}
    />
  );
}

export default DemoLogin;
