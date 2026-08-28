import { useEffect } from "react";
import { Link } from "@/lib/router-compat";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Star,
  ShieldCheck,
  FileSearch,
  GitCompareArrows,
  MessageSquareText,
  BellRing,
  ScrollText,
  Users,
  Lock,
  Server,
  EyeOff,
  Link2,
  Search,
  Bell,
  Download,
  Filter,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FynLogo from "@/components/FynLogo";

/* ─────────────────────────────────────────────────────────
   FynHelp homepage — premium fintech editorial layout
   Display: Fraunces (italic serif) · Body: Inter
   Palette: ink / maroon / cream / gold (brand only)
   ───────────────────────────────────────────────────────── */

const C = {
  ink: "#150C05",
  ink2: "#241309",
  cream: "#FAF6EC",
  creamDeep: "#F1EADB",
  card: "#FFFDF8",
  body: "rgba(26,16,8,0.66)",
  muted: "rgba(26,16,8,0.48)",
  line: "rgba(26,16,8,0.10)",
  lineSoft: "rgba(26,16,8,0.06)",
  maroon: "#A93838",
  maroonDeep: "#7C1D2E",
  gold: "#8B6914",
  green: "#1F7A5C",
  onDark: "#F6EFE2",
};

const STYLES = `
.fyn-home { background:${C.cream}; color:#1A1008; font-family:'Inter',system-ui,sans-serif; -webkit-font-smoothing:antialiased; overflow-x:hidden; }
.fyn-home *, .fyn-home *::before, .fyn-home *::after { box-sizing:border-box; }
.fyn-home h1,.fyn-home h2,.fyn-home h3,.fyn-home h4 { font-family:'Fraunces','Playfair Display',Georgia,serif; font-weight:400; font-style:italic; letter-spacing:-0.015em; margin:0; color:inherit; }
.fyn-home p,.fyn-home div,.fyn-home span,.fyn-home li,.fyn-home a,.fyn-home button,.fyn-home input,.fyn-home th,.fyn-home td,.fyn-home label { font-family:'Inter',system-ui,sans-serif; }
.fyn-home .num { font-variant-numeric:tabular-nums; }
.fh-wrap { max-width:1180px; margin:0 auto; padding:0 24px; }
.fh-sec { padding:100px 0; position:relative; }
@media (max-width:768px){ .fh-sec{ padding:68px 0; } }

.fh-kicker { display:inline-flex; align-items:center; gap:8px; font-size:10.5px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; padding:6px 14px; border-radius:999px; border:1px solid ${C.line}; color:${C.maroon}; background:${C.card}; }
.fh-dark .fh-kicker { border-color:rgba(246,239,226,.2); background:rgba(246,239,226,.06); color:#E8B9B9; }
.fh-h2 { font-size:clamp(30px,4.4vw,50px); line-height:1.14; margin-top:18px !important; }
.fh-lead { font-size:16px; line-height:1.7; color:${C.body}; max-width:60ch; margin-top:16px; }
.fh-dark .fh-lead { color:rgba(246,239,226,.6); }
.fh-center { text-align:center; }
.fh-center .fh-lead { margin-left:auto; margin-right:auto; }

.fh-btn { display:inline-flex; align-items:center; gap:8px; border-radius:999px; font-weight:600; font-size:14.5px; padding:13px 24px; text-decoration:none; border:1px solid transparent; cursor:pointer; transition:transform .3s cubic-bezier(.16,1,.3,1), background .2s, box-shadow .3s; }
.fh-btn-primary { background:${C.maroon}; color:#FFF7EC; box-shadow:0 14px 30px -16px rgba(169,56,56,.9); }
.fh-btn-primary:hover { background:${C.maroonDeep}; transform:translateY(-2px); }
.fh-btn-ghost { background:transparent; color:inherit; border-color:${C.line}; }
.fh-dark .fh-btn-ghost { border-color:rgba(246,239,226,.24); color:${C.onDark}; }
.fh-btn-ghost:hover { transform:translateY(-2px); background:rgba(255,255,255,.06); }

/* ── HERO (dark) ── */
.fh-hero { background:radial-gradient(120% 90% at 50% -10%, #3A1A12 0%, ${C.ink2} 42%, ${C.ink} 100%); color:${C.onDark}; padding:86px 0 0; position:relative; overflow:hidden; }
.fh-hero::after { content:''; position:absolute; left:50%; bottom:-120px; transform:translateX(-50%); width:1000px; height:400px; background:radial-gradient(closest-side, rgba(169,56,56,.34), transparent 70%); filter:blur(10px); pointer-events:none; }
.fh-hero h1 { font-size:clamp(38px,6.2vw,74px); line-height:1.06; color:#FDF8EF; max-width:16ch; margin:22px auto 0 !important; }
.fh-hero p.sub { color:rgba(246,239,226,.62); font-size:16px; line-height:1.7; max-width:48ch; margin:20px auto 0; }
.fh-capture { display:flex; gap:8px; align-items:center; background:rgba(255,255,255,.07); border:1px solid rgba(246,239,226,.18); border-radius:999px; padding:6px 6px 6px 20px; max-width:430px; margin:30px auto 0; backdrop-filter:blur(8px); }
.fh-capture input { flex:1; background:transparent; border:none; outline:none; color:${C.onDark}; font-size:14.5px; min-width:0; }
.fh-capture input::placeholder { color:rgba(246,239,226,.45); }
.fh-hero-note { margin-top:16px; font-size:12.5px; color:rgba(246,239,226,.42); letter-spacing:.02em; }

/* dashboard mock overlapping */
.fh-mock-stage { position:relative; z-index:2; margin-top:56px; padding-bottom:0; }
.fh-mock { background:${C.card}; border-radius:18px 18px 0 0; border:1px solid rgba(26,16,8,.08); box-shadow:0 -10px 70px -20px rgba(169,56,56,.5), 0 40px 90px -50px rgba(0,0,0,.8); overflow:hidden; max-width:960px; margin:0 auto; }
.fh-mock-bar { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid ${C.lineSoft}; }
.fh-mock-brand { display:flex; align-items:center; gap:8px; font-size:12.5px; font-weight:700; color:#1A1008; }
.fh-mock-brand i { width:18px; height:18px; border-radius:6px; background:${C.maroon}; display:block; }
.fh-mock-icons { display:flex; align-items:center; gap:12px; color:${C.muted}; }
.fh-mock-user { display:flex; align-items:center; gap:8px; font-size:11.5px; color:${C.body}; }
.fh-mock-user b { display:block; color:#1A1008; font-size:12px; }
.fh-mock-av { width:24px; height:24px; border-radius:50%; background:linear-gradient(135deg,${C.maroon},${C.gold}); }
.fh-mock-body { display:grid; grid-template-columns:52px 1fr; }
.fh-rail { border-right:1px solid ${C.lineSoft}; padding:16px 0; display:flex; flex-direction:column; align-items:center; gap:16px; }
.fh-rail i { width:16px; height:16px; border-radius:5px; background:rgba(26,16,8,.10); display:block; }
.fh-rail i.on { background:${C.maroon}; }
.fh-mock-main { padding:20px; }
.fh-mock-hi { font-family:'Fraunces',Georgia,serif; font-style:italic; font-size:21px; }
.fh-mock-sub { font-size:11.5px; color:${C.muted}; margin-top:3px; }
.fh-chip { font-size:10.5px; padding:6px 11px; border-radius:8px; border:1px solid ${C.line}; color:${C.body}; display:inline-flex; align-items:center; gap:6px; background:${C.cream}; }
.fh-chip.solid { background:${C.maroon}; color:#FFF7EC; border-color:${C.maroon}; }
.fh-mock-grid { display:grid; grid-template-columns:1.55fr 1fr; gap:14px; margin-top:16px; }
@media (max-width:720px){ .fh-mock-grid{ grid-template-columns:1fr; } }
.fh-mini { border:1px solid ${C.lineSoft}; border-radius:12px; padding:14px; background:${C.card}; }
.fh-mini .lbl { font-size:10.5px; color:${C.muted}; letter-spacing:.06em; text-transform:uppercase; }
.fh-mini .big { font-family:'Fraunces',Georgia,serif; font-style:italic; font-size:26px; margin-top:4px; font-variant-numeric:tabular-nums; }
.fh-bars { display:flex; align-items:flex-end; gap:7px; height:112px; margin-top:16px; }
.fh-bars span { flex:1; border-radius:5px 5px 2px 2px; background:linear-gradient(180deg, rgba(169,56,56,.85), rgba(169,56,56,.22)); }
.fh-axis { display:flex; justify-content:space-between; margin-top:7px; font-size:9px; color:${C.muted}; letter-spacing:.04em; }
.fh-line { display:flex; align-items:center; justify-content:space-between; font-size:11.5px; padding:8px 0; border-top:1px solid ${C.lineSoft}; color:${C.body}; font-variant-numeric:tabular-nums; }
.fh-line b { color:#1A1008; font-weight:600; }
.fh-pillrow { display:flex; gap:6px; margin-top:12px; }
.fh-pillrow span { height:8px; border-radius:4px; flex:1; background:rgba(26,16,8,.08); }
.fh-pillrow span.a { background:${C.ink}; flex:2; }
.fh-pillrow span.b { background:${C.maroon}; flex:1.4; }
.fh-pillrow span.c { background:${C.gold}; flex:1; }

/* ── marquee ── */
.fh-logos { background:${C.cream}; padding:38px 0 18px; text-align:center; }
.fh-logos .cap { font-size:12.5px; color:${C.muted}; }
.fh-marquee { margin-top:22px; overflow:hidden; -webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent); mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent); }
.fh-track { display:flex; gap:56px; width:max-content; animation:fh-slide 32s linear infinite; }
.fh-track span { font-family:'Fraunces',Georgia,serif; font-style:italic; font-size:20px; color:rgba(26,16,8,.42); white-space:nowrap; }
@keyframes fh-slide { to { transform:translateX(-50%); } }
@media (prefers-reduced-motion: reduce){ .fh-track{ animation:none; } }

/* ── generic cards ── */
.fh-grid { display:grid; gap:18px; margin-top:44px; }
.fh-g2 { grid-template-columns:repeat(2,1fr); }
.fh-g3 { grid-template-columns:repeat(3,1fr); }
@media (max-width:900px){ .fh-g3{ grid-template-columns:1fr 1fr; } }
@media (max-width:660px){ .fh-g2,.fh-g3{ grid-template-columns:1fr; } }
.fh-card { background:${C.card}; border:1px solid ${C.line}; border-radius:16px; padding:24px; height:100%; transition:transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s, border-color .3s; }
.fh-card:hover { transform:translateY(-5px); box-shadow:0 26px 50px -36px rgba(26,16,8,.5); border-color:rgba(169,56,56,.3); }
.fh-card h3 { font-size:19px; line-height:1.3; }
.fh-card p { font-size:14px; line-height:1.65; color:${C.body}; margin:9px 0 0; }
.fh-ico { width:36px; height:36px; border-radius:10px; background:rgba(169,56,56,.10); color:${C.maroon}; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
.fh-tag { display:inline-block; margin-top:14px; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:4px 10px; border-radius:999px; border:1px solid ${C.line}; color:${C.muted}; }
.fh-tag.pro { color:${C.gold}; border-color:rgba(139,105,20,.35); background:rgba(139,105,20,.08); }
.fh-dark .fh-card { background:rgba(255,255,255,.045); border-color:rgba(246,239,226,.12); }
.fh-dark .fh-card:hover { border-color:rgba(232,185,185,.42); box-shadow:none; }
.fh-dark .fh-card p { color:rgba(246,239,226,.6); }
.fh-dark .fh-ico { background:rgba(232,185,185,.14); color:#E8B9B9; }

/* split feature */
.fh-split2 { display:grid; grid-template-columns:.95fr 1.05fr; gap:52px; align-items:center; }
@media (max-width:920px){ .fh-split2{ grid-template-columns:1fr; gap:34px; } }
.fh-featlist { margin-top:30px; display:grid; gap:22px; }
.fh-feat { display:flex; gap:14px; }
.fh-feat h4 { font-size:16.5px; font-style:normal; font-weight:600; font-family:'Inter',sans-serif; letter-spacing:0; }
.fh-feat p { font-size:13.5px; color:${C.body}; line-height:1.6; margin-top:5px; }
.fh-glass { border-radius:20px; padding:26px; background:linear-gradient(150deg, rgba(169,56,56,.10), rgba(139,105,20,.08)); border:1px solid ${C.line}; }

/* stats */
.fh-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; text-align:center; }
@media (max-width:760px){ .fh-stats{ grid-template-columns:1fr 1fr; } }
.fh-stat .v { font-family:'Fraunces',Georgia,serif; font-style:italic; font-size:clamp(30px,4vw,44px); font-variant-numeric:tabular-nums; }
.fh-stat .v small { font-size:.5em; font-style:normal; font-family:'Inter',sans-serif; color:${C.maroon}; }
.fh-stat .l { font-size:12.5px; color:${C.muted}; margin-top:6px; }

/* before/after */
.fh-panel { background:${C.card}; border:1px solid ${C.line}; border-radius:18px; overflow:hidden; }
.fh-panel-head { display:flex; justify-content:space-between; padding:13px 18px; border-bottom:1px solid ${C.lineSoft}; font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; font-weight:700; color:${C.muted}; }
.fh-split { display:grid; grid-template-columns:1fr 1fr; }
@media (max-width:560px){ .fh-split{ grid-template-columns:1fr; } }
.fh-side { padding:18px; }
.fh-side + .fh-side { border-left:1px solid ${C.lineSoft}; }
.fh-side-t { font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; font-weight:700; color:${C.muted}; margin-bottom:12px; }
.fh-msg { background:${C.creamDeep}; border-radius:11px; padding:9px 12px; font-size:12.5px; color:${C.body}; margin-bottom:8px; }
.fh-row { display:flex; align-items:center; gap:8px; font-size:12.5px; padding:8px 10px; border-radius:10px; background:rgba(31,122,92,.08); margin-bottom:7px; font-variant-numeric:tabular-nums; }
.fh-row.flag { background:rgba(169,56,56,.09); }
.fh-dot { width:7px; height:7px; border-radius:50%; background:${C.green}; flex:0 0 auto; }
.fh-row.flag .fh-dot { background:${C.maroon}; }
.fh-summary { margin-top:12px; border-top:1px dashed ${C.line}; padding-top:12px; font-size:12.5px; color:${C.muted}; }
.fh-summary b { color:#1A1008; font-size:18px; font-family:'Fraunces',Georgia,serif; font-style:italic; }

/* steps */
.fh-steps { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:44px; }
@media (max-width:900px){ .fh-steps{ grid-template-columns:1fr 1fr; } }
@media (max-width:560px){ .fh-steps{ grid-template-columns:1fr; } }
.fh-step { border-top:2px solid ${C.line}; padding-top:16px; transition:border-color .3s; }
.fh-step:hover { border-color:${C.maroon}; }
.fh-step .n { font-size:11px; color:${C.maroon}; font-weight:700; letter-spacing:.14em; }
.fh-step h3 { font-size:18px; margin-top:8px; }
.fh-step p { font-size:13.5px; color:${C.body}; line-height:1.6; margin-top:7px; }

/* pricing */
.fh-price-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-top:44px; align-items:start; }
@media (max-width:900px){ .fh-price-grid{ grid-template-columns:1fr; max-width:440px; margin-inline:auto; } }
.fh-plan { background:${C.card}; border:1px solid ${C.line}; border-radius:18px; padding:28px; position:relative; text-align:left; }
.fh-plan.pop { border:1.5px solid ${C.maroon}; box-shadow:0 30px 60px -40px rgba(169,56,56,.65); }
.fh-plan .badge { position:absolute; top:-11px; left:26px; background:${C.maroon}; color:#FFF7EC; font-size:9.5px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; padding:5px 12px; border-radius:999px; }
.fh-plan .pn { font-family:'Fraunces',Georgia,serif; font-style:italic; font-size:21px; }
.fh-plan .pp { font-family:'Fraunces',Georgia,serif; font-style:italic; font-size:38px; margin-top:8px; font-variant-numeric:tabular-nums; }
.fh-plan .pp small { font-size:13px; font-style:normal; font-family:'Inter',sans-serif; color:${C.muted}; font-weight:500; }
.fh-annual { font-size:11px; color:${C.gold}; font-weight:700; letter-spacing:.1em; text-transform:uppercase; margin-top:6px; }
.fh-plan ul { list-style:none; padding:0; margin:18px 0 22px; }
.fh-plan li { display:flex; gap:9px; font-size:13.5px; line-height:1.55; color:${C.body}; padding:7px 0; border-top:1px solid ${C.lineSoft}; }
.fh-plan li b { color:#1A1008; font-weight:600; }
.fh-plan .fh-btn { width:100%; justify-content:center; }

/* testimonial */
.fh-quote { display:grid; grid-template-columns:1fr 240px; gap:0; background:${C.card}; border:1px solid ${C.line}; border-radius:20px; overflow:hidden; max-width:860px; margin:40px auto 0; text-align:left; }
@media (max-width:660px){ .fh-quote{ grid-template-columns:1fr; } }
.fh-quote .q { padding:32px; }
.fh-quote .q p { font-family:'Fraunces',Georgia,serif; font-style:italic; font-size:19px; line-height:1.55; }
.fh-quote .who { margin-top:20px; font-size:13px; font-weight:600; }
.fh-quote .who small { display:block; font-weight:400; color:${C.muted}; margin-top:3px; }
.fh-stars { display:flex; gap:3px; margin-top:12px; color:${C.gold}; }
.fh-quote .ph { background:linear-gradient(150deg, ${C.maroon}, ${C.ink}); display:flex; align-items:center; justify-content:center; color:rgba(255,247,236,.85); font-family:'Fraunces',Georgia,serif; font-style:italic; font-size:46px; min-height:180px; }

/* faq */
.fh-faq { margin-top:36px; border-top:1px solid ${C.line}; text-align:left; }
.fh-faq details { border-bottom:1px solid ${C.line}; }
.fh-faq summary { cursor:pointer; list-style:none; padding:20px 0; display:flex; justify-content:space-between; gap:20px; font-family:'Fraunces',Georgia,serif; font-style:italic; font-size:18px; }
.fh-faq summary::-webkit-details-marker { display:none; }
.fh-faq summary::after { content:'+'; color:${C.maroon}; font-size:21px; line-height:1; font-style:normal; }
.fh-faq details[open] summary::after { content:'–'; }
.fh-faq p { font-size:14.5px; line-height:1.7; color:${C.body}; margin:0 0 20px; max-width:74ch; }

/* cta band */
.fh-ctaband { background:radial-gradient(90% 140% at 50% 0%, #3A1A12, ${C.ink}); color:${C.onDark}; border-radius:26px; padding:60px 34px; text-align:center; }
.fh-ctaband h2 { color:#FDF8EF; max-width:20ch; margin-inline:auto; }

/* footer */
.fh-foot { background:${C.ink}; color:rgba(246,239,226,.6); padding:62px 0 26px; }
.fh-foot-grid { display:grid; grid-template-columns:1.4fr repeat(3,1fr); gap:32px; }
@media (max-width:800px){ .fh-foot-grid{ grid-template-columns:1fr 1fr; } }
.fh-foot h4 { color:#FBF6EC; font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; font-family:'Inter',sans-serif; font-style:normal; font-weight:700; margin-bottom:13px; }
.fh-foot a { display:block; color:rgba(246,239,226,.58); text-decoration:none; font-size:13.5px; padding:5px 0; transition:color .2s; }
.fh-foot a:hover { color:#FBF6EC; }
.fh-foot-bottom { border-top:1px solid rgba(246,239,226,.12); margin-top:38px; padding-top:18px; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; font-size:12.5px; }
.fh-mark { font-family:'Fraunces',Georgia,serif; font-style:italic; font-size:23px; color:#FBF6EC; }
.fh-mark span { color:#E8B9B9; }

/* reveal */
.fh-rv { opacity:0; transform:translateY(20px); transition:opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); }
.fh-rv.in { opacity:1; transform:none; }
@media (prefers-reduced-motion: reduce){ .fh-rv{ opacity:1; transform:none; transition:none; } }
`;

