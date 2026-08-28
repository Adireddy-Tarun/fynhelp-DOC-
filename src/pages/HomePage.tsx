import { useEffect } from "react";
import { Link } from "@/lib/router-compat";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  X as XIcon,
  Minus,
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
} from "lucide-react";
import Navbar from "@/components/Navbar";

/* ─────────────────────────────────────────────────────────
   FynHelp homepage — cream / maroon brand system
   Display: Fraunces · Body: Inter
   ───────────────────────────────────────────────────────── */

const C = {
  cream: "#F6F0E4",
  creamDeep: "#EFE8D8",
  card: "#FFFDF8",
  ink: "#1A1008",
  body: "rgba(26,16,8,0.68)",
  muted: "rgba(26,16,8,0.5)",
  line: "rgba(26,16,8,0.10)",
  lineSoft: "rgba(26,16,8,0.06)",
  maroon: "#7C1D2E",
  maroonDeep: "#5E1523",
  maroonTint: "rgba(124,29,46,0.08)",
  gold: "#8B6914",
  green: "#1F7A5C",
};

const STYLES = `
.fyn-home { background:${C.cream}; color:${C.ink}; font-family:'Inter','Instrument Sans',system-ui,sans-serif; -webkit-font-smoothing:antialiased; overflow-x:hidden; }
.fyn-home *, .fyn-home *::before, .fyn-home *::after { box-sizing:border-box; }
.fyn-home h1,.fyn-home h2,.fyn-home h3,.fyn-home h4,.fyn-home h5 { font-family:'Fraunces','Playfair Display',Georgia,serif; font-weight:600; letter-spacing:-0.02em; color:${C.ink}; margin:0; }
.fyn-home p,.fyn-home div,.fyn-home span,.fyn-home li,.fyn-home td,.fyn-home th,.fyn-home a,.fyn-home button,.fyn-home label { font-family:'Inter','Instrument Sans',system-ui,sans-serif; }
.fyn-home .num { font-variant-numeric:tabular-nums; }
.fh-wrap { max-width:1200px; margin:0 auto; padding:0 24px; }
.fh-sec { padding:96px 0; position:relative; }
@media (max-width:768px){ .fh-sec{ padding:64px 0; } }

.fh-eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:11px; font-weight:600; letter-spacing:0.16em; text-transform:uppercase; color:${C.maroon}; }
.fh-eyebrow::before { content:''; width:18px; height:1px; background:${C.maroon}; opacity:.5; }
.fh-h2 { font-size:clamp(30px,4.2vw,48px); line-height:1.08; margin-top:16px !important; max-width:19ch; }
.fh-lead { font-size:17px; line-height:1.65; color:${C.body}; max-width:62ch; margin-top:18px; }

.fh-btn { display:inline-flex; align-items:center; gap:9px; border-radius:999px; font-weight:600; font-size:15px; padding:14px 26px; text-decoration:none; border:1px solid transparent; cursor:pointer; transition:transform .25s cubic-bezier(.16,1,.3,1), background .2s, box-shadow .25s; }
.fh-btn-primary { background:${C.maroon}; color:#FFF7EC; box-shadow:0 12px 28px -14px rgba(124,29,46,.75); }
.fh-btn-primary:hover { background:${C.maroonDeep}; transform:translateY(-2px); }
.fh-btn-ghost { background:transparent; color:${C.ink}; border-color:${C.line}; }
.fh-btn-ghost:hover { background:${C.card}; transform:translateY(-2px); }

/* HERO */
.fh-hero { padding:72px 0 40px; position:relative; }
.fh-hero::before { content:''; position:absolute; top:-180px; left:50%; transform:translateX(-50%); width:900px; height:520px; background:radial-gradient(closest-side, rgba(124,29,46,.10), transparent 72%); pointer-events:none; }
.fh-hero-grid { display:grid; grid-template-columns:1.05fr .95fr; gap:56px; align-items:center; }
@media (max-width:980px){ .fh-hero-grid{ grid-template-columns:1fr; gap:40px; } }
.fh-hero h1 { font-size:clamp(38px,5.4vw,66px); line-height:1.03; margin-top:20px !important; }
.fh-hero h1 em { font-style:italic; color:${C.maroon}; }
.fh-hero-sub { font-size:18px; line-height:1.6; color:${C.body}; margin-top:22px; max-width:56ch; }
.fh-hero-sub b { color:${C.ink}; font-weight:600; }
.fh-hero-cta { display:flex; gap:12px; flex-wrap:wrap; margin-top:30px; }
.fh-micro { margin-top:22px; font-size:13.5px; color:${C.muted}; display:flex; align-items:center; gap:8px; }

/* before/after panel */
.fh-panel { background:${C.card}; border:1px solid ${C.line}; border-radius:20px; box-shadow:0 40px 80px -50px rgba(26,16,8,.45); overflow:hidden; }
.fh-panel-head { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid ${C.lineSoft}; }
.fh-panel-tag { font-size:10.5px; letter-spacing:.14em; font-weight:700; text-transform:uppercase; color:${C.muted}; }
.fh-split { display:grid; grid-template-columns:1fr 1fr; }
@media (max-width:560px){ .fh-split{ grid-template-columns:1fr; } }
.fh-side { padding:18px; }
.fh-side + .fh-side { border-left:1px solid ${C.lineSoft}; }
@media (max-width:560px){ .fh-side + .fh-side{ border-left:none; border-top:1px solid ${C.lineSoft}; } }
.fh-side-t { font-size:11px; letter-spacing:.12em; text-transform:uppercase; font-weight:700; color:${C.muted}; margin-bottom:12px; }
.fh-msg { background:${C.creamDeep}; border-radius:12px; padding:9px 12px; font-size:12.5px; color:${C.body}; margin-bottom:8px; line-height:1.4; }
.fh-msg.dim { opacity:.62; }
.fh-row { display:flex; align-items:center; gap:8px; font-size:12.5px; padding:8px 10px; border-radius:10px; background:rgba(31,122,92,.07); color:${C.ink}; margin-bottom:7px; font-variant-numeric:tabular-nums; }
.fh-row.flag { background:${C.maroonTint}; }
.fh-dot { width:7px; height:7px; border-radius:50%; background:${C.green}; flex:0 0 auto; }
.fh-row.flag .fh-dot { background:${C.maroon}; }
.fh-summary { margin-top:12px; border-top:1px dashed ${C.line}; padding-top:12px; font-size:12.5px; color:${C.muted}; }
.fh-summary b { color:${C.ink}; font-size:18px; font-family:'Fraunces',Georgia,serif; }

/* proof strip */
.fh-proof { border-top:1px solid ${C.line}; border-bottom:1px solid ${C.line}; background:rgba(255,253,248,.55); }
.fh-proof-grid { display:grid; grid-template-columns:repeat(4,1fr); }
@media (max-width:860px){ .fh-proof-grid{ grid-template-columns:repeat(2,1fr); } }
.fh-proof-cell { padding:26px 22px; border-left:1px solid ${C.lineSoft}; }
.fh-proof-cell:first-child { border-left:none; }
.fh-proof-cell .k { font-family:'Fraunces',Georgia,serif; font-size:17px; font-weight:600; }
.fh-proof-cell .v { font-size:12.5px; color:${C.muted}; margin-top:5px; }

/* cards */
.fh-grid { display:grid; gap:18px; margin-top:44px; }
.fh-g2 { grid-template-columns:repeat(2,1fr); }
.fh-g3 { grid-template-columns:repeat(3,1fr); }
@media (max-width:900px){ .fh-g3{ grid-template-columns:1fr 1fr; } }
@media (max-width:660px){ .fh-g2,.fh-g3{ grid-template-columns:1fr; } }
.fh-card { background:${C.card}; border:1px solid ${C.line}; border-radius:16px; padding:26px; transition:transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s, border-color .3s; }
.fh-card:hover { transform:translateY(-5px); box-shadow:0 26px 50px -34px rgba(26,16,8,.45); border-color:rgba(124,29,46,.28); }
.fh-card h3 { font-size:19px; line-height:1.25; }
.fh-card p { font-size:14.5px; line-height:1.6; color:${C.body}; margin:10px 0 0; }
.fh-ico { width:38px; height:38px; border-radius:11px; background:${C.maroonTint}; color:${C.maroon}; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
.fh-tag { display:inline-block; margin-top:16px; font-size:10.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:4px 10px; border-radius:999px; border:1px solid ${C.line}; color:${C.muted}; }
.fh-tag.pro { color:${C.gold}; border-color:rgba(139,105,20,.35); background:rgba(139,105,20,.07); }

.fh-closing { margin-top:32px; font-size:19px; line-height:1.5; font-family:'Fraunces',Georgia,serif; max-width:60ch; }
.fh-closing span { color:${C.maroon}; }

/* dark band */
.fh-dark { background:${C.ink}; color:#F6F0E4; }
.fh-dark h2,.fh-dark h3 { color:#FBF6EC; }
.fh-dark .fh-eyebrow { color:#D8A0AA; }
.fh-dark .fh-eyebrow::before { background:#D8A0AA; }
.fh-dark .fh-lead { color:rgba(246,240,228,.66); }
.fh-dark .fh-card { background:rgba(255,255,255,.045); border-color:rgba(246,240,228,.12); }
.fh-dark .fh-card:hover { border-color:rgba(216,160,170,.4); box-shadow:none; }
.fh-dark .fh-card p { color:rgba(246,240,228,.62); }
.fh-dark .fh-ico { background:rgba(216,160,170,.14); color:#E7B7BF; }
.fh-callout { margin-top:36px; border:1px solid rgba(246,240,228,.16); border-radius:16px; padding:26px 28px; display:flex; gap:22px; align-items:center; flex-wrap:wrap; background:rgba(255,255,255,.035); }
.fh-callout .big { font-family:'Fraunces',Georgia,serif; font-size:38px; font-weight:600; color:#FBF6EC; font-variant-numeric:tabular-nums; line-height:1; }
.fh-callout .txt { flex:1; min-width:240px; font-size:14.5px; line-height:1.6; color:rgba(246,240,228,.66); }

/* steps */
.fh-steps { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:44px; counter-reset:step; }
@media (max-width:900px){ .fh-steps{ grid-template-columns:1fr 1fr; } }
@media (max-width:560px){ .fh-steps{ grid-template-columns:1fr; } }
.fh-step { border-top:2px solid ${C.line}; padding-top:18px; transition:border-color .3s; }
.fh-step:hover { border-color:${C.maroon}; }
.fh-step .n { font-family:'Fraunces',Georgia,serif; font-size:13px; color:${C.maroon}; font-weight:700; letter-spacing:.08em; }
.fh-step h3 { font-size:18px; margin-top:8px; }
.fh-step p { font-size:14px; color:${C.body}; line-height:1.6; margin-top:8px; }

/* pricing */
.fh-price-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-top:44px; align-items:start; }
@media (max-width:900px){ .fh-price-grid{ grid-template-columns:1fr; max-width:460px; margin-left:auto; margin-right:auto; } }
.fh-plan { background:${C.card}; border:1px solid ${C.line}; border-radius:18px; padding:28px; position:relative; }
.fh-plan.pop { border:1.5px solid ${C.maroon}; box-shadow:0 30px 60px -40px rgba(124,29,46,.6); }
.fh-plan .badge { position:absolute; top:-12px; left:28px; background:${C.maroon}; color:#FFF7EC; font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; padding:5px 12px; border-radius:999px; }
.fh-plan .pn { font-family:'Fraunces',Georgia,serif; font-size:20px; font-weight:600; }
.fh-plan .pp { font-family:'Fraunces',Georgia,serif; font-size:38px; font-weight:600; margin-top:10px; font-variant-numeric:tabular-nums; }
.fh-plan .pp small { font-size:14px; font-family:'Inter',sans-serif; color:${C.muted}; font-weight:500; }
.fh-plan ul { list-style:none; padding:0; margin:20px 0 24px; }
.fh-plan li { display:flex; gap:9px; font-size:14px; line-height:1.55; color:${C.body}; padding:7px 0; border-top:1px solid ${C.lineSoft}; }
.fh-plan li b { color:${C.ink}; font-weight:600; }
.fh-plan .fh-btn { width:100%; justify-content:center; }
.fh-annual { font-size:12px; color:${C.gold}; font-weight:600; letter-spacing:.06em; text-transform:uppercase; margin-top:6px; }

/* comparison */
.fh-table-wrap { margin-top:44px; overflow-x:auto; border:1px solid ${C.line}; border-radius:16px; background:${C.card}; }
.fh-table { width:100%; border-collapse:collapse; min-width:680px; }
.fh-table th,.fh-table td { text-align:left; padding:16px 20px; font-size:14px; border-top:1px solid ${C.lineSoft}; vertical-align:top; }
.fh-table thead th { border-top:none; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:${C.muted}; font-weight:700; }
.fh-table thead th.us { color:${C.maroon}; }
.fh-table td.us { background:${C.maroonTint}; font-weight:500; color:${C.ink}; }
.fh-table td { color:${C.body}; }

/* pilot band */
.fh-pilot { background:linear-gradient(135deg, ${C.maroon}, ${C.maroonDeep}); color:#FFF7EC; border-radius:22px; padding:44px; display:flex; gap:28px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
.fh-pilot h2 { color:#FFF7EC; font-size:clamp(26px,3.2vw,36px); max-width:20ch; }
.fh-pilot p { color:rgba(255,247,236,.76); font-size:15px; line-height:1.6; margin-top:12px; max-width:52ch; }
.fh-pilot .fh-btn { background:#FFF7EC; color:${C.maroonDeep}; }
.fh-pilot .fh-btn:hover { background:#fff; }

/* faq */
.fh-faq { margin-top:40px; border-top:1px solid ${C.line}; }
.fh-faq details { border-bottom:1px solid ${C.line}; }
.fh-faq summary { cursor:pointer; list-style:none; padding:22px 0; display:flex; justify-content:space-between; gap:20px; font-family:'Fraunces',Georgia,serif; font-size:18px; font-weight:600; }
.fh-faq summary::-webkit-details-marker { display:none; }
.fh-faq summary::after { content:'+'; color:${C.maroon}; font-size:22px; line-height:1; }
.fh-faq details[open] summary::after { content:'–'; }
.fh-faq p { font-size:15px; line-height:1.7; color:${C.body}; margin:0 0 22px; max-width:76ch; }

/* footer */
.fh-foot { background:${C.ink}; color:rgba(246,240,228,.6); padding:64px 0 28px; }
.fh-foot-grid { display:grid; grid-template-columns:1.4fr repeat(3,1fr); gap:32px; }
@media (max-width:800px){ .fh-foot-grid{ grid-template-columns:1fr 1fr; } }
.fh-foot h4 { color:#FBF6EC; font-size:11px; letter-spacing:.14em; text-transform:uppercase; font-family:'Inter',sans-serif; font-weight:700; margin-bottom:14px; }
.fh-foot a { display:block; color:rgba(246,240,228,.6); text-decoration:none; font-size:14px; padding:5px 0; transition:color .2s; }
.fh-foot a:hover { color:#FBF6EC; }
.fh-foot-bottom { border-top:1px solid rgba(246,240,228,.12); margin-top:40px; padding-top:20px; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; font-size:13px; }
.fh-mark { font-family:'Fraunces',Georgia,serif; font-size:22px; font-weight:600; color:#FBF6EC; }
.fh-mark span { color:#D8A0AA; }

/* reveal */
.fh-rv { opacity:0; transform:translateY(22px); transition:opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
.fh-rv.in { opacity:1; transform:none; }
@media (prefers-reduced-motion: reduce){ .fh-rv{ opacity:1; transform:none; transition:none; } }
`;

