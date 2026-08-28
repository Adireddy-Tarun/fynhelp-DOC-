import { useEffect, useState } from "react";
import {
  Check,
  AlertTriangle,
  Download,
  ScanLine,
  GitCompareArrows,
  MessageSquareText,
  PenLine,
  FileCheck2,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Hero visual — one real close cycle, run by six agents in
   sequence: Collect → Extract → Match → Chaser → Narrate →
   Sign-off. Full pass is 7 seconds, then holds and repeats.
   ───────────────────────────────────────────────────────── */

const ROWS = [
  { id: "HDFC · NEFT", party: "Meghna Textiles", amt: "₹4,12,000", ref: "INV-2288", ok: true },
  { id: "ICICI · UPI", party: "Suraj Enterprises", amt: "₹18,400", ref: "INV-2290", ok: true },
  { id: "HDFC · IMPS", party: "Blue Orbit Media", amt: "₹96,750", ref: "INV-2291", ok: true },
  { id: "Axis · NEFT", party: "Unmatched credit", amt: "₹4,120", ref: "amount variance", ok: false },
  { id: "HDFC · ACH", party: "Kalyani Logistics", amt: "₹2,08,900", ref: "INV-2294", ok: true },
];

/* timeline in ms — the full working pass is 7000ms */
const STAGES = [
  { key: "collect", label: "Collect", note: "HDFC · ICICI · Axis feeds", Icon: Download, at: [0, 1100] },
  { key: "extract", label: "Extract", note: "Reading refs, GST & TDS fields", Icon: ScanLine, at: [1100, 2400] },
  { key: "match", label: "Match", note: "Bank ↔ ledger · 1% tolerance", Icon: GitCompareArrows, at: [2400, 4100] },
  { key: "chaser", label: "Chaser", note: "Asking client for the missing bill", Icon: MessageSquareText, at: [4100, 5300] },
  { key: "narrate", label: "Narrate", note: "Writing the variance note", Icon: PenLine, at: [5300, 6200] },
  { key: "signoff", label: "Sign-off", note: "Packing 1 exception for partner", Icon: FileCheck2, at: [6200, 7000] },
] as const;

const CYCLE = 8600; // 7s of work + 1.6s hold

const FEEDS = [
  { n: "HDFC Bank", d: "Current · 4412" },
  { n: "ICICI Bank", d: "Current · 8890" },
  { n: "Axis Bank", d: "Escrow · 2210" },
];

const LOG = [
  { t: 300, s: "3 bank feeds connected · 5 new lines" },
  { t: 1500, s: "Refs read on 5 lines · 0 manual entry" },
  { t: 2900, s: "4 lines tied out to ledger" },
  { t: 3900, s: "1 variance held back · ₹4,120" },
  { t: 4700, s: "WhatsApp sent to Kalyani Logistics" },
  { t: 5100, s: "Client replied with the missing bill" },
  { t: 5800, s: "Reason code written · short receipt" },
  { t: 6600, s: "Exception pack queued for partner" },
];

const BARS = [38, 52, 44, 66, 58, 74, 63, 88, 71, 92];

const CSS = `
.hv { position:relative; margin:56px auto 0; max-width:1040px; }
.hv-glow { position:absolute; left:50%; top:-40px; width:min(780px,92%); height:220px; transform:translateX(-50%);
  background:radial-gradient(50% 60% at 50% 50%, rgba(226,103,63,.4), rgba(169,56,56,.15) 45%, transparent 72%);
  filter:blur(28px); pointer-events:none; }
.hv-shell { position:relative; border-radius:24px; background:#FFFDF9; border:1px solid rgba(23,18,8,.08);
  box-shadow:0 60px 120px -60px rgba(23,18,8,.55), 0 2px 0 rgba(255,255,255,.8) inset; overflow:hidden; text-align:left; }
.hv-top { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:13px 16px; border-bottom:1px solid rgba(23,18,8,.055); }
.hv-dots { display:flex; gap:6px; }
.hv-dots i { width:9px; height:9px; border-radius:50%; background:rgba(23,18,8,.12); display:block; }
.hv-dots i:first-child { background:rgba(226,103,63,.55); }
.hv-title { font-size:12px; font-weight:600; letter-spacing:-.01em; color:rgba(23,18,8,.72); }
.hv-live { display:inline-flex; align-items:center; gap:7px; font-size:10.5px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:#1F5A46; white-space:nowrap; }
.hv-live i { width:7px; height:7px; border-radius:50%; background:#1F5A46; animation:hv-beat 2s ease-in-out infinite; }
@keyframes hv-beat { 0%,100%{ transform:scale(1); opacity:1;} 50%{ transform:scale(1.45); opacity:.4;} }

/* agent rail */
.hv-rail { display:grid; grid-template-columns:repeat(6,1fr); gap:7px; padding:12px 14px; border-bottom:1px solid rgba(23,18,8,.055); background:rgba(23,18,8,.016); }
@media (max-width:900px){ .hv-rail{ grid-template-columns:repeat(3,1fr); } }
@media (max-width:520px){ .hv-rail{ grid-template-columns:repeat(2,1fr); } }
.hv-agent { position:relative; display:flex; align-items:center; gap:8px; padding:9px 9px; border-radius:13px; border:1px solid rgba(23,18,8,.07);
  background:#FFFDF9; overflow:hidden; transition:border-color .35s ease, box-shadow .45s cubic-bezier(.16,1,.3,1), transform .45s cubic-bezier(.16,1,.3,1); }
.hv-agent.on { border-color:rgba(226,103,63,.38); box-shadow:0 14px 30px -20px rgba(169,56,56,.9); transform:translateY(-2px); }
.hv-agent.done { border-color:rgba(31,90,70,.22); }
.hv-agent .ic { width:24px; height:24px; flex:0 0 auto; border-radius:8px; display:flex; align-items:center; justify-content:center;
  background:rgba(23,18,8,.06); color:rgba(23,18,8,.4); transition:background .35s ease, color .35s ease; }
.hv-agent.on .ic { background:#E2673F; color:#FFF6F1; }
.hv-agent.done .ic { background:rgba(31,90,70,.13); color:#1F5A46; }
.hv-agent .tx { min-width:0; }
.hv-agent .nm { display:block; font-size:11.5px; font-weight:600; color:#171208; letter-spacing:-.01em; }
.hv-agent .st { display:block; font-size:9.5px; color:rgba(23,18,8,.42); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.hv-agent .bar { position:absolute; left:0; bottom:0; height:2px; width:0; background:linear-gradient(90deg,#E2673F,#A93838); }
.hv-agent.on .bar { width:var(--p,0%); }
.hv-agent.done .bar { width:100%; background:rgba(31,90,70,.45); }
.hv-nowline { font-size:11px; color:rgba(23,18,8,.5); padding:0 16px 12px; }
.hv-nowline b { color:#171208; font-weight:600; }

.hv-body { display:grid; grid-template-columns:1.5fr 1fr; }
@media (max-width:880px){ .hv-body{ grid-template-columns:1fr; } }
.hv-left { padding:16px; }
.hv-right { padding:16px; border-left:1px solid rgba(23,18,8,.055); display:grid; gap:12px; align-content:start; }
@media (max-width:880px){ .hv-right{ border-left:none; border-top:1px solid rgba(23,18,8,.055); } }

.hv-lbl { font-size:9.5px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:rgba(23,18,8,.42); }

/* feeds */
.hv-feeds { display:flex; gap:7px; margin-top:10px; flex-wrap:wrap; }
.hv-feed { display:flex; align-items:center; gap:7px; padding:6px 10px; border-radius:999px; border:1px solid rgba(23,18,8,.08);
  background:rgba(23,18,8,.02); opacity:.42; transition:opacity .45s ease, border-color .45s ease, background .45s ease; }
.hv-feed.on { opacity:1; border-color:rgba(31,90,70,.24); background:rgba(31,90,70,.07); }
.hv-feed i { width:6px; height:6px; border-radius:50%; background:rgba(23,18,8,.2); display:block; transition:background .4s ease; }
.hv-feed.on i { background:#1F5A46; }
.hv-feed span { font-size:10.5px; color:rgba(23,18,8,.7); }
.hv-feed span em { font-style:normal; color:rgba(23,18,8,.4); }

.hv-rows { display:grid; gap:7px; margin-top:12px; }
.hv-row { position:relative; display:flex; align-items:center; gap:10px; padding:9px 11px; border-radius:12px; font-variant-numeric:tabular-nums;
  background:rgba(23,18,8,.032); border:1px solid transparent; opacity:0; transform:translateY(8px);
  transition:opacity .45s cubic-bezier(.16,1,.3,1), transform .45s cubic-bezier(.16,1,.3,1), background .4s ease, border-color .4s ease; }
.hv-row.in { opacity:1; transform:none; }
.hv-row.scan::after { content:""; position:absolute; inset:0; border-radius:12px; pointer-events:none; overflow:hidden;
  background:linear-gradient(90deg, transparent, rgba(226,103,63,.14), transparent); animation:hv-scan .7s ease-out both; }
@keyframes hv-scan { from{ transform:translateX(-100%);} to{ transform:translateX(100%);} }
.hv-row.matched { background:rgba(31,90,70,.085); border-color:rgba(31,90,70,.16); }
.hv-row.flag { background:rgba(226,103,63,.11); border-color:rgba(226,103,63,.26); }
.hv-row.cleared { background:rgba(31,90,70,.085); border-color:rgba(31,90,70,.16); }
.hv-tick { width:19px; height:19px; border-radius:50%; flex:0 0 auto; display:flex; align-items:center; justify-content:center;
  background:rgba(23,18,8,.08); color:transparent; transition:background .35s ease, color .35s ease, transform .4s cubic-bezier(.16,1,.3,1); }
.hv-row.matched .hv-tick, .hv-row.cleared .hv-tick { background:#1F5A46; color:#EAF7F1; transform:scale(1.05); }
.hv-row.flag .hv-tick { background:#E2673F; color:#2A0F06; }
.hv-src { font-size:10.5px; color:rgba(23,18,8,.4); width:86px; flex:0 0 auto; }
.hv-party { font-size:12.5px; color:rgba(23,18,8,.82); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.hv-amt { font-size:12.5px; font-weight:600; color:#171208; }
.hv-ref { font-size:10.5px; color:rgba(23,18,8,.45); width:112px; text-align:right; flex:0 0 auto; transition:opacity .35s ease; }
.hv-ref.hide { opacity:0; }
.hv-row.flag .hv-ref { color:#B8401F; font-weight:600; }
@media (max-width:640px){ .hv-src{ display:none; } .hv-ref{ width:auto; } }

/* chaser thread */
.hv-thread { margin-top:11px; border:1px solid rgba(23,18,8,.07); border-radius:14px; padding:11px; background:rgba(23,18,8,.018);
  opacity:0; transform:translateY(8px); transition:opacity .5s ease, transform .5s cubic-bezier(.16,1,.3,1); }
.hv-thread.on { opacity:1; transform:none; }
.hv-msg { display:flex; gap:8px; margin-top:8px; opacity:0; transform:translateY(6px); transition:opacity .4s ease, transform .4s cubic-bezier(.16,1,.3,1); }
.hv-msg.on { opacity:1; transform:none; }
.hv-msg .who { font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:rgba(23,18,8,.38); width:58px; flex:0 0 auto; padding-top:3px; }
.hv-msg .bub { font-size:11.5px; line-height:1.45; color:rgba(23,18,8,.78); background:#FFFDF9; border:1px solid rgba(23,18,8,.07); border-radius:11px; padding:7px 10px; }
.hv-msg.them .bub { background:rgba(31,90,70,.07); border-color:rgba(31,90,70,.16); color:#17452F; }
.hv-typing { display:inline-flex; gap:4px; align-items:center; padding:3px 0; }
.hv-typing i { width:5px; height:5px; border-radius:50%; background:rgba(23,18,8,.3); animation:hv-dot 1s ease-in-out infinite; }
.hv-typing i:nth-child(2){ animation-delay:.15s } .hv-typing i:nth-child(3){ animation-delay:.3s }
@keyframes hv-dot { 0%,100%{ transform:translateY(0); opacity:.35 } 50%{ transform:translateY(-3px); opacity:1 } }

.hv-foot { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:13px; padding-top:11px; border-top:1px dashed rgba(23,18,8,.1); flex-wrap:wrap; }
.hv-count { font-size:12px; color:rgba(23,18,8,.55); font-variant-numeric:tabular-nums; }
.hv-count b { font-size:19px; font-weight:700; letter-spacing:-.04em; color:#171208; margin-right:5px; }
.hv-note { font-size:11px; color:rgba(23,18,8,.5); }

.hv-stat { border:1px solid rgba(23,18,8,.055); border-radius:16px; padding:13px; }
.hv-stat .v { font-size:25px; font-weight:700; letter-spacing:-.045em; margin-top:4px; font-variant-numeric:tabular-nums; }
.hv-bars { display:flex; align-items:flex-end; gap:5px; height:58px; margin-top:12px; }
.hv-bars span { flex:1; border-radius:5px 5px 2px 2px; background:linear-gradient(180deg,#5C1216,rgba(92,18,22,.18));
  transform-origin:bottom; animation:hv-rise 1s cubic-bezier(.16,1,.3,1) both; }
@keyframes hv-rise { from{ transform:scaleY(.05); opacity:.2;} to{ transform:none; opacity:1;} }
.hv-prog { height:7px; border-radius:99px; background:rgba(23,18,8,.07); margin-top:12px; overflow:hidden; }
.hv-prog i { display:block; height:100%; border-radius:99px; background:linear-gradient(90deg,#E2673F,#A93838); transition:width .3s linear; }
.hv-chips { display:flex; gap:6px; flex-wrap:wrap; margin-top:11px; }
.hv-chip { font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:5px 9px; border-radius:999px; background:rgba(23,18,8,.05); color:rgba(23,18,8,.5); transition:background .4s ease, color .4s ease; }
.hv-chip.ok { background:rgba(31,90,70,.12); color:#1F5A46; }

.hv-log { display:grid; gap:7px; margin-top:10px; }
.hv-log li { list-style:none; display:flex; gap:8px; align-items:flex-start; font-size:11px; line-height:1.4; color:rgba(23,18,8,.6);
  opacity:0; transform:translateY(5px); transition:opacity .45s ease, transform .45s cubic-bezier(.16,1,.3,1); }
.hv-log li.on { opacity:1; transform:none; }
.hv-log li i { width:5px; height:5px; border-radius:50%; background:rgba(31,90,70,.55); margin-top:6px; flex:0 0 auto; }
@media (prefers-reduced-motion: reduce){ .hv *{ animation:none !important; transition:none !important; } .hv-row,.hv-log li,.hv-msg,.hv-thread{ opacity:1; transform:none; } }
`;

const seg = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));

