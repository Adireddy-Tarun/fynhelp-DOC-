/**
 * FYNHelp Investor View — new module.
 * Composes only brand primitives. No external deps beyond design tokens.
 */
import { Check, AlertTriangle, Circle } from "lucide-react";
import { C, A, T, SURF, FONT } from "./_design/tokens";
import {
  CFOBriefing,
  LedgerStrip,
  LedgerMetric,
  RecommendedAction,
  SectionHeader,
} from "./_design/primitives";

export function InvestorDashboard({ data: _data }: { data: any }) {
  return (
    <div>
      <CFOBriefing
        verdict={
          <>
            At current growth you can justify <strong style={{ color: C.beige, fontWeight: 600 }}>₹8.5Cr–₹12.2Cr</strong> valuation on a 5x–7x ARR multiple.
            The one number that will raise questions in any Series A conversation is your burn multiple of{" "}
            <strong style={{ color: C.beige, fontWeight: 600 }}>2.4x</strong> — above the 1.5x benchmark.
            Fixing this is the highest-leverage action before your next raise.
          </>
        }
      />

      <SectionHeader>Investor Metrics</SectionHeader>
      <LedgerStrip>
        <LedgerMetric label="EBITDA"               value="₹4.2L"   context="+18% MoM" />
        <LedgerMetric label="EBITDA MARGIN"        value="22.7%"   context="Benchmark 18–25% · " status="Healthy" statusColor={C.goldL} />
        <LedgerMetric label="GROSS MARGIN"         value="68.4%"   context="+2.1% QoQ" />
        <LedgerMetric label="BURN MULTIPLE"        value="2.4x"    context="Target <1.5x · " status="Above threshold" statusColor={C.red} valueColor={C.red} />
        <LedgerMetric label="NET REVENUE RETENTION" value="108%"   context="Expansion exceeds churn · " status="Healthy" statusColor={C.goldL} />
        <LedgerMetric label="LTV : CAC"            value="7.0x"    context="Target >3x · " status="Excellent" statusColor={C.goldL} />
      </LedgerStrip>

      {/* Tension Table */}
      <SectionHeader>What's Working vs. What Needs Attention</SectionHeader>
      <div style={{ ...SURF.card, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: SURF.divider }}>
          <div style={{ ...T.eyebrow, padding: "14px 20px" }}>WHAT IS WORKING</div>
          <div style={{ ...T.eyebrow, color: C.red, padding: "14px 20px", borderLeft: SURF.divider }}>
            WHAT NEEDS ATTENTION
          </div>
        </div>
        {[
          ["LTV:CAC 7.0x — Excellent", "Burn Multiple 2.4x — Above Series A threshold"],
          ["NRR 108% — Expansion happening", "DSO 42 days — Cash tied in receivables"],
          ["Gross Margin 68.4% — Fundable", "GST penalty ₹0.96L — Resolve before raise"],
          ["ARR growing 127% YoY", "Working capital tight vs. next payroll"],
        ].map(([good, bad], i, arr) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderBottom: i < arr.length - 1 ? SURF.divider : "none",
            }}
          >
            <div style={{ ...T.td, padding: "14px 20px", color: C.gold, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Check size={14} style={{ color: C.gold, marginTop: 3, flexShrink: 0 }} />
              <span>{good}</span>
            </div>
            <div style={{ ...T.td, padding: "14px 20px", color: C.red, borderLeft: SURF.divider, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <AlertTriangle size={14} style={{ color: C.red, marginTop: 3, flexShrink: 0 }} />
              <span>{bad}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Valuation Statement */}
      <SectionHeader>Valuation Estimate</SectionHeader>
      <div
        style={{
          background: A.red06,
          borderLeft: `4px solid ${C.red}`,
          border: `1px solid ${A.red15}`,
          borderRadius: 6,
          padding: "32px 36px",
        }}
      >
        <div style={{ ...T.eyebrow, marginBottom: 10 }}>CURRENT VALUATION ESTIMATE</div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: "clamp(36px, 5vw, 52px)",
            color: C.beige,
            letterSpacing: "-2px",
            lineHeight: 1.05,
          }}
        >
          ₹8.5Cr — ₹12.2Cr
        </div>
        <div style={{ ...T.sub, marginTop: 12, color: A.beige50 }}>
          Based on 5x–7x ARR multiple for B2B SaaS at 127% YoY growth
        </div>

        {/* scenario bars */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 28, alignItems: "end" }}>
          {[
            { label: "Conservative", value: "₹6.8Cr", h: 55, color: A.beige20 },
            { label: "Base",         value: "₹10.2Cr", h: 75, color: C.gold },
            { label: "Optimistic",   value: "₹13.6Cr", h: 100, color: C.red },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ height: 120, display: "flex", alignItems: "end" }}>
                <div style={{ width: "100%", height: `${s.h}%`, background: s.color, borderRadius: "4px 4px 0 0" }} />
              </div>
              <div style={{ ...T.eyebrow }}>{s.label}</div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: C.beige }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ ...T.sub, marginTop: 20, color: A.beige55 }}>
          ARR ₹1.70Cr · YoY Growth 127.4% · Multiple 5x–7x
        </div>
      </div>

      {/* Raise Readiness Checklist */}
      <SectionHeader>Series A Readiness Checklist</SectionHeader>
      <div style={{ ...SURF.card, overflow: "hidden" }}>
        {[
          { icon: "ok",   text: "MRR above ₹10L",          status: "Done — ₹14.2L",                color: C.goldL },
          { icon: "ok",   text: "NRR above 100%",          status: "Done — 108%",                  color: C.goldL },
          { icon: "ok",   text: "Gross Margin above 60%",  status: "Done — 68.4%",                 color: C.goldL },
          { icon: "ok",   text: "18 months runway",        status: "Done — 24 months",             color: C.goldL },
          { icon: "warn", text: "Burn Multiple below 1.5x",status: "Action needed — 2.4x",         color: C.red   },
          { icon: "warn", text: "Clean GST compliance",    status: "Action needed — ₹0.96L exposure", color: C.red },
          { icon: "todo", text: "Audited financials",      status: "Not yet verified",             color: A.beige30 },
        ].map((row, i, arr) => {
          const bg =
            row.icon === "ok"   ? A.gold06 :
            row.icon === "warn" ? A.red06  : "transparent";
          const Icon =
            row.icon === "ok"   ? Check :
            row.icon === "warn" ? AlertTriangle : Circle;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "14px 20px",
                background: bg,
                borderBottom: i < arr.length - 1 ? SURF.divider : "none",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center", color: A.beige72, ...T.td }}>
                <Icon size={14} style={{ color: row.color, flexShrink: 0 }} />
                <span>{row.text}</span>
              </div>
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12, color: row.color }}>{row.status}</div>
            </div>
          );
        })}
      </div>

      {/* Deep Metrics */}
      <SectionHeader>Deep Metrics</SectionHeader>
      <LedgerStrip>
        <LedgerMetric label="CUSTOMER LTV"    value="₹8.4L" />
        <LedgerMetric label="CAC"             value="₹1.2L" />
        <LedgerMetric label="DSCR"            value="3.2x" />
        <LedgerMetric label="WORKING CAPITAL" value="₹12.8L" />
      </LedgerStrip>

      <RecommendedAction
        action="Before your next investor conversation: resolve the burn multiple by reducing CAC 20% or increasing ARR growth rate. Fixing GST penalty cleans the compliance record. These two actions push your readiness score from 72 to 91 and valuation from ₹10.2Cr to ₹14Cr base case."
      />
    </div>
  );
}