const LOGOS = ["Tally Prime", "Zoho Books", "GSTN", "HDFC Bank", "ICICI", "Razorpay", "QuickBooks", "Busy"];

const BARS = [38, 52, 44, 68, 58, 82, 64, 92, 74, 88, 70, 96];
const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const FEATURES = [
  { icon: FileSearch, t: "Document intake, classified", d: "Statements, invoices and GSTR files read into structured lines the moment they land." },
  { icon: GitCompareArrows, t: "Exact → fuzzy → your rules", d: "What ties out collapses out of the queue. What doesn't arrives with the rule that flagged it." },
  { icon: Users, t: "Queues split by role", d: "Junior review and partner sign-off are separate objects, not one list with a filter." },
  { icon: Link2, t: "Source-linked numbers", d: "Every figure in every pack is one click from the bank line it came from." },
];

const STATS = [
  ["400→8", "transactions to decisions"],
  ["15", "min review, not 3 hrs", "min"],
  ["100%", "source-linked figures"],
  ["0", "per-seat charges"],
];

const PROBLEMS = [
  ["Document chasing", "\u201cWhere\u2019s the August statement?\u201d on WhatsApp, then email, then WhatsApp again. Across 30 clients, that\u2019s a junior\u2019s week."],
  ["Manual reconciliation", "Bank in one tab, books in another, GSTR-2B in a third. Hundreds of lines matched by hand to find the few that don\u2019t tie."],
  ["Rework after review", "Junior → manager → partner → back again, with nothing recording why something was flagged the first time."],
  ["Sign-off on faith", "A finished P&L with no visible trail back to source is a signature you can\u2019t defend later."],
];

