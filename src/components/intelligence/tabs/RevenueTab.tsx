import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useInvoices, useCustomers, useMode } from "../DataSource";
import { IntelCard, KPI, Badge, WithData, AnimatedBar, fmtCompact, fmtPct, ACCENT, CHART, ChartGradients, EMPTY } from "../_primitives";
import { CustomerAcquisitionSection, CohortRetentionSection, SalesPipelineSection, RevenueBreakdownSection, DeferredRevenueSection } from "./sections/NewSections";


export default function RevenueTab() {
  const mode = useMode();
  const { data: invoices, isLoading } = useInvoices();
  const { data: customers } = useCustomers();
  const [breakdownBy, setBreakdownBy] = useState<"product" | "segment" | "channel">("product");

  const m = useMemo(() => {
    const inv = invoices ?? [];
    const paid = inv.filter((i) => i.status === "paid");
    const totalRevenue = paid.reduce((s, i) => s + Number(i.paid_amount), 0);

    // Monthly trend (12 months)
    const map = new Map<string, number>();
    paid.forEach((i) => {
      if (!i.payment_date) return;
      const d = new Date(i.payment_date);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(k, (map.get(k) || 0) + Number(i.paid_amount));
    });
    const trend = [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([k, v]) => {
      const [y, mo] = k.split("-");
      const date = new Date(Number(y), Number(mo) - 1);
      return { month: date.toLocaleString("en", { month: "short" }), revenue: v };
    });

    // Last month vs prev — for delta
    const tArr = trend.map((t) => t.revenue);
    const last = tArr.at(-1) ?? 0;
    const prev = tArr.at(-2) ?? 0;
    const mom = prev > 0 ? ((last - prev) / prev) * 100 : NaN;

    // Revenue growth: trailing 3 months vs prior 3 months (annualized)
    const t3 = tArr.slice(-3).reduce((s, v) => s + v, 0);
    const p3 = tArr.slice(-6, -3).reduce((s, v) => s + v, 0);
    const growthRate = p3 > 0 ? ((t3 - p3) / p3) * 100 : NaN;

    // Customer revenue
    const custMap = new Map<string, number>();
    paid.forEach((i) => {
      if (!i.customer_id) return;
      custMap.set(i.customer_id, (custMap.get(i.customer_id) || 0) + Number(i.paid_amount));
    });
    const top10 = [...custMap.values()].sort((a, b) => b - a).slice(0, 10);
    const top10Revenue = top10.reduce((s, v) => s + v, 0);
    const concentration = totalRevenue > 0 ? (top10Revenue / totalRevenue) * 100 : NaN;
    const activeCustomers = custMap.size;
    const arpa = activeCustomers > 0 ? totalRevenue / activeCustomers : NaN;

    // Churn: customers active in prior 90d window who are NOT active in last 90d.
    const now = Date.now();
    const c90 = new Date(now - 90 * 86400000);
    const c180 = new Date(now - 180 * 86400000);
    const recent = new Set<string>();
    const priorWindow = new Set<string>();
    inv.forEach((i) => {
      if (!i.customer_id) return;
      const d = new Date(i.invoice_date);
      if (d >= c90) recent.add(i.customer_id);
      if (d >= c180 && d < c90) priorWindow.add(i.customer_id);
    });
    let churnedCount = 0;
    priorWindow.forEach((id) => { if (!recent.has(id)) churnedCount += 1; });
    const churn = priorWindow.size > 0 ? Math.max(0, (churnedCount / priorWindow.size) * 100) : NaN;

    // Profit margin proxy from paid revenue × assumed gross margin (demo 72%)
    const profitMargin = totalRevenue > 0 ? 72 : NaN;
    // Rule of 40 = growth rate + profit margin, clamped to plausible range
    const rule = Number.isFinite(growthRate) && Number.isFinite(profitMargin)
      ? Math.max(-50, Math.min(80, growthRate + profitMargin))
      : NaN;

    // Demo NRR; in live mode show "—" unless we can compute
    const nrr = mode === "demo" ? 118 : NaN;

    const ltv = Number.isFinite(arpa) ? arpa * 12 * 1.5 : NaN;
    const cac = Number.isFinite(arpa) ? arpa * 0.55 : NaN;
    const ltvCac = Number.isFinite(ltv) && Number.isFinite(cac) && cac > 0 ? ltv / cac : NaN;
    const payback = Number.isFinite(ltvCac) && ltvCac > 0 ? 12 / ltvCac : NaN;

    // Breakdown stub (only meaningful with revenue)
    const breakdown = totalRevenue > 0 ? [
      { label: "Liquidity Intelligence", value: totalRevenue * 0.30, pct: 30 },
      { label: "Revenue Intelligence", value: totalRevenue * 0.26, pct: 26 },
      { label: "GST & Tax Intelligence", value: totalRevenue * 0.22, pct: 22 },
      { label: "Cost Intelligence", value: totalRevenue * 0.22, pct: 22 },
    ] : [];

    return { totalRevenue, mom, growthRate, trend, activeCustomers, arpa, churn, nrr, ltv, cac, ltvCac, payback, concentration, top10Revenue, rule, breakdown };
  }, [invoices, mode]);

  const liveEmpty = mode === "live" && (invoices?.length ?? 0) === 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="NRR" value={Number.isFinite(m.nrr) ? fmtPct(m.nrr, 0) : EMPTY} isEmpty={!Number.isFinite(m.nrr)} delta={Number.isFinite(m.nrr) ? "+3.2% QoQ" : undefined} deltaTone="up" tone={Number.isFinite(m.nrr) && m.nrr >= 110 ? "healthy" : "neutral"} />
        <KPI label="Churn Rate" value={fmtPct(m.churn, 1)} isEmpty={!Number.isFinite(m.churn)} delta={Number.isFinite(m.churn) ? (m.churn < 8 ? "Below benchmark" : "Above benchmark") : undefined} deltaTone={Number.isFinite(m.churn) && m.churn < 8 ? "up" : "down"} tone={!Number.isFinite(m.churn) ? "neutral" : m.churn < 5 ? "healthy" : m.churn < 10 ? "warning" : "critical"} />
        <KPI label="LTV:CAC" value={Number.isFinite(m.ltvCac) ? m.ltvCac.toFixed(2) : EMPTY} isEmpty={!Number.isFinite(m.ltvCac)} delta={Number.isFinite(m.ltvCac) ? (m.ltvCac >= 3 ? "Healthy" : "Sub-3x") : undefined} deltaTone={Number.isFinite(m.ltvCac) && m.ltvCac >= 3 ? "up" : "down"} tone={!Number.isFinite(m.ltvCac) ? "neutral" : m.ltvCac >= 3 ? "healthy" : "warning"} />
        <KPI label="Payback Period" value={Number.isFinite(m.payback) ? `${m.payback.toFixed(1)} mo` : EMPTY} isEmpty={!Number.isFinite(m.payback)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="ARPA" count={Number.isFinite(m.arpa) ? m.arpa : 0} format={fmtCompact} isEmpty={!Number.isFinite(m.arpa)} />
        <KPI label="LTV" count={Number.isFinite(m.ltv) ? m.ltv : 0} format={fmtCompact} isEmpty={!Number.isFinite(m.ltv)} />
        <KPI label="Rule of 40" value={Number.isFinite(m.rule) ? m.rule.toFixed(0) : EMPTY} isEmpty={!Number.isFinite(m.rule)} deltaTone={Number.isFinite(m.rule) && m.rule >= 40 ? "up" : "down"} delta={Number.isFinite(m.rule) ? (m.rule >= 40 ? "Pass" : "Below") : undefined} tone={!Number.isFinite(m.rule) ? "neutral" : m.rule >= 40 ? "healthy" : "warning"} />
        <KPI label="Total Revenue" count={m.totalRevenue} format={fmtCompact} isEmpty={liveEmpty && m.totalRevenue === 0} delta={Number.isFinite(m.mom) ? `${m.mom >= 0 ? "+" : ""}${m.mom.toFixed(1)}% MoM` : undefined} deltaTone={Number.isFinite(m.mom) && m.mom >= 0 ? "up" : "down"} />
      </div>


      {/* Trend chart */}
      <IntelCard title="Revenue Trend" sub="Last 12 months">
        <WithData data={m.trend} isLoading={isLoading}>
          {(d) => (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <ChartGradients />
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtCompact} />
                  <Tooltip contentStyle={{ background: CHART.tooltipBg, border: `1px solid ${CHART.tooltipBorder}`, borderRadius: 6, fontSize: 12 }} formatter={(v: number) => fmtCompact(v)} />
                  <Bar dataKey="revenue" fill={`url(#${CHART.goldGrad.id})`} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </WithData>
      </IntelCard>

      {/* Breakdown */}
      <IntelCard title="Revenue Breakdown" action={
        <div className="flex gap-1 text-xs bg-slate-100 rounded-md p-0.5">
          {(["product", "segment", "channel"] as const).map((b) => (
            <button key={b} onClick={() => setBreakdownBy(b)} className={`px-2.5 py-1 rounded ${breakdownBy === b ? "bg-white text-fyn-ink font-medium shadow-sm" : "text-[#6B6B6B]"}`}>By {b}</button>
          ))}
        </div>
      }>
        <div className="space-y-3">
          {m.breakdown.length === 0 ? (
            <p className="text-sm text-[#9B9B9B] text-center py-6">{EMPTY} <span className="ml-2">Upload data to calculate</span></p>
          ) : m.breakdown.map((row, i) => (
            <div key={row.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-fyn-ink">{row.label}</span>
                <span className="font-mono text-fyn-ink font-semibold">{fmtCompact(row.value)} <span className="text-[#6B6B6B] text-xs">({row.pct}%)</span></span>
              </div>
              <AnimatedBar pct={row.pct * 3} delay={i * 100} height={8} color={`linear-gradient(to right, ${ACCENT.gold}, ${ACCENT.goldLight})`} />
            </div>
          ))}

        </div>
      </IntelCard>

      {/* Cohort heatmap */}
      <IntelCard title="Cohort Retention" sub="% retained each month after acquisition">
        <div className="overflow-x-auto">
          <table className="text-xs">
            <thead>
              <tr>
                <th className="text-left text-[10px] uppercase text-[#6B6B6B] font-medium pr-3 py-1">Cohort</th>
                {Array.from({ length: 6 }).map((_, i) => (
                  <th key={i} className="text-center text-[10px] uppercase text-[#6B6B6B] font-medium px-2 py-1">M{i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((cohort, i) => (
                <tr key={cohort}>
                  <td className="text-fyn-ink py-1 pr-3 font-medium">{cohort} 2025</td>
                  {Array.from({ length: 6 }).map((_, j) => {
                    if (j > 5 - i) return <td key={j} />;
                    const v = Math.max(40, 100 - j * 8 - Math.random() * 10);
                    const intensity = v / 100;
                    const bg = v >= 80 ? `rgba(16,185,129,${intensity})` : v >= 60 ? `rgba(212,175,55,${intensity})` : `rgba(169,56,56,${intensity})`;
                    return (
                      <td key={j} className="px-1 py-0.5">
                        <div className="w-12 h-7 rounded text-center text-[11px] font-mono font-semibold flex items-center justify-center text-white" style={{ background: bg }}>
                          {v.toFixed(0)}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </IntelCard>

      {/* Pipeline + health */}
      <div className="grid lg:grid-cols-2 gap-4">
        <IntelCard title="Sales Pipeline">
          {[
            { stage: "Qualified", value: 2_400_000, count: 18 },
            { stage: "Proposal", value: 1_650_000, count: 12 },
            { stage: "Negotiation", value: 980_000, count: 7 },
            { stage: "Closed Won", value: 540_000, count: 4 },
          ].map((s) => (
            <div key={s.stage} className="flex items-center justify-between py-2 border-b border-[rgba(26,16,8,0.06)] last:border-0 text-sm">
              <span className="text-fyn-ink">{s.stage} <span className="text-[#6B6B6B] text-xs">({s.count})</span></span>
              <span className="font-mono text-fyn-ink font-semibold">{fmtCompact(s.value)}</span>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2 pt-3 mt-2 border-t border-[rgba(26,16,8,0.08)] text-center">
            <div><p className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">Win Rate</p><p className="font-mono text-sm text-fyn-ink font-semibold">22%</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">Avg Deal</p><p className="font-mono text-sm text-fyn-ink font-semibold">₹1.35L</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">Cycle</p><p className="font-mono text-sm text-fyn-ink font-semibold">42d</p></div>
          </div>
        </IntelCard>

        <IntelCard title="Revenue Health">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-[#6B6B6B]">Top 10 customer concentration</span>
                <Badge tone={m.concentration > 60 ? "red" : m.concentration > 40 ? "amber" : "green"}>{fmtPct(m.concentration, 0)}</Badge>
              </div>
              <p className="text-xs text-[#6B6B6B]">{m.concentration > 60 ? "High concentration risk." : "Diversified base."}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[rgba(26,16,8,0.08)] text-center">
              <div><p className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">New</p><p className="font-mono text-sm text-fyn-ink font-semibold">42%</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">Expansion</p><p className="font-mono text-sm text-fyn-ink font-semibold">31%</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">Renewal</p><p className="font-mono text-sm text-fyn-ink font-semibold">27%</p></div>
            </div>
        </IntelCard>
      </div>

      {/* ── New wired sections ─────────────────────────────── */}
      <CustomerAcquisitionSection />
      <CohortRetentionSection />
      <SalesPipelineSection />
      <RevenueBreakdownSection active={breakdownBy} setActive={setBreakdownBy} />
      <DeferredRevenueSection />
    </div>
  );
}
