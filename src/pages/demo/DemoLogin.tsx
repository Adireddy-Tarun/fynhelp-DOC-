import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Lock, Calendar, Users, TrendingUp, TrendingDown,
  Shield, FileText, AlertCircle, ChevronRight, CheckCircle,
  Clock, Zap, BarChart2, PieChart, Activity, IndianRupee,
  Building2, UserCheck, Bell, Target, Mail,
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

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1400
  );
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isDesktop = screenWidth >= 1280;
  const isTablet = screenWidth >= 768 && screenWidth < 1280;
  const isMobile = screenWidth < 768;

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
        @keyframes floatUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

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
        .fyn-mini-scroll::-webkit-scrollbar { display: none; }
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

      {isDesktop && (
      <>
      {/* LEFT FLOATING WIDGETS */}
      <div
        className="fyn-side-cards"
        style={{
          position: "fixed",
          left: "2%",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          zIndex: 2,
          opacity: mounted ? 1 : 0,
          transition: "opacity 1s ease 0.5s",
          pointerEvents: "none",
        }}
      >
        {/* WIDGET 1: SECURITY */}
        <div
          style={{
            width: "210px",
            background: "#140d04",
            border: "1px solid rgba(244,237,218,0.07)",
            borderRadius: "18px",
            overflow: "hidden",
            position: "relative",
            animation: "cardDrift1 7s ease-in-out infinite",
          }}
        >
          <div style={{ height: "3px", background: "linear-gradient(90deg,#C41E1E,rgba(196,30,30,0.15))" }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "60px",
              background: "linear-gradient(180deg,transparent,rgba(244,237,218,0.018),transparent)",
              animation: "scanMove 5s linear infinite",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <div style={{ padding: "18px", position: "relative", zIndex: 2 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "9px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(244,237,218,0.28)",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ display: "inline-block", width: "16px", height: "1px", background: "rgba(244,237,218,0.2)" }} />
              Infrastructure
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "28px",
                lineHeight: 0.95,
                color: "#F4EDDA",
                letterSpacing: "0.02em",
                marginBottom: "14px",
              }}
            >
              Bank-<br />Grade<br />
              <span style={{ color: "#C41E1E" }}>Security</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
              <div style={{ position: "relative", width: "64px", height: "64px", flexShrink: 0, animation: "cardDrift2 4s ease-in-out infinite" }}>
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(244,237,218,0.05)" strokeWidth="3" />
                  <circle
                    cx="32"
                    cy="32"
                    r="24"
                    fill="none"
                    stroke="#C41E1E"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="151"
                    transform="rotate(-90 32 32)"
                    style={{ animation: "fw-ring-fill 1.8s cubic-bezier(0.16,1,0.3,1) 0.3s both", strokeDashoffset: 0 }}
                  />
                </svg>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  style={{ position: "absolute", top: 0, left: 0, animation: "rotateSlow 8s linear infinite" }}
                >
                  <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(196,30,30,0.2)" strokeWidth="1" strokeDasharray="4 8" />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", color: "#F4EDDA" }}>100</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "rgba(244,237,218,0.3)", letterSpacing: "0.1em" }}>SCORE</div>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", color: "#10B981" }}>100%</div>
                <div style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: "11px", color: "rgba(244,237,218,0.4)", lineHeight: 1.5 }}>
                  Compliance<br />verified
                </div>
                <div
                  style={{
                    marginTop: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "3px 9px",
                    borderRadius: "100px",
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10B981", animation: "blink 2s ease-in-out infinite" }} />
                  <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: "10px", fontWeight: 600, color: "#10B981" }}>Secure</span>
                </div>
              </div>
            </div>
            <div style={{ height: "1px", background: "rgba(244,237,218,0.05)", margin: "12px 0" }} />
            {[
              { label: "SSL Encrypted", status: "ACTIVE" },
              { label: "Row-Level Security", status: "ON" },
              { label: "DPDP Act 2023", status: "COMPLIANT" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: i < 2 ? "7px" : 0 }}>
                <div style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: "11px", fontWeight: 500, color: "rgba(244,237,218,0.55)" }}>{row.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#10B981" }}>{row.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* WIDGET 2: CONNECTIVITY */}
        <div
          style={{
            width: "210px",
            background: "#140d04",
            border: "1px solid rgba(244,237,218,0.07)",
            borderRadius: "18px",
            overflow: "hidden",
            position: "relative",
            animation: "cardDrift3 9s ease-in-out infinite",
          }}
        >
          <div style={{ height: "3px", background: "linear-gradient(90deg,#8B6914,rgba(139,105,20,0.15))" }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "60px",
              background: "linear-gradient(180deg,transparent,rgba(244,237,218,0.018),transparent)",
              animation: "scanMove 5s linear infinite 1.8s",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <div style={{ padding: "18px", position: "relative", zIndex: 2 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "9px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(244,237,218,0.28)",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ display: "inline-block", width: "16px", height: "1px", background: "rgba(244,237,218,0.2)" }} />
              Data Layer
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "26px",
                lineHeight: 0.95,
                color: "#F4EDDA",
                letterSpacing: "0.02em",
                marginBottom: "14px",
              }}
            >
              Live<br />
              <span style={{ color: "#8B6914" }}>Connectivity</span>
            </div>
            <div style={{ position: "relative", height: "40px", marginBottom: "14px", display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,transparent,rgba(139,105,20,0.4))" }} />
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "9px",
                  background: "rgba(139,105,20,0.12)",
                  border: "1px solid rgba(139,105,20,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  animation: "cardDrift2 3.5s ease-in-out infinite",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
                  <circle cx="12" cy="12" r="2" />
                  <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                </svg>
              </div>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,rgba(139,105,20,0.4),transparent)" }} />
            </div>
            {[
              { label: "Razorpay", status: "LIVE SYNC", color: "#10B981", dotColor: "#10B981", delay: "1.8s" },
              { label: "Zoho Books", status: "CONNECTED", color: "#10B981", dotColor: "#10B981", delay: "2.4s" },
              { label: "CSV Upload", status: "READY", color: "#8B6914", dotColor: "#8B6914", delay: "3s" },
            ].map((src, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  padding: "8px 11px",
                  background: "rgba(244,237,218,0.025)",
                  border: "1px solid rgba(244,237,218,0.05)",
                  borderRadius: "8px",
                  marginBottom: i < 2 ? "5px" : 0,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: src.dotColor,
                    flexShrink: 0,
                    animation: `blink ${src.delay} ease-in-out infinite`,
                  }}
                />
                <span style={{ flex: 1, fontFamily: "'Instrument Sans', sans-serif", fontSize: "12px", fontWeight: 500, color: "rgba(244,237,218,0.7)" }}>
                  {src.label}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: src.color }}>{src.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT FLOATING WIDGETS */}
      <div
        className="fyn-side-cards"
        style={{
          position: "fixed",
          right: "2%",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          zIndex: 2,
          opacity: mounted ? 1 : 0,
          transition: "opacity 1s ease 0.7s",
          pointerEvents: "none",
        }}
      >
        {/* WIDGET 3: INTELLIGENCE */}
        <div
          style={{
            width: "218px",
            background: "#140d04",
            border: "1px solid rgba(244,237,218,0.07)",
            borderRadius: "18px",
            overflow: "hidden",
            position: "relative",
            animation: "cardDrift2 8s ease-in-out infinite",
          }}
        >
          <div style={{ height: "3px", background: "linear-gradient(90deg,#8B6914,#C41E1E,rgba(196,30,30,0.1))" }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "60px",
              background: "linear-gradient(180deg,transparent,rgba(244,237,218,0.018),transparent)",
              animation: "scanMove 5s linear infinite 0.9s",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <div style={{ padding: "18px", position: "relative", zIndex: 2 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "9px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(244,237,218,0.28)",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ display: "inline-block", width: "16px", height: "1px", background: "rgba(244,237,218,0.2)" }} />
              Coverage
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "26px",
                lineHeight: 0.95,
                color: "#F4EDDA",
                letterSpacing: "0.02em",
                marginBottom: "14px",
              }}
            >
              <span style={{ color: "#8B6914" }}>5</span> Intel<br />Modules
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              {[
                { val: 92, label: "LIQD", color: "#C41E1E", offset: 9, delay: "0.2s" },
                { val: 88, label: "REV", color: "#8B6914", offset: 14, delay: "0.4s" },
                { val: 85, label: "COST", color: "#8B6914", offset: 17, delay: "0.6s" },
                { val: 95, label: "GST", color: "#C41E1E", offset: 6, delay: "0.8s" },
                { val: 80, label: "GOV", color: "#8B6914", offset: 23, delay: "1s" },
              ].map((ring, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ position: "relative", width: "34px", height: "34px" }}>
                    <svg width="34" height="34" viewBox="0 0 34 34" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="17" cy="17" r="13" fill="none" stroke="rgba(244,237,218,0.05)" strokeWidth="2.5" />
                      <circle
                        cx="17"
                        cy="17"
                        r="13"
                        fill="none"
                        stroke={ring.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="82"
                        style={{
                          animation: `fw-ring-seq 1.4s cubic-bezier(0.16,1,0.3,1) ${ring.delay} both`,
                          strokeDashoffset: ring.offset,
                        }}
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "10px",
                        color: "#F4EDDA",
                      }}
                    >
                      {ring.val}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", letterSpacing: "0.06em", color: "rgba(244,237,218,0.28)" }}>
                    {ring.label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: "1px", background: "rgba(244,237,218,0.05)", marginBottom: "10px" }} />
            {[
              { label: "Liquidity", val: "92%", w: "92%", color: "#C41E1E", delay: "0.5s" },
              { label: "Revenue", val: "88%", w: "88%", color: "#8B6914", delay: "0.65s" },
              { label: "GST & Tax", val: "95%", w: "95%", color: "#C41E1E", delay: "0.8s" },
            ].map((bar, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: i < 2 ? "5px" : 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", width: "28px", textAlign: "right", color: "rgba(244,237,218,0.3)" }}>
                  {bar.label.substring(0, 3).toUpperCase()}
                </div>
                <div style={{ flex: 1, height: "4px", background: "rgba(244,237,218,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: bar.w,
                      background: bar.color,
                      borderRadius: "2px",
                      animation: `barGrow 1.2s cubic-bezier(0.16,1,0.3,1) ${bar.delay} both`,
                    }}
                  />
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: bar.color, minWidth: "26px" }}>{bar.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* WIDGET 4: FYNNY AI */}
        <div
          style={{
            width: "218px",
            background: "#140d04",
            border: "1px solid rgba(244,237,218,0.07)",
            borderRadius: "18px",
            overflow: "hidden",
            position: "relative",
            animation: "cardDrift1 10s ease-in-out infinite reverse",
          }}
        >
          <div style={{ height: "3px", background: "linear-gradient(90deg,#C41E1E,#8B6914,rgba(139,105,20,0.1))" }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "60px",
              background: "linear-gradient(180deg,transparent,rgba(244,237,218,0.018),transparent)",
              animation: "scanMove 5s linear infinite 2.7s",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <div style={{ padding: "18px", position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(244,237,218,0.28)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ display: "inline-block", width: "16px", height: "1px", background: "rgba(244,237,218,0.2)" }} />
                AI CFO
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 8px",
                  borderRadius: "100px",
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10B981", animation: "blink 2s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: "10px", fontWeight: 600, color: "#10B981" }}>ONLINE</span>
              </div>
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", lineHeight: 0.95, color: "#F4EDDA", marginBottom: "12px" }}>
              FYNNY<br />
              <span style={{ color: "#C41E1E" }}>AI</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                  style={{
                    padding: "8px 11px",
                    borderRadius: "10px 10px 2px 10px",
                    background: "rgba(244,237,218,0.06)",
                    border: "1px solid rgba(244,237,218,0.08)",
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontSize: "11.5px",
                    color: "rgba(244,237,218,0.65)",
                    maxWidth: "88%",
                    animation: "chatIn1 0.4s ease 0.9s both",
                    opacity: 0,
                  }}
                >
                  What is my runway?
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "7px",
                    background: "rgba(196,30,30,0.12)",
                    border: "1px solid rgba(196,30,30,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                    animation: "chatIn2 0.4s ease 1.6s both",
                    opacity: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C41E1E" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                  </svg>
                </div>
                <div
                  style={{
                    padding: "8px 11px",
                    borderRadius: "2px 10px 10px 10px",
                    background: "rgba(196,30,30,0.1)",
                    border: "1px solid rgba(196,30,30,0.18)",
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontSize: "11.5px",
                    color: "#F4EDDA",
                    maxWidth: "88%",
                    lineHeight: 1.5,
                    animation: "chatIn2 0.4s ease 1.6s both",
                    opacity: 0,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "8px",
                      color: "rgba(196,30,30,0.6)",
                      marginBottom: "3px",
                      letterSpacing: "0.08em",
                    }}
                  >
                    FYNNY · NOW
                  </span>
                  ₹2.1L/mo burn · <strong>8.4 months runway</strong>
                  <span
                    style={{
                      display: "inline-block",
                      width: "2px",
                      height: "11px",
                      background: "#C41E1E",
                      verticalAlign: "middle",
                      marginLeft: "2px",
                      animation: "blink 1s step-end infinite",
                    }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px" }}>
              {[
                { val: "115+", label: "METRICS", color: "#F4EDDA" },
                { val: "<3s", label: "RESPONSE", color: "#8B6914" },
                { val: "24/7", label: "ALWAYS ON", color: "#C41E1E" },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    padding: "7px 5px",
                    background: "rgba(244,237,218,0.03)",
                    border: "1px solid rgba(244,237,218,0.06)",
                    borderRadius: "7px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "17px", color: stat.color, lineHeight: 1 }}>{stat.val}</div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "7px",
                      color: "rgba(244,237,218,0.28)",
                      marginTop: "2px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>
      )}

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

        {/* MOBILE/TABLET PLATFORM STRIP */}
        {(isTablet || isMobile) && (
          <div
            style={{
              width: "100%",
              marginTop: 20,
              animation: "floatUp 0.5s ease 0.25s forwards",
              opacity: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(244,237,218,0.06)" }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(244,237,218,0.2)",
                }}
              >
                Platform Overview
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(244,237,218,0.06)" }} />
            </div>

            <div
              className="fyn-mini-scroll"
              style={{
                display: "flex",
                gap: 10,
                overflowX: "auto",
                paddingBottom: 8,
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {/* MINI 1: SECURITY */}
              <div
                style={{
                  minWidth: isMobile ? 200 : 220,
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                  background: "#140d04",
                  border: "1px solid rgba(244,237,218,0.07)",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <div style={{ height: 2, background: "linear-gradient(90deg,#C41E1E,rgba(196,30,30,0.15))" }} />
                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(244,237,218,0.28)" }}>
                      Infrastructure
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 100, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#10B981", animation: "blink 2s ease-in-out infinite" }} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#10B981", fontWeight: 600 }}>SECURE</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, lineHeight: 0.95, color: "#F4EDDA", marginBottom: 10 }}>
                    Bank-Grade<br />
                    <span style={{ color: "#C41E1E" }}>Security</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {[
                      { label: "SSL Encrypted", status: "ACTIVE" },
                      { label: "Row-Level Security", status: "ON" },
                      { label: "DPDP Act 2023", status: "COMPLIANT" },
                    ].map((row, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", background: "rgba(244,237,218,0.025)", borderRadius: 6 }}>
                        <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 10.5, color: "rgba(244,237,218,0.5)" }}>{row.label}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#10B981" }}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MINI 2: CONNECTIVITY */}
              <div
                style={{
                  minWidth: isMobile ? 200 : 220,
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                  background: "#140d04",
                  border: "1px solid rgba(244,237,218,0.07)",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <div style={{ height: 2, background: "linear-gradient(90deg,#8B6914,rgba(139,105,20,0.15))" }} />
                <div style={{ padding: 14 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(244,237,218,0.28)", marginBottom: 10 }}>
                    Data Layer
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, lineHeight: 0.95, color: "#F4EDDA", marginBottom: 10 }}>
                    Live<br />
                    <span style={{ color: "#8B6914" }}>Connectivity</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {[
                      { label: "Razorpay", status: "LIVE SYNC", color: "#10B981" },
                      { label: "Zoho Books", status: "CONNECTED", color: "#10B981" },
                      { label: "CSV Upload", status: "READY", color: "#8B6914" },
                    ].map((src, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", background: "rgba(244,237,218,0.025)", borderRadius: 6 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: src.color, flexShrink: 0, animation: `blink ${1.8 + i * 0.6}s ease-in-out infinite` }} />
                        <span style={{ flex: 1, fontFamily: "'Instrument Sans', sans-serif", fontSize: 10.5, color: "rgba(244,237,218,0.55)" }}>{src.label}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: src.color }}>{src.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MINI 3: INTELLIGENCE */}
              <div
                style={{
                  minWidth: isMobile ? 200 : 220,
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                  background: "#140d04",
                  border: "1px solid rgba(244,237,218,0.07)",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <div style={{ height: 2, background: "linear-gradient(90deg,#8B6914,#C41E1E,rgba(196,30,30,0.1))" }} />
                <div style={{ padding: 14 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(244,237,218,0.28)", marginBottom: 10 }}>
                    Coverage
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, lineHeight: 0.95, color: "#F4EDDA", marginBottom: 10 }}>
                    <span style={{ color: "#8B6914" }}>5</span> Intel<br />Modules
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    {[
                      { val: 92, label: "LIQD", color: "#C41E1E", offset: 9 },
                      { val: 88, label: "REV", color: "#8B6914", offset: 14 },
                      { val: 85, label: "COST", color: "#8B6914", offset: 17 },
                      { val: 95, label: "GST", color: "#C41E1E", offset: 6 },
                      { val: 80, label: "GOV", color: "#8B6914", offset: 23 },
                    ].map((ring, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <div style={{ position: "relative", width: 30, height: 30 }}>
                          <svg width="30" height="30" viewBox="0 0 30 30" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="15" cy="15" r="11" fill="none" stroke="rgba(244,237,218,0.05)" strokeWidth="2.5" />
                            <circle
                              cx="15"
                              cy="15"
                              r="11"
                              fill="none"
                              stroke={ring.color}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeDasharray="69"
                              style={{ animation: `fw-ring-seq 1.4s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.15}s both`, strokeDashoffset: ring.offset }}
                            />
                          </svg>
                          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "'Bebas Neue', sans-serif", fontSize: 9, color: "#F4EDDA" }}>
                            {ring.val}
                          </div>
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 6, color: "rgba(244,237,218,0.25)", letterSpacing: "0.04em" }}>
                          {ring.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "6px 8px", background: "rgba(196,30,30,0.07)", border: "1px solid rgba(196,30,30,0.12)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 10.5, color: "rgba(244,237,218,0.5)" }}>GST &amp; Tax</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#C41E1E" }}>95% · LIVE</span>
                  </div>
                </div>
              </div>

              {/* MINI 4: FYNNY AI */}
              <div
                style={{
                  minWidth: isMobile ? 200 : 220,
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                  background: "#140d04",
                  border: "1px solid rgba(244,237,218,0.07)",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <div style={{ height: 2, background: "linear-gradient(90deg,#C41E1E,#8B6914,rgba(139,105,20,0.1))" }} />
                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(244,237,218,0.28)" }}>
                      AI CFO
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 100, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#10B981", animation: "blink 2s ease-in-out infinite" }} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#10B981", fontWeight: 600 }}>ONLINE</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, lineHeight: 0.95, color: "#F4EDDA", marginBottom: 10 }}>
                    FYNNY<br />
                    <span style={{ color: "#C41E1E" }}>AI</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ padding: "6px 9px", borderRadius: "8px 8px 2px 8px", background: "rgba(244,237,218,0.06)", fontFamily: "'Instrument Sans', sans-serif", fontSize: 10.5, color: "rgba(244,237,218,0.55)", animation: "chatIn1 0.4s ease 0.9s both", opacity: 0 }}>
                        What is my runway?
                      </div>
                    </div>
                    <div style={{ padding: "6px 9px", borderRadius: "2px 8px 8px 8px", background: "rgba(196,30,30,0.1)", border: "1px solid rgba(196,30,30,0.15)", fontFamily: "'Instrument Sans', sans-serif", fontSize: 10.5, color: "#F4EDDA", lineHeight: 1.5, animation: "chatIn2 0.4s ease 1.5s both", opacity: 0 }}>
                      <span style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: "rgba(196,30,30,0.6)", marginBottom: 2 }}>
                        FYNNY · NOW
                      </span>
                      <strong>8.4 months</strong> at ₹2.1L/mo burn
                      <span style={{ display: "inline-block", width: 2, height: 10, background: "#C41E1E", verticalAlign: "middle", marginLeft: 2, animation: "blink 1s step-end infinite" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                    {[
                      { val: "115+", label: "METRICS", color: "#F4EDDA" },
                      { val: "<3s", label: "SPEED", color: "#8B6914" },
                      { val: "24/7", label: "ONLINE", color: "#C41E1E" },
                    ].map((s, i) => (
                      <div key={i} style={{ padding: "5px 4px", background: "rgba(244,237,218,0.03)", border: "1px solid rgba(244,237,218,0.05)", borderRadius: 6, textAlign: "center" }}>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: s.color, lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 6, color: "rgba(244,237,218,0.25)", marginTop: 1 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: i === 0 ? 16 : 4,
                    height: 3,
                    borderRadius: 2,
                    background: i === 0 ? "#C41E1E" : "rgba(244,237,218,0.15)",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
          </div>
        )}

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

        {/* BENEFITS STRIP */}
        <div
          style={{
            width: "100%",
            marginTop: "20px",
            background: "#140d04",
            border: "1px solid rgba(244,237,218,0.07)",
            borderRadius: "18px",
            overflow: "hidden",
            animation: "floatUp 0.5s ease 0.5s forwards",
            opacity: 0,
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg,rgba(196,30,30,0.12),rgba(139,105,20,0.08),transparent)",
              padding: "12px 20px",
              borderBottom: "1px solid rgba(244,237,218,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
              <path d="M20 12V22H4V12" />
              <path d="M22 7H2v5h20V7z" />
              <path d="M12 22V7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "15px", letterSpacing: "0.08em", color: "#F4EDDA" }}>
              Waitlist Member Benefits
            </span>
            <div style={{ marginLeft: "auto" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  background: "rgba(196,30,30,0.12)",
                  border: "1px solid rgba(196,30,30,0.2)",
                }}
              >
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#C41E1E", animation: "blink 2s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: "10px", fontWeight: 600, color: "#C41E1E" }}>753 SPOTS LEFT</span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
            {[
              { val: "6", unit: "MONTHS FREE", desc: "Full platform · No credit card", color: "#10B981" },
              { val: "1st", unit: "PRIORITY ACCESS", desc: "Every new feature · Early", color: "#8B6914" },
              { val: "50%", unit: "OFF PRO PLAN", desc: "Locked in · Forever yours", color: "#C41E1E" },
              { val: "10x", unit: "AI USAGE LIMITS", desc: "Enterprise-grade · Included", color: "#8B6914" },
            ].map((b, i) => (
              <div
                key={i}
                style={{
                  padding: "16px 18px",
                  borderRight: i < 3 ? "1px solid rgba(244,237,218,0.05)" : "none",
                }}
              >
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "40px", lineHeight: 1, color: b.color, marginBottom: "2px" }}>
                  {b.val}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "12px", letterSpacing: "0.06em", color: "#F4EDDA", marginBottom: "4px" }}>
                  {b.unit}
                </div>
                <div style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: "11px", color: "rgba(244,237,218,0.3)", lineHeight: 1.5 }}>
                  {b.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT */}
        <div
          style={{
            ...fade(0.4),
            width: "100%",
            marginTop: 28,
            padding: "16px 18px",
            background: "rgba(244,237,218,0.03)",
            border: "1px solid rgba(244,237,218,0.08)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "rgba(139,105,20,0.12)",
              border: "1px solid rgba(139,105,20,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Mail size={16} color="#8B6914" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13.5,
                fontWeight: 600,
                color: "#F4EDDA",
              }}
            >
              Need help or have questions?
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11.5,
                color: "rgba(244,237,218,0.5)",
                marginTop: 2,
              }}
            >
              support@fynhelp.com
            </div>
          </div>
          <a
            href="mailto:support@fynhelp.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "#C41E1E",
              border: "none",
              borderRadius: 8,
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: "#F4EDDA",
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "background 0.2s, transform 0.15s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#A01818";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#C41E1E";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            <Mail size={12} />
            Contact Us
          </a>
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