const PROOF = [
  ["Tally & Zoho", "native integrations"],
  ["Exact → Fuzzy → Rules", "reconciliation logic"],
  ["Source-linked", "every number, always"],
  ["India-hosted", "data residency"],
];

const PROBLEMS = [
  {
    t: "Document chasing",
    d: "\u201cWhere\u2019s the August bank statement?\u201d sent on WhatsApp, then email, then WhatsApp again. Across 30 clients, this is where a junior\u2019s week actually goes.",
  },
  {
    t: "Manual reconciliation, line by line",
    d: "Bank statement in one tab, books in another, GSTR-2B in a third. Hundreds of transactions matched by hand to find the handful that don\u2019t tie out.",
  },
  {
    t: "Rework after review",
    d: "Junior → Manager → Partner → back again. Nothing tells anyone why something was flagged, so the same mistakes repeat next month.",
  },
  {
    t: "Sign-off is a leap of faith",
    d: "By the time a P&L reaches the partner, it\u2019s a finished document with no visible trail back to the bank line it came from.",
  },
];

const MECHANISMS = [
  {
    icon: GitCompareArrows,
    t: "Auto-matched, not auto-hidden",
    d: "Exact, then fuzzy, then your firm\u2019s rules. What matches cleanly collapses out of the queue — and is still one click away when you want to look.",
  },
  {
    icon: FileSearch,
    t: "Reason-coded exceptions",
    d: "Every exception carries the rule that raised it — amount variance, date window, missing counterparty — never a bare flag and never \u201cAI decided\u201d.",
  },
  {
    icon: Users,
    t: "Structurally separate queues",
    d: "The junior\u2019s queue and the partner\u2019s queue are different objects, not the same list with a filter. Review and sign-off don\u2019t collide.",
  },
];