const PIPELINE = [
  { icon: FileSearch, t: "Extract", d: "Multi-format documents classified and read into structured lines.", plan: "All plans" },
  { icon: GitCompareArrows, t: "Recon", d: "Exact, fuzzy and firm-rule matching with variance thresholds you set.", plan: "All plans" },
  { icon: MessageSquareText, t: "Narrate", d: "A plain-language monthly note grounded in the matched lines.", plan: "All plans" },
  { icon: BellRing, t: "Chaser", d: "Automated document follow-ups, on the channel clients reply on.", plan: "Professional+" },
  { icon: ScrollText, t: "Audit trail", d: "Who changed what, when, and from which source line. Exportable.", plan: "All plans" },
  { icon: Users, t: "Unlimited users", d: "Your whole firm, every role. Never priced per seat.", plan: "All plans" },
];

const STEPS = [
  ["Connect your data", "Read-only links to Tally, Zoho and bank feeds. No migration, nothing switched off."],
  ["We extract & match", "Documents classified and reconciled — exact, then fuzzy, then your firm's rules."],
  ["Review exceptions only", "Genuine mismatches surface with a reason code and a link to source."],
  ["Client gets a clean MIS", "A source-linked pack with a narrative your client can actually read."],
];

const TRUST = [
  { icon: ShieldCheck, t: "No dummy numbers, ever", d: "If we don\u2019t have the data, the space stays empty. Never a placeholder figure dressed as real." },
  { icon: Link2, t: "Every match is explainable", d: "Each matched or flagged line names the rule behind it. Never \u201cAI decided\u201d." },
  { icon: Lock, t: "Read-only, revocable", d: "We read; we never write to your ledger. Revoke any connection at any time." },
  { icon: ScrollText, t: "Full audit trail", d: "Every action logged and exportable, so a review reconstructs months later." },
  { icon: Server, t: "Hosted in India", d: "Client data stays on Indian infrastructure. Certifications published only once verified." },
  { icon: EyeOff, t: "No training on your data", d: "Learning is scoped to your firm and the client it came from. Never shared models." },
];

