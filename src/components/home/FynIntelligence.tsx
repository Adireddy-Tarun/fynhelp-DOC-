import { useEffect, useState } from "react";
import { FileSearch, GitCompareArrows, PenLine, Send } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Fyn Intelligence — one glow system, four agent states.
   Apple-Intelligence-style continuous gradient material,
   recoloured per agent in FynHelp's cream/maroon/gold palette.
   ───────────────────────────────────────────────────────── */

const MAROON = "#7C1D2E";
const GOLD = "#A9812F";
const BLUSH = "#F3E2DD";
const INK = "#2B161A";

type Agent = {
  id: string;
  n: string;
  icon: typeof FileSearch;
  from: string;
  to: string;
  desc: string;
  states: { k: string; label: string }[];
};

const AGENTS: Agent[] = [
  {
    id: "extract",
    n: "Extract",
    icon: FileSearch,
    from: GOLD,
    to: BLUSH,
    desc: "Documents classified, read and lifted into structured lines — amount, date, GSTIN, counterparty.",
    states: [
      { k: "Idle", label: "Waiting for documents" },
      { k: "Working", label: "Reading INV-4515.pdf…" },
      { k: "Done", label: "Extracted — 3 fields, 98% confidence" },
      { k: "Check", label: "Extracted — 2 fields need a quick check" },
    ],
  },
  {
    id: "recon",
    n: "Recon",
    icon: GitCompareArrows,
    from: MAROON,
    to: GOLD,
    desc: "Bank lines drift toward ledger lines and lock. What doesn't lock stays visible — a workflow step, not a failure.",
    states: [
      { k: "Idle", label: "Ready to reconcile" },
      { k: "Working", label: "Matching 423 transactions — exact pass…" },
      { k: "Match", label: "Matched — exact reference number" },
      { k: "Exception", label: "Needs review — amount mismatch" },
    ],
  },
  {
    id: "narrate",
    n: "Narrate",
    icon: PenLine,
    from: BLUSH,
    to: INK,
    desc: "A line of narration writes itself out, then clips its source document to the end. Slow, deliberate, reviewable.",
    states: [
      { k: "Idle", label: "Ready to draft" },
      { k: "Working", label: "Drafting narration for GSTR-3B adjustment…" },
      { k: "Done", label: "Drafted — source attached, awaiting your review" },
      { k: "Approved", label: "Approved by partner" },
    ],
  },
  {
    id: "chaser",
    n: "Chaser",
    icon: Send,
    from: GOLD,
    to: MAROON,
    desc: "A quiet, polite nudge that sends and fades. If something's still missing, it pulses once more — never in red.",
    states: [
      { k: "Idle", label: "No follow-ups due" },
      { k: "Sent", label: "Reminder sent — Aug bank statement" },
      { k: "Escalated", label: "Following up again — 3 days overdue" },
      { k: "Resolved", label: "Received — closing this item" },
    ],
  },
];