const PIPELINE = [
  { icon: FileSearch, t: "Extract", d: "Statements, invoices and GSTR files classified and read into structured lines.", plan: "All plans" },
  { icon: GitCompareArrows, t: "Recon", d: "Exact → fuzzy → rules matching against the ledger, with variance thresholds you set.", plan: "All plans" },
  { icon: MessageSquareText, t: "Narrate", d: "A plain-language monthly note that explains what moved, grounded in the matched lines.", plan: "All plans" },
  { icon: BellRing, t: "Chaser", d: "Automated document follow-ups per client, on the channel they actually reply on.", plan: "Professional+" },
  { icon: ScrollText, t: "Audit trail", d: "Who changed what, when, and which source line it came from — exportable.", plan: "All plans" },
  { icon: Users, t: "Unlimited users", d: "Your whole firm, every role. We never price you per seat.", plan: "All plans" },
];

const STEPS = [
  { t: "Connect your data", d: "Read-only links to Tally, Zoho and bank feeds. No migration, nothing switched off." },
  { t: "We extract & match", d: "Documents are classified and reconciled — exact first, then fuzzy, then your firm\u2019s rules." },
  { t: "Your team reviews exceptions", d: "Only genuine mismatches surface, each with a reason code and a link to source." },
  { t: "Client gets a clean MIS", d: "A source-linked pack and a plain-language narrative your client can actually read." },
];

