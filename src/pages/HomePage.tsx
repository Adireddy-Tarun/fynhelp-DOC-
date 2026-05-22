import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Play, Send, Cloud, Lock, Database, ShieldCheck, EyeOff, ArrowUpRight } from "lucide-react";

// ===== PALETTE (matches reference) =====
const C = {
  bg: "#ECE6D2",
  card: "#FAF7EC",
  cardSoft: "#F4EFDD",
  ink: "#111111",
  inkSoft: "#1A1A1A",
  body: "#3A3A3A",
  muted: "#6B6B6B",
  red: "#B8333A",
  redDark: "#9E2A30",
  redSoft: "#F2DCDD",
  redTint: "#FBEFEF",
  black: "#0E0E0E",
  green: "#10B981",
  border: "rgba(0,0,0,0.08)",
};

// ===== STYLES =====
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  .fyn-page { background: ${C.bg}; color: ${C.ink}; font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; }
  .fyn-page * { box-sizing: border-box; }
  .fyn-h { font-family: 'Inter', sans-serif; font-weight: 800; letter-spacing: -0.025em; line-height: 1.02; color: ${C.ink}; }
  .fyn-container { max-width: 1240px; margin: 0 auto; padding: 0 24px; }

  /* Nav */
  .fyn-nav { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 1180px; z-index: 50;
    background: ${C.card}; border: 1px solid ${C.border}; border-radius: 100px; padding: 10px 14px 10px 22px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: space-between; }
  .fyn-nav-links { display: none; gap: 28px; }
  @media (min-width: 900px) { .fyn-nav-links { display: flex; } }
  .fyn-nav a.fyn-nav-link { font-size: 14px; color: ${C.body}; text-decoration: none; font-weight: 500; }
  .fyn-nav a.fyn-nav-link:hover { color: ${C.ink}; }
  .fyn-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
  .fyn-logo-dot { width: 26px; height: 26px; border-radius: 50%; background: ${C.ink}; display: flex; align-items: center; justify-content: center; }
  .fyn-logo-dot::after { content:''; width:9px; height:9px; border-radius:50%; background: ${C.red}; }
  .fyn-logo-text { font-weight: 700; font-size: 17px; color: ${C.ink}; }
  .fyn-logo-text span { color: ${C.red}; }

  .btn-pill { display: inline-flex; align-items: center; gap: 8px; border-radius: 100px; font-weight: 600; cursor: pointer; transition: all .15s ease; text-decoration: none; }
  .btn-red { background: ${C.red}; color: #fff; padding: 12px 22px; font-size: 14px; border: none; }
  .btn-red:hover { background: ${C.redDark}; }
  .btn-ghost { background: transparent; color: ${C.ink}; padding: 10px 18px; font-size: 14px; border: 1px solid transparent; }
  .btn-ghost:hover { background: rgba(0,0,0,0.04); }
  .btn-outline { background: ${C.card}; color: ${C.ink}; padding: 14px 26px; font-size: 15px; border: 1px solid ${C.border}; }
  .btn-outline:hover { background: #fff; }
  .btn-dark { background: ${C.black}; color: #fff; padding: 12px 22px; font-size: 14px; border: none; }
  .btn-dark:hover { background: #222; }

  /* Hero */
  .hero { padding: 140px 0 60px; text-align: center; }
  .hero h1 { font-size: clamp(56px, 9vw, 116px); font-weight: 900; }
  .hero .red-line { color: ${C.red}; }
  .hero-sub { max-width: 720px; margin: 32px auto 0; font-size: 19px; line-height: 1.55; color: ${C.body}; }
  .hero-sub b { color: ${C.ink}; font-weight: 700; }
  .hero-cta { display: flex; gap: 14px; justify-content: center; margin-top: 36px; flex-wrap: wrap; }
  .hero-cta .btn-red { padding: 16px 30px; font-size: 16px; }
  .hero-cta .btn-outline { padding: 16px 26px; font-size: 16px; }

  /* Stats row */
  .stats-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 64px; }
  @media (min-width: 760px) { .stats-row { grid-template-columns: repeat(4, 1fr); } }
  .stat-card { background: ${C.card}; border-radius: 14px; padding: 22px 26px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid ${C.border}; }
  .stat-card .v { font-size: 36px; font-weight: 800; color: ${C.ink}; letter-spacing: -0.02em; line-height: 1; }
  .stat-card .l { font-size: 11px; font-weight: 600; color: ${C.muted}; letter-spacing: 0.12em; margin-top: 8px; }

  /* Chat */
  .chat-card { background: ${C.card}; border-radius: 22px; padding: 28px; margin-top: 56px; min-height: 360px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid ${C.border}; position: relative; }
  .chat-live { position: absolute; top: 22px; right: 22px; display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 100px; background: #E8F8EF; }
  .chat-live::before { content:''; width: 6px; height: 6px; border-radius: 50%; background: ${C.green}; }
  .chat-live-t { font-size: 11px; color: ${C.green}; font-weight: 600; letter-spacing: 0.06em; }
  .chat-avatar { width: 42px; height: 42px; border-radius: 50%; background: ${C.red}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .chat-avatar::after { content:''; width: 14px; height: 14px; border-radius: 50%; background: #fff; }
  .chat-row-user { display: flex; justify-content: center; margin: 28px 0 22px; }
  .chat-bubble-user { background: ${C.red}; color: #fff; padding: 10px 16px; border-radius: 100px; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; }
  .chat-row-bot { display: flex; gap: 14px; align-items: flex-start; margin-top: 16px; }
  .chat-bot-content { flex: 1; background: ${C.redTint}; border: 1px solid ${C.redSoft}; border-radius: 14px; padding: 16px 20px; }
  .chat-bot-label { font-size: 11px; color: ${C.red}; font-weight: 700; letter-spacing: 0.14em; margin-bottom: 6px; }
  .chat-bot-text { font-size: 14.5px; color: ${C.body}; line-height: 1.55; }
  .chat-bot-text b { color: ${C.ink}; font-weight: 600; }
  .chat-bot-text .g { color: ${C.green}; font-weight: 600; }
  .chat-bot-text .a { color: ${C.red}; font-weight: 600; }
  .chat-input-row { position: absolute; bottom: 22px; right: 22px; }
  .chat-typing { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; }
  .chat-typing span { width: 5px; height: 5px; border-radius: 50%; background: ${C.green}; animation: blink 1.2s infinite; opacity: 0.4; }
  .chat-typing span:nth-child(2) { animation-delay: .2s; }
  .chat-typing span:nth-child(3) { animation-delay: .4s; }
  @keyframes blink { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
  .send-fab { width: 44px; height: 44px; border-radius: 50%; background: ${C.red}; border: none; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; }

  /* Ticker */
  .ticker { overflow: hidden; padding: 14px 0; }
  .ticker-light { background: ${C.cardSoft}; border-top: 1px solid ${C.border}; border-bottom: 1px solid ${C.border}; }
  .ticker-dark { background: ${C.black}; }
  .ticker-track { display: inline-flex; white-space: nowrap; animation: scroll 60s linear infinite; }
  .ticker-light .ticker-track { animation-duration: 50s; }
  .ticker-item { display: inline-flex; align-items: center; gap: 28px; padding-right: 28px; font-size: 14px; }
  .ticker-light .ticker-item { color: ${C.body}; }
  .ticker-dark .ticker-item { color: rgba(255,255,255,0.85); }
  .ticker-dot { width: 4px; height: 4px; border-radius: 50%; background: ${C.red}; }
  @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

  /* Section */
  .section { padding: 100px 0; }
  .section-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 100px; background: ${C.card}; border: 1px solid ${C.border}; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; color: ${C.ink}; }
  .section-eyebrow.dot::before { content:''; width: 7px; height: 7px; border-radius: 50%; background: ${C.red}; }
  .section h2 { font-size: clamp(40px, 6vw, 72px); font-weight: 800; text-align: center; margin: 20px 0 0; }
  .section h2.left { text-align: left; }
  .section .lead { text-align: center; color: ${C.muted}; font-size: 17px; margin-top: 16px; }

  /* Integrations grid */
  .int-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 56px; }
  @media (min-width: 700px) { .int-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1000px) { .int-grid { grid-template-columns: repeat(6, 1fr); } }
  .int-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 12px; }
  .int-abbr { width: 38px; height: 38px; border-radius: 50%; background: ${C.ink}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .int-name { font-size: 14px; font-weight: 600; color: ${C.ink}; }
  .int-status { font-size: 11px; color: ${C.green}; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
  .int-status::before { content:''; width: 5px; height: 5px; border-radius: 50%; background: ${C.green}; }

  /* Problem */
  .problem-card { background: ${C.card}; border-radius: 24px; padding: 64px; display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid ${C.border}; }
  @media (min-width: 900px) { .problem-card { grid-template-columns: 1fr 1fr; } }
  .problem-card h2 { font-size: clamp(40px, 5.5vw, 60px); text-align: left; margin: 24px 0 0; line-height: 1.05; }
  .problem-card h2 .red { color: ${C.red}; }
  .problem-card p { color: ${C.body}; font-size: 16px; margin-top: 24px; line-height: 1.6; }
  .problem-stat { background: linear-gradient(135deg, #B8333A, #8E2429); border-radius: 18px; padding: 56px 32px; color: #fff; text-align: center; }
  .problem-stat .num { font-size: 110px; font-weight: 800; line-height: 1; letter-spacing: -0.02em; }
  .problem-stat .lbl { font-size: 11px; letter-spacing: 0.14em; margin-top: 10px; opacity: 0.92; font-weight: 600; }
  .problem-stat .pills { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 32px; }
  .problem-stat .pill { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 100px; padding: 8px 12px; font-size: 12px; font-weight: 500; }

  /* Steps */
  .steps-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 16px; margin-top: 56px; }
  @media (min-width: 700px) { .steps-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1000px) { .steps-grid { grid-template-columns: repeat(4, 1fr); } }
  .step-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 16px; padding: 28px; min-height: 200px; position: relative; transition: transform .2s ease; }
  .step-card:hover { transform: translateY(-3px); }
  .step-num { font-size: 12px; color: ${C.muted}; font-weight: 600; }
  .step-card .arrow { position: absolute; top: 24px; right: 24px; color: ${C.muted}; }
  .step-title { font-size: 20px; font-weight: 700; color: ${C.ink}; margin: 28px 0 12px; }
  .step-desc { font-size: 14px; color: ${C.muted}; line-height: 1.5; }
  .step-link { color: ${C.red}; font-size: 13px; font-weight: 600; margin-top: 16px; display: inline-block; }

  /* Simulator */
  .sim-card { background: ${C.black}; border-radius: 24px; padding: 64px; color: #fff; display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center; }
  @media (min-width: 900px) { .sim-card { grid-template-columns: 1fr 1fr; } }
  .sim-eyebrow { font-size: 11px; letter-spacing: 0.18em; color: rgba(255,255,255,0.6); font-weight: 600; }
  .sim-card h2 { color: #fff; text-align: left; font-size: clamp(40px, 5vw, 56px); margin-top: 20px; }
  .sim-card h2 .red { color: ${C.red}; }
  .sim-card p { color: rgba(255,255,255,0.7); margin-top: 24px; font-size: 15px; line-height: 1.6; }
  .sim-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 28px; }
  .sim-chip { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 100px; padding: 8px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; color: rgba(255,255,255,0.85); }
  .sim-foot { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 28px; font-family: 'JetBrains Mono', monospace; }
  .sim-panel { background: ${C.card}; border-radius: 18px; padding: 36px; min-height: 380px; display: flex; flex-direction: column; justify-content: space-between; }
  .sim-result { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 60px; }
  .sim-result-cell { text-align: center; }
  .sim-result-cell .v { font-size: 26px; font-weight: 800; color: ${C.red}; }
  .sim-unlock { background: ${C.red}; color: #fff; border: none; border-radius: 12px; padding: 16px; font-size: 15px; font-weight: 600; margin-top: 24px; cursor: pointer; }

  /* Security */
  .sec-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 56px; }
  @media (min-width: 700px) { .sec-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1100px) { .sec-grid { grid-template-columns: repeat(6, 1fr); } }
  .sec-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 14px; padding: 22px; }
  .sec-icon { width: 40px; height: 40px; border-radius: 10px; background: ${C.redTint}; color: ${C.red}; display: flex; align-items: center; justify-content: center; }
  .sec-label { font-size: 11px; color: ${C.muted}; letter-spacing: 0.12em; font-weight: 600; margin-top: 16px; }
  .sec-value { font-size: 17px; font-weight: 700; color: ${C.ink}; margin-top: 6px; }

  /* Testimonials */
  .test-grid { display: grid; grid-template-columns: 1fr; gap: 18px; margin-top: 56px; }
  @media (min-width: 800px) { .test-grid { grid-template-columns: 1fr 1fr; } }
  .test-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 18px; padding: 28px; }
  .test-card.tinted { background: linear-gradient(135deg, ${C.cardSoft}, ${C.redTint}); }
  .test-q { font-size: 17px; line-height: 1.5; color: ${C.ink}; }
  .test-author { display: flex; align-items: center; gap: 12px; margin-top: 22px; }
  .test-avatar { width: 38px; height: 38px; border-radius: 50%; background: ${C.ink}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
  .test-name { font-weight: 700; font-size: 14px; color: ${C.ink}; }
  .test-meta { font-size: 12px; color: ${C.muted}; margin-top: 2px; }
  .test-tag { font-size: 12px; color: ${C.red}; font-weight: 600; margin-top: 18px; }

  .nums-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 32px; }
  @media (min-width: 800px) { .nums-row { grid-template-columns: repeat(5, 1fr); } }
  .num-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 18px; padding: 26px; text-align: center; }
  .num-card .v { font-size: 32px; font-weight: 800; color: ${C.ink}; }
  .num-card .l { font-size: 10px; letter-spacing: 0.18em; color: ${C.muted}; margin-top: 10px; font-weight: 600; }

  /* Final CTA */
  .cta-card { background: ${C.black}; border-radius: 24px; padding: 80px 32px; text-align: center; color: #fff; }
  .cta-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; letter-spacing: 0.18em; color: rgba(255,255,255,0.7); font-weight: 600; }
  .cta-eyebrow::before { content:''; width: 7px; height: 7px; border-radius: 50%; background: ${C.red}; }
  .cta-card h2 { color: #fff; margin: 20px 0 0; font-size: clamp(48px, 7vw, 88px); }
  .cta-card h2 .red { color: ${C.red}; }
  .cta-card p { color: rgba(255,255,255,0.75); font-size: 17px; margin-top: 20px; max-width: 560px; margin-left: auto; margin-right: auto; }
  .cta-form { max-width: 560px; margin: 36px auto 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .cta-form input { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); border-radius: 100px; padding: 14px 22px; color: #fff; font-size: 14px; outline: none; }
  .cta-form input::placeholder { color: rgba(255,255,255,0.45); }
  .cta-submit { grid-column: 1 / -1; background: ${C.red}; color: #fff; border: none; border-radius: 100px; padding: 16px; font-size: 15px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
  .cta-submit:hover { background: ${C.redDark}; }
  .cta-foot { font-size: 11px; letter-spacing: 0.18em; color: rgba(255,255,255,0.45); margin-top: 22px; font-weight: 600; }

  /* Footer */
  .footer { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 24px; padding: 56px 48px; margin: 80px auto 32px; max-width: 1180px; display: grid; grid-template-columns: 1fr; gap: 40px; }
  @media (min-width: 900px) { .footer { grid-template-columns: 1.4fr 1fr 1fr 1fr; } }
  .footer h4 { font-size: 12px; letter-spacing: 0.16em; color: ${C.muted}; font-weight: 700; margin: 0 0 18px; }
  .footer a, .footer li { color: ${C.ink}; font-size: 14px; text-decoration: none; line-height: 2; display: block; }
  .footer a:hover { color: ${C.red}; }
  .footer .desc { color: ${C.muted}; font-size: 14px; line-height: 1.6; max-width: 280px; margin-top: 14px; }
  .footer .made { font-size: 12px; color: ${C.muted}; margin-top: 18px; }
  .footer-bottom { max-width: 1180px; margin: 0 auto 40px; padding: 0 48px; display: flex; justify-content: space-between; font-size: 12px; color: ${C.muted}; }

  /* Animations */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px);} to { opacity: 1; transform: translateY(0);} }
  .fade-up { animation: fadeUp 0.7s ease both; }

  /* Scroll reveal */
  .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1); will-change: opacity, transform; }
  .reveal.in { opacity: 1; transform: translateY(0); }
  @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
`;

// ===== DATA =====
const NAV_LINKS = [
  { label: "Products", href: "/#products" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
];

const STATS = [
  { v: "63M+", l: "INDIAN MSMES" },
  { v: "500+", l: "CA SCENARIOS" },
  { v: "₹0", l: "CFO COST" },
  { v: "24/7", l: "AI ALWAYS ON" },
];

const TICKER_LIGHT = [
  "Powered by FynHelp Intelligence",
  "Trained on 500+ CA-verified SME scenarios",
  "Real-time What-If Scenario Engine",
  "GST & Tax Intelligence built-in",
  "Connected to Indian Banks & Accounting",
];

const TICKER_DARK = [
  "₹40,000 avg saved/month on missed deductions",
  "4.2 months avg runway extension",
  "Real-time cash flow across all bank accounts",
  "Auto-detect hidden vendor charges (₹2L+/yr)",
  "Proactive burn alerts prevent cash crises",
  "GST ITC reconciliation saves ₹1.8L/year",
  "30% faster month-end close",
  "Zero GST penalties with deadline tracking",
  "Predict cash shortfalls 60 days in advance",
  "Know your runway in 10 seconds, not 10 days",
  "Never miss a GST deadline with automated alerts",
  "Track every UPI payment — no lost revenue",
  "Cut reconciliation from 15 hours to 1 hour/month",
];

const INTEGRATIONS = [
  ["RP", "Razorpay"], ["ZB", "Zoho Books"], ["HD", "HDFC Bank"],
  ["IC", "ICICI Bank"], ["SB", "SBI"], ["AX", "Axis Bank"],
  ["KT", "Kotak"], ["TL", "Tally"], ["ST", "Stripe"],
  ["PU", "PayU"], ["GS", "GST Portal"], ["QB", "QuickBooks"],
];

const STEPS = [
  { n: "01", t: "Connect your bank", d: "2 minutes via RBI's Account Aggregator." },
  { n: "02", t: "Connect accounting", d: "15 minutes — we handle the mapping." },
  { n: "03", t: "Enter your GSTIN", d: "3 minutes — instant compliance calendar." },
  { n: "04", t: "Fynny's first brief", d: "Within minutes. Then every morning after." },
];

const SIM_CHIPS = ["CREDIT TERMS", "HIRING", "PRICING", "GST REFUND DELAY", "MACHINERY PURCHASE", "WORKING CAPITAL LOAN", "SEASONAL PUSH", "M&A"];

const SECURITY = [
  { Icon: Cloud, l: "INFRASTRUCTURE", v: "AWS Mumbai" },
  { Icon: Lock, l: "ENCRYPTION", v: "256-bit AES" },
  { Icon: Database, l: "DATABASE", v: "PostgreSQL" },
  { Icon: ShieldCheck, l: "COMPLIANCE", v: "Audit Trail" },
  { Icon: EyeOff, l: "PRIVACY", v: "Zero-Knowledge" },
  { Icon: Cloud, l: "BACKUP", v: "Daily Automated" },
];

const TESTIMONIALS = [
  {
    q: "\"CFO Fynny told me I'd run out of cash in 34 days — five weeks before my CA would have even noticed. I collected from 3 clients that week and avoided a complete shutdown.\"",
    a: "RM", n: "Rajesh Mehta", m: "Mehta Textile Traders, Surat · ₹18 Cr turnover",
    tag: "Crisis averted · ₹24L collected · Runway +22 days", tinted: false,
  },
  {
    q: "\"Our GST notice risk was 74 when we joined. Three months of ITC reconciliation brought it to 18. We recovered ₹4.2L in ITC we didn't know we were missing.\"",
    a: "PS", n: "Priya Sharma", m: "Sharma & Sons Distributors, Pune · ₹12 Cr business",
    tag: "₹4.2L ITC recovered · Notice risk 74 → 18", tinted: true,
  },
  {
    q: "\"I used to spend 3 hours every Monday trying to understand my finances. Fynny's morning brief is 3 sentences. In Hindi. I know everything in 30 seconds.\"",
    a: "KS", n: "Karthik Sundaram", m: "KS Engineering Components, Chennai · ₹8 Cr manufacturing",
    tag: "12 hrs/month saved · CA relationship improved", tinted: false,
  },
  {
    q: "\"Fynhelp flagged that a large corporate buyer was legally obligated to pay me within 45 days under Section 43B(h). I sent the notice. They paid within a week.\"",
    a: "AF", n: "Anwar Farooqui", m: "Farooqui Garments Export, Tiruppur · Export · 32 employees",
    tag: "₹6.8L collected · Section 43B(h) exercised", tinted: false,
  },
];

const NUMS = [
  { v: "10,000+", l: "BUSINESSES" },
  { v: "₹2,400 Cr", l: "MONITORED" },
  { v: "₹180 Cr", l: "ITC RECOVERED" },
  { v: "98.7%", l: "ACCURACY" },
  { v: "4.8★", l: "AVG RATING" },
];

// ===== Chat sequence (typed) =====
const CHAT = {
  user: "GST status?",
  label: "GST INTELLIGENCE",
  reply: <><span className="g">GSTR-1 filed</span> · GSTR-3B due in <b className="a">3 days</b>. ITC reconciliation shows <b>₹18K gap</b> vs 2A. Recommend filing by tomorrow to avoid interest.</>,
};

// ===== COMPONENTS =====
function Nav() {
  return (
    <nav className="fyn-nav">
      <Link to="/" className="fyn-logo">
        <div className="fyn-logo-dot" />
        <div className="fyn-logo-text">Fyn<span>Help</span></div>
      </Link>
      <div className="fyn-nav-links">
        {NAV_LINKS.map(l => <a key={l.label} href={l.href} className="fyn-nav-link">{l.label}</a>)}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Link to="/demo/login" className="btn-pill btn-outline" style={{ padding: "10px 20px", fontSize: 14 }}>Demo Login</Link>
        <Link to="/waitlist" className="btn-pill btn-red">Join Waitlist <ArrowRight size={16} /></Link>
      </div>
    </nav>
  );
}

function ChatWidget() {
  const [phase, setPhase] = useState<"idle" | "user" | "typing" | "reply">("idle");
  useEffect(() => {
    const seq = () => {
      setPhase("user");
      setTimeout(() => setPhase("typing"), 1200);
      setTimeout(() => setPhase("reply"), 2400);
      setTimeout(() => setPhase("idle"), 6000);
    };
    seq();
    const i = setInterval(seq, 7500);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="chat-card fade-up">
      <div className="chat-live"><span className="chat-live-t">LIVE</span></div>
      <div className="chat-avatar" style={{ position: "absolute", top: 22, left: 22 }} />
      {(phase === "user" || phase === "typing" || phase === "reply") && (
        <div className="chat-row-user fade-up"><div className="chat-bubble-user">📄 {CHAT.user}</div></div>
      )}
      {phase === "typing" && (
        <div style={{ position: "relative", height: 40 }}>
          <div className="chat-typing"><span /><span /><span /></div>
        </div>
      )}
      {phase === "reply" && (
        <div className="chat-row-bot fade-up" style={{ marginTop: 28 }}>
          <div className="chat-avatar" style={{ width: 32, height: 32 }} />
          <div className="chat-bot-content">
            <div className="chat-bot-label">{CHAT.label}</div>
            <div className="chat-bot-text">{CHAT.reply}</div>
          </div>
        </div>
      )}
      <div className="chat-input-row"><button className="send-fab"><Send size={18} /></button></div>
    </div>
  );
}

function Ticker({ items, dark }: { items: string[]; dark?: boolean }) {
  const loop = [...items, ...items];
  return (
    <div className={`ticker ${dark ? "ticker-dark" : "ticker-light"}`}>
      <div className="ticker-track">
        {loop.map((t, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-dot" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ===== PAGE =====
export default function HomePage() {
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => { e.preventDefault(); navigate("/waitlist"); };

  useEffect(() => {
    const root = document.querySelector(".fyn-page");
    if (!root) return;
    const selector = [
      ".section .fyn-h",
      ".section .section-eyebrow",
      ".section .lead",
      ".section p",
      ".section .btn-pill",
      ".section .stat-card",
      ".section .int-card",
      ".section .step-card",
      ".section .sec-card",
      ".section .test-card",
      ".section .num-card",
      ".section .problem-card",
      ".section .sim-card",
      ".section .cta-card",
      ".section .cta-form",
      ".section .pill",
      ".section .sim-chip",
    ].join(",");
    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
    targets.forEach((el, i) => {
      el.classList.add("reveal");
      // Stagger siblings within same parent
      const idx = Array.from(el.parentElement?.children || []).indexOf(el);
      el.style.transitionDelay = `${Math.min(idx, 8) * 80}ms`;
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);


  return (
    <div className="fyn-page">
      <style>{STYLES}</style>
      <Nav />

      {/* HERO */}
      <section className="hero">
        <div className="fyn-container">
          <h1 className="fyn-h fade-up">
            Don't just track your data.<br />
            <span className="red-line">Interrogate it.</span>
          </h1>
          <p className="hero-sub fade-up">
            Meet <b>CFO Fynny</b> — stop running your business on gut feeling. Start running it on intelligence. Predictive what-if scenarios and instant financial clarity.
          </p>
          <div className="hero-cta fade-up">
            <Link to="/waitlist" className="btn-pill btn-red">Join Waitlist <ArrowRight size={18} /></Link>
            <Link to="/demo/login" className="btn-pill btn-outline"><Play size={16} /> Watch Demo</Link>
          </div>
          <div className="stats-row fade-up">
            {STATS.map(s => (
              <div key={s.l} className="stat-card">
                <div className="v">{s.v}</div>
                <div className="l">{s.l}</div>
              </div>
            ))}
          </div>
          <ChatWidget />
        </div>
      </section>

      <Ticker items={TICKER_LIGHT} />

      {/* INTEGRATIONS */}
      <section className="section">
        <div className="fyn-container" style={{ textAlign: "center" }}>
          <span className="section-eyebrow">✦&nbsp; 12+ LIVE INTEGRATIONS</span>
          <h2 className="fyn-h">Connect your entire financial stack.</h2>
          <p className="lead">All systems connected. One coherent view of your business.</p>
          <div className="int-grid">
            {INTEGRATIONS.map(([a, n]) => (
              <div key={n} className="int-card">
                <div className="int-abbr">{a}</div>
                <div>
                  <div className="int-name">{n}</div>
                  <div className="int-status">Connected</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Ticker items={TICKER_DARK} dark />

      {/* PROBLEM */}
      <section className="section">
        <div className="fyn-container">
          <div className="problem-card">
            <div>
              <span className="section-eyebrow dot">THE PROBLEM</span>
              <h2 className="fyn-h">India's SMEs make ₹Crore decisions with <span className="red">no financial intelligence</span>.</h2>
              <p>Manufacturers in Ludhiana, traders in Surat, clinics in Chennai, exporters in Tiruppur — all making critical decisions on gut feel and a bank balance check.</p>
              <Link to="/use-cases" className="btn-pill btn-dark" style={{ marginTop: 32 }}>See how Fynhelp fixes this <ArrowRight size={16} /></Link>
            </div>
            <div className="problem-stat">
              <div className="num">98%</div>
              <div className="lbl">OF SMES CANNOT AFFORD A CFO</div>
              <div className="pills">
                {["Manufacturers", "Traders", "Clinics", "Exporters", "Retailers", "Services"].map(p => (
                  <div key={p} className="pill">{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="section">
        <div className="fyn-container" style={{ textAlign: "center" }}>
          <span className="section-eyebrow">GETTING STARTED</span>
          <h2 className="fyn-h">Your finance team in 4 steps.</h2>
          <div className="steps-grid">
            {STEPS.map(s => (
              <div key={s.n} className="step-card">
                <ArrowUpRight size={18} className="arrow" />
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.t}</div>
                <div className="step-desc">{s.d}</div>
                <div className="step-link">Learn more →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIMULATOR */}
      <section className="section">
        <div className="fyn-container">
          <div className="sim-card">
            <div>
              <div className="sim-eyebrow">DECISION SIMULATOR</div>
              <h2 className="fyn-h">Simulate every decision <span className="red">before</span> you make it.</h2>
              <p>Every major decision has a cash consequence. Extending credit terms. Hiring a senior engineer. Buying a new machine. Fynhelp models any scenario against your live data and shows the exact cash impact.</p>
              <div className="sim-chips">{SIM_CHIPS.map(c => <span key={c} className="sim-chip">{c}</span>)}</div>
              <div className="sim-foot">Built by our CA team from 500+ SME interviews</div>
            </div>
            <div className="sim-panel">
              <div style={{ flex: 1 }} />
              <div className="sim-result">
                <div className="sim-result-cell"><div className="v">−₹25L</div></div>
                <div className="sim-result-cell" />
                <div className="sim-result-cell"><div className="v">HIGH</div></div>
              </div>
              <button className="sim-unlock">Unlock Full Analysis</button>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="section">
        <div className="fyn-container" style={{ textAlign: "center" }}>
          <span className="section-eyebrow">🛡 SECURITY & TRUST</span>
          <h2 className="fyn-h">Enterprise-grade security.<br /><span style={{ color: C.red }}>Zero compromise.</span></h2>
          <p className="lead">Trusted by 1000+ beta users. Your financial data deserves military-grade protection.</p>
          <div className="sec-grid">
            {SECURITY.map(({ Icon, l, v }) => (
              <div key={l} className="sec-card">
                <div className="sec-icon"><Icon size={20} /></div>
                <div className="sec-label">{l}</div>
                <div className="sec-value">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <div className="fyn-container" style={{ textAlign: "center" }}>
          <span className="section-eyebrow">WHAT BUSINESSES SAY</span>
          <h2 className="fyn-h">The numbers speak.<br />So do our customers.</h2>
          <div className="test-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.n} className={`test-card ${t.tinted ? "tinted" : ""}`} style={{ textAlign: "left" }}>
                <div className="test-q">{t.q}</div>
                <div className="test-author">
                  <div className="test-avatar">{t.a}</div>
                  <div>
                    <div className="test-name">{t.n}</div>
                    <div className="test-meta">{t.m}</div>
                  </div>
                </div>
                <div className="test-tag">{t.tag}</div>
              </div>
            ))}
          </div>
          <div className="nums-row">
            {NUMS.map(n => (
              <div key={n.l} className="num-card">
                <div className="v">{n.v}</div>
                <div className="l">{n.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="fyn-container">
          <div className="cta-card">
            <span className="cta-eyebrow">EARLY ACCESS</span>
            <h2 className="fyn-h">Talk to your <span className="red">AI CFO</span>.</h2>
            <p>Be among the first 100 businesses to get 6 months FREE access to CFO Fynny — worth ₹45,000.</p>
            <form className="cta-form" onSubmit={onSubmit}>
              <input type="email" placeholder="Work email *" required />
              <input type="text" placeholder="Company name" />
              <input type="tel" placeholder="Phone" />
              <input type="text" placeholder="City" />
              <button type="submit" className="cta-submit">Join the Waitlist <ArrowRight size={18} /></button>
            </form>
            <div className="cta-foot">NO CREDIT CARD · LAUNCH MAY 2026</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="footer">
        <div>
          <div className="fyn-logo">
            <div className="fyn-logo-dot" />
            <div className="fyn-logo-text">Fyn<span>Help</span></div>
          </div>
          <div className="desc">India's Virtual CFO platform. Built for SMEs, loved by founders.</div>
          <div className="made">Made in India, for India 🇮🇳</div>
        </div>
        <div>
          <h4>PRODUCT</h4>
          <Link to="/products/liquidity">Liquidity Intelligence</Link>
          <Link to="/products/revenue">Revenue Intelligence</Link>
          <Link to="/products/cost">Cost Intelligence</Link>
          <Link to="/products/gst">GST & Tax</Link>
          <Link to="/products/governance">Governance</Link>
          <Link to="/products/hr">HR & Workforce</Link>
        </div>
        <div>
          <h4>COMPANY</h4>
          <Link to="/about">About FynHelp</Link>
          <Link to="/about">Our Mission</Link>
          <Link to="/about">Founders</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/community">Community</Link>
          <Link to="/about">Contact</Link>
        </div>
        <div>
          <h4>LEGAL</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Refund Policy</a>
          <a href="#">Cookie Policy</a>
          <a href="#">DPDP Act</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 FynHelp Technologies · Bengaluru, Karnataka, India</span>
        <span>support@fynhelp.com</span>
      </div>
    </div>
  );
}