export default function HeroVisual() {
  const [t, setT] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start = performance.now();
    const loop = (now: number) => {
      const e = now - start;
      if (e > CYCLE) start = now;
      setT(Math.min(e, CYCLE));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const prog = STAGES.map((s) => seg(t, s.at[0], s.at[1]));
  const active = STAGES.findIndex((s) => t < s.at[1]);
  const stageIdx = active === -1 ? STAGES.length : active;

  const shown = Math.floor(prog[0] * ROWS.length + 0.0001);
  const read = Math.floor(prog[1] * ROWS.length + 0.0001);
  const done = Math.floor(prog[2] * ROWS.length + 0.0001);

  const chaseSent = t > 4500;
  const chaseTyping = t > 4750 && t < 5050;
  const chaseReplied = t > 5050;
  const cleared = t > 5900; // variance resolved after the bill arrives

  const matchedNow = ROWS.slice(0, done).filter((r) => r.ok).length + (cleared ? 1 : 0);
  const counter = 389 + matchedNow;
  const flagged = cleared ? 0 : ROWS.slice(0, done).filter((r) => !r.ok).length;
  const readiness = Math.round(
    58 + 42 * (0.08 * prog[0] + 0.14 * prog[1] + 0.4 * prog[2] + 0.16 * prog[3] + 0.12 * prog[4] + 0.1 * prog[5]),
  );

  return (
    <div className="hv">
      <style>{CSS}</style>
      <div className="hv-glow" aria-hidden />
      <div className="hv-shell">
        <div className="hv-top">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="hv-dots">
              <i />
              <i />
              <i />
            </span>
            <span className="hv-title">August close · Sharma &amp; Co · 38 entities</span>
          </div>
          <span className="hv-live">
            <i /> {stageIdx >= STAGES.length ? "Ready for review" : "Running"}
          </span>
        </div>

        <div className="hv-rail" aria-hidden>
          {STAGES.map((a, i) => (
            <div
              key={a.key}
              className={`hv-agent ${stageIdx === i ? "on" : ""} ${stageIdx > i ? "done" : ""}`}
              style={{ ["--p" as string]: `${Math.round(prog[i] * 100)}%` }}
            >
              <span className="ic">
                {stageIdx > i ? <Check size={13} strokeWidth={3} /> : <a.Icon size={13} strokeWidth={2.2} />}
              </span>
              <span className="tx">
                <span className="nm">{a.label}</span>
                <span className="st">{stageIdx > i ? "Done" : stageIdx === i ? "Working" : "Queued"}</span>
              </span>
              <span className="bar" />
            </div>
          ))}
        </div>
        <div className="hv-nowline">
          <b>{STAGES[Math.min(stageIdx, STAGES.length - 1)].label}</b> ·{" "}
          {stageIdx >= STAGES.length ? "Close pack ready — 1 note for the partner" : STAGES[stageIdx].note}
        </div>

        <div className="hv-body">
          <div className="hv-left">
            <div className="hv-lbl">Live bank ↔ ledger queue</div>
            <div className="hv-feeds">
              {FEEDS.map((f, i) => (
                <span key={f.n} className={`hv-feed ${prog[0] > (i + 0.4) / FEEDS.length ? "on" : ""}`}>
                  <i />
                  <span>
                    {f.n} <em>{f.d}</em>
                  </span>
                </span>
              ))}
            </div>
            <div className="hv-rows">
              {ROWS.map((r, i) => {
                const isIn = i < shown;
                const isRead = i < read;
                const isDone = i < done;
                const state = !isDone ? "" : r.ok ? "matched" : cleared ? "cleared" : "flag";
                return (
                  <div
                    key={r.ref}
                    className={`hv-row ${isIn ? "in" : ""} ${isRead && !isDone ? "scan" : ""} ${state}`}
                  >
                    <span className="hv-tick">
                      {r.ok || cleared ? (
                        <Check size={11} strokeWidth={3} />
                      ) : (
                        <AlertTriangle size={11} strokeWidth={3} />
                      )}
                    </span>
                    <span className="hv-src">{r.id}</span>
                    <span className="hv-party">{!r.ok && cleared ? "Kalyani Logistics · part receipt" : r.party}</span>
                    <span className="hv-amt">{r.amt}</span>
                    <span className={`hv-ref ${isRead ? "" : "hide"}`}>
                      {!r.ok && cleared ? "INV-2294 · cleared" : r.ref}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={`hv-thread ${t > 4300 ? "on" : ""}`}>
              <div className="hv-lbl">Chaser · WhatsApp to Kalyani Logistics</div>
              <div className={`hv-msg ${chaseSent ? "on" : ""}`}>
                <span className="who">Fyn</span>
                <span className="bub">₹4,120 credit on 26 Aug has no bill against INV-2294. Can you share it?</span>
              </div>
              <div className={`hv-msg them ${chaseTyping || chaseReplied ? "on" : ""}`}>
                <span className="who">Client</span>
                <span className="bub">
                  {chaseReplied ? (
                    "Sharing now — it was a part receipt, balance next week."
                  ) : (
                    <span className="hv-typing">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="hv-foot">
              <div className="hv-count">
                <b>{counter.toLocaleString("en-IN")}</b> auto-matched · {flagged} open
              </div>
              <span className="hv-note">
                {stageIdx >= 4 ? "Every exception carries its reason code" : "What ties out never reaches a human"}
              </span>
            </div>
          </div>

          <div className="hv-right">
            <div className="hv-stat">
              <div className="hv-lbl">Close readiness</div>
              <div className="v">{readiness}%</div>
              <div className="hv-prog">
                <i style={{ width: `${readiness}%` }} />
              </div>
              <div className="hv-chips">
                <span className={`hv-chip ${stageIdx > 0 ? "ok" : ""}`}>Bank fed</span>
                <span className={`hv-chip ${stageIdx > 1 ? "ok" : ""}`}>GSTR-2B in</span>
                <span className={`hv-chip ${stageIdx > 3 ? "ok" : ""}`}>Bills chased</span>
                <span className={`hv-chip ${stageIdx >= STAGES.length ? "ok" : ""}`}>Partner review</span>
              </div>
            </div>

            <div className="hv-stat">
              <div className="hv-lbl">Agent activity</div>
              <ul className="hv-log">
                {LOG.map((l) => (
                  <li key={l.s} className={t > l.t ? "on" : ""}>
                    <i />
                    <span>{l.s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hv-stat">
              <div className="hv-lbl">Transactions reconciled</div>
              <div className="v">{(124875 + matchedNow).toLocaleString("en-IN")}</div>
              <div className="hv-bars">
                {BARS.map((h, i) => (
                  <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 70}ms` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
