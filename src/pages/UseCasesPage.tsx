import { Link } from "@/lib/router-compat";
import { ArrowRight, Check } from "lucide-react";
import SiteShell, { PageHero, Section, CtaBand, Reveal } from "@/components/site/SiteShell";
import { AGENTS } from "@/components/site/agents";
import { C } from "@/components/site/siteTheme";

const SEGMENTS = [
  {
    t: "Manufacturing and trading",
    d: "Working capital is the whole game. Purchase heavy books, GST credit tied up with slow filing vendors, and a cash cycle that stretches without warning.",
    wins: ["Input credit recovered every cycle", "Vendor payment sequencing", "Inventory funded by real cash, not hope"],
  },
  {
    t: "Services and agencies",
    d: "Revenue is people. Utilisation, collections and a small number of large clients decide whether a good month is actually a good month.",
    wins: ["Concentration risk visible early", "DSO tracked per client", "Cost per delivery team"],
  },
  {
    t: "D2C and marketplace sellers",
    d: "Settlement files, fee deductions and returns make reported revenue and banked revenue two different numbers every single week.",
    wins: ["Settlement reconciliation", "True contribution per channel", "Fee leakage flagged"],
  },
  {
    t: "CA and accounting practices",
    d: "Multiple clients, one calendar, and a team where review capacity is the constraint. The work is not harder, it is repeated forty times.",
    wins: ["Firm wide compliance calendar", "Bulk reconciliation with review queue", "Branded client reporting"],
  },
];

export default function UseCasesPage() {
  return (
    <SiteShell>
      <PageHero
        kicker="Use cases"
        title="Eight agents. One"
        italic="finance desk that never sleeps"
        sub="Each agent owns a part of the month end. Together they read your books, reconcile them against source, and hand you the handful of things that genuinely need a decision."
        actions={
          <>
            <Link to="/waitlist" className="fh-btn fh-btn-primary">
              Book a demo <ArrowRight size={15} />
            </Link>
            <Link to="/demo" className="fh-btn fh-btn-ghost">
              Open the live demo
            </Link>
          </>
        }
      />

      <div className="fh-wrap">
        <div className="fh-strip">
          <div className="fh-strip-grid">
            <div><div className="v num">8</div><div className="l">agents on every account</div></div>
            <div><div className="v num">13 wk</div><div className="l">cash horizon</div></div>
            <div><div className="v num">100%</div><div className="l">figures traceable to source</div></div>
            <div><div className="v num">30 min</div><div className="l">to first finding</div></div>
          </div>
        </div>
      </div>

      <Section
        kicker="The agents"
        title="Pick the one that owns"
        italic="your worst week of the month"
        lead="Every agent runs on the same ledger, so a finding in one shows up as context in another."
      >
        <div className="fh-grid fh-g3" style={{ marginTop: 44 }}>
          {AGENTS.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 3) * 80}>
              <Link to={`/agents/${a.slug}`} className="fh-card" style={{ display: "block", color: "inherit" }}>
                <span className="fh-tag">{a.kicker}</span>
                <h3>{a.name}</h3>
                <p>{a.sub}</p>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.maroon }}>
                  {a.footerUse} · read more
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        alt
        kicker="By business type"
        title="The same books read"
        italic="through your industry"
        lead="What matters in a trading business is not what matters in an agency. The agents weight accordingly."
      >
        <div className="fh-grid fh-g2" style={{ marginTop: 40 }}>
          {SEGMENTS.map((s, i) => (
            <Reveal key={s.t} delay={(i % 2) * 90}>
              <div className="fh-card">
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <ul className="fh-list">
                  {s.wins.map((w) => (
                    <li key={w}>
                      <Check size={15} />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title="See the agents run"
        italic="on your own numbers"
        lead="Bring one month of statements. You leave with the findings whether or not you sign up."
        secondary={{ to: "/pricing", label: "See pricing" }}
      />
    </SiteShell>
  );
}
