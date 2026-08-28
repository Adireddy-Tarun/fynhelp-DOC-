import { useEffect, useRef, useState } from "react";
import { Check, AlertTriangle, Sparkles } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Hero visual — a live reconciliation queue.
   Rows stream in, tie out, and the counter climbs. One row
   lands flagged with its reason code. Editorial, not flashy.
   ───────────────────────────────────────────────────────── */

const ROWS = [
  { id: "HDFC · NEFT", party: "Meghna Textiles", amt: "₹4,12,000", ref: "INV-2288", ok: true },
  { id: "ICICI · UPI", party: "Suraj Enterprises", amt: "₹18,400", ref: "INV-2290", ok: true },
  { id: "HDFC · IMPS", party: "Blue Orbit Media", amt: "₹96,750", ref: "INV-2291", ok: true },
  { id: "Axis · NEFT", party: "Unmatched credit", amt: "₹4,120", ref: "amount variance", ok: false },
  { id: "HDFC · ACH", party: "Kalyani Logistics", amt: "₹2,08,900", ref: "INV-2294", ok: true },
];

const BARS = [38, 52, 44, 66, 58, 74, 63, 88, 71, 92];

const CSS = `
.hv { position:relative; margin:56px auto 0; max-width:1000px; }
.hv-glow { position:absolute; left:50%; top:-40px; width:min(760px,92%); height:210px; transform:translateX(-50%);
  background:radial-gradient(50% 60% at 50% 50%, rgba(226,103,63,.42), rgba(169,56,56,.16) 45%, transparent 72%);
  filter:blur(26px); pointer-events:none; }
.hv-shell { position:relative; border-radius:22px; background:#FFFDF9; border:1px solid rgba(23,18,8,.09);
  box-shadow:0 60px 110px -60px rgba(23,18,8,.6), 0 2px 0 rgba(255,255,255,.7) inset; overflow:hidden; text-align:left; }
.hv-top { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:13px 16px; border-bottom:1px solid rgba(23,18,8,.055); }
.hv-dots { display:flex; gap:6px; }
.hv-dots i { width:9px; height:9px; border-radius:50%; background:rgba(23,18,8,.12); display:block; }
.hv-dots i:first-child { background:rgba(226,103,63,.55); }
.hv-title { font-size:12px; font-weight:600; letter-spacing:-.01em; color:rgba(23,18,8,.72); }
.hv-live { display:inline-flex; align-items:center; gap:7px; font-size:10.5px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:#1F5A46; }
.hv-live i { width:7px; height:7px; border-radius:50%; background:#1F5A46; animation:hv-beat 1.8s ease-in-out infinite; }
@keyframes hv-beat { 0%,100%{ transform:scale(1); opacity:1;} 50%{ transform:scale(1.5); opacity:.45;} }

.hv-body { display:grid; grid-template-columns:1.45fr 1fr; }
@media (max-width:820px){ .hv-body{ grid-template-columns:1fr; } }
.hv-left { padding:16px; }
.hv-right { padding:16px; border-left:1px solid rgba(23,18,8,.055); display:grid; gap:12px; align-content:start; }
@media (max-width:820px){ .hv-right{ border-left:none; border-top:1px solid rgba(23,18,8,.055); } }

.hv-lbl { font-size:9.5px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:rgba(23,18,8,.42); }
.hv-rows { display:grid; gap:7px; margin-top:11px; }
.hv-row { display:flex; align-items:center; gap:10px; padding:9px 11px; border-radius:12px; font-variant-numeric:tabular-nums;
  background:rgba(23,18,8,.035); border:1px solid transparent; opacity:0; transform:translateY(9px);
  transition:opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1), background .5s ease, border-color .5s ease; }
.hv-row.in { opacity:1; transform:none; }
.hv-row.matched { background:rgba(31,90,70,.09); border-color:rgba(31,90,70,.16); }
.hv-row.flag { background:rgba(226,103,63,.12); border-color:rgba(226,103,63,.28); }
.hv-tick { width:19px; height:19px; border-radius:50%; flex:0 0 auto; display:flex; align-items:center; justify-content:center;
  background:rgba(23,18,8,.09); color:transparent; transition:background .45s ease, color .45s ease, transform .45s cubic-bezier(.16,1,.3,1); }
.hv-row.matched .hv-tick { background:#1F5A46; color:#EAF7F1; transform:scale(1.06); }
.hv-row.flag .hv-tick { background:#E2673F; color:#2A0F06; }
.hv-src { font-size:10.5px; color:rgba(23,18,8,.42); width:86px; flex:0 0 auto; }
.hv-party { font-size:12.5px; color:rgba(23,18,8,.82); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.hv-amt { font-size:12.5px; font-weight:600; color:#171208; }
.hv-ref { font-size:10.5px; color:rgba(23,18,8,.45); width:104px; text-align:right; flex:0 0 auto; }
.hv-row.flag .hv-ref { color:#B8401F; font-weight:600; }
@media (max-width:640px){ .hv-src{ display:none; } .hv-ref{ width:auto; } }

.hv-foot { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:13px; padding-top:11px; border-top:1px dashed rgba(23,18,8,.1); flex-wrap:wrap; }
.hv-count { font-size:12px; color:rgba(23,18,8,.55); font-variant-numeric:tabular-nums; }
.hv-count b { font-size:19px; font-weight:700; letter-spacing:-.04em; color:#171208; margin-right:5px; }
.hv-note { display:inline-flex; align-items:center; gap:6px; font-size:11px; color:rgba(23,18,8,.5); }

.hv-stat { border:1px solid rgba(23,18,8,.055); border-radius:16px; padding:13px; }
.hv-stat .v { font-size:25px; font-weight:700; letter-spacing:-.045em; margin-top:4px; font-variant-numeric:tabular-nums; }
.hv-bars { display:flex; align-items:flex-end; gap:5px; height:64px; margin-top:12px; }
.hv-bars span { flex:1; border-radius:5px 5px 2px 2px; background:linear-gradient(180deg,#5C1216,rgba(92,18,22,.2));
  transform-origin:bottom; animation:hv-rise .9s cubic-bezier(.16,1,.3,1) both; }
@keyframes hv-rise { from{ transform:scaleY(.05); opacity:.2;} to{ transform:none; opacity:1;} }
.hv-prog { height:7px; border-radius:99px; background:rgba(23,18,8,.08); margin-top:12px; overflow:hidden; }
.hv-prog i { display:block; height:100%; border-radius:99px; background:linear-gradient(90deg,#E2673F,#A93838); transition:width 1.1s cubic-bezier(.16,1,.3,1); }
.hv-chips { display:flex; gap:6px; flex-wrap:wrap; margin-top:11px; }
.hv-chip { font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:5px 9px; border-radius:999px; background:rgba(23,18,8,.05); color:rgba(23,18,8,.55); }
@media (prefers-reduced-motion: reduce){ .hv *{ animation:none !important; transition:none !important; } .hv-row{ opacity:1; transform:none; } }
`;