const CSS = `
.fyn-int { position:relative; }
@keyframes fyn-swirl { to { transform:rotate(360deg); } }
@keyframes fyn-breathe { 0%,100% { opacity:.45; } 50% { opacity:.9; } }
@keyframes fyn-scan { 0% { top:8%; opacity:0; } 12% { opacity:1; } 88% { opacity:1; } 100% { top:92%; opacity:0; } }
@keyframes fyn-flow { 0% { background-position:0% 50%; } 100% { background-position:200% 50%; } }

.fyn-agent { position:relative; border-radius:20px; padding:1.25px; overflow:hidden; height:100%; }
.fyn-agent::before {
  content:''; position:absolute; inset:-60%; z-index:0;
  background:conic-gradient(from 0deg, transparent 0%, var(--g1) 18%, var(--g2) 34%, transparent 52%, var(--g1) 74%, transparent 100%);
  animation:fyn-swirl 14s linear infinite, fyn-breathe 6s ease-in-out infinite;
  filter:blur(6px);
}
.fyn-agent:hover::before { animation-duration:3.4s, 2.2s; filter:blur(3px); }
.fyn-agent-in {
  position:relative; z-index:1; height:100%; border-radius:19px;
  background:linear-gradient(180deg, rgba(255,253,248,.06), rgba(255,253,248,.02));
  backdrop-filter:blur(14px);
  border:1px solid rgba(246,239,226,.08);
  padding:26px 24px 22px;
  display:flex; flex-direction:column; gap:14px;
}
.fyn-orb {
  width:46px; height:46px; border-radius:14px; position:relative;
  display:flex; align-items:center; justify-content:center; color:#FBF6EC; flex:0 0 auto;
  background:linear-gradient(135deg, var(--g1), var(--g2));
  box-shadow:0 0 0 1px rgba(246,239,226,.12), 0 10px 30px -12px var(--g1);
}
.fyn-orb::after {
  content:''; position:absolute; inset:-7px; border-radius:20px; z-index:-1;
  background:radial-gradient(closest-side, var(--g1), transparent 72%);
  opacity:.55; filter:blur(10px); animation:fyn-breathe 5s ease-in-out infinite;
}
.fyn-agent h3 { font-size:20px; color:#FBF6EC; margin:0; }
.fyn-agent p.d { font-size:13.5px; line-height:1.7; color:rgba(246,239,226,.58); margin:0; }

.fyn-stage { position:relative; height:76px; border-radius:12px; overflow:hidden; margin-top:auto;
  background:linear-gradient(180deg, rgba(246,239,226,.05), rgba(246,239,226,.02));
  border:1px solid rgba(246,239,226,.07); }
.fyn-scanline { position:absolute; left:10%; right:10%; height:1px; background:linear-gradient(90deg, transparent, var(--g1), transparent); animation:fyn-scan 2.8s ease-in-out infinite; }
.fyn-state { position:absolute; left:14px; right:14px; bottom:12px; font-size:12px; letter-spacing:.01em; color:rgba(246,239,226,.82); }
.fyn-state .k { display:inline-block; font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--g2); margin-right:8px; }
.fyn-state.sw { animation:fyn-fade .5s ease both; }
@keyframes fyn-fade { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }

.fyn-pipe { margin-top:44px; border-radius:18px; padding:26px 22px; border:1px solid rgba(246,239,226,.09);
  background:linear-gradient(180deg, rgba(246,239,226,.05), rgba(246,239,226,.015)); }
.fyn-pipe-bar { position:relative; height:10px; border-radius:999px; overflow:hidden;
  background:linear-gradient(90deg, ${GOLD}, ${BLUSH}, ${MAROON}, ${GOLD}, ${MAROON}, ${GOLD});
  background-size:200% 100%; animation:fyn-flow 9s linear infinite; box-shadow:0 0 34px -6px rgba(169,129,47,.6); }
.fyn-pipe-labels { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-top:16px; }
.fyn-pipe-labels div { font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:rgba(246,239,226,.55); }
.fyn-pipe-labels div b { display:block; font-size:13px; letter-spacing:0; text-transform:none; color:#FBF6EC; font-weight:500; margin-bottom:3px; }
@media (max-width:640px){ .fyn-pipe-labels { grid-template-columns:repeat(2,1fr); } }
`;

function AgentCard({ a, offset }: { a: Agent; offset: number }) {
  const [i, setI] = useState(offset % a.states.length);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % a.states.length), 2600 + offset * 240);
    return () => clearInterval(t);
  }, [a.states.length, offset]);
  const s = a.states[i];
  const Icon = a.icon;
  return (
    <div className="fyn-agent" style={{ ["--g1" as string]: a.from, ["--g2" as string]: a.to }}>
      <div className="fyn-agent-in">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="fyn-orb">
            <Icon size={19} />
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(246,239,226,.4)" }}>
              {`0${AGENTS.indexOf(a) + 1}`}
            </div>
            <h3>{a.n}</h3>
          </div>
        </div>
        <p className="d">{a.desc}</p>
        <div className="fyn-stage">
          <span className="fyn-scanline" />
          <div className="fyn-state sw" key={s.k}>
            <span className="k">{s.k}</span>
            {s.label}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FynIntelligence() {
  return (
    <section
      className="fh-sec fh-dark fyn-int"
      id="fyn-intelligence"
      style={{ background: "radial-gradient(90% 120% at 80% 0%, #33141B, #150C05)", color: "#F6EFE2" }}
    >
      <style>{CSS}</style>
      <div className="fh-wrap">
        <span className="fh-kicker">Fyn Intelligence</span>
        <h2 className="fh-h2" style={{ color: "#FDF8EF" }}>
          One pipeline, four jobs
        </h2>
        <p className="fh-lead">
          The same material moving left to right — glowing gold as it reads a document, turning maroon as it
          matches, settling into ink as it drafts a narration a partner can sign.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: 18,
            marginTop: 34,
          }}
        >
          {AGENTS.map((a, i) => (
            <AgentCard key={a.id} a={a} offset={i} />
          ))}
        </div>

        <div className="fyn-pipe">
          <div className="fyn-pipe-bar" />
          <div className="fyn-pipe-labels">
            <div><b>Extract</b>raw material in</div>
            <div><b>Recon</b>lines lock together</div>
            <div><b>Narrate</b>drafted with source</div>
            <div><b>Chaser</b>only if something&rsquo;s missing</div>
          </div>
        </div>
      </div>
    </section>
  );
}