const PLANS = [
  { name: "Starter", price: "\u20B92,999", per: "/mo", clients: "15 client entities included", extra: "Extra client \u20B9149 (cap 25)", adds: ["Extract, Recon, Narrate", "Full audit trail", "Unlimited users"], cta: "Start with Starter" },
  { name: "Professional", price: "\u20B95,999", per: "/mo", clients: "40 client entities included", extra: "Extra client \u20B9119", adds: ["Everything in Starter", "Chaser follow-ups", "White-label client packs", "Priority processing"], cta: "Book a firm demo", popular: true },
  { name: "Scale", price: "\u20B912,999", per: "/mo", clients: "100 client entities included", extra: "Extra client \u20B999 (no cap)", adds: ["Everything in Professional", "Multi-partner dashboards", "API access", "Dedicated success manager"], cta: "Talk to us" },
];

const FAQS = [
  ["Do we have to switch off Tally or Zoho?", "No. FynHelp reads from them. Your ledger stays where it is and stays the system of record — we add the extraction, reconciliation and review layer on top."],
  ["What does my team stop doing?", "Line-by-line matching of transactions that were always going to tie out, and chasing documents by hand. Your team keeps the judgement: exceptions, treatment decisions and sign-off."],
  ["What counts as an active client entity?", "One set of books you process in a given month — a company, LLP or proprietorship with its own ledger. Entities you don't process that month don't count."],
  ["How is client data kept safe?", "Read-only, revocable connections, India-hosted data, and an exportable audit trail on every action. We publish certifications only once independently verified."],
  ["Do you train AI models on our data?", "No. Your clients' books never train shared or global models. Pattern learning is scoped to your firm and the individual client it came from."],
];

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div className="fh-rv" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function HomePage() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".fh-rv"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <div className="fyn-home">
      <style>{STYLES}</style>
      <Navbar />

      {/* ── HERO ── */}
      <section className="fh-hero">
        <div className="fh-wrap fh-center" style={{ position: "relative", zIndex: 2 }}>
          <Reveal>
            <span className="fh-kicker">Built for chartered accountants</span>
            <h1>
              The Intelligence Layer<br />Beneath Your Ledger
            </h1>
            <p className="sub">
              FynHelp reads your documents, reconciles them against Tally, Zoho and bank feeds, and hands
              your team only the exceptions that need a decision.
            </p>
            <form
              className="fh-capture"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = "/waitlist";
              }}
            >
              <input type="email" placeholder="Enter your work email" aria-label="Work email" required />
              <button type="submit" className="fh-btn fh-btn-primary">
                Book a Demo <ArrowRight size={15} />
              </button>
            </form>
            <div className="fh-hero-note">Read-only access · No ledger migration · Revocable anytime</div>
          </Reveal>
        </div>

        {/* dashboard mock */}
        <div className="fh-wrap fh-mock-stage">
          <Reveal delay={140}>
            <div className="fh-mock">
              <div className="fh-mock-bar">
                <div className="fh-mock-brand">
                  <i />
                  FynHelp
                </div>
                <div className="fh-mock-icons">
                  <Search size={14} />
                  <Bell size={14} />
                  <div className="fh-mock-user">
                    <div className="fh-mock-av" />
                    <span>
                      <b>Adireddy T.</b>
                      Partner, Sharma &amp; Co
                    </span>
                  </div>
                </div>
              </div>
              <div className="fh-mock-body">
                <div className="fh-rail">
                  <i className="on" />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="fh-mock-main">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div className="fh-mock-hi">Good morning, Adireddy</div>
                      <div className="fh-mock-sub">August close · 38 client entities · 2 need your sign-off</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span className="fh-chip">
                        <Filter size={11} /> Exceptions
                      </span>
                      <span className="fh-chip solid">
                        <Download size={11} /> Export MIS
                      </span>
                    </div>
                  </div>

                  <div className="fh-mock-grid">
                    <div className="fh-mini">
                      <div className="lbl">Transactions reconciled</div>
                      <div className="big num">1,24,880</div>
                      <div className="fh-bars">
                        {BARS.map((h, i) => (
                          <span key={i} style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <div className="fh-axis">
                        {MONTHS.map((m) => (
                          <span key={m}>{m}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: 14 }}>
                      <div className="fh-mini">
                        <div className="lbl">Exceptions open</div>
                        <div className="big num">8</div>
                        <div className="fh-line">
                          <span>Amount variance</span>
                          <b>4</b>
                        </div>
                        <div className="fh-line">
                          <span>No counterparty</span>
                          <b>3</b>
                        </div>
                        <div className="fh-line">
                          <span>Date window</span>
                          <b>1</b>
                        </div>
                      </div>
                      <div className="fh-mini">
                        <div className="lbl">Close readiness</div>
                        <div className="big num">92%</div>
                        <div className="fh-pillrow">
                          <span className="a" />
                          <span className="b" />
                          <span className="c" />
                          <span />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── LOGO MARQUEE ── */}
      <section className="fh-logos">
        <div className="fh-wrap">
          <div className="cap">Reads from the systems Indian practices already run on</div>
        </div>
        <div className="fh-marquee">
          <div className="fh-track">
            {[...LOGOS, ...LOGOS].map((l, i) => (
              <span key={`${l}-${i}`}>{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE SPLIT ── */}
      <section className="fh-sec">
        <div className="fh-wrap fh-split2">
          <div>
            <Reveal>
              <span className="fh-kicker">What FynHelp does</span>
              <h2 className="fh-h2">Explore Our Exception-First Close</h2>
              <p className="fh-lead">
                Not another ledger. A layer that sits above the one you have and removes the part of the month
                your team should never have been doing by hand.
              </p>
              <div className="fh-featlist">
                {FEATURES.map((f) => (
                  <div className="fh-feat" key={f.t}>
                    <div className="fh-ico" style={{ marginBottom: 0, flex: "0 0 auto" }}>
                      <f.icon size={17} />
                    </div>
                    <div>
                      <h4>{f.t}</h4>
                      <p>{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="fh-glass">
              <div className="fh-panel">
                <div className="fh-panel-head">
                  <span>August close · 393 txns</span>
                  <span style={{ color: C.maroon }}>Before / After</span>
                </div>
                <div className="fh-split">
                  <div className="fh-side">
                    <div className="fh-side-t">Today</div>
                    <div className="fh-msg">&ldquo;Sir, August statement pending&rdquo;</div>
                    <div className="fh-msg" style={{ opacity: 0.62 }}>&ldquo;Sent last week no?&rdquo;</div>
                    <div className="fh-msg" style={{ opacity: 0.62 }}>recon_aug_v4_FINAL.xlsx</div>
                    <div className="fh-summary">
                      <b className="num">3 hrs</b> manual matching, per client
                    </div>
                  </div>
                  <div className="fh-side">
                    <div className="fh-side-t">With FynHelp</div>
                    <div className="fh-row">
                      <span className="fh-dot" />
                      <span className="num">391 auto-matched</span>
                    </div>
                    <div className="fh-row flag">
                      <span className="fh-dot" />
                      Variance ₹4,120 · INV-2291
                    </div>
                    <div className="fh-row flag">
                      <span className="fh-dot" />
                      No counterparty · ₹18,000
                    </div>
                    <div className="fh-summary">
                      <b className="num">15 min</b> review, 2 decisions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: C.creamDeep, padding: "56px 0" }}>
        <div className="fh-wrap">
          <div className="fh-stats">
            {STATS.map(([v, l], i) => (
              <Reveal key={l} delay={i * 70}>
                <div className="fh-stat">
                  <div className="v num">{v}</div>
                  <div className="l">{l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="fh-sec">
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-kicker">Where the month goes</span>
            <h2 className="fh-h2">Four Things Quietly Eat Your Firm&rsquo;s Week</h2>
          </Reveal>
          <div className="fh-grid fh-g2">
            {PROBLEMS.map(([t, d], i) => (
              <Reveal key={t} delay={i * 70}>
                <div className="fh-card">
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PIPELINE (dark) ── */}
      <section className="fh-sec fh-dark" style={{ background: `radial-gradient(80% 120% at 20% 0%, #3A1A12, ${C.ink})`, color: C.onDark }} id="the-fix">
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-kicker">The pipeline</span>
            <h2 className="fh-h2" style={{ color: "#FDF8EF" }}>
              Extract → Recon → Narrate → Chaser
            </h2>
            <p className="fh-lead">
              Four moving parts and two guarantees — the same vocabulary you&rsquo;ll see on the pricing table
              below. No second product, no renamed modules.
            </p>
          </Reveal>
          <div className="fh-grid fh-g3">
            {PIPELINE.map((p, i) => (
              <Reveal key={p.t} delay={i * 60}>
                <div className="fh-card">
                  <div className="fh-ico">
                    <p.icon size={17} />
                  </div>
                  <h3 style={{ color: "#FBF6EC" }}>{p.t}</h3>
                  <p>{p.d}</p>
                  <span className={`fh-tag ${p.plan !== "All plans" ? "pro" : ""}`} style={{ color: p.plan !== "All plans" ? C.gold : "rgba(246,239,226,.5)", borderColor: "rgba(246,239,226,.18)" }}>
                    {p.plan}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEPS ── */}
      <section className="fh-sec">
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-kicker">How it works</span>
            <h2 className="fh-h2">Four Steps From Connection to a Clean MIS</h2>
          </Reveal>
          <div className="fh-steps">
            {STEPS.map(([t, d], i) => (
              <Reveal key={t} delay={i * 70}>
                <div className="fh-step">
                  <div className="n">STEP {String(i + 1).padStart(2, "0")}</div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="fh-sec" style={{ background: C.creamDeep }}>
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-kicker">Trust &amp; security</span>
            <h2 className="fh-h2">A Checklist, Not a Sales Pitch</h2>
          </Reveal>
          <div className="fh-grid fh-g3">
            {TRUST.map((t, i) => (
              <Reveal key={t.t} delay={i * 55}>
                <div className="fh-card">
                  <div className="fh-ico">
                    <t.icon size={17} />
                  </div>
                  <h3>{t.t}</h3>
                  <p>{t.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="fh-sec fh-center">
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-kicker">Early practices</span>
            <h2 className="fh-h2">Sweet Words From Serious Firms</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="fh-quote">
              <div className="q">
                <p>
                  &ldquo;We stopped opening three tabs per client. The exception queue is the only screen my
                  seniors touch now, and every figure in the pack traces back to a bank line — that&rsquo;s
                  what made partner sign-off quick.&rdquo;
                </p>
                <div className="fh-stars">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={14} fill={C.gold} strokeWidth={0} />
                  ))}
                </div>
                <div className="who">
                  Pilot partner, 40-entity practice
                  <small>Bengaluru · onboarding cohort 2026</small>
                </div>
              </div>
              <div className="ph">FH</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="fh-sec fh-center" style={{ background: C.creamDeep }} id="pricing">
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-kicker">Pricing</span>
            <h2 className="fh-h2">Priced Per Client Entity. Never Per Seat.</h2>
            <p className="fh-lead">Annual billing saves 15% on every plan. Fewer than 3 entities? The pilot is free.</p>
          </Reveal>
          <div className="fh-price-grid">
            {PLANS.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <div className={`fh-plan ${p.popular ? "pop" : ""}`}>
                  {p.popular && <span className="badge">Most popular</span>}
                  <div className="pn">{p.name}</div>
                  <div className="pp num">
                    {p.price}
                    <small>{p.per}</small>
                  </div>
                  <div className="fh-annual">Save 15% annually</div>
                  <ul>
                    <li>
                      <Check size={15} style={{ color: C.maroon, flex: "0 0 auto" }} />
                      <b>{p.clients}</b>
                    </li>
                    <li>
                      <Check size={15} style={{ color: C.maroon, flex: "0 0 auto" }} />
                      {p.extra}
                    </li>
                    {p.adds.map((a) => (
                      <li key={a}>
                        <Check size={15} style={{ color: C.maroon, flex: "0 0 auto" }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                  <Link to="/waitlist" className={`fh-btn ${p.popular ? "fh-btn-primary" : "fh-btn-ghost"}`}>
                    {p.cta} <ArrowUpRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="fh-sec" id="faq">
        <div className="fh-wrap" style={{ maxWidth: 880 }}>
          <Reveal>
            <span className="fh-kicker">FAQ</span>
            <h2 className="fh-h2">The Five Questions Firms Ask First</h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="fh-faq">
              {FAQS.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="fh-sec fh-dark" style={{ paddingTop: 0, background: "transparent" }}>
        <div className="fh-wrap">
          <Reveal>
            <div className="fh-ctaband">
              <span className="fh-kicker">Limited first cohort</span>
              <h2 className="fh-h2">Run Your Next Monthly Close Through FynHelp</h2>
              <p className="fh-lead" style={{ marginInline: "auto" }}>
                We&rsquo;re onboarding firms managing 5 to 40+ client entities directly — set up by the founding
                team, not a self-serve signup form.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
                <Link to="/waitlist" className="fh-btn fh-btn-primary">
                  Book a Firm Demo <ArrowRight size={16} />
                </Link>
                <Link to="/ca-firms" className="fh-btn fh-btn-ghost">
                  For CA firms
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="fh-foot">
        <div className="fh-wrap">
          <div className="fh-foot-grid">
            <div>
              <div className="fh-mark">
                Fyn<span>Help</span>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, marginTop: 12, color: "rgba(246,239,226,.58)" }}>
                The intelligence layer between your documents and your ledger. Built in India, for Indian
                practices.
              </p>
            </div>
            <div>
              <h4>Product</h4>
              <a href="#the-fix">How it works</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
              <Link to="/demo">Live demo</Link>
            </div>
            <div>
              <h4>For firms</h4>
              <Link to="/ca-firms">CA firms</Link>
              <Link to="/ca/login">CA sign in</Link>
              <Link to="/use-cases">Use cases</Link>
              <Link to="/blog">Blog</Link>
            </div>
            <div>
              <h4>Company</h4>
              <Link to="/about">About</Link>
              <Link to="/security">Security</Link>
              <Link to="/community">Community</Link>
              <Link to="/login">Sign in</Link>
            </div>
          </div>
          <div className="fh-foot-bottom">
            <span>© 2026 FynHelp Technologies · Bengaluru, India</span>
            <span>support@fynhelp.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