export default function HeroVisual() {
  const [step, setStep] = useState(0);
  const [matched, setMatched] = useState(389);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const run = () => {
      let i = 0;
      const tick = () => {
        if (!alive) return;
        i += 1;
        setStep(i);
        if (i <= ROWS.length && ROWS[i - 1]?.ok) setMatched((m) => m + 1);
        if (i <= ROWS.length) window.setTimeout(tick, 700);
        else
          window.setTimeout(() => {
            if (!alive) return;
            setStep(0);
            setMatched(389);
            window.setTimeout(run, 600);
          }, 3400);
      };
      window.setTimeout(tick, 500);
    };
    run();
    return () => {
      alive = false;
    };
  }, []);

  const readiness = Math.min(100, 62 + step * 8);

  return (
    <div className="hv" ref={ref}>
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
            <i /> Reconciling
          </span>
        </div>

        <div className="hv-body">
          <div className="hv-left">
            <div className="hv-lbl">Live bank ↔ ledger queue</div>
            <div className="hv-rows">
              {ROWS.map((r, i) => (
                <div
                  key={r.ref}
                  className={`hv-row ${step > i ? "in " + (r.ok ? "matched" : "flag") : ""}`}
                >
                  <span className="hv-tick">
                    {r.ok ? <Check size={11} strokeWidth={3} /> : <AlertTriangle size={11} strokeWidth={3} />}
                  </span>
                  <span className="hv-src">{r.id}</span>
                  <span className="hv-party">{r.party}</span>
                  <span className="hv-amt">{r.amt}</span>
                  <span className="hv-ref">{r.ref}</span>
                </div>
              ))}
            </div>
            <div className="hv-foot">
              <div className="hv-count">
                <b>{matched.toLocaleString("en-IN")}</b> auto-matched · 2 flagged
              </div>
              <span className="hv-note">
                <Sparkles size={12} /> What ties out never reaches a human
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
                <span className="hv-chip">Bank fed</span>
                <span className="hv-chip">GSTR-2B in</span>
                <span className="hv-chip">TDS pending</span>
              </div>
            </div>
            <div className="hv-stat">
              <div className="hv-lbl">Transactions reconciled</div>
              <div className="v">1,24,880</div>
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