const TRUST = [
  { icon: ShieldCheck, t: "No dummy numbers, ever", d: "If we don\u2019t have the data, the space stays empty. We never show a placeholder figure as if it were real." },
  { icon: Link2, t: "Every match is explainable", d: "Each matched or flagged line names the rule behind it. Never \u201cAI decided\u201d." },
  { icon: Lock, t: "Read-only, revocable access", d: "We read; we don\u2019t write to your ledger. Revoke any connection at any time." },
  { icon: ScrollText, t: "Full audit trail", d: "Every action logged and exportable, so a review can be reconstructed months later." },
  { icon: Server, t: "Hosted in India", d: "Your client data is stored on Indian infrastructure. Specific certifications published only once verified." },
  { icon: EyeOff, t: "No training on your data", d: "Your clients\u2019 books are never used to train shared models. Learning stays inside your firm." },
];

const PLANS = [
  {
    name: "Starter",
    price: "\u20B92,999",
    per: "/mo",
    clients: "15 client entities included",
    extra: "Extra client \u20B9149 (cap 25)",
    adds: ["Extract, Recon, Narrate", "Full audit trail", "Unlimited users"],
    cta: "Start with Starter",
  },
  {
    name: "Professional",
    price: "\u20B95,999",
    per: "/mo",
    clients: "40 client entities included",
    extra: "Extra client \u20B9119",
    adds: ["Everything in Starter", "Chaser automated follow-ups", "White-label client packs", "Priority processing"],
    cta: "Book a firm demo",
    popular: true,
  },
  {
    name: "Scale",
    price: "\u20B912,999",
    per: "/mo",
    clients: "100 client entities included",
    extra: "Extra client \u20B999 (no cap)",
    adds: ["Everything in Professional", "Multi-partner dashboards", "API access", "Dedicated success manager"],
    cta: "Talk to us",
  },
];

