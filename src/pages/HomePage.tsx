import { useEffect, useMemo, useState, useRef, FormEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, Send, ShieldCheck, Lock, EyeOff, User as UserIco, Search, Database, ArrowUpRight, Landmark, BookOpen, FileText, Sparkles, ChevronDown, Clock, X as XIcon, Shield, UserCheck, FileCheck, Paperclip, Mic, TrendingUp, AlertTriangle, CheckCircle2, Scale } from "lucide-react";
import { SUITES } from "@/data/suiteStatus";
import MobileProductsSection from "@/components/home/MobileProductsSection";
import AIRecommendedSection from "@/components/AIRecommendedSection";
import FAQSection from "@/components/home/FAQSection";
import { Helmet } from "react-helmet-async";
import { IntelligenceProvider, useBankTxns, useInvoices, useExpenses, useCustomers, useGstFilings } from "@/components/intelligence/DataSource";
import Navbar from "@/components/Navbar";
import CAPartnerSection from "@/components/home/CAPartnerSection";

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
  .fyn-page { background: ${C.bg}; color: ${C.ink}; font-family: 'Satoshi', 'Inter', system-ui, sans-serif; min-height: 100vh; position: relative; }
  .fyn-page * { box-sizing: border-box; }
  .fyn-page :where(h1,h2,h3,h4,h5,h6), .fyn-h { font-family: 'Clash Display', 'Inter', sans-serif; font-weight: 600; letter-spacing: -0.035em; line-height: 1.02; color: ${C.ink}; }
  .fyn-page .num, .fyn-page .tabnum, .stat-card .v, .num-card .v { font-variant-numeric: tabular-nums; }
  .fyn-container { max-width: 1240px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 2; }

  /* Ledger canvas + drifting motes */
  .fyn-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.55; }
  @media (prefers-reduced-motion: reduce) { .fyn-canvas { display: none; } }

  /* Logo (footer) */
  .fyn-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
  .fyn-logo-dot { width: 26px; height: 26px; border-radius: 50%; background: ${C.ink}; display: flex; align-items: center; justify-content: center; }
  .fyn-logo-dot::after { content:''; width:9px; height:9px; border-radius:50%; background: ${C.red}; }
  .fyn-logo-text { font-weight: 700; font-size: 17px; color: ${C.ink}; font-family: 'Clash Display', sans-serif; letter-spacing: -0.02em; }
  .fyn-logo-text span { color: ${C.red}; }

  .btn-pill { display: inline-flex; align-items: center; gap: 8px; border-radius: 100px; font-weight: 600; cursor: pointer; transition: all .2s ease; text-decoration: none; font-family: 'Satoshi', sans-serif; }
  .btn-red { background: ${C.red}; color: #fff; padding: 12px 22px; font-size: 14px; border: none; }
  .btn-red:hover { background: ${C.redDark}; transform: translateY(-1px); }
  .btn-outline { background: ${C.card}; color: ${C.ink}; padding: 14px 26px; font-size: 15px; border: 1px solid ${C.border}; }
  .btn-outline:hover { background: #fff; }

  /* Hero */
  .hero { padding: 40px 0 60px; text-align: center; position: relative; }
  .hero h1 { font-size: clamp(56px, 9vw, 116px); font-weight: 600; line-height: 1.0; }
  .hero h1 .word { display: inline-block; opacity: 0; filter: blur(10px); transform: translateY(.4em);
    animation: heroWord 1s cubic-bezier(.16,1,.3,1) forwards; }
  .hero h1 .word.red-line { color: ${C.red}; }
  @keyframes heroWord { to { opacity: 1; filter: blur(0); transform: translateY(0); } }
  .hero-sub { max-width: 720px; margin: 32px auto 0; font-size: 19px; line-height: 1.55; color: ${C.body}; opacity: 0; animation: fadeUp 1s cubic-bezier(.16,1,.3,1) 0.9s forwards; }
  .hero-sub b { color: ${C.ink}; font-weight: 700; }
  .hero-cta { display: flex; gap: 14px; justify-content: center; margin-top: 36px; flex-wrap: wrap; opacity: 0; animation: fadeUp 1s cubic-bezier(.16,1,.3,1) 1.04s forwards; }
  .hero-cta .btn-red { padding: 16px 30px; font-size: 16px; }
  .hero-cta .btn-outline { padding: 16px 26px; font-size: 16px; }

  /* Stats */
  .stats-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 64px; opacity: 0; animation: fadeUp 1s cubic-bezier(.16,1,.3,1) 1.18s forwards; }
  @media (min-width: 760px) { .stats-row { grid-template-columns: repeat(4, 1fr); } }
  .stat-card { background: ${C.card}; border-radius: 14px; padding: 22px 26px; border: 1px solid ${C.border}; position: relative; overflow: hidden; transition: transform .3s cubic-bezier(.16,1,.3,1); }
  .stat-card::after { content:''; position: absolute; left: 0; bottom: 0; height: 2px; width: 0; background: ${C.red}; transition: width .4s cubic-bezier(.16,1,.3,1); }
  .stat-card:hover { transform: translateY(-6px); }
  .stat-card:hover::after { width: 100%; }
  .stat-card .v { font-family: 'Clash Display', sans-serif; font-size: 40px; font-weight: 600; color: ${C.ink}; letter-spacing: -0.035em; line-height: 1; font-variant-numeric: tabular-nums; }
  .stat-card .l { font-size: 11px; font-weight: 600; color: ${C.muted}; letter-spacing: 0.12em; margin-top: 8px; }

  /* Chat wrap animation */
  .chat-wrap-anim { opacity: 0; animation: fadeUp 1s cubic-bezier(.16,1,.3,1) 1.32s forwards; }

  /* Fynny chat */
  .fx { background: #FAF7EC; border: 1px solid rgba(0,0,0,.10); border-radius: 20px; max-width: 860px; margin: 76px auto 0; text-align: left; overflow: hidden; box-shadow: 0 30px 60px -30px rgba(0,0,0,.18); }
  .fx-head { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.08); }
  .fx-head-tile { width: 36px; height: 36px; border-radius: 9px; background: ${C.red}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .fx-head-name { font-family: 'Clash Display', sans-serif; font-weight: 600; font-size: 15px; color: ${C.ink}; letter-spacing: -0.02em; }
  .fx-head-sub { font-size: 11.5px; color: ${C.muted}; margin-top: 2px; }
  .fx-live { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 100px; background: rgba(16,185,129,0.12); }
  .fx-live::before { content:''; width: 6px; height: 6px; border-radius: 50%; background: ${C.green}; box-shadow: 0 0 8px ${C.green}; animation: fx-pulse 1.6s ease-in-out infinite; }
  .fx-live-t { font-size: 10.5px; letter-spacing: 0.14em; color: ${C.green}; font-weight: 700; }
  @keyframes fx-pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

  .fx-body { min-height: 340px; padding: 22px 20px; display: flex; flex-direction: column; gap: 14px; }
  .fx-user { align-self: flex-end; background: ${C.red}; color: #fff; padding: 10px 16px; font-size: 14px; border-radius: 16px 16px 5px 16px; max-width: 78%; font-weight: 500; animation: fx-in .35s cubic-bezier(.16,1,.3,1); font-variant-numeric: tabular-nums; }
  @keyframes fx-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .fx-reply { display: flex; gap: 10px; align-items: flex-start; }
  .fx-fox { width: 32px; height: 32px; border-radius: 50%; background: ${C.red}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .fx-panel { flex: 1; background: #F1F0EC; border: 1px solid #E3E1DA; border-radius: 5px 16px 16px 16px; padding: 14px 16px; min-width: 0; }
  .fx-label { display: inline-flex; align-items: center; gap: 6px; color: ${C.red}; font-size: 10.5px; letter-spacing: 0.13em; font-weight: 700; text-transform: uppercase; }
  .fx-answer { color: ${C.body}; font-size: 14px; line-height: 1.55; margin-top: 8px; font-variant-numeric: tabular-nums; }
  .fx-answer b { color: ${C.ink}; font-weight: 700; }
  .fx-answer .g { color: ${C.green}; font-weight: 700; }
  .fx-answer .r { color: ${C.red}; font-weight: 700; }
  .fx-caret { display: inline-block; width: 2px; height: 1em; vertical-align: text-bottom; background: ${C.red}; margin-left: 2px; animation: fx-blink 1s steps(1) infinite; }
  @keyframes fx-blink { 50% { opacity: 0; } }

  .fx-pipe { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; background: rgba(0,0,0,.02); font-size: 12.5px; color: ${C.body}; font-variant-numeric: tabular-nums; }
  .fx-pipe + .fx-pipe { margin-top: 6px; }
  .fx-pipe-i { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(0,0,0,.15); border-top-color: ${C.red}; animation: fx-spin .9s linear infinite; flex-shrink: 0; }
  .fx-pipe.done .fx-pipe-i { border: none; background: ${C.green}; display: flex; align-items: center; justify-content: center; animation: none; color: #fff; font-size: 9px; font-weight: 900; }
  .fx-pipe.done .fx-pipe-i::after { content: '✓'; }
  .fx-pipe .fx-pipe-l { flex: 1; }
  .fx-pipe .fx-pipe-c { color: ${C.muted}; font-weight: 600; font-size: 11.5px; }
  @keyframes fx-spin { to { transform: rotate(360deg); } }

  .fx-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
  .fx-tile { background: #fff; border: 1px solid #E3E1DA; border-radius: 10px; padding: 10px 12px; }
  .fx-tile .k { font-size: 9.5px; letter-spacing: 0.14em; color: ${C.muted}; font-weight: 700; }
  .fx-tile .v { font-family: 'Clash Display', sans-serif; font-size: 18px; font-weight: 600; color: ${C.ink}; letter-spacing: -0.02em; margin-top: 4px; font-variant-numeric: tabular-nums; }
  .fx-tile.red .v { color: ${C.red}; }
  .fx-tile.g .v { color: ${C.green}; }

  .fx-opt { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px; padding: 10px 12px; background: #fff; border: 1px solid #E3E1DA; border-radius: 10px; margin-top: 6px; animation: fx-in .4s cubic-bezier(.16,1,.3,1); }
  .fx-opt-t { font-size: 13px; color: ${C.ink}; font-weight: 600; }
  .fx-opt-bar { grid-column: 1 / -1; height: 4px; background: rgba(0,0,0,.06); border-radius: 100px; overflow: hidden; }
  .fx-opt-bar > i { display: block; height: 100%; background: ${C.red}; border-radius: 100px; width: 0; transition: width 1.2s cubic-bezier(.16,1,.3,1); }
  .fx-opt.win .fx-opt-bar > i { background: ${C.green}; }
  .fx-opt-s { font-family: 'Clash Display', sans-serif; font-weight: 600; font-size: 15px; color: ${C.ink}; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .fx-verdict { margin-top: 10px; display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 100px; background: rgba(16,185,129,0.15); color: #047857; font-weight: 700; font-size: 12.5px; }

  .fx-alert { border: 1px solid ${C.red}; background: rgba(184,51,58,0.05); border-radius: 12px; padding: 12px 14px; }
  .fx-alert-h { display: flex; align-items: center; gap: 8px; }
  .fx-sev { padding: 3px 8px; border-radius: 100px; background: ${C.red}; color: #fff; font-size: 9.5px; font-weight: 800; letter-spacing: 0.12em; }
  .fx-warn { animation: fx-pulse 1.4s ease-in-out infinite; color: ${C.red}; }

  .fx-gst-row { display: grid; grid-template-columns: 1.4fr 1fr auto; gap: 8px; align-items: center; padding: 8px 10px; border-radius: 8px; background: #fff; border: 1px solid #E3E1DA; margin-top: 6px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: ${C.body}; }
  .fx-badge { padding: 3px 8px; border-radius: 100px; font-size: 9.5px; font-weight: 800; letter-spacing: 0.1em; }
  .fx-badge.check { background: rgba(0,0,0,.06); color: ${C.muted}; }
  .fx-badge.match { background: rgba(16,185,129,0.15); color: #047857; }
  .fx-badge.miss { background: rgba(184,51,58,0.12); color: ${C.red}; }
  .fx-badge.mm { background: rgba(212,140,20,0.15); color: #B8860B; }

  .fx-pdf { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: #fff; border: 1px solid #E3E1DA; margin-top: 10px; }
  .fx-pdf-i { width: 36px; height: 36px; border-radius: 8px; background: ${C.red}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; letter-spacing: .04em; flex-shrink: 0; }
  .fx-pdf-t { font-weight: 700; color: ${C.ink}; font-size: 13px; }
  .fx-pdf-s { color: ${C.muted}; font-size: 11.5px; margin-top: 2px; font-variant-numeric: tabular-nums; }
  .fx-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .fx-btns button { border: 1px solid ${C.red}; background: transparent; color: ${C.red}; border-radius: 100px; padding: 6px 12px; font-size: 11.5px; font-weight: 700; cursor: pointer; font-family: 'Satoshi', sans-serif; }
  .fx-btns button.primary { background: ${C.red}; color: #fff; }

  .fx-foot { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-top: 1px solid rgba(0,0,0,.08); background: #F7F3E6; }
  .fx-icon-btn { width: 34px; height: 34px; border-radius: 8px; border: none; background: transparent; color: ${C.muted}; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .fx-icon-btn:hover { background: rgba(0,0,0,.04); color: ${C.ink}; }
  .fx-input { flex: 1; background: #fff; border: 1px solid rgba(0,0,0,.10); border-radius: 100px; padding: 10px 16px; font-size: 14px; color: ${C.ink}; outline: none; font-family: 'Satoshi', sans-serif; }
  .fx-input:focus { border-color: ${C.red}; box-shadow: 0 0 0 3px rgba(184,51,58,0.10); }
  .fx-send { width: 40px; height: 40px; border-radius: 10px; background: ${C.red}; color: #fff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform .15s; }
  .fx-send.pulse { animation: fx-btn 1s cubic-bezier(.16,1,.3,1); }
  @keyframes fx-btn { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }

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
  .section { padding: 100px 0; overflow-x: clip; }
  .section h2 { font-size: clamp(40px, 6vw, 72px); font-weight: 600; text-align: center; margin: 0; }
  .section h2.left { text-align: left; }
  .section .lead { text-align: center; color: ${C.muted}; font-size: 17px; margin-top: 16px; max-width: 640px; margin-left: auto; margin-right: auto; }

  /* Integrations */
  .int-stage { position: relative; margin: 64px -24px 0; padding: 8px 0; overflow: hidden; isolation: isolate; }
  .int-stage::before, .int-stage::after { content: ''; position: absolute; top: 0; bottom: 0; width: 180px; z-index: 3; pointer-events: none; }
  .int-stage::before { left: 0; background: linear-gradient(90deg, ${C.bg} 0%, rgba(236,230,210,0) 100%); }
  .int-stage::after  { right: 0; background: linear-gradient(270deg, ${C.bg} 0%, rgba(236,230,210,0) 100%); }
  .int-marquee { position: relative; display: flex; overflow: hidden; padding: 14px 0; z-index: 1; }
  .int-marquee + .int-marquee { margin-top: 8px; }
  .int-track { display: flex; gap: 16px; flex-shrink: 0; padding-right: 16px; animation: int-slide 42s linear infinite; will-change: transform; }
  .int-marquee.rev .int-track { animation-direction: reverse; animation-duration: 52s; }
  .int-marquee:hover .int-track { animation-play-state: paused; }
  @keyframes int-slide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .int-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 14px; padding: 12px 22px 12px 12px; display: flex; align-items: center; gap: 14px; min-width: 230px; transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s; }
  .int-card:hover { transform: translateY(-4px); box-shadow: 0 18px 38px -14px rgba(0,0,0,0.15); }
  .int-logo { width: 42px; height: 42px; border-radius: 12px; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 6px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05); overflow: hidden; }
  .int-logo img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .int-logo .fallback { width: 34px; height: 34px; border-radius: 8px; background: ${C.ink}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
  .int-name { font-size: 14px; font-weight: 700; color: ${C.ink}; letter-spacing: -0.01em; }
  .int-status { font-size: 11px; color: ${C.green}; display: flex; align-items: center; gap: 5px; margin-top: 3px; font-weight: 600; letter-spacing: 0.04em; }
  .int-status::before { content:''; width: 6px; height: 6px; border-radius: 50%; background: ${C.green}; box-shadow: 0 0 8px ${C.green}; animation: fx-pulse 1.8s ease-in-out infinite; }

  /* Problem */
  .problem-card { background: ${C.card}; border-radius: 24px; padding: 64px; display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center; border: 1px solid ${C.border}; }
  @media (min-width: 900px) { .problem-card { grid-template-columns: 1fr 1fr; } }
  .problem-card h2 { font-size: clamp(40px, 5.5vw, 60px); text-align: left; line-height: 1.05; }
  .problem-card h2 .red { color: ${C.red}; }
  .problem-card p { color: ${C.body}; font-size: 16px; margin-top: 24px; line-height: 1.6; }

  /* Steps */
  .steps-wrap { position: relative; margin-top: 72px; }
  .steps-line { position: absolute; left: 8%; right: 8%; top: 52px; height: 2px; pointer-events: none; z-index: 0;
    background-image: linear-gradient(90deg, ${C.red} 50%, transparent 50%); background-size: 10px 2px; background-repeat: repeat-x;
    opacity: 0.35; mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
    animation: steps-flow 14s linear infinite; }
  @keyframes steps-flow { from { background-position: 0 0; } to { background-position: -400px 0; } }
  @media (max-width: 999px) { .steps-line { display: none; } }
  .steps-grid { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(1, 1fr); gap: 22px; }
  @media (min-width: 700px) { .steps-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1000px) { .steps-grid { grid-template-columns: repeat(4, 1fr); } }
  .step-card { position: relative; background: ${C.card}; border: 1px solid ${C.border}; border-radius: 18px; padding: 28px 24px; min-height: 240px; text-align: left; transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s, border-color .25s; }
  .step-card:hover { transform: translateY(-6px); box-shadow: 0 22px 40px -18px rgba(26,16,8,0.22); border-color: rgba(184,51,58,0.25); }
  .step-icon { position: relative; width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fff, ${C.cardSoft}); border: 1px solid ${C.border}; color: ${C.red}; margin-bottom: 22px; }
  .step-num { font-size: 11px; color: ${C.muted}; font-weight: 700; letter-spacing: 0.18em; }
  .step-card .arrow { position: absolute; top: 22px; right: 22px; color: ${C.muted}; transition: color .3s, transform .3s; }
  .step-card:hover .arrow { color: ${C.red}; transform: translate(2px,-2px); }
  .step-title { font-family: 'Clash Display', sans-serif; font-size: 20px; font-weight: 600; color: ${C.ink}; margin: 12px 0 10px; letter-spacing: -0.03em; }
  .step-desc { font-size: 14px; color: ${C.muted}; line-height: 1.55; }

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
  .sim-panel { background: ${C.card}; border-radius: 18px; padding: 32px; min-height: 380px; display: flex; flex-direction: column; gap: 18px; }
  .sim-panel h3 { font-size: 20px; font-weight: 600; color: ${C.ink}; margin: 0 0 4px; font-family: 'Clash Display', sans-serif; letter-spacing: -0.03em; }
  .sim-row { display: flex; flex-direction: column; gap: 8px; }
  .sim-row-head { display: flex; justify-content: space-between; align-items: baseline; }
  .sim-row-label { font-size: 10.5px; letter-spacing: 0.14em; font-weight: 700; color: ${C.muted}; text-transform: uppercase; }
  .sim-row-value { font-size: 14px; font-weight: 600; color: ${C.ink}; font-variant-numeric: tabular-nums; }
  .sim-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 3px; background: #E5DFCB; border-radius: 100px; outline: none; }
  .sim-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${C.red}; cursor: pointer; border: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
  .sim-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: ${C.red}; cursor: pointer; border: 0; }
  .sim-divider { display: flex; justify-content: space-between; align-items: baseline; padding-top: 14px; border-top: 1px dashed rgba(0,0,0,0.12); }
  .sim-divider .l { font-size: 10.5px; letter-spacing: 0.14em; font-weight: 700; color: ${C.muted}; text-transform: uppercase; }
  .sim-divider .v { font-size: 14px; font-weight: 600; color: ${C.ink}; font-variant-numeric: tabular-nums; }
  .sim-result { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 4px; }
  .sim-result-cell { background: #fff; border: 1px solid ${C.redSoft}; border-radius: 12px; padding: 18px 10px; text-align: center; }
  .sim-result-cell .v { font-family: 'Clash Display', sans-serif; font-size: 26px; font-weight: 600; color: ${C.red}; letter-spacing: -0.03em; line-height: 1.05; font-variant-numeric: tabular-nums; }
  .sim-result-cell .v.gold { color: #B8860B; }
  .sim-result-cell .l { font-size: 10px; letter-spacing: 0.16em; font-weight: 600; color: ${C.muted}; margin-top: 6px; text-transform: uppercase; }
  .sim-unlock { background: ${C.red}; color: #fff; border: none; border-radius: 12px; padding: 16px; font-size: 15px; font-weight: 600; margin-top: 8px; cursor: pointer; font-family: 'Satoshi', sans-serif; }
  .sim-unlock:hover { background: ${C.redDark}; }

  /* Books-stay-yours (Security) */
  .yours-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 56px; }
  @media (min-width: 700px) { .yours-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1000px) { .yours-grid { grid-template-columns: repeat(4, 1fr); } }
  .yours-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 18px; padding: 28px; text-align: left; transition: transform .3s, border-color .3s; }
  .yours-card:hover { transform: translateY(-4px); border-color: rgba(184,51,58,0.3); }
  .yours-ic { width: 44px; height: 44px; border-radius: 12px; background: rgba(184,51,58,0.08); color: ${C.red}; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
  .yours-t { font-family: 'Clash Display', sans-serif; font-weight: 600; font-size: 18px; color: ${C.ink}; letter-spacing: -0.025em; }
  .yours-d { color: ${C.muted}; font-size: 14px; line-height: 1.55; margin-top: 10px; }
  .yours-pills { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 40px; }
  .yours-pill { padding: 8px 16px; border-radius: 100px; background: ${C.card}; border: 1px solid ${C.border}; font-size: 12.5px; color: ${C.body}; font-weight: 600; letter-spacing: 0.02em; }

  /* Testimonials/nums (kept minimal) */
  .num-card .v { font-family: 'Clash Display', sans-serif; font-size: 32px; font-weight: 600; color: ${C.ink}; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
  .num-card .l { font-size: 10px; letter-spacing: 0.18em; color: ${C.muted}; margin-top: 10px; font-weight: 600; }

  /* Final CTA */
  .cta-card { background: ${C.black}; border-radius: 24px; padding: 80px 32px; text-align: center; color: #fff; }
  .cta-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; letter-spacing: 0.18em; color: rgba(255,255,255,0.7); font-weight: 600; }
  .cta-eyebrow::before { content:''; width: 7px; height: 7px; border-radius: 50%; background: ${C.red}; }
  .cta-card h2 { color: #fff; margin: 20px 0 0; font-size: clamp(48px, 7vw, 88px); }
  .cta-card h2 .red { color: ${C.red}; }
  .cta-card p { color: rgba(255,255,255,0.75); font-size: 17px; margin-top: 20px; max-width: 560px; margin-left: auto; margin-right: auto; }
  .cta-form { max-width: 560px; margin: 36px auto 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .cta-form input { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); border-radius: 100px; padding: 14px 22px; color: #fff; font-size: 14px; outline: none; font-family: 'Satoshi', sans-serif; }
  .cta-form input::placeholder { color: rgba(255,255,255,0.45); }
  .cta-submit { grid-column: 1 / -1; background: ${C.red}; color: #fff; border: none; border-radius: 100px; padding: 16px; font-size: 15px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Satoshi', sans-serif; }
  .cta-submit:hover { background: ${C.redDark}; }
  .cta-foot { font-size: 11px; letter-spacing: 0.18em; color: rgba(255,255,255,0.45); margin-top: 22px; font-weight: 600; }

  /* Superpowers (kept, refined typography) */
  .sp-wrap { background: #0E0A06; border-radius: 28px; padding: 72px 56px; margin-top: 0; border: 1px solid rgba(255,255,255,0.06); position: relative; overflow: hidden; }
  .sp-wrap::before { content: ''; position: absolute; inset: 0; background:
    radial-gradient(circle at 12% 10%, rgba(196,30,30,0.18), transparent 45%),
    radial-gradient(circle at 88% 90%, rgba(139,105,20,0.14), transparent 50%);
    pointer-events: none; }
  .sp-head { position: relative; text-align: center; max-width: 760px; margin: 0 auto 56px; }
  .sp-head h2 { font-family: 'Clash Display', sans-serif; font-weight: 600; font-size: clamp(34px, 5.2vw, 60px); letter-spacing: -0.035em; line-height: 1.06; color: #fff; margin: 0; }
  .sp-head h2 em { font-style: normal; color: ${C.red}; }
  .sp-head p { color: rgba(255,255,255,0.62); font-size: 16px; margin-top: 16px; line-height: 1.55; }
  .sp-grid { position: relative; display: grid; grid-template-columns: 1fr; gap: 18px; }
  @media (min-width: 760px) { .sp-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }
  @media (min-width: 1100px) { .sp-grid { grid-template-columns: repeat(3, 1fr); gap: 22px; } }
  .sp-grid.sp-grid-2 { grid-template-columns: 1fr; }
  @media (min-width: 760px) { .sp-grid.sp-grid-2 { grid-template-columns: repeat(2, 1fr); } }
  .sp-cta { background: ${C.red} !important; color: #fff !important; padding: 14px 26px; box-shadow: 0 12px 32px -10px rgba(196,30,30,0.6); }
  .sp-cta:hover { background: ${C.redDark} !important; }
  .sp-card { position: relative; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015)); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px 26px 24px; overflow: hidden; transition: transform 0.45s cubic-bezier(0.22,1,0.36,1), border-color 0.3s, box-shadow 0.45s; }
  .sp-card:hover { transform: translateY(-4px); border-color: rgba(196,30,30,0.4); box-shadow: 0 24px 60px -28px rgba(196,30,30,0.55); }
  .sp-num { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.14em; color: rgba(255,255,255,0.4); font-weight: 600; }
  .sp-card h3 { font-family: 'Clash Display', sans-serif; font-size: 20px; font-weight: 600; color: ${C.red}; letter-spacing: -0.025em; margin: 10px 0 0; line-height: 1.25; }
  .sp-card p { font-size: 13.5px; line-height: 1.55; color: rgba(255,255,255,0.62); margin: 10px 0 22px; }
  .sp-mock { position: relative; background: linear-gradient(180deg, #15100B, #0B0805); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px; min-height: 168px; overflow: hidden; }
  .sp-mock-bar { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
  .sp-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.18); }
  .sp-dot.red { background: ${C.red}; }
  .spm-chat-u { display: inline-block; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); padding: 7px 12px; border-radius: 12px 12px 12px 4px; font-size: 12px; max-width: 80%; }
  .spm-chat-a { display: inline-block; margin-top: 10px; background: linear-gradient(135deg, ${C.red}, #E0524A); color: #fff; padding: 9px 13px; border-radius: 12px 12px 4px 12px; font-size: 12px; font-weight: 500; max-width: 88%; box-shadow: 0 6px 18px rgba(196,30,30,0.35); }
  .spm-chat-a b { font-weight: 700; }
  .spm-kpi { display: flex; align-items: baseline; gap: 8px; color: #fff; font-family: 'JetBrains Mono', monospace; }
  .spm-kpi .v { font-size: 26px; font-weight: 700; }
  .spm-kpi .l { font-size: 10px; letter-spacing: 0.14em; color: rgba(255,255,255,0.45); text-transform: uppercase; }
  .spm-drill { margin-top: 14px; display: flex; flex-direction: column; gap: 5px; }
  .spm-row { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.75); padding: 6px 10px; background: rgba(255,255,255,0.04); border-radius: 6px; font-family: 'JetBrains Mono', monospace; }
  .spm-row.hi { background: rgba(196,30,30,0.18); color: #fff; border: 1px solid rgba(196,30,30,0.45); }
  .spm-sim-label { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.55); margin-bottom: 8px; letter-spacing: 0.06em; }
  .spm-sim-label b { color: #fff; font-weight: 600; }
  .spm-sim-track { height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; position: relative; }
  .spm-sim-fill { position: absolute; left: 0; top: 0; bottom: 0; width: 62%; background: linear-gradient(90deg, ${C.red}, #8B6914); border-radius: 2px; }
  .spm-sim-thumb { position: absolute; left: 62%; top: 50%; width: 14px; height: 14px; margin-left: -7px; margin-top: -7px; background: #fff; border-radius: 50%; box-shadow: 0 4px 10px rgba(196,30,30,0.45); }
  .spm-sim-results { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px; }
  .spm-sim-results > div { background: rgba(255,255,255,0.04); border-radius: 8px; padding: 10px; }
  .spm-sim-results .k { font-size: 9px; letter-spacing: 0.12em; color: rgba(255,255,255,0.45); }
  .spm-sim-results .vred { font-size: 16px; color: ${C.red}; font-weight: 700; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
  .spm-sim-results .vgrn { font-size: 16px; color: #4ADE80; font-weight: 700; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
  .spm-match { display: grid; grid-template-columns: 1fr 14px 1fr; gap: 8px; align-items: center; }
  .spm-inv { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 9px; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: rgba(255,255,255,0.7); }
  .spm-inv b { display: block; color: #fff; font-size: 12px; margin-bottom: 3px; }
  .spm-link { color: #8B6914; font-size: 16px; text-align: center; }
  .spm-match + .spm-match { margin-top: 8px; }
  .spm-spark { position: relative; height: 60px; margin-top: 10px; }
  .spm-spark svg { width: 100%; height: 100%; display: block; }
  .spm-runway-pills { display: flex; gap: 8px; margin-top: 12px; }
  .spm-pill { flex: 1; background: rgba(255,255,255,0.04); border-radius: 8px; padding: 8px 10px; }
  .spm-pill .k { font-size: 9px; letter-spacing: 0.12em; color: rgba(255,255,255,0.45); }
  .spm-pill .v { font-size: 14px; color: #fff; font-weight: 700; margin-top: 3px; font-family: 'JetBrains Mono', monospace; }
  .spm-pill .v.red { color: ${C.red}; }
  .spm-avatars { display: flex; }
  .spm-avatar { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #15100B; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; margin-left: -8px; font-family: 'Satoshi', sans-serif; }
  .spm-avatar:first-child { margin-left: 0; }
  .spm-doc { margin-top: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; }
  .spm-doc .t { color: #fff; font-size: 12px; font-weight: 600; }
  .spm-doc .s { color: rgba(255,255,255,0.45); font-size: 10px; margin-top: 4px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.08em; }
  .spm-doc .lines { margin-top: 10px; display: flex; flex-direction: column; gap: 4px; }
  .spm-doc .lines i { display: block; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.08); }
  .spm-doc .lines i:nth-child(1) { width: 92%; }
  .spm-doc .lines i:nth-child(2) { width: 78%; }
  .spm-doc .lines i:nth-child(3) { width: 60%; background: rgba(196,30,30,0.4); }
  @media (max-width: 768px) {
    .sp-wrap { padding: 44px 20px; border-radius: 22px; }
    .sp-card { padding: 22px 20px 20px; }
    .sp-card h3 { font-size: 18px; }
    .sp-mock { min-height: 150px; padding: 14px; }
  }

  /* Footer */
  .footer { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 24px; padding: 56px 48px; margin: 80px auto 32px; max-width: 1180px; display: grid; grid-template-columns: 1fr; gap: 40px; position: relative; z-index: 2; }
  @media (min-width: 900px) { .footer { grid-template-columns: 1.4fr 1fr 1fr 1fr; } }
  .footer h4 { font-size: 12px; letter-spacing: 0.16em; color: ${C.muted}; font-weight: 700; margin: 0 0 18px; font-family: 'Satoshi', sans-serif; }
  .footer a, .footer li { color: ${C.ink}; font-size: 14px; text-decoration: none; line-height: 2; display: block; }
  .footer a:hover { color: ${C.red}; }
  .footer .desc { color: ${C.muted}; font-size: 14px; line-height: 1.6; max-width: 280px; margin-top: 14px; }
  .footer .made { font-size: 12px; color: ${C.muted}; margin-top: 18px; }
  .footer-bottom { max-width: 1180px; margin: 0 auto 40px; padding: 0 48px; display: flex; justify-content: space-between; font-size: 12px; color: ${C.muted}; position: relative; z-index: 2; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px);} to { opacity: 1; transform: translateY(0);} }

  /* Bidirectional scroll reveal — cards use overshoot spring */
  .reveal { opacity: 0; transform: translateY(52px) scale(.86) rotate(-1.5deg);
    transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.34,1.56,.64,1); will-change: opacity, transform; }
  .reveal.in { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
  .reveal-text-l { opacity: 0; transform: translateX(-40px);
    transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
  .reveal-text-l.in { opacity: 1; transform: none; }
  .reveal-text-r { opacity: 0; transform: translateX(40px);
    transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
  .reveal-text-r.in { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) {
    .reveal, .reveal-text-l, .reveal-text-r { opacity: 1 !important; transform: none !important; transition: none !important; }
    .hero h1 .word, .hero-sub, .hero-cta, .stats-row, .chat-wrap-anim { opacity: 1 !important; animation: none !important; filter: none !important; transform: none !important; }
  }

  html, body, #root { max-width: 100%; overflow-x: hidden; }
  .section, .hero, .problem-card, .sim-card, .cta-card, .footer { max-width: 100%; }
  img, svg, video { max-width: 100%; }

  @media (max-width: 1024px) {
    .section { padding: 72px 0; }
    .footer { padding: 40px 28px; margin: 56px 16px 24px; }
    .footer-bottom { padding: 0 28px; flex-wrap: wrap; gap: 12px; }
  }
  @media (max-width: 768px) {
    .fyn-container { padding: 0 18px; }
    .section { padding: 56px 0; }
    .section h2 { font-size: clamp(28px, 7.5vw, 42px); }
    .section .lead { font-size: 15px; padding: 0 8px; }
    .hero { padding: 24px 0 40px; }
    .hero h1 { font-size: clamp(40px, 11vw, 64px); line-height: 1.04; }
    .hero-sub { font-size: 16px; padding: 0 8px; margin-top: 24px; }
    .hero-cta { gap: 10px; margin-top: 28px; padding: 0 12px; }
    .hero-cta .btn-red, .hero-cta .btn-outline { padding: 14px 22px; font-size: 14px; }
    .problem-card { padding: 28px 22px !important; border-radius: 22px; }
    .problem-card h2 { font-size: clamp(28px, 7vw, 40px); }
    .sim-card { padding: 28px 22px !important; border-radius: 22px; }
    .sim-card h2 { font-size: clamp(26px, 6.5vw, 38px); }
    .cta-card { padding: 36px 22px !important; border-radius: 22px; }
    .cta-card h2 { font-size: clamp(34px, 9vw, 52px); }
    .cta-form { grid-template-columns: 1fr; }
    .footer { padding: 36px 22px; margin: 40px 14px 20px; grid-template-columns: 1fr; gap: 28px; border-radius: 20px; }
    .footer-bottom { padding: 0 22px; margin-bottom: 28px; }
    .fx-tiles { grid-template-columns: 1fr 1fr 1fr; }
  }
  @media (max-width: 480px) {
    .fyn-container { padding: 0 14px; }
    .section { padding: 44px 0; }
    .hero h1 { font-size: clamp(36px, 11vw, 56px); }
    .hero-cta { flex-direction: column; align-items: stretch; }
    .hero-cta .btn-red, .hero-cta .btn-outline { width: 100%; justify-content: center; }
    .problem-card, .sim-card, .cta-card { padding: 24px 18px !important; }
    .footer { padding: 28px 18px; }
    .fx-tiles { grid-template-columns: 1fr; }
  }
`;

// ===== DATA =====

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
  "Track every UPI payment, no lost revenue",
  "Cut reconciliation from 15 hours to 1 hour/month",
];

const INTEGRATIONS: [string, string, string][] = [
  ["RP", "Razorpay", "razorpay.com"],
  ["ZB", "Zoho Books", "zoho.com"],
  ["HD", "HDFC Bank", "hdfcbank.com"],
  ["IC", "ICICI Bank", "icicibank.com"],
  ["SB", "SBI", "sbi.co.in"],
  ["AX", "Axis Bank", "axisbank.com"],
  ["KT", "Kotak", "kotak.com"],
  ["TL", "Tally", "tallysolutions.com"],
  ["ST", "Stripe", "stripe.com"],
  ["PU", "PayU", "payu.in"],
  ["GS", "GST Portal", "gst.gov.in"],
  ["QB", "QuickBooks", "intuit.com"],
];

const STEPS = [
  { n: "01", t: "Connect your bank", d: "2 minutes via RBI's Account Aggregator.", icon: "bank" as const },
  { n: "02", t: "Connect accounting", d: "15 minutes, we handle the mapping.", icon: "ledger" as const },
  { n: "03", t: "Enter your GSTIN", d: "3 minutes, instant compliance calendar.", icon: "doc" as const },
  { n: "04", t: "Fynny's first brief", d: "Within minutes. Then every morning after.", icon: "spark" as const },
];

const SIM_CHIPS = ["CREDIT TERMS", "HIRING", "PRICING", "GST REFUND DELAY", "MACHINERY PURCHASE", "WORKING CAPITAL LOAN", "SEASONAL PUSH", "M&A"];

const SECURITY = [
  { Icon: ShieldCheck, l: "SOC 2", d: "Actively working toward Type II. Enterprise-grade compliance with DPA standards." },
  { Icon: Lock, l: "END-TO-END ENCRYPTION", d: "AES-256 at rest, TLS 1.3 in transit. Your data is protected at every step." },
  { Icon: EyeOff, l: "ZERO DATA RETENTION", d: "Your data never trains models and nothing gets stored after processing." },
  { Icon: UserIco, l: "ACCESS CONTROLS", d: "Granular, role-based permissions ensure only the right people see what they need." },
  { Icon: Search, l: "FULL TRACEABILITY", d: "Complete audit trail with every transformation logged. Click any output to trace its source." },
  { Icon: Database, l: "DATA OWNERSHIP", d: "You decide what happens with your data. We're just the processing layer." },
];

const TESTIMONIALS = [
  {
    q: "\"CFO Fynny told me I'd run out of cash in 34 days, five weeks before my CA would have even noticed. I collected from 3 clients that week and avoided a complete shutdown.\"",
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

// ===== COMPONENTS =====



// ===== ChatWidget (CFO Fynny, production demo) =====
type Frame = {
  user: string;
  reply: ReactNode;
  visual?: ReactNode;
  buttons: string[];
  alert?: string;
};

const FynnyMark = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="5" y="3" width="2" height="18" rx="0.5" fill="#F4EDDA" />
    <rect x="5" y="3" width="14" height="2" rx="0.5" fill="#F4EDDA" />
    <rect x="5" y="11" width="9" height="2" rx="0.5" fill="#F4EDDA" />
    <line x1="14" y1="12" x2="19" y2="5" stroke="#F4EDDA" strokeWidth="2" strokeLinecap="round" />
    <circle cx="19" cy="5" r="2" fill="#8B6914" />
  </svg>
);
const HamburgerBtn = () => (
  <button className="cf-hamburger" aria-label="Open menu">
    <span /><span /><span />
  </button>
);
const UserIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);
const PlusIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>);
const DownloadIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>);
const PaperclipIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11l-9 9a5 5 0 11-7-7l10-10a3.5 3.5 0 115 5l-9.5 9.5a2 2 0 11-3-3l8-8"/></svg>);
const SendIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>);
const AlertIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L1 21h22L12 2z"/><path d="M12 9v5M12 17h.01"/></svg>);

function MiniBars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values);
  const w = values.length >= 8 ? 10 : 12;
  return (
    <div className="cf-chart">
      <div className="cf-chart-bars">
        {values.map((v, i) => (
          <div key={i} className="cf-bar-col" style={{ width: w }}>
            <div className="cf-bar" style={{ height: `${Math.max(8, (v / max) * 80)}px`, animationDelay: `${i * 0.05}s`, width: w }} />
          </div>
        ))}
      </div>
      <div className="cf-chart-labels">
        {labels.map((l, i) => (<span key={i} style={{ width: w + 6 }}>{l}</span>))}
      </div>
    </div>
  );
}

function MetricCards({ items }: { items: { label: string; value: string; sub?: string }[] }) {
  return (
    <div className="cf-metrics">
      {items.map((m, i) => (
        <div key={i} className="cf-metric-card" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="cf-metric-label">{m.label}</div>
          <div className="cf-metric-value">{m.value}</div>
          {m.sub && <div className="cf-metric-sub">{m.sub}</div>}
        </div>
      ))}
    </div>
  );
}

// Tiny INR formatter, identical rule to AskFynnyTab (lakhs / crores).
function inrShort(n: number): string {
  if (!isFinite(n) || n === 0) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

// Build FRAMES from real DEMO_BIZ tables — every number rendered here must
// trace to one of these hooks. No hardcoded financial figures.
function useDemoFrames(): Frame[] | null {
  const { data: bank }      = useBankTxns();
  const { data: invoices }  = useInvoices();
  const { data: expenses }  = useExpenses();
  const { data: customers } = useCustomers();
  const { data: gst }       = useGstFilings();

  return useMemo<Frame[] | null>(() => {
    if (!bank || !invoices || !expenses || !customers || !gst) return null;
    if (bank.length + invoices.length + expenses.length + customers.length === 0) return null;

    const c30 = new Date(Date.now() - 30 * 86400000);

    // cash = latest bank balance (rows arrive ordered by date desc from DataSource)
    const cash = Number(bank[0]?.balance ?? 0);

    // Revenue (paid invoices)
    const totalRev = invoices
      .filter((i) => i.status === "paid")
      .reduce((s, i) => s + Number(i.paid_amount), 0);
    const rev30 = invoices
      .filter((i) => i.status === "paid" && i.payment_date && new Date(i.payment_date) >= c30)
      .reduce((s, i) => s + Number(i.paid_amount), 0);

    // Spend (last 30 days)
    const burn30 = expenses
      .filter((e) => new Date(e.date) >= c30)
      .reduce((s, e) => s + Number(e.amount), 0);
    const net30 = rev30 - burn30;

    // Customer segments — every label/count comes from customer_category in DB
    const segMap = new Map<string, number>();
    customers.forEach((c) => {
      const k = (c as any).customer_category || "Other";
      segMap.set(k, (segMap.get(k) || 0) + 1);
    });
    const segments = [...segMap.entries()].sort((a, b) => b[1] - a[1]);
    const segVals   = segments.map(([, n]) => n);
    const segLabels = segments.map(([k]) => k);

    // GST pending count + nearest upcoming due date
    const today = new Date().toISOString().slice(0, 10);
    const pending = gst.filter((g) => g.status !== "filed");
    const gstPending = pending.length;
    const nextDue = [...pending]
      .filter((g) => g.due_date && g.due_date >= today)
      .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))[0];
    const daysToNext = nextDue?.due_date
      ? Math.max(0, Math.round((new Date(nextDue.due_date).getTime() - Date.now()) / 86400000))
      : null;

    // Bars for the runway/cashflow frame — last 8 weeks of net cash by week
    const weeks: number[] = Array(8).fill(0);
    invoices
      .filter((i) => i.status === "paid" && i.payment_date)
      .forEach((i) => {
        const w = Math.floor((Date.now() - new Date(i.payment_date!).getTime()) / (7 * 86400000));
        if (w >= 0 && w < 8) weeks[7 - w] += Number(i.paid_amount);
      });
    expenses.forEach((e) => {
      const w = Math.floor((Date.now() - new Date(e.date).getTime()) / (7 * 86400000));
      if (w >= 0 && w < 8) weeks[7 - w] -= Number(e.amount);
    });
    const weekVals = weeks.map((v) => Math.max(1, Math.abs(v) / 1000)); // visual scale

    return [
      {
        user: "What's my current runway?",
        reply: net30 >= 0 ? (
          <>You're <b>cash-flow positive</b> — last 30 days you brought in <b>{inrShort(rev30)}</b> and spent <b>{inrShort(burn30)}</b>, net <b>+{inrShort(net30)}</b>. Cash on hand: <b>{inrShort(cash)}</b>.</>
        ) : (
          <>Cash on hand <b>{inrShort(cash)}</b>. Last 30 days: <b>{inrShort(rev30)}</b> in / <b>{inrShort(burn30)}</b> out (net <b>{inrShort(net30)}</b>).</>
        ),
        visual: <MetricCards items={[
          { label: "CASH ON HAND",  value: inrShort(cash),   sub: "across accounts" },
          { label: "NET LAST 30D",  value: `${net30 >= 0 ? "+" : ""}${inrShort(net30)}`, sub: net30 >= 0 ? "cash-flow positive" : "burning cash" },
        ]} />,
        buttons: ["Export Report", "Run What-If"],
      },
      {
        user: "Am I GST compliant?",
        reply: (
          <>You have <b>{gstPending} filings</b> still pending{nextDue ? <> — nearest is <b>{nextDue.filing_type}</b> for <b>{nextDue.period}</b>, due in <b>{daysToNext} days</b></> : ""}. Stay ahead of due dates to avoid notices.</>
        ),
        visual: <MetricCards items={[
          { label: "PENDING FILINGS", value: String(gstPending), sub: "across GSTR types" },
          ...(nextDue ? [{ label: "NEXT DUE", value: nextDue.filing_type, sub: `in ${daysToNext} days` }] : []),
        ]} />,
        buttons: ["View Calendar", "Open GST"],
      },
      {
        user: "How's revenue trending?",
        reply: (
          <>Total paid revenue is <b>{inrShort(totalRev)}</b>, with <b>{inrShort(rev30)}</b> collected in the last 30 days. Customer mix: {segments.map(([k, n], i) => (
            <span key={k}>{i > 0 ? ", " : ""}<b>{k} ({n})</b></span>
          ))}.</>
        ),
        visual: <MiniBars values={segVals.length ? segVals : [1]} labels={segLabels.length ? segLabels : ["—"]} />,
        buttons: ["Full Report", "Share with CA"],
      },
      {
        user: "Show me my cash flow trend.",
        reply: (
          <>Weekly net cash flow over the last 8 weeks. Current cash on hand: <b>{inrShort(cash)}</b>, with <b>{inrShort(rev30)}</b> collected in the trailing 30 days.</>
        ),
        visual: <MiniBars values={weekVals} labels={["W-7","W-6","W-5","W-4","W-3","W-2","W-1","Now"]} />,
        buttons: ["Open Liquidity", "Set Alert"],
      },
    ];
  }, [bank, invoices, expenses, customers, gst]);
}

// Static placeholder shown for a brief moment while DEMO_BIZ data loads.
const LOADING_FRAME: Frame = {
  user: "What's my current runway?",
  reply: <>Pulling live numbers from your demo company…</>,
  visual: <MetricCards items={[{ label: "CASH ON HAND", value: "…", sub: "loading" }, { label: "NET LAST 30D", value: "…", sub: "loading" }]} />,
  buttons: ["Export Report", "Run What-If"],
};

function ChatWidget() {
  const [frame, setFrame] = useState(0);
  const [step, setStep] = useState<"user" | "typing" | "reply">("user");
  const frames = useDemoFrames();
  const FRAMES_LIVE: Frame[] = frames ?? [LOADING_FRAME];

  useEffect(() => {
    setStep("user");
    const t1 = setTimeout(() => setStep("typing"), 700);
    const t2 = setTimeout(() => setStep("reply"), 2200);
    const t3 = setTimeout(() => setFrame((f) => (f + 1) % FRAMES_LIVE.length), 6500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [frame, FRAMES_LIVE.length]);

  const f = FRAMES_LIVE[frame % FRAMES_LIVE.length];

  return (
    <div className="cf-wrap">
      <style>{CF_STYLES}</style>
      <div className="cf-bg-terms" aria-hidden>
        {["MRR","Runway","GST","ITC","₹","Burn Rate","Cash Flow","EBITDA"].map((t, i) => (
          <span key={i} style={{
            top: `${(i * 41) % 88 + 4}%`,
            left: `${(i * 67) % 88 + 4}%`,
            transform: `rotate(${((i * 13) % 11) - 5}deg)`,
          }}>{t}</span>
        ))}
      </div>
      <svg className="cf-bg-ghost cf-bg-ghost-tr" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
        <path d="M0,150 Q100,100 200,120 T400,100" fill="none" strokeWidth="2" />
        <path d="M0,200 Q100,150 200,170 T400,150" fill="none" strokeWidth="2" />
      </svg>
      <svg className="cf-bg-ghost cf-bg-ghost-bl" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
        <path d="M0,150 Q100,100 200,120 T400,100" fill="none" strokeWidth="2" />
        <path d="M0,200 Q100,150 200,170 T400,150" fill="none" strokeWidth="2" />
      </svg>
      <div className="cf-glow" aria-hidden />

      <div className="cf-card">
        {/* Header */}
        <div className="cf-header">
          <div className="cf-id">
            <HamburgerBtn />
            <div className="cf-avatar cf-avatar-fynny cf-avatar-lg"><FynnyMark size={26} /></div>
            <div>
              <div className="cf-name">CFO Fynny</div>
              <div className="cf-sub">Financial Intelligence</div>
            </div>
          </div>
          <div className="cf-live"><span className="cf-live-dot" /> LIVE</div>
        </div>

        {/* Chat area */}
        <div className="cf-chat">
          <div key={`u-${frame}`} className="cf-row cf-row-user cf-anim-in">
            <div className="cf-avatar cf-avatar-user"><UserIcon /></div>
            <div className="cf-bubble cf-bubble-user">{f.user}</div>
          </div>

          {step === "typing" && (
            <div className="cf-row cf-row-fynny cf-anim-in">
              <div className="cf-avatar cf-avatar-fynny"><FynnyMark size={18} /></div>
              <div className="cf-bubble cf-bubble-fynny cf-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          {step === "reply" && (
            <div key={`r-${frame}`} className="cf-row cf-row-fynny cf-anim-in">
              <div className="cf-avatar cf-avatar-fynny"><FynnyMark size={18} /></div>
              <div className="cf-bubble cf-bubble-fynny">
                {f.alert && (
                  <div className="cf-alert">
                    <AlertIcon />
                    <span>{f.alert}</span>
                  </div>
                )}
                <div className="cf-reply">{f.reply}</div>
                {f.visual && <div className="cf-visual">{f.visual}</div>}
                <div className="cf-actions">
                  {f.buttons.map((b, i) => (
                    <button key={b} className="cf-action" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>{b}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="cf-input-row">
          <div className="cf-utils">
            <button className="cf-util" aria-label="Import"><PlusIcon /></button>
            <button className="cf-util" aria-label="Export"><DownloadIcon /></button>
            <button className="cf-util" aria-label="Attach"><PaperclipIcon /></button>
          </div>
          <div className="cf-input-pill">
            <div className="cf-input"><TypingPlaceholder /><span className="cf-caret" /></div>
            <button className="cf-send" aria-label="Send"><SendIcon /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingPlaceholder() {
  const phrases = useMemo(() => [
    "Ask Fynny anything about your business...",
    "What's my runway this quarter?",
    "Show me overdue receivables",
    "Am I GST compliant this month?",
    "How can I extend my cash runway?",
  ], []);
  const [pi, setPi] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const full = phrases[pi];
    if (!deleting && text === full) {
      const t = setTimeout(() => setDeleting(true), 1600);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setPi((pi + 1) % phrases.length);
      return;
    }
    const t = setTimeout(() => {
      setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
    }, deleting ? 28 : 55);
    return () => clearTimeout(t);
  }, [text, deleting, pi, phrases]);
  return <span className="cf-typed">{text}</span>;
}

const CF_STYLES = `
.cf-wrap { position: relative; max-width: 1280px; margin: 56px auto 0; padding: 90px 80px; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; isolation: isolate; background: linear-gradient(135deg, #FAFAF8 0%, #F4EDDA 50%, #EFE8D8 100%), repeating-linear-gradient(45deg, rgba(139,105,20,0.035) 0 1px, transparent 1px 14px), repeating-linear-gradient(-45deg, rgba(139,105,20,0.035) 0 1px, transparent 1px 14px); border-radius: 32px; }
.cf-wrap::before { content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 0; background-image: repeating-linear-gradient(45deg, rgba(139,105,20,0.035) 0 1px, transparent 1px 14px), repeating-linear-gradient(-45deg, rgba(139,105,20,0.035) 0 1px, transparent 1px 14px); border-radius: inherit; }
.cf-hamburger { display: inline-flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 4.5px; width: 32px; height: 32px; padding: 0 7px; border-radius: 8px; background: transparent; border: none; cursor: pointer; transition: background 0.18s; }
.cf-hamburger:hover { background: rgba(139,105,20,0.12); }
.cf-hamburger span { display: block; height: 1.5px; background: #1A1008; border-radius: 1px; }
.cf-hamburger span:nth-child(1), .cf-hamburger span:nth-child(3) { width: 18px; }
.cf-hamburger span:nth-child(2) { width: 13px; }
.cf-wrap, .cf-wrap * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
.cf-bg-terms { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.cf-bg-terms span { position: absolute; font-size: 11px; font-weight: 600; color: rgba(26,16,8,0.01); white-space: nowrap; }
.cf-bg-ghost { position: absolute; width: 400px; height: 300px; max-width: 50%; opacity: 0.02; pointer-events: none; z-index: 0; }
.cf-bg-ghost-tr { top: 0; right: 0; }
.cf-bg-ghost-bl { bottom: 0; left: 0; transform: rotate(180deg); }
.cf-bg-ghost path { stroke: #A93838; }
.cf-glow { position: absolute; width: 120%; height: 120%; top: -10%; left: -10%; background: radial-gradient(circle, rgba(169,56,56,0.03) 0%, transparent 70%); filter: blur(150px); z-index: 0; pointer-events: none; }

.cf-card { position: relative; z-index: 1; background: #fff; border-radius: 24px; border: 1px solid rgba(26,16,8,0.12); box-shadow: 0 20px 60px rgba(26,16,8,0.12), 0 6px 18px rgba(26,16,8,0.08), 0 1px 3px rgba(26,16,8,0.06); display: flex; flex-direction: column; min-height: 640px; max-height: 720px; overflow: hidden; }

.cf-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; border-bottom: 1px solid rgba(26,16,8,0.10); }
.cf-id { display: flex; align-items: center; gap: 14px; }
.cf-name { font-weight: 700; font-size: 18px; color: #1A1008; letter-spacing: -0.01em; line-height: 1.2; }
.cf-sub { font-weight: 500; font-size: 13px; color: #6B6B6B; margin-top: 2px; }

.cf-avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cf-avatar-lg { width: 48px; height: 48px; border-radius: 12px; }
.cf-avatar-fynny { background: #C41E1E; border-radius: 9px; box-shadow: 0 4px 12px rgba(196,30,30,0.28); }
.cf-avatar-user { background: linear-gradient(135deg, #8A8A8A, #B5B5B5); }

.cf-live { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 100px; background: rgba(16,185,129,0.1); color: #10B981; font-weight: 600; font-size: 13px; letter-spacing: 0.05em; }
.cf-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; animation: cf-pulse 1.6s infinite; }
@keyframes cf-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }

.cf-chat { flex: 1; overflow-y: auto; padding: 32px; background: #fff; display: flex; flex-direction: column; gap: 18px; }
.cf-row { display: flex; gap: 12px; align-items: flex-start; width: 100%; }
.cf-row-user { justify-content: flex-end; flex-direction: row-reverse; }
.cf-row-fynny { justify-content: flex-start; flex-direction: row; }

.cf-bubble { padding: 14px 18px; font-size: 16px; font-weight: 500; line-height: 1.6; color: #1A1008; }
.cf-bubble-user { background: #C41E1E; color: #F4EDDA; border: 1px solid rgba(196,30,30,0.25); border-radius: 18px 18px 4px 18px; max-width: 78%; box-shadow: 0 2px 8px rgba(196,30,30,0.15); }
.cf-bubble-fynny { background: #F4EDDA; border: 1px solid rgba(139,105,20,0.18); border-radius: 18px 18px 18px 4px; max-width: 78%; box-shadow: 0 2px 8px rgba(26,16,8,0.06); }
.cf-bubble-fynny b { font-weight: 700; color: #A93838; font-size: 18px; }

.cf-typing { display: inline-flex; gap: 6px; padding: 16px 20px; }
.cf-typing span { width: 8px; height: 8px; border-radius: 50%; background: #C9A0A0; animation: cf-bounce 1.2s infinite; }
.cf-typing span:nth-child(2) { animation-delay: 0.15s; }
.cf-typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes cf-bounce { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }

.cf-reply { font-size: 16px; line-height: 1.6; }
.cf-visual { margin-top: 14px; }

.cf-alert { display: flex; align-items: flex-start; gap: 10px; background: linear-gradient(135deg, #A93838, #C45050); color: #fff; padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; line-height: 1.5; margin-bottom: 12px; letter-spacing: 0.01em; }
.cf-alert svg { flex-shrink: 0; margin-top: 2px; }

.cf-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.cf-action { font-family: 'Inter'; font-weight: 600; font-size: 14px; color: #A93838; background: #fff; border: 1.5px solid rgba(169,56,56,0.25); padding: 9px 16px; border-radius: 10px; cursor: pointer; transition: transform 0.2s, background 0.2s, color 0.2s; opacity: 0; animation: cf-slide-up 0.4s forwards; }
.cf-action:hover { transform: translateY(-2px); background: #A93838; color: #fff; border-color: #A93838; }

.cf-chart { background: #fff; border: 1px solid rgba(139,105,20,0.10); border-radius: 12px; padding: 16px; }
.cf-chart-bars { display: flex; align-items: flex-end; gap: 6px; height: 80px; }
.cf-bar-col { display: flex; align-items: flex-end; height: 100%; }
.cf-bar { background: linear-gradient(to top, #A93838, #E87C7C); border-radius: 4px 4px 0 0; transform-origin: bottom; transform: scaleY(0); animation: cf-bar-grow 0.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
@keyframes cf-bar-grow { to { transform: scaleY(1); } }
.cf-chart-labels { display: flex; gap: 6px; margin-top: 8px; }
.cf-chart-labels span { font-size: 10px; color: #6B6B6B; text-align: center; font-weight: 500; }

.cf-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cf-metric-card { background: #fff; border: 1px solid rgba(139,105,20,0.10); border-radius: 12px; padding: 14px 16px; opacity: 0; animation: cf-slide-up 0.5s forwards; }
.cf-metric-label { font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.05em; }
.cf-metric-value { font-size: 20px; font-weight: 700; color: #A93838; margin-top: 6px; line-height: 1.1; }
.cf-metric-sub { font-size: 13px; font-weight: 500; color: #6B6B6B; margin-top: 4px; }

.cf-input-row { display: flex; align-items: center; gap: 12px; padding: 20px 28px; border-top: 1px solid rgba(26,16,8,0.10); background: #fff; }
.cf-input-pill { flex: 1; display: flex; align-items: center; gap: 10px; padding: 6px 6px 6px 16px; border-radius: 999px; background: linear-gradient(135deg, rgba(244,237,218,0.55) 0%, rgba(255,255,255,0.9) 40%, rgba(244,237,218,0.4) 100%); border: 1px solid rgba(139,105,20,0.2); box-shadow: inset 0 1px 2px rgba(26,16,8,0.06); min-width: 0; }
.cf-utils { display: flex; gap: 6px; }
.cf-util { width: 40px; height: 40px; border-radius: 10px; background: #fff; border: 1.5px solid rgba(26,16,8,0.08); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s, border-color 0.2s; }
.cf-util:hover { background: #F5F5F3; border-color: rgba(26,16,8,0.18); }
.cf-input { flex: 1; padding: 10px 6px; border: none; background: transparent; color: #6B6B6B; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 2px; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.cf-typed { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cf-caret { display: inline-block; width: 2px; height: 1em; background: #A93838; margin-left: 2px; animation: cf-caret 1s steps(1) infinite; vertical-align: middle; }
@keyframes cf-caret { 50% { opacity: 0; } }
.cf-send { width: 40px; height: 40px; border-radius: 999px; background: #C41E1E; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(196,30,30,0.3); flex-shrink: 0; }
.cf-send:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(196,30,30,0.4); }

.cf-anim-in { animation: cf-slide-up 0.5s ease-out; }
@keyframes cf-slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 1024px) {
  .cf-wrap { padding: 70px 32px; }
  .cf-chat { padding: 26px; }
}
@media (max-width: 768px) {
  .cf-wrap { padding: 40px 14px; margin-top: 32px; border-radius: 20px; }
  .cf-card { min-height: 540px; max-height: none; border-radius: 18px; }
  .cf-header { padding: 16px 18px; }
  .cf-name { font-size: 15px; }
  .cf-sub { font-size: 12px; }
  .cf-live { padding: 6px 12px; font-size: 11px; }
  .cf-chat { padding: 18px; gap: 12px; }
  .cf-bubble { font-size: 14px; max-width: 82%; padding: 12px 14px; }
  .cf-bubble-fynny b { font-size: 16px; }
  .cf-input-row { padding: 12px 14px; gap: 8px; }
  .cf-input { font-size: 13px; padding: 11px 14px; }
  .cf-utils { gap: 4px; }
  .cf-util { width: 36px; height: 36px; }
  .cf-send { width: 42px; height: 42px; }
  .cf-metrics { grid-template-columns: 1fr; }
  .cf-avatar { width: 32px; height: 32px; border-radius: 9px; }
}
@media (max-width: 480px) {
  .cf-wrap { padding: 28px 10px; }
  .cf-header { padding: 14px 14px; }
  .cf-chat { padding: 14px; }
  .cf-utils .cf-util:nth-child(2) { display: none; }
  .cf-input { padding: 10px 12px; font-size: 12px; }
}
`;

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

function CreditSimulator() {
  const [currentDays, setCurrentDays] = useState(30);
  const [newDays, setNewDays] = useState(60);
  const [revenueL, setRevenueL] = useState(25);

  const currentRunway = 52;
  const { cashGap, newRunway, bridging, risk } = useMemo(() => {
    const delta = Math.max(0, newDays - currentDays);
    const cashGap = -(delta / 30) * revenueL;
    const daysLost = Math.round(Math.abs(cashGap) * 2.08);
    const newRunway = Math.max(0, currentRunway - daysLost);
    const bridging = Math.abs(cashGap) * 0.73;
    let risk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (newRunway < 30) risk = "HIGH";
    else if (newRunway < 60) risk = "MEDIUM";
    return { cashGap, newRunway, bridging, risk };
  }, [currentDays, newDays, revenueL]);

  const fmtL = (n: number) => `₹${(Math.round(n * 10) / 10).toFixed(n % 1 === 0 ? 0 : 1)}L`;

  return (
    <div className="sim-panel">
      <h3>What happens if I extend credit terms?</h3>

      <div className="sim-row">
        <div className="sim-row-head">
          <span className="sim-row-label">Current Credit Days</span>
          <span className="sim-row-value">{currentDays} days</span>
        </div>
        <input className="sim-slider" type="range" min={0} max={120} value={currentDays}
          onChange={(e) => setCurrentDays(+e.target.value)} />
      </div>

      <div className="sim-row">
        <div className="sim-row-head">
          <span className="sim-row-label">New Credit Days</span>
          <span className="sim-row-value">{newDays} days</span>
        </div>
        <input className="sim-slider" type="range" min={0} max={120} value={newDays}
          onChange={(e) => setNewDays(+e.target.value)} />
      </div>

      <div className="sim-row">
        <div className="sim-row-head">
          <span className="sim-row-label">Monthly Revenue from Customer</span>
          <span className="sim-row-value">₹{revenueL}L</span>
        </div>
        <input className="sim-slider" type="range" min={1} max={100} value={revenueL}
          onChange={(e) => setRevenueL(+e.target.value)} />
      </div>

      <div className="sim-divider">
        <span className="l">Current Runway</span>
        <span className="v">{currentRunway} days</span>
      </div>

      <div className="sim-result">
        <div className="sim-result-cell"><div className="v">{cashGap === 0 ? "₹0" : `−${fmtL(Math.abs(cashGap))}`}</div><div className="l">Cash Gap Created</div></div>
        <div className="sim-result-cell"><div className="v">{newRunway} days</div><div className="l">New Runway</div></div>
        <div className="sim-result-cell"><div className="v gold">{fmtL(bridging)}</div><div className="l">Bridging Needed</div></div>
        <div className="sim-result-cell"><div className="v">{risk}</div><div className="l">Risk Level</div></div>
      </div>

      <button className="sim-unlock" onClick={() => window.location.assign("/waitlist")}>Unlock Full Analysis</button>
    </div>
  );
}



// ===== Fynny fox icon (compact svg mark) =====
const FoxHead = ({ size = 18, color = "#fff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {/* ears */}
    <path d="M4 5 L8 3 L8.5 8" />
    <path d="M20 5 L16 3 L15.5 8" />
    {/* head */}
    <path d="M5 8c1.5-1 4-2 7-2s5.5 1 7 2c.6 1.4.8 3 .3 4.5-.6 1.9-2 3.4-3.9 4.2-1 .4-2.2.6-3.4.6s-2.4-.2-3.4-.6C6.7 15.9 5.3 14.4 4.7 12.5 4.2 11 4.4 9.4 5 8z" />
    {/* eyes */}
    <circle cx="9.5" cy="11.4" r="0.9" fill={color} stroke="none" />
    <circle cx="14.5" cy="11.4" r="0.9" fill={color} stroke="none" />
    {/* muzzle */}
    <path d="M10.5 15.2 L12 16.4 L13.5 15.2" />
    {/* collar notch */}
    <path d="M7 17.5 L10 19 L12 17.5 L14 19 L17 17.5" />
  </svg>
);

// ===== FynnyReel (auto-looping 5-scenario demo) =====
type Pipe = { l: string; c: string };
type Opt = { t: string; s: number; win?: boolean };
type Tile = { k: string; v: string; tone?: "red" | "g" };
type GstRow = { gstin: string; amt: string; status: "check" | "match" | "miss" | "mm" };

type Scenario = {
  id: string;
  q: string;
  label: string;
  Icon: typeof TrendingUp;
  answer: string; // typed out char-by-char
  duration: number; // total ms until next
  render: (progress: number) => ReactNode; // extra body rendered under answer, animated by progress 0..1
};

function useLetterType(text: string, active: boolean, msPerChar = 22) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) { setOut(""); return; }
    let i = 0;
    setOut("");
    const id = window.setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, msPerChar);
    return () => window.clearInterval(id);
  }, [text, active, msPerChar]);
  return out;
}

function useTypeInto(text: string, active: boolean, onDone: () => void, msPerChar = 34) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) { setOut(""); return; }
    let i = 0;
    setOut("");
    const id = window.setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        window.setTimeout(onDone, 500);
      }
    }, msPerChar);
    return () => window.clearInterval(id);
  }, [text, active, msPerChar]);
  return out;
}

const SCENARIOS: Scenario[] = [
  {
    id: "report",
    q: "Generate my Q2 board report",
    label: "GENERATING REPORT",
    Icon: FileText,
    answer: "Here's your Q2 board report — fully reconciled and ready to send.",
    duration: 14500,
    render: (p) => {
      const pipes: Pipe[] = [
        { l: "Fetching bank + Tally entries", c: "1,482 rows" },
        { l: "Reconciling GSTR-2B", c: "7 mismatches" },
        { l: "Computing runway & burn", c: "8.2 mo" },
        { l: "Drafting commentary", c: "412 words" },
        { l: "Rendering PDF", c: "14 pages" },
      ];
      const doneCount = Math.min(pipes.length, Math.floor(p * (pipes.length + 0.4)));
      const showPdf = p > 0.85;
      return (
        <>
          <div style={{ marginTop: 10 }}>
            {pipes.map((row, i) => (
              <div key={i} className={`fx-pipe ${i < doneCount ? "done" : ""}`}>
                <span className="fx-pipe-i" />
                <span className="fx-pipe-l">{row.l}</span>
                <span className="fx-pipe-c">{i < doneCount ? row.c : "…"}</span>
              </div>
            ))}
          </div>
          {showPdf && (
            <>
              <div className="fx-pdf">
                <div className="fx-pdf-i">PDF</div>
                <div>
                  <div className="fx-pdf-t">FynHelp_Q2_Board_Report.pdf</div>
                  <div className="fx-pdf-s">14 pages · 2.4 MB · reconciled to ₹1</div>
                </div>
              </div>
              <div className="fx-btns">
                <button className="primary">Download</button>
                <button>Email to board</button>
                <button>Send to CA</button>
              </div>
            </>
          )}
        </>
      );
    },
  },
  {
    id: "options",
    q: "Should I take the ₹40L working capital loan?",
    label: "WEIGHING OPTIONS",
    Icon: Scale,
    answer: "Three ways to play this — here's how they stack up on cost, flexibility, and runway impact.",
    duration: 11500,
    render: (p) => {
      const opts: Opt[] = [
        { t: "Take the full ₹40L", s: 48 },
        { t: "Take ₹18L now, keep rest as a line", s: 86, win: true },
        { t: "Skip it, chase receivables instead", s: 41 },
      ];
      const shown = Math.min(opts.length, Math.floor(p * (opts.length + 0.4)));
      const barsUp = p > 0.55;
      const verdict = p > 0.82;
      return (
        <div style={{ marginTop: 10 }}>
          {opts.slice(0, shown).map((o, i) => (
            <div key={o.t} className={`fx-opt ${o.win ? "win" : ""}`}>
              <div className="fx-opt-t">{o.t}</div>
              <div className="fx-opt-s">{o.s}/100</div>
              <div className="fx-opt-bar"><i style={{ width: barsUp ? `${o.s}%` : 0 }} /></div>
            </div>
          ))}
          {verdict && (
            <div className="fx-verdict">
              <CheckCircle2 size={14} /> My call: take ₹18L now, keep ₹22L as an undrawn line.
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "forecast",
    q: "What does my cash look like in 6 months?",
    label: "FORECASTING",
    Icon: TrendingUp,
    answer: "Trending down. Two months of runway left at current burn — actionable if you close AR this month.",
    duration: 11000,
    render: (p) => {
      const tiles: Tile[] = [
        { k: "IN 6 MONTHS", v: "₹9.4L" },
        { k: "RUNWAY LEFT", v: "2.1 mo", tone: "red" },
        { k: "CONFIDENCE", v: "72%" },
      ];
      // stroke-dashoffset animation via inline style
      const drawn = Math.max(0, Math.min(1, (p - 0.15) / 0.55));
      const showTiles = p > 0.7;
      return (
        <div style={{ marginTop: 10 }}>
          <svg viewBox="0 0 320 100" width="100%" height="90" style={{ display: "block" }} aria-hidden>
            <defs>
              <linearGradient id="cone" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#B8333A" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#B8333A" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* grid */}
            {[20, 40, 60, 80].map((y) => (
              <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="rgba(0,0,0,0.06)" />
            ))}
            {/* today marker */}
            <line x1="180" x2="180" y1="0" y2="100" stroke="rgba(0,0,0,0.15)" strokeDasharray="3 3" />
            {/* confidence cone */}
            {p > 0.6 && (
              <path d="M180,44 L320,20 L320,80 L180,64 Z" fill="url(#cone)" />
            )}
            {/* actuals */}
            <path
              d="M0,70 L30,60 L60,55 L90,50 L120,52 L150,48 L180,44"
              fill="none"
              stroke="#B8333A"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 260, strokeDashoffset: 260 - drawn * 260 }}
            />
            {/* projection */}
            {p > 0.5 && (
              <path
                d="M180,44 L220,50 L260,58 L300,68 L320,72"
                fill="none"
                stroke="#B8333A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 4"
                opacity={Math.min(1, (p - 0.5) / 0.25)}
              />
            )}
          </svg>
          {showTiles && (
            <div className="fx-tiles">
              {tiles.map((t) => (
                <div key={t.k} className={`fx-tile ${t.tone || ""}`}>
                  <div className="k">{t.k}</div>
                  <div className="v">{t.v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "alert",
    q: "Anything I should worry about today?",
    label: "CRITICAL ALERT",
    Icon: AlertTriangle,
    answer: "Yes — payroll on 5 Aug will short by ₹2.15L unless you act this week.",
    duration: 11000,
    render: (p) => {
      const show = p > 0.35;
      const tiles: Tile[] = [
        { k: "GST 3B DUE", v: "4 days" },
        { k: "ITC AT RISK", v: "₹1.2L", tone: "red" },
        { k: "OVERDUE AR", v: "₹6.8L", tone: "red" },
      ];
      const showTiles = p > 0.7;
      return (
        <div style={{ marginTop: 10 }}>
          {show && (
            <div className="fx-alert">
              <div className="fx-alert-h">
                <AlertTriangle size={16} className="fx-warn" />
                <span className="fx-sev">SEVERITY 1</span>
                <span style={{ fontWeight: 700, color: "#111", fontSize: 13 }}>Payroll shortfall on 5 Aug</span>
              </div>
              <div style={{ color: "#3A3A3A", fontSize: 12.5, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
                Payroll debits <b>₹8.20L</b>. Projected balance <b>₹6.05L</b>. Short by <b style={{ color: "#B8333A" }}>₹2.15L</b>.
              </div>
              <div className="fx-tiles" style={{ marginTop: 10 }}>
                <div className="fx-tile red"><div className="k">DAYS LEFT</div><div className="v">6</div></div>
                <div className="fx-tile"><div className="k">HOURS</div><div className="v">14</div></div>
                <div className="fx-tile red"><div className="k">SHORTFALL</div><div className="v">₹2.15L</div></div>
              </div>
            </div>
          )}
          {showTiles && (
            <div className="fx-tiles" style={{ marginTop: 8 }}>
              {tiles.map((t) => (
                <div key={t.k} className={`fx-tile ${t.tone || ""}`}>
                  <div className="k">{t.k}</div>
                  <div className="v">{t.v}</div>
                </div>
              ))}
            </div>
          )}
          {p > 0.85 && (
            <div className="fx-btns">
              <button className="primary">Draft chaser emails</button>
              <button>Draw on credit line</button>
              <button>Escalate to CA</button>
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "gst",
    q: "Reconcile my GST for July",
    label: "RECONCILING GSTR-2B",
    Icon: BookOpen,
    answer: "1,204 of 1,209 invoices matched. 5 flagged — ₹1.2L in ITC still recoverable.",
    duration: 12500,
    render: (p) => {
      const rows: GstRow[] = [
        { gstin: "27AABCU9603R1ZM", amt: "₹1,84,200", status: "match" },
        { gstin: "29AAGCB7383J1Z4", amt: "₹62,400", status: "match" },
        { gstin: "06AABCS1429B1ZX", amt: "₹1,12,750", status: "miss" },
        { gstin: "24AAACR5055K1Z7", amt: "₹48,900", status: "match" },
        { gstin: "33AAFCD5862R1ZR", amt: "₹7,300", status: "mm" },
      ];
      const shown = Math.min(rows.length, Math.floor(p * (rows.length + 0.5)));
      const showTiles = p > 0.78;
      const labelFor = (s: GstRow["status"]) =>
        s === "match" ? "MATCHED" : s === "miss" ? "NOT IN 2B" : s === "mm" ? "VALUE MISMATCH" : "CHECKING";
      return (
        <div style={{ marginTop: 10 }}>
          {rows.slice(0, shown).map((r) => (
            <div key={r.gstin} className="fx-gst-row">
              <div>{r.gstin}</div>
              <div>{r.amt}</div>
              <span className={`fx-badge ${r.status}`}>{labelFor(r.status)}</span>
            </div>
          ))}
          {showTiles && (
            <div className="fx-tiles" style={{ marginTop: 10 }}>
              <div className="fx-tile g"><div className="k">MATCHED</div><div className="v">1,204/1,209</div></div>
              <div className="fx-tile red"><div className="k">MISMATCHED</div><div className="v">5 · ₹1.20L</div></div>
              <div className="fx-tile"><div className="k">ITC RECOVERABLE</div><div className="v">₹1.2L</div></div>
            </div>
          )}
        </div>
      );
    },
  },
];

type Phase = "typing_q" | "sending" | "answering" | "resting";

function FynnyReel() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing_q");
  const [progress, setProgress] = useState(0);
  const [userMsg, setUserMsg] = useState<string | null>(null);
  const [sendPulse, setSendPulse] = useState(false);

  const scenario = SCENARIOS[idx];

  // Typing question into input
  const typedInput = useTypeInto(
    scenario.q,
    phase === "typing_q",
    () => {
      setSendPulse(true);
      setPhase("sending");
      window.setTimeout(() => {
        setUserMsg(scenario.q);
        setSendPulse(false);
        setPhase("answering");
      }, 450);
    }
  );

  // Answer typewriter
  const typedAnswer = useLetterType(scenario.answer, phase === "answering", 20);

  // Progress ticker for body content during answering
  useEffect(() => {
    if (phase !== "answering") { setProgress(0); return; }
    const start = performance.now();
    const total = scenario.duration - 2400; // leave time for question + rest
    let raf = 0;
    const step = (t: number) => {
      const el = t - start;
      const pr = Math.min(1, el / total);
      setProgress(pr);
      if (pr < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase, scenario.duration]);

  // Advance to next scenario at end
  useEffect(() => {
    if (phase !== "answering") return;
    const id = window.setTimeout(() => {
      setPhase("resting");
      window.setTimeout(() => {
        setUserMsg(null);
        setIdx((i) => (i + 1) % SCENARIOS.length);
        setPhase("typing_q");
      }, 900);
    }, scenario.duration - 1500);
    return () => window.clearTimeout(id);
  }, [phase, scenario.duration]);

  const ScLabelIcon = scenario.Icon;

  return (
    <div className="fx" role="region" aria-label="CFO Fynny live demo">
      <div className="fx-head">
        <div className="fx-head-tile"><FoxHead size={20} /></div>
        <div style={{ minWidth: 0 }}>
          <div className="fx-head-name">CFO Fynny</div>
          <div className="fx-head-sub">Grounded on your books · updated 4 min ago</div>
        </div>
        <div className="fx-live"><span className="fx-live-t">LIVE</span></div>
      </div>

      <div className="fx-body">
        {userMsg && <div className="fx-user">{userMsg}</div>}
        {(phase === "answering" || phase === "resting") && (
          <div className="fx-reply">
            <div className="fx-fox"><FoxHead size={18} /></div>
            <div className="fx-panel">
              <div className="fx-label"><ScLabelIcon size={12} /> {scenario.label}</div>
              <div className="fx-answer">
                {typedAnswer}
                {phase === "answering" && typedAnswer.length < scenario.answer.length && <span className="fx-caret" />}
              </div>
              {scenario.render(progress)}
            </div>
          </div>
        )}
      </div>

      <div className="fx-foot">
        <button className="fx-icon-btn" aria-label="Attach"><Paperclip size={16} /></button>
        <input
          className="fx-input"
          value={phase === "typing_q" ? typedInput : ""}
          placeholder="Ask Fynny anything about your business…"
          readOnly
          aria-label="Ask Fynny"
        />
        <button className="fx-icon-btn" aria-label="Voice"><Mic size={16} /></button>
        <button className={`fx-send ${sendPulse ? "pulse" : ""}`} aria-label="Send"><ArrowRight size={16} /></button>
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
          if (e.isIntersecting) e.target.classList.add("in");
          else e.target.classList.remove("in");
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);



  return (
    <div className="fyn-page">
      <Helmet>
        <link rel="canonical" href="https://fynhelp.com/" />
      </Helmet>
      <style>{STYLES}</style>
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="fyn-container">
          <h1>
            {"Don't just track your data.".split(" ").map((w, i) => (
              <span key={`w1-${i}`} className="word" style={{ animationDelay: `${i * 75}ms` }}>
                {w}&nbsp;
              </span>
            ))}
            <br />
            {"Interrogate it.".split(" ").map((w, i) => (
              <span
                key={`w2-${i}`}
                className="word red-line"
                style={{ animationDelay: `${(4 + i) * 75}ms` }}
              >
                {w}&nbsp;
              </span>
            ))}
          </h1>
          <p className="hero-sub">
            Meet <b>CFO Fynny</b>, stop running your business on gut feeling. Start running it on
            intelligence. Predictive what-if scenarios and instant financial clarity.
          </p>
          <div className="hero-cta">
            <Link to="/waitlist" className="btn-pill btn-red">
              Join Waitlist <ArrowRight size={18} />
            </Link>
            <Link to="/demo/liquidity" className="btn-pill btn-outline">
              <Calendar size={16} /> Watch Demo
            </Link>
          </div>
          <div className="stats-row">
            {STATS.map((s) => (
              <div key={s.l} className="stat-card">
                <div className="v">{s.v}</div>
                <div className="l">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="chat-wrap-anim">
            <FynnyReel />
          </div>
        </div>
      </section>


      <AIRecommendedSection />

      <MobileProductsSection />

      {/* INTEGRATIONS */}
      <section className="section">
        <div className="fyn-container" style={{ textAlign: "center" }}>
          
          <h2 className="fyn-h">Connect your entire financial stack.</h2>
          <p className="lead">All systems connected. One coherent view of your business.</p>
          <div className="int-stage">
            <div className="int-glow" aria-hidden />
            {[INTEGRATIONS.slice(0, 6), INTEGRATIONS.slice(6)].map((row, ri) => (
              <div key={ri} className={`int-marquee ${ri === 1 ? "rev" : ""}`}>
                <div className="int-track">
                  {[...row, ...row, ...row].map(([a, n, d], i) => (
                    <div key={`${ri}-${i}-${n}`} className="int-card">
                      <div className="int-logo">
                        <img
                          src={`https://icons.duckduckgo.com/ip3/${d}.ico`}
                          alt={`${n} logo`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const t = e.currentTarget as HTMLImageElement;
                            if (!t.dataset.fb1) {
                              t.dataset.fb1 = "1";
                              t.src = `https://www.google.com/s2/favicons?sz=128&domain=${d}`;
                              return;
                            }
                            if (!t.dataset.fb2) {
                              t.dataset.fb2 = "1";
                              t.src = `https://${d}/favicon.ico`;
                              return;
                            }
                            const parent = t.parentElement!;
                            t.remove();
                            const f = document.createElement("div");
                            f.className = "fallback";
                            f.textContent = a;
                            parent.appendChild(f);
                          }}
                        />
                      </div>
                      <div>
                        <div className="int-name">{n}</div>
                        <div className="int-status">Connected</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* PROBLEM */}
      <section className="section">
        <div className="fyn-container">
          <div className="sp-wrap">
            <div className="sp-head">
              <span className="sp-eyebrow">THE PROBLEM</span>
              <h2>India's SMEs make ₹Crore decisions with <em>no financial intelligence.</em></h2>
              <p>Manufacturers in Ludhiana, traders in Surat, clinics in Chennai, exporters in Tiruppur, all running ₹Crore businesses on gut feel, a bank balance check, and a monthly call with the CA.</p>
            </div>

            <div className="sp-grid sp-grid-2">
              {/* 1, Gut feel */}
              <article className="sp-card">
                <div className="sp-num">PAIN · 01</div>
                <h3>"Should I hire?" is answered with a gut feel</h3>
                <p>No runway model, no scenario math. Founders make ₹50L+ hiring calls staring at the HDFC app, and find out 3 months later it broke their cash flow.</p>
                <div className="sp-mock">
                  <div className="sp-mock-bar"><span className="sp-dot red" /><span className="sp-dot" /><span className="sp-dot" /></div>
                  <div className="spm-kpi"><span className="v" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>₹??.?L</span><span className="l">RUNWAY · UNKNOWN</span></div>
                  <div className="spm-drill">
                    <div className="spm-row" style={{ opacity: 0.5 }}><span>Cash burn this month</span><span>?</span></div>
                    <div className="spm-row" style={{ opacity: 0.5 }}><span>Receivables overdue</span><span>?</span></div>
                    <div className="spm-row hi"><span>↳ Gut says: "we'll manage"</span><span>🤞</span></div>
                  </div>
                </div>
              </article>

              {/* 2, CFO cost */}
              <article className="sp-card">
                <div className="sp-num">PAIN · 02</div>
                <h3>A full-time CFO costs ₹45L+/year</h3>
                <p>The salary alone rules them out for 98% of Indian SMEs. So the second-most-important seat in the company stays empty, for years.</p>
                <div className="sp-mock">
                  <div className="spm-match">
                    <div className="spm-inv"><b>CFO · Salary</b>Mumbai · Sr.</div>
                    <div className="spm-link" style={{ color: C.red }}>=</div>
                    <div className="spm-inv" style={{ borderColor: "rgba(196,30,30,0.4)" }}><b style={{ color: C.red }}>₹45,00,000</b>per year, fixed</div>
                  </div>
                  <div className="spm-match">
                    <div className="spm-inv"><b>+ ESOPs</b>2-4% equity</div>
                    <div className="spm-link" style={{ color: C.red }}>=</div>
                    <div className="spm-inv" style={{ borderColor: "rgba(196,30,30,0.4)" }}><b style={{ color: C.red }}>Dilution</b>before PMF</div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 10.5, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textAlign: "center" }}>OUT OF REACH FOR 6.3 CRORE MSMEs</div>
                </div>
              </article>

              {/* 3, Spreadsheets */}
              <article className="sp-card">
                <div className="sp-num">PAIN · 03</div>
                <h3>Month-end is 40 hours of spreadsheets</h3>
                <p>The CA sends a P&L on the 20th. Receivables live in another sheet. Bank statements in a PDF. Nothing reconciles. Nothing ties out. By the time it's clean, the month is already gone.</p>
                <div className="sp-mock">
                  <div className="sp-mock-bar"><span className="sp-dot" /><span className="sp-dot" /><span className="sp-dot" /><span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>aug-final-FINAL-v7.xlsx</span></div>
                  <div className="spm-drill">
                    <div className="spm-row"><span>A2  Sales · Aug</span><span>₹18,40,000</span></div>
                    <div className="spm-row hi"><span>A3  =SUMIF(... #REF!)</span><span style={{ color: C.red }}>#ERROR</span></div>
                    <div className="spm-row"><span>A4  GST Payable</span><span>₹??</span></div>
                    <div className="spm-row" style={{ opacity: 0.55 }}><span>A5  Receivables</span><span>see sheet 4</span></div>
                  </div>
                </div>
              </article>

              {/* 4, GST surprise */}
              <article className="sp-card">
                <div className="sp-num">PAIN · 04</div>
                <h3>GST notices arrive without warning</h3>
                <p>ITC mismatch in GSTR-2B. Late-fee penalty on 3B. ₹2-3L surprises that could've been caught the moment the invoice was booked, but weren't.</p>
                <div className="sp-mock">
                  <div className="spm-doc" style={{ background: "rgba(196,30,30,0.08)", border: "1px solid rgba(196,30,30,0.4)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="t" style={{ color: C.red }}>⚠ NOTICE · GSTR-2B Mismatch</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}>DUE 7 DAYS</div>
                    </div>
                    <div className="s" style={{ color: "rgba(255,255,255,0.6)" }}>FROM · gst.gov.in · AUG QUARTER</div>
                    <div style={{ marginTop: 12, fontSize: 11.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>ITC claim of <b style={{ color: "#fff" }}>₹2,84,200</b> does not match supplier filings. Reverse credit and pay penalty within 7 days or face proceedings under section 73.</div>
                  </div>
                </div>
              </article>
            </div>

            <div style={{ textAlign: "center", marginTop: 36, position: "relative" }}>
              <Link to="/use-cases" className="btn-pill btn-red sp-cta">See how FynHelp fixes this <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>



      {/* STEPS */}
      <section className="section">
        <div className="fyn-container" style={{ textAlign: "center" }}>
          
          <h2 className="fyn-h">Your finance team in 4 steps.</h2>
          <div className="steps-wrap">
            <div className="steps-line" aria-hidden />
            <div className="steps-grid">
              {STEPS.map(s => {
                const Icon = s.icon === "bank" ? Landmark : s.icon === "ledger" ? BookOpen : s.icon === "doc" ? FileText : Sparkles;
                return (
                  <div key={s.n} className="step-card">
                    <ArrowUpRight size={18} className="arrow" />
                    <div className="step-icon"><Icon size={26} strokeWidth={1.6} /></div>
                    <div className="step-num">STEP {s.n}</div>
                    <div className="step-title">{s.t}</div>
                    <div className="step-desc">{s.d}</div>
                    
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CA PARTNER SECTION */}
      <CAPartnerSection />



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
            <CreditSimulator />
          </div>
        </div>
      </section>

      <Ticker items={TICKER_DARK} dark />



      {/* SUPERPOWERS */}
      <section className="section">
        <div className="fyn-container">
          <div className="sp-wrap">
            <div className="sp-head">
              <span className="sp-eyebrow">FYNHELP SUPERPOWERS</span>
              <h2>One platform. <em>Every finance answer.</em></h2>
              <p>From the first rupee tracked to the boardroom what-if, FynHelp gives Indian SMEs a CFO-grade brain that's always on, always honest, and always in your ledger.</p>
            </div>

            <div className="sp-grid">
              {/* 1, Ask Fynny */}
              <article className="sp-card">
                <div className="sp-num">01 · ASK</div>
                <h3>Ask Fynny anything, in plain English</h3>
                <p>Conversational CFO trained on your books. Ask in English, Hindi, or Hinglish, get audit-ready answers in seconds, not weeks.</p>
                <div className="sp-mock">
                  <div className="sp-mock-bar"><span className="sp-dot red" /><span className="sp-dot" /><span className="sp-dot" /></div>
                  <div className="spm-chat-u">What's my runway?</div>
                  <div style={{ display: "block" }}>
                    <div className="spm-chat-a"><b>4.2 months</b> at ₹2.1L/mo burn. Cut vendor X to extend to <b>5.8 months</b>.</div>
                  </div>
                </div>
              </article>

              {/* 2, Drill */}
              <article className="sp-card">
                <div className="sp-num">02 · TRACE</div>
                <h3>Drill from any KPI to the exact rupee</h3>
                <p>Every number on every dashboard links back to the bank line, invoice, or GST entry it came from. Click. See. Done.</p>
                <div className="sp-mock">
                  <div className="spm-kpi"><span className="v">₹18.4L</span><span className="l">Q3 Expenses</span></div>
                  <div className="spm-drill">
                    <div className="spm-row"><span>SaaS Tools</span><span>₹3.2L</span></div>
                    <div className="spm-row hi"><span>↳ AWS Mumbai</span><span>₹2.1L</span></div>
                    <div className="spm-row"><span>Payroll · Aug</span><span>₹8.6L</span></div>
                    <div className="spm-row"><span>GST Paid · Jul</span><span>₹1.4L</span></div>
                  </div>
                </div>
              </article>

              {/* 3, Simulate */}
              <article className="sp-card">
                <div className="sp-num">03 · SIMULATE</div>
                <h3>Stress-test decisions before you commit</h3>
                <p>Hire 3 engineers? Extend credit by 30 days? Move a slider, see the cash gap, runway hit, and risk verdict instantly.</p>
                <div className="sp-mock">
                  <div className="spm-sim-label"><span>NEW CREDIT DAYS</span><b>60</b></div>
                  <div className="spm-sim-track"><div className="spm-sim-fill" /><div className="spm-sim-thumb" /></div>
                  <div className="spm-sim-results">
                    <div><div className="k">CASH GAP</div><div className="vred">-₹6.5L</div></div>
                    <div><div className="k">NEW RUNWAY</div><div className="vgrn">38 days</div></div>
                  </div>
                </div>
              </article>

              {/* 4, GST reconcile */}
              <article className="sp-card">
                <div className="sp-num">04 · RECONCILE</div>
                <h3>GST & ITC, auto-matched to the paisa</h3>
                <p>15 hours of monthly reconciliation collapsed to a single review. Mismatches surface with the exact GSTIN and invoice ID.</p>
                <div className="sp-mock">
                  <div className="spm-match">
                    <div className="spm-inv"><b>GSTR-2B</b>INV-4421 · ₹84,200</div>
                    <div className="spm-link">↔</div>
                    <div className="spm-inv"><b>Books</b>INV-4421 · ₹84,200</div>
                  </div>
                  <div className="spm-match">
                    <div className="spm-inv"><b>GSTR-2B</b>INV-4515 · ₹12,800</div>
                    <div className="spm-link" style={{ color: C.red }}>!</div>
                    <div className="spm-inv" style={{ borderColor: "rgba(196,30,30,0.4)" }}><b>Books</b>Missing · ⚠</div>
                  </div>
                </div>
              </article>

              {/* 5, Runway live */}
              <article className="sp-card">
                <div className="sp-num">05 · MONITOR</div>
                <h3>Runway, burn & MRR, live, every morning</h3>
                <p>Bank syncs through RBI's Account Aggregator. Your runway and burn refresh overnight, no spreadsheets, no waiting on the CA.</p>
                <div className="sp-mock">
                  <div className="spm-kpi"><span className="v">₹17.6L</span><span className="l">Cash on Hand</span></div>
                  <div className="spm-spark">
                    <svg viewBox="0 0 200 60" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="spfade" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#C41E1E" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#C41E1E" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0 40 L25 32 L50 36 L75 22 L100 28 L125 14 L150 20 L175 8 L200 12 L200 60 L0 60 Z" fill="url(#spfade)" />
                      <path d="M0 40 L25 32 L50 36 L75 22 L100 28 L125 14 L150 20 L175 8 L200 12" fill="none" stroke="#C41E1E" strokeWidth="1.6" />
                    </svg>
                  </div>
                  <div className="spm-runway-pills">
                    <div className="spm-pill"><div className="k">RUNWAY</div><div className="v">8.4 mo</div></div>
                    <div className="spm-pill"><div className="k">BURN</div><div className="v red">₹2.1L</div></div>
                  </div>
                </div>
              </article>

              {/* 6, Collab CA */}
              <article className="sp-card">
                <div className="sp-num">06 · COLLABORATE</div>
                <h3>Loop in your CA without sending a single email</h3>
                <p>Grant scoped access to your Chartered Accountant. They see the same numbers you do, comments, queries and audits in one place.</p>
                <div className="sp-mock">
                  <div className="spm-avatars">
                    <div className="spm-avatar" style={{ background: "linear-gradient(135deg,#C41E1E,#E0524A)" }}>NK</div>
                    <div className="spm-avatar" style={{ background: "linear-gradient(135deg,#8B6914,#B89047)" }}>RS</div>
                    <div className="spm-avatar" style={{ background: "linear-gradient(135deg,#2A2A2A,#555)" }}>PA</div>
                    <div className="spm-avatar" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>+2</div>
                  </div>
                  <div className="spm-doc">
                    <div className="t">Q3 GSTR-3B · Ready for review</div>
                    <div className="s">SHARED WITH CA · 2 COMMENTS</div>
                    <div className="lines"><i /><i /><i /></div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Books stay yours (Security) */}
      <section className="section">
        <div className="fyn-container" style={{ textAlign: "center" }}>
          <h2 className="fyn-h">Your books stay yours.</h2>
          <p className="lead">Read-only, revocable, encrypted, and hosted in India. Fynny observes. It never owns.</p>
          <div className="yours-grid">
            {[
              { Icon: Shield, t: "RBI-licensed Account Aggregator", d: "Read-only, consent-based access. You approve every fetch, and you can revoke access instantly from within FynHelp." },
              { Icon: Lock, t: "AES-256 encryption", d: "Books are encrypted at rest with AES-256 and in transit over TLS 1.3. Signed URLs for every document." },
              { Icon: UserCheck, t: "Scoped, revocable access", d: "Invite your CA, controller, or team with role-based scopes. Owner, Manager, Accountant, or Viewer. Revoke in one click." },
              { Icon: FileCheck, t: "Data stays in India", d: "Hosted in Indian data centres with full immutable audit trails. DPDP-ready, with export-and-delete on request." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="yours-card">
                <div className="yours-ic"><Icon size={22} strokeWidth={1.6} /></div>
                <div className="yours-t">{t}</div>
                <div className="yours-d">{d}</div>
              </div>
            ))}
          </div>
          <div className="yours-pills">
            {["RBI Account Aggregator", "DPDP Act ready", "AES-256 at rest", "TLS 1.3 in transit", "Full audit trail", "No data resale, ever"].map((p) => (
              <span key={p} className="yours-pill">{p}</span>
            ))}
          </div>
        </div>
      </section>


      <FAQSection />

      {/* FINAL CTA */}
      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="fyn-container">
          <div className="cta-card">
            <span className="cta-eyebrow">EARLY ACCESS</span>
            <h2 className="fyn-h">Talk to your <span className="red">AI CFO</span>.</h2>
            <p>Be among the first 100 businesses to get 30 days FREE access to CFO Fynny.</p>
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
