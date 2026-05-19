import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Lock, Calendar, Users, TrendingUp, TrendingDown,
  Shield, FileText, AlertCircle, ChevronRight, CheckCircle,
  Clock, Zap, BarChart2, PieChart, Activity, IndianRupee,
  Building2, UserCheck, Bell, Target,
} from "lucide-react";

const DEMO_PASSWORD = "fynhelp2026";

type Tab = "waitlist" | "demo" | "access";

function DemoGate({ onAccess }: { onAccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("waitlist");
  const [formData, setFormData] = useState({ name: "", email: "", company: "", role: "" });
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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

  const handleWaitlistSubmit = async () => {
    if (!formData.name || !formData.email || !formData.company) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setActiveTab("demo");
  };

  const handleDemoSubmit = async () => {
    if (!formData.name || !formData.email || !formData.company) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitted(true);
    setLoading(false);
  };

  const fade = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  });

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: "rgba(244,237,218,0.45)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: 600,
  };

  const metricValueStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 24,
    fontWeight: 700,
    color: "#F4EDDA",
    display: "flex",
    alignItems: "center",
    gap: 2,
  };

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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes orbPulse { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.08);opacity:.9} }
        @keyframes cardDrift1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes cardDrift2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes cardDrift3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes cardDrift4 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes gridScroll { from{transform:translateY(0)} to{transform:translateY(64px)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes progressFill75 { from{width:0%} to{width:75%} }
        @keyframes progressFill89 { from{width:0%} to{width:89%} }
        @keyframes scanMove { 0%{top:-20%} 100%{top:120%} }
        @keyframes fw-ring-fill { from{stroke-dashoffset:151} to{stroke-dashoffset:0} }
        @keyframes fw-ring-seq { from{stroke-dashoffset:82} }
        @keyframes barGrow { from{width:0} }
        @keyframes chatIn1 { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes chatIn2 { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .fyn-input, .fyn-select {
          width: 100%; padding: 12px 14px;
          background: rgba(244,237,218,0.04);
          border: 1px solid rgba(244,237,218,0.08);
          border-radius: 9px; color: #F4EDDA;
          font-size: 13.5px; font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .fyn-input:focus, .fyn-select:focus {
          border-color: rgba(139,105,20,0.5);
          background: rgba(244,237,218,0.06);
          box-shadow: 0 0 0 3px rgba(139,105,20,0.08);
        }
        .fyn-input::placeholder { color: rgba(244,237,218,0.2); }
        .fyn-select { appearance: none; cursor: pointer; }
        .fyn-select option { background:#1A1008; color:#F4EDDA; }

        .fyn-btn-primary {
          width: 100%; padding: 13px;
          background: #C41E1E; border: none;
          border-radius: 9px; color: #F4EDDA;
          font-size: 13.5px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; letter-spacing: 0.02em;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background .2s, transform .15s, box-shadow .2s;
        }
        .fyn-btn-primary:hover:not(:disabled) {
          background: #A01818; transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(196,30,30,0.3);
        }
        .fyn-btn-primary:disabled { opacity: .35; cursor: not-allowed; }

        .fyn-tab {
          flex: 1; padding: 9px 6px; border-radius: 7px;
          font-size: 12px; font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; border: 1px solid transparent;
          transition: all .2s; text-align: center;
          display: flex; align-items: center; justify-content: center; gap: 5px;
          background: transparent;
        }

        .metric-card {
          background: rgba(26,16,8,0.85);
          border: 1px solid rgba(244,237,218,0.08);
          border-radius: 14px; padding: 18px 20px;
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          position: absolute; width: 240px; overflow: hidden;
        }
        .metric-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(244,237,218,0.12), transparent);
        }

        .benefit-row {
          display: flex; align-items: flex-start; gap: 12px; padding: 14px;
          background: rgba(244,237,218,0.02);
          border: 1px solid rgba(244,237,218,0.05);
          border-radius: 10px; transition: all .2s;
        }
        .benefit-row:hover {
          background: rgba(244,237,218,0.04);
          border-color: rgba(139,105,20,0.15);
        }

        .fyn-back {
          padding: 9px 14px; background: rgba(244,237,218,0.04);
          border: 1px solid rgba(244,237,218,0.08); border-radius: 9px;
          color: rgba(244,237,218,0.55); font-size: 12.5px;
          font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px; transition: all .2s;
        }
        .fyn-back:hover { background: rgba(244,237,218,0.08); color: #F4EDDA; }

        .fyn-link { color: #8B6914; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }

        @media (max-width: 1100px) { .fyn-side-cards { display: none; } }
      `}</style>

      {/* Grid background */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "linear-gradient(rgba(244,237,218,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(244,237,218,0.04) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        animation: "gridScroll 20s linear infinite",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
      }} />

      {/* Orbs */}
      <div aria-hidden style={{
        position: "absolute", top: "-10%", left: "-10%", width: 500, height: 500,
        borderRadius: "50%", filter: "blur(40px)",
        background: "radial-gradient(circle, rgba(196,30,30,0.18), transparent 70%)",
        animation: "orbPulse 8s ease-in-out infinite",
      }} />
      <div aria-hidden style={{
        position: "absolute", bottom: "-15%", right: "-10%", width: 600, height: 600,
        borderRadius: "50%", filter: "blur(40px)",
        background: "radial-gradient(circle, rgba(139,105,20,0.15), transparent 70%)",
        animation: "orbPulse 10s ease-in-out infinite",
      }} />

      {/* LEFT FLOATING CARDS */}
      <div className="fyn-side-cards">
        {/* Burn Rate */}
        <div className="metric-card" style={{ top: 130, left: 40, animation: "cardDrift1 7s ease-in-out infinite" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={labelStyle}>Burn Rate</span>
            <TrendingDown size={14} color="#5FBF7F" />
          </div>
          <div style={metricValueStyle}>
            <IndianRupee size={20} strokeWidth={2.5} />
            2.1L
            <span style={{ fontSize: 12, color: "rgba(244,237,218,0.45)", fontWeight: 500, marginLeft: 2 }}>/mo</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#5FBF7F", marginTop: 8 }}>
            <TrendingDown size={11} /> 12% vs last month
          </div>
          <div style={{ height: 3, background: "rgba(244,237,218,0.06)", borderRadius: 2, overflow: "hidden", marginTop: 12 }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg, #8B6914, #C9A642)", animation: "progressFill75 2s ease-out forwards" }} />
          </div>
        </div>

        {/* Runway */}
        <div className="metric-card" style={{ top: 380, left: 60, animation: "cardDrift2 9s ease-in-out infinite" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={labelStyle}>Runway</span>
            <Activity size={14} color="#8B6914" />
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700 }}>8.4 months</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#5FBF7F", marginTop: 8 }}>
            <TrendingUp size={11} /> Extended by 2.3 months
          </div>
          <div style={{ height: 3, background: "rgba(244,237,218,0.06)", borderRadius: 2, overflow: "hidden", marginTop: 12 }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg, #C41E1E, #8B6914)", animation: "progressFill89 2.2s ease-out forwards" }} />
          </div>
        </div>
      </div>

      {/* RIGHT FLOATING CARDS */}
      <div className="fyn-side-cards">
        {/* GST */}
        <div className="metric-card" style={{ top: 130, right: 40, animation: "cardDrift3 8s ease-in-out infinite" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={labelStyle}>GST Compliance</span>
            <Shield size={14} color="#5FBF7F" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: "#5FBF7F" }}>
            <CheckCircle size={14} /> Filed On Time
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "GSTR-1", status: "Filed", ok: true },
              { label: "GSTR-3B", status: "Due 20 Jun", ok: false },
            ].map((row) => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontSize: 11, padding: "6px 0", borderTop: "1px solid rgba(244,237,218,0.05)",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(244,237,218,0.7)" }}>
                  {row.ok ? <CheckCircle size={10} color="#5FBF7F" /> : <Clock size={10} color="#C9A642" />}
                  {row.label}
                </span>
                <span style={{ color: row.ok ? "#5FBF7F" : "#C9A642" }}>{row.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MRR */}
        <div className="metric-card" style={{ top: 380, right: 60, animation: "cardDrift4 7.5s ease-in-out infinite" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={labelStyle}>Monthly Revenue</span>
            <BarChart2 size={14} color="#8B6914" />
          </div>
          <div style={metricValueStyle}>
            <IndianRupee size={20} strokeWidth={2.5} />
            4.8L
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#5FBF7F", marginTop: 8 }}>
            <TrendingUp size={11} /> 23% MoM growth
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 32, marginTop: 12 }}>
            {[40, 55, 45, 65, 60, 75, 89].map((h, i) => (
              <div key={i} style={{
                flex: 1, height: `${h}%`,
                background: i === 6 ? "#C41E1E" : "rgba(139,105,20,0.5)",
                borderRadius: 2,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* BACK TO HOME */}
      <div style={{ position: "absolute", top: 24, left: 24, zIndex: 10 }}>
        <button className="fyn-back" onClick={() => (window.location.href = "/")}>
          <ArrowLeft size={14} /> Back to Home
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        position: "relative", zIndex: 5, maxWidth: 480, margin: "0 auto",
        padding: "80px 24px 48px", display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        {/* Logo */}
        <div style={fade(0)}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 14px", background: "rgba(196,30,30,0.1)",
            border: "1px solid rgba(196,30,30,0.25)", borderRadius: 100,
            fontSize: 12, color: "#C41E1E", fontWeight: 600, letterSpacing: "0.06em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C41E1E", animation: "blink 2s ease-in-out infinite" }} />
            FYNHELP
          </div>
        </div>

        {/* Headline */}
        <div style={{ ...fade(0.1), textAlign: "center", marginTop: 24 }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 38, fontWeight: 700, lineHeight: 1.1,
            letterSpacing: "-0.02em", color: "#F4EDDA", margin: 0,
          }}>
            CFO-Level Clarity.
            <br />
            <span style={{ color: "#C41E1E" }}>Not CFO-Level Cost.</span>
          </h1>
          <p style={{
            marginTop: 14, fontSize: 15, color: "rgba(244,237,218,0.55)",
            lineHeight: 1.5, maxWidth: 380, marginInline: "auto",
          }}>
            Built for Indian founders who need real financial intelligence — not another spreadsheet.
          </p>
        </div>

        {/* Stats */}
        <div style={{ ...fade(0.2), display: "flex", gap: 10, width: "100%", marginTop: 28 }}>
          {[
            { icon: <Building2 size={14} color="#8B6914" />, value: "63M+", label: "Indian MSMEs" },
            { icon: <Target size={14} color="#8B6914" />, value: "5", label: "Intel Modules" },
            { icon: <Zap size={14} color="#8B6914" />, value: "Free", label: "During Beta" },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, background: "rgba(244,237,218,0.03)",
              border: "1px solid rgba(244,237,218,0.06)", borderRadius: 12,
              padding: "14px 10px", textAlign: "center",
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#F4EDDA" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "rgba(244,237,218,0.45)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* MAIN CARD */}
        <div style={{
          ...fade(0.3), width: "100%", marginTop: 28,
          background: "rgba(244,237,218,0.03)",
          border: "1px solid rgba(244,237,218,0.08)", borderRadius: 18,
          padding: 22, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex", gap: 6, padding: 4,
            background: "rgba(0,0,0,0.2)", borderRadius: 9, marginBottom: 22,
          }}>
            {([
              { key: "waitlist" as const, label: "Join Waitlist", icon: <Users size={13} /> },
              { key: "demo" as const, label: "Book Demo", icon: <Calendar size={13} /> },
              { key: "access" as const, label: "Access", icon: <Lock size={12} /> },
            ]).map((tab) => (
              <button
                key={tab.key}
                className="fyn-tab"
                onClick={() => { setActiveTab(tab.key); setSubmitted(false); }}
                style={{
                  background: activeTab === tab.key ? "rgba(196,30,30,0.12)" : "transparent",
                  borderColor: activeTab === tab.key ? "rgba(196,30,30,0.25)" : "transparent",
                  color: activeTab === tab.key ? "#C41E1E" : "rgba(244,237,218,0.4)",
                  fontWeight: activeTab === tab.key ? 600 : 400,
                }}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* WAITLIST */}
          {activeTab === "waitlist" && !submitted && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, margin: 0 }}>
                  Secure Your Free Access
                </h2>
                <p style={{ fontSize: 13, color: "rgba(244,237,218,0.5)", marginTop: 4 }}>
                  First 1,000 founders get 6 months free. No credit card needed.
                </p>
              </div>

              <input className="fyn-input" placeholder="Full name" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <input className="fyn-input" type="email" placeholder="Work email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <input className="fyn-input" placeholder="Company" value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })} />

              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", background: "rgba(139,105,20,0.08)",
                border: "1px solid rgba(139,105,20,0.2)", borderRadius: 10,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#8B6914", animation: "blink 2s ease-in-out infinite" }} />
                <div style={{ fontSize: 12, color: "rgba(244,237,218,0.7)" }}>
                  <strong style={{ color: "#F4EDDA" }}>247 founders</strong> on the list
                  <span style={{ color: "rgba(244,237,218,0.45)" }}> · 753 spots remaining</span>
                </div>
              </div>

              <button className="fyn-btn-primary" onClick={handleWaitlistSubmit} disabled={loading}>
                {loading ? "Joining..." : <>Secure My Spot <ChevronRight size={16} /></>}
              </button>

              <div style={{ fontSize: 11, color: "rgba(244,237,218,0.4)", textAlign: "center" }}>
                Next step: book your live demo slot
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
                  30-min session with real data. See Nidhi AI answer your actual questions.
                </p>
              </div>

              <input className="fyn-input" placeholder="Full name" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <input className="fyn-input" type="email" placeholder="Work email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <input className="fyn-input" placeholder="Company" value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
              <select className="fyn-select" value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="">Select your role</option>
                <option>Founder / Co-founder</option>
                <option>CFO / Finance Head</option>
                <option>Chartered Accountant</option>
                <option>Operations / Admin</option>
                <option>Other</option>
              </select>

              <button className="fyn-btn-primary" onClick={handleDemoSubmit} disabled={loading}>
                {loading ? "Booking..." : <>Book My Demo <ChevronRight size={16} /></>}
              </button>

              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { icon: <Clock size={11} />, label: "30 min" },
                  { icon: <UserCheck size={11} />, label: "Live Q&A" },
                  { icon: <Zap size={11} />, label: "Free" },
                ].map((p) => (
                  <div key={p.label} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    fontSize: 11, color: "rgba(244,237,218,0.45)",
                    padding: "8px 6px", background: "rgba(244,237,218,0.02)",
                    border: "1px solid rgba(244,237,218,0.05)", borderRadius: 8,
                  }}>
                    {p.icon} {p.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACCESS */}
          {activeTab === "access" && !submitted && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, margin: 0 }}>
                  Internal Access
                </h2>
                <p style={{ fontSize: 13, color: "rgba(244,237,218,0.5)", marginTop: 4 }}>
                  For the FYNHelp team only
                </p>
              </div>

              <div>
                <input
                  type="password"
                  className="fyn-input"
                  placeholder="Enter access password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAccess()}
                  style={error ? { borderColor: "rgba(239,68,68,0.4)" } : undefined}
                  autoFocus
                />
                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#EF4444", marginTop: 8 }}>
                    <AlertCircle size={12} /> Incorrect password. Try again.
                  </div>
                )}
              </div>

              <button className="fyn-btn-primary" onClick={handleAccess} disabled={loading || !password}>
                {loading ? "Verifying..." : <>Access Dashboard <ChevronRight size={16} /></>}
              </button>

              <div style={{ fontSize: 12, color: "rgba(244,237,218,0.4)", textAlign: "center" }}>
                Not a team member?{" "}
                <span className="fyn-link" onClick={() => setActiveTab("waitlist")}>Join the waitlist</span>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {submitted && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "16px 8px" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(95,191,127,0.12)",
                border: "1px solid rgba(95,191,127,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 18, color: "#5FBF7F",
              }}>
                <CheckCircle size={28} />
              </div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 600, margin: 0 }}>
                Demo Booked
              </h2>
              <p style={{ fontSize: 13, color: "rgba(244,237,218,0.55)", marginTop: 8, maxWidth: 320 }}>
                We will reach out within 24 hours to confirm your slot. Check your inbox.
              </p>
              <button
                className="fyn-back"
                style={{ marginTop: 22 }}
                onClick={() => { setSubmitted(false); setActiveTab("access"); }}
              >
                <Lock size={12} /> Have internal access?
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM BENEFITS */}
        <div style={{ ...fade(0.4), width: "100%", marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(244,237,218,0.08)" }} />
            <div style={{
              fontSize: 11, color: "rgba(244,237,218,0.5)",
              textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600,
            }}>
              What you get
            </div>
            <div style={{ flex: 1, height: 1, background: "rgba(244,237,218,0.08)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                icon: <PieChart size={16} color="#8B6914" />,
                bg: "rgba(139,105,20,0.1)", border: "rgba(139,105,20,0.2)",
                title: "Live Financial Dashboard",
                desc: "Liquidity, Revenue, Cost, GST and Governance — in one view",
                tag: "Waitlist", tagColor: "#8B6914", tagBg: "rgba(139,105,20,0.12)",
              },
              {
                icon: <Zap size={16} color="#C41E1E" />,
                bg: "rgba(196,30,30,0.08)", border: "rgba(196,30,30,0.2)",
                title: "AI CFO — Nidhi",
                desc: "Ask financial questions in plain language. Get answers in seconds.",
                tag: "Demo", tagColor: "#C41E1E", tagBg: "rgba(196,30,30,0.1)",
              },
              {
                icon: <Bell size={16} color="#5FBF7F" />,
                bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)",
                title: "Proactive GST and Tax Alerts",
                desc: "Never miss a filing deadline. ITC reconciliation automated.",
                tag: "Both", tagColor: "#5FBF7F", tagBg: "rgba(16,185,129,0.08)",
              },
              {
                icon: <FileText size={16} color="#8B6914" />,
                bg: "rgba(139,105,20,0.1)", border: "rgba(139,105,20,0.2)",
                title: "Razorpay and Zoho Sync",
                desc: "Connect your existing tools. Data flows automatically.",
                tag: "Waitlist", tagColor: "#8B6914", tagBg: "rgba(139,105,20,0.12)",
              },
            ].map((b) => (
              <div key={b.title} className="benefit-row">
                <div style={{
                  flexShrink: 0, width: 36, height: 36, borderRadius: 9,
                  background: b.bg, border: `1px solid ${b.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {b.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 14, fontWeight: 600, color: "#F4EDDA",
                  }}>
                    {b.title}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(244,237,218,0.55)", marginTop: 3, lineHeight: 1.4 }}>
                    {b.desc}
                  </div>
                </div>
                <span style={{
                  flexShrink: 0,
                  padding: "4px 10px", borderRadius: 100,
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
                  color: b.tagColor, background: b.tagBg,
                  textTransform: "uppercase",
                }}>
                  {b.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ ...fade(0.5), marginTop: 28, fontSize: 11, color: "rgba(244,237,218,0.35)", textAlign: "center" }}>
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