const COMPARE: Array<[string, string, string, string]> = [
  ["System of record", "Stays yours — we sit on top", "Yes, that\u2019s their job", "No"],
  ["Task & workflow tracking", "Exception queues by role", "No", "Yes"],
  ["Document intake & classification", "Automated, multi-format", "Manual entry", "Upload + tag only"],
  ["Reconciliation logic", "Exact → fuzzy → rules", "Manual matching", "None"],
  ["Structured review queue", "Junior / partner, separated", "No", "Task lists only"],
  ["Source-linked numbers", "Every figure, one click", "Drill-down within ledger", "No"],
];

const FAQS = [
  {
    q: "Do we have to switch off Tally or Zoho?",
    a: "No. FynHelp reads from them. Your ledger stays where it is and stays the system of record — we add the extraction, reconciliation and review layer on top of it.",
  },
  {
    q: "What does my team actually stop doing?",
    a: "Line-by-line matching of transactions that were always going to tie out, and chasing documents by hand. Your team keeps the judgement work: the exceptions, the treatment decisions and the sign-off.",
  },
  {
    q: "What counts as an \u201cactive client entity\u201d?",
    a: "One client entity is one set of books you process in a given month — a company, LLP or proprietorship with its own ledger. Entities you don\u2019t process that month don\u2019t count towards your plan.",
  },
  {
    q: "How is our client data kept safe?",
    a: "Connections are read-only and revocable at any time, data is hosted in India, and every action is written to an exportable audit trail. We publish specific certifications only once they are independently verified.",
  },
  {
    q: "Do you train AI models on our data?",
    a: "No. Your clients\u2019 books are never used to train shared or global models. Any pattern learning is scoped to your firm and to the individual client it came from.",
  },
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

      {/* HERO */}
      <section className="fh-hero">
        <div className="fh-wrap fh-hero-grid">
          <div>
            <Reveal>
              <span className="fh-eyebrow">Built for chartered accountants &amp; finance teams</span>
              <h1>
                Stop reviewing 400 transactions to find the <em>8 that matter.</em>
              </h1>
              <p className="fh-hero-sub">
                FynHelp sits on top of <b>Tally, Zoho</b> and your bank feeds — classifying documents,
                auto-matching what&rsquo;s obviously correct, and handing your team an exception-only queue for
                what isn&rsquo;t. <b>Every number is one click from its source.</b>
              </p>
              <div className="fh-hero-cta">
                <Link to="/waitlist" className="fh-btn fh-btn-primary">
                  Book a Firm Demo <ArrowRight size={17} />
                </Link>
                <a href="#the-fix" className="fh-btn fh-btn-ghost">
                  See how the review queue works
                </a>
              </div>
              <div className="fh-micro">
                <ShieldCheck size={15} style={{ color: C.maroon }} />
                No ledger migration. No data lock-in. Read-only access you can revoke anytime.
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="fh-panel">
              <div className="fh-panel-head">
                <span className="fh-panel-tag">August close · 393 transactions</span>
                <span className="fh-panel-tag" style={{ color: C.maroon }}>Before / After</span>
              </div>
              <div className="fh-split">
                <div className="fh-side">
                  <div className="fh-side-t">Today</div>
                  <div className="fh-msg">&ldquo;Sir, August bank statement pending 🙏&rdquo;</div>
                  <div className="fh-msg dim">&ldquo;Sent last week no?&rdquo;</div>
                  <div className="fh-msg dim">recon_aug_v4_FINAL.xlsx</div>
                  <div className="fh-msg dim">&ldquo;Which tab has GSTR-2B?&rdquo;</div>
                  <div className="fh-summary">
                    <b className="num">3 hrs</b> of manual matching, per client
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
                    Amount variance ₹4,120 · INV-2291
                  </div>
                  <div className="fh-row flag">
                    <span className="fh-dot" />
                    No counterparty match · UPI ₹18,000
                  </div>
                  <div className="fh-summary">
                    <b className="num">15 min</b> review, 2 decisions
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section className="fh-proof">
        <div className="fh-wrap">
          <div className="fh-proof-grid">
            {PROOF.map(([k, v], i) => (
              <Reveal key={k} delay={i * 70}>
                <div className="fh-proof-cell">
                  <div className="k">{k}</div>
                  <div className="v">{v}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="fh-sec">
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-eyebrow">Where the month actually goes</span>
            <h2 className="fh-h2">Four things quietly eat your firm&rsquo;s week.</h2>
          </Reveal>
          <div className="fh-grid fh-g2">
            {PROBLEMS.map((p, i) => (
              <Reveal key={p.t} delay={i * 80}>
                <div className="fh-card" style={{ height: "100%" }}>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="fh-closing">
              None of this is a Tally problem or a Zoho problem — it&rsquo;s a{" "}
              <span>nothing-sits-between-your-documents-and-your-ledger</span> problem.
            </p>
          </Reveal>
        </div>
      </section>

      {/* THE FIX */}
      <section className="fh-sec fh-dark" id="the-fix">
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-eyebrow">How FynHelp changes the month</span>
            <h2 className="fh-h2">A 3-hour MIS becomes a 15-minute sign-off.</h2>
            <p className="fh-lead">
              Classify → match (exact → fuzzy → rules) → route only genuine exceptions, with a reason code,
              not just a flag.
            </p>
          </Reveal>
          <div className="fh-grid fh-g3">
            {MECHANISMS.map((m, i) => (
              <Reveal key={m.t} delay={i * 80}>
                <div className="fh-card" style={{ height: "100%" }}>
                  <div className="fh-ico">
                    <m.icon size={18} />
                  </div>
                  <h3>{m.t}</h3>
                  <p>{m.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="fh-callout">
              <div className="big">400 → 8</div>
              <div className="txt">
                From roughly 400 transactions reviewed by hand to about 8 that need a decision. Your exact
                ratio depends on the client — this is the shape of the mechanism, not a guaranteed benchmark.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="fh-sec">
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-eyebrow">The pipeline</span>
            <h2 className="fh-h2">Extract → Recon → Narrate → Chaser.</h2>
            <p className="fh-lead">
              Four moving parts and two guarantees. The same vocabulary you&rsquo;ll see on the pricing table
              below — no second product, no renamed modules.
            </p>
          </Reveal>
          <div className="fh-grid fh-g3">
            {PIPELINE.map((p, i) => (
              <Reveal key={p.t} delay={i * 70}>
                <div className="fh-card" style={{ height: "100%" }}>
                  <div className="fh-ico">
                    <p.icon size={18} />
                  </div>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                  <span className={`fh-tag ${p.plan !== "All plans" ? "pro" : ""}`}>{p.plan}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="fh-sec" style={{ background: C.creamDeep }}>
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-eyebrow">How it works</span>
            <h2 className="fh-h2">Four steps from connection to a clean MIS.</h2>
          </Reveal>
          <div className="fh-steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} delay={i * 80}>
                <div className="fh-step">
                  <div className="n">STEP {String(i + 1).padStart(2, "0")}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="fh-sec">
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-eyebrow">Trust &amp; security</span>
            <h2 className="fh-h2">A checklist, not a sales pitch.</h2>
            <p className="fh-lead">
              These are the claims a firm will test in the first three minutes of a trial. So they&rsquo;re
              written the way they&rsquo;re engineered.
            </p>
          </Reveal>
          <div className="fh-grid fh-g3">
            {TRUST.map((t, i) => (
              <Reveal key={t.t} delay={i * 60}>
                <div className="fh-card" style={{ height: "100%" }}>
                  <div className="fh-ico">
                    <t.icon size={18} />
                  </div>
                  <h3>{t.t}</h3>
                  <p>{t.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="fh-sec" style={{ background: C.creamDeep }} id="pricing">
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-eyebrow">Pricing</span>
            <h2 className="fh-h2">Priced per client entity. Never per seat.</h2>
            <p className="fh-lead">Annual billing saves 15% on every plan.</p>
          </Reveal>
          <div className="fh-price-grid">
            {PLANS.map((p, i) => (
              <Reveal key={p.name} delay={i * 90}>
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
                      <Check size={16} style={{ color: C.maroon, flex: "0 0 auto" }} />
                      <b>{p.clients}</b>
                    </li>
                    <li>
                      <Check size={16} style={{ color: C.maroon, flex: "0 0 auto" }} />
                      {p.extra}
                    </li>
                    {p.adds.map((a) => (
                      <li key={a}>
                        <Check size={16} style={{ color: C.maroon, flex: "0 0 auto" }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                  <Link to="/waitlist" className={`fh-btn ${p.popular ? "fh-btn-primary" : "fh-btn-ghost"}`}>
                    {p.cta} <ArrowUpRight size={16} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="fh-lead" style={{ marginTop: 28 }}>
              Fewer than 3 client entities? The <b>Pilot program</b> is free — no card, no clock.
            </p>
          </Reveal>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="fh-sec">
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-eyebrow">Where we sit</span>
            <h2 className="fh-h2">We keep your ledger. We add the layer it doesn&rsquo;t have.</h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="fh-table-wrap">
              <table className="fh-table">
                <thead>
                  <tr>
                    <th />
                    <th className="us">FynHelp</th>
                    <th>Tally / Zoho Books</th>
                    <th>Jamku / Winman</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map(([row, us, ledger, pm]) => (
                    <tr key={row}>
                      <td style={{ color: C.ink, fontWeight: 600 }}>{row}</td>
                      <td className="us">{us}</td>
                      <td>
                        {ledger === "No" ? <XIcon size={15} style={{ verticalAlign: "-2px", opacity: 0.5 }} /> : null} {ledger}
                      </td>
                      <td>
                        {pm === "No" ? <Minus size={15} style={{ verticalAlign: "-2px", opacity: 0.5 }} /> : null} {pm}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PILOT BAND */}
      <section className="fh-sec" style={{ paddingTop: 0 }}>
        <div className="fh-wrap">
          <Reveal>
            <div className="fh-pilot">
              <div>
                <h2>Fewer than 3 clients? The Pilot program is free.</h2>
                <p>
                  The full pipeline for up to 3 client entities. No card, no clock. All we ask for is honest
                  feedback in exchange for early access.
                </p>
              </div>
              <Link to="/waitlist" className="fh-btn">
                Apply for the pilot <ArrowRight size={17} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SME ATTACH */}
      <section className="fh-sec" style={{ paddingTop: 0 }}>
        <div className="fh-wrap">
          <Reveal>
            <span className="fh-eyebrow">For your clients</span>
            <h2 className="fh-h2">Give your clients a founder-friendly window into their own numbers.</h2>
            <p className="fh-lead">
              A scoped share link off the work you already do — not a second product to sell.
            </p>
          </Reveal>
          <div className="fh-grid fh-g3">
            {[
              ["One sentence before any number", "Context first, figure second — so a founder knows what they're looking at."],
              ["Plain-language terms", "\u201cMoney you're owed\u201d, not \u201creceivables ageing bucket 3\u201d."],
              ["Straight answers, grounded in real books", "Every answer traces back to the same source lines your team signed off."],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 80}>
                <div className="fh-card" style={{ height: "100%" }}>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="fh-sec" style={{ background: C.creamDeep }} id="faq">
        <div className="fh-wrap" style={{ maxWidth: 900 }}>
          <Reveal>
            <span className="fh-eyebrow">FAQ</span>
            <h2 className="fh-h2">The five questions firms ask first.</h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="fh-faq">
              {FAQS.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="fh-sec fh-dark" style={{ textAlign: "center" }}>
        <div className="fh-wrap" style={{ maxWidth: 780 }}>
          <Reveal>
            <h2 className="fh-h2" style={{ margin: "0 auto", maxWidth: "22ch" }}>
              Be one of the first firms to run your monthly close through FynHelp.
            </h2>
            <p className="fh-lead" style={{ margin: "18px auto 0" }}>
              We&rsquo;re onboarding a small first cohort directly — firms managing 5 to 40+ client entities,
              set up by the founding team, not a self-serve signup form.
            </p>
            <div className="fh-hero-cta" style={{ justifyContent: "center" }}>
              <Link to="/waitlist" className="fh-btn fh-btn-primary">
                Book a Firm Demo <ArrowRight size={17} />
              </Link>
              <Link to="/ca-firms" className="fh-btn fh-btn-ghost" style={{ color: "#F6F0E4", borderColor: "rgba(246,240,228,.25)" }}>
                For CA firms
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="fh-foot">
        <div className="fh-wrap">
          <div className="fh-foot-grid">
            <div>
              <div className="fh-mark">
                Fyn<span>Help</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 12, color: "rgba(246,240,228,.6)" }}>
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
