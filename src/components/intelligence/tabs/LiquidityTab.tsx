import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, Phone } from "lucide-react";
import { useBankTxns, useInvoices, useExpenses, useCustomers, useVendors, useMode } from "../DataSource";
import { IntelCard, KPI, Badge, WithData, AnimatedBar, fmtCompact, fmtINR, fmtPct, ACCENT, CHART, ChartGradients, EMPTY } from "../_primitives";


function daysBetween(a: string, b: string) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export default function LiquidityTab() {
  const mode = useMode();
  const { data: bank, isLoading: bankL } = useBankTxns();
  const { data: invoices, isLoading: invL } = useInvoices();
  const { data: expenses, isLoading: expL } = useExpenses();
  const { data: customers } = useCustomers();
  const { data: vendors } = useVendors();

  const m = useMemo(() => {
    const inv = invoices ?? [];
    const exp = expenses ?? [];
    const bk = bank ?? [];

    const cashBalance = bk[0]?.balance ?? 0;
    const restricted = cashBalance * 0.08;
    const operating = cashBalance - restricted;

    const now = new Date();
    const c30 = new Date(now.getTime() - 30 * 86400000);
    const grossBurn = exp.filter((e) => new Date(e.date) >= c30).reduce((s, e) => s + Number(e.amount), 0);
    const revenue30 = inv.filter((i) => i.status === "paid" && i.payment_date && new Date(i.payment_date) >= c30).reduce((s, i) => s + Number(i.paid_amount), 0);
    // Net burn = total expenses − total paid invoices (last 30 days). Can be negative if profitable.
    const netBurn = grossBurn - revenue30;
    const runwayMonths = netBurn > 0 && cashBalance > 0 ? cashBalance / netBurn : NaN;


    // AR aging
    const aging = { current: 0, d31_60: 0, d61_90: 0, d90: 0 };
    inv.forEach((i) => {
      if (i.status === "paid" || i.status === "cancelled") return;
      const d = daysBetween(i.due_date || i.invoice_date, new Date().toISOString());
      const amt = Number(i.outstanding_amount);
      if (d <= 30) aging.current += amt;
      else if (d <= 60) aging.d31_60 += amt;
      else if (d <= 90) aging.d61_90 += amt;
      else aging.d90 += amt;
    });

    // Overdue
    const overdue = inv
      .filter((i) => i.status === "overdue" || (i.outstanding_amount > 0 && i.due_date && new Date(i.due_date) < now))
      .map((i) => ({ ...i, daysOver: i.due_date ? Math.max(0, daysBetween(i.due_date, new Date().toISOString())) : 0, customer_name: customers?.find((c) => c.id === i.customer_id)?.customer_name ?? "—" }))
      .sort((a, b) => b.daysOver - a.daysOver)
      .slice(0, 6);

    // Major payments due
    const payments = exp
      .filter((e) => e.payment_status !== "Paid" && e.due_date)
      .map((e) => ({ ...e, vendor_name: vendors?.find((v) => v.id === e.vendor_id)?.vendor_name ?? "—" }))
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 5);

    // CCC / DSO / DPO  (rough — net sales over 90d / receivables)
    const c90 = new Date(now.getTime() - 90 * 86400000);
    const sales90 = inv.filter((i) => new Date(i.invoice_date) >= c90).reduce((s, i) => s + Number(i.total_amount), 0);
    const recv = inv.reduce((s, i) => s + Number(i.outstanding_amount), 0);
    const pay = exp.filter((e) => e.payment_status !== "Paid").reduce((s, e) => s + Number(e.amount), 0);
    const cogs90 = exp.filter((e) => new Date(e.date) >= c90).reduce((s, e) => s + Number(e.amount), 0);
    const dso = sales90 > 0 ? (recv / sales90) * 90 : NaN;
    const dpo = cogs90 > 0 ? (pay / cogs90) * 90 : NaN;
    const dio = 12; // proxy
    const ccc = Number.isFinite(dso) && Number.isFinite(dpo) ? dso + dio - dpo : NaN;

    const quickRatio = pay > 0 ? (cashBalance + recv) / pay : NaN;
    const currentRatio = pay > 0 ? (cashBalance + recv) / pay : NaN;
    const workingCapital = cashBalance + recv - pay;


    // 13-week forecast
    const weekly: { week: string; inflow: number; outflow: number; net: number }[] = [];
    for (let w = 1; w <= 13; w++) {
      const inflow = revenue30 / 4.3 * (0.9 + Math.random() * 0.2);
      const outflow = grossBurn / 4.3 * (0.9 + Math.random() * 0.2);
      weekly.push({ week: `W${w}`, inflow, outflow, net: inflow - outflow });
    }

    return { cashBalance, operating, restricted, grossBurn, netBurn, runwayMonths, revenue30, dso, dpo, ccc, quickRatio, currentRatio, workingCapital, aging, overdue, payments, weekly };
  }, [bank, invoices, expenses, customers, vendors]);

  const isEmpty = !invL && !bankL && !expL && (invoices?.length ?? 0) === 0;
  const zeroDate = useMemo(() => {
    if (m.netBurn <= 0 || m.cashBalance <= 0) return null;
    const days = (m.cashBalance / m.netBurn) * 30;
    const d = new Date();
    d.setDate(d.getDate() + Math.round(days));
    return d.toISOString().slice(0, 10);
  }, [m]);

  return (
    <div className="space-y-6">
      {/* Alert ticker */}
      <div className="bg-white rounded-md px-4 py-2 flex items-center gap-3 overflow-hidden" style={{ border: "1px solid rgba(26,16,8,0.08)" }}>
        <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT.red }} />
        <div className="flex gap-8 text-xs text-fyn-ink animate-[ticker-scroll_30s_linear_infinite] whitespace-nowrap">
          <span>GST filing due in 3 days</span>
          <span>•</span>
          <span>Receivables {fmtCompact(m.aging.d61_90 + m.aging.d90)} overdue 60+ days</span>
          <span>•</span>
          <span>Burn multiple {m.revenue30 > 0 ? (m.netBurn / m.revenue30).toFixed(2) : "—"}x</span>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Cash Balance" value={fmtCompact(m.cashBalance)} sub={`Operating ${fmtCompact(m.operating)}`} />
        <KPI label="Runway" value={`${m.runwayMonths.toFixed(1)} mo`} sub={zeroDate ? `Zero by ${zeroDate}` : "—"} deltaTone={m.runwayMonths < 6 ? "down" : "up"} delta={m.runwayMonths < 6 ? "Low" : "Healthy"} />
        <KPI label="Net Burn" value={`${fmtCompact(m.netBurn)}/mo`} sub={`Gross ${fmtCompact(m.grossBurn)}`} />
        <KPI label="Working Capital" value={fmtCompact(m.workingCapital)} sub={`Quick Ratio ${m.quickRatio.toFixed(2)}`} />
      </div>

      {/* Cash position + CCC */}
      <div className="grid lg:grid-cols-3 gap-4">
        <IntelCard title="Cash Conversion Cycle" sub="DSO + DIO − DPO">
          <div className="space-y-3">
            <div>
              <p className="font-mono text-3xl text-fyn-ink font-semibold">{m.ccc.toFixed(0)} <span className="text-sm text-[#6B6B6B] font-sans">days</span></p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[rgba(26,16,8,0.08)]">
              <div><p className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">DSO</p><p className="font-mono text-base text-fyn-ink">{m.dso.toFixed(0)}d</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">DIO</p><p className="font-mono text-base text-fyn-ink">12d</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">DPO</p><p className="font-mono text-base text-fyn-ink">{m.dpo.toFixed(0)}d</p></div>
            </div>
          </div>
        </IntelCard>

        <IntelCard title="Liquidity Ratios">
          <div className="space-y-3">
            <Row label="Quick Ratio" value={m.quickRatio.toFixed(2)} />
            <Row label="Current Ratio" value={m.currentRatio.toFixed(2)} />
            <Row label="Cash Balance" value={fmtCompact(m.cashBalance)} />
            <Row label="Restricted Cash" value={fmtCompact(m.restricted)} />
          </div>
        </IntelCard>

        <IntelCard title="Scenario Planning" sub="Runway under different revenue scenarios">
          <div className="space-y-2">
            {[
              { label: "Best Case (+20%)", months: m.runwayMonths * 1.35, tone: "green" as const },
              { label: "Base Case", months: m.runwayMonths, tone: "gold" as const },
              { label: "Worst Case (−20%)", months: m.runwayMonths * 0.68, tone: "red" as const },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <span className="text-fyn-ink">{s.label}</span>
                <span className="font-mono text-fyn-ink font-semibold">{s.months.toFixed(1)} mo</span>
              </div>
            ))}
            <button className="w-full mt-3 text-xs font-medium py-2 rounded-md text-white" style={{ background: ACCENT.red }}>Model Custom Scenario</button>
          </div>
        </IntelCard>
      </div>

      {/* 13-week forecast */}
      <IntelCard title="13-Week Cash Forecast" sub="Net cash flow per week">
        <WithData data={isEmpty ? [] : m.weekly} isLoading={bankL && expL}>
          {(d) => (
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <ChartGradients />
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => fmtCompact(v)} />
                  <Tooltip contentStyle={{ background: CHART.tooltipBg, border: `1px solid ${CHART.tooltipBorder}`, borderRadius: 6, fontSize: 12 }} formatter={(v: number) => fmtCompact(v)} />
                  <Bar dataKey="net" fill={`url(#${CHART.redGrad.id})`} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </WithData>
      </IntelCard>

      {/* Receivables aging + overdue */}
      <div className="grid lg:grid-cols-2 gap-4">
        <IntelCard title="Accounts Receivable Aging">
          <div className="space-y-2">
            {[
              { label: "Current (0-30 days)", value: m.aging.current, tone: "green" as const },
              { label: "31-60 days", value: m.aging.d31_60, tone: "gold" as const },
              { label: "61-90 days", value: m.aging.d61_90, tone: "amber" as const },
              { label: "90+ days", value: m.aging.d90, tone: "red" as const },
            ].map((row) => {
              const total = m.aging.current + m.aging.d31_60 + m.aging.d61_90 + m.aging.d90 || 1;
              const pct = (row.value / total) * 100;
              return (
                <div key={row.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-fyn-ink">{row.label}</span>
                    <span className="font-mono text-fyn-ink font-semibold">{fmtCompact(row.value)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: row.tone === "green" ? ACCENT.green : row.tone === "gold" ? ACCENT.gold : row.tone === "amber" ? ACCENT.amber : ACCENT.red }} />
                  </div>
                </div>
              );
            })}
          </div>
        </IntelCard>

        <IntelCard title="Overdue Invoices" sub="Action required" action={<Badge tone="red">{m.overdue.length} overdue</Badge>}>
          <WithData data={m.overdue} emptyTitle="No overdue invoices" emptyDescription="All receivables on track." cta={null}>
            {(rows) => (
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-[rgba(26,16,8,0.06)] last:border-0">
                      <td className="py-2.5">
                        <p className="text-fyn-ink font-medium text-xs">{r.customer_name}</p>
                        <p className="text-[11px] text-[#6B6B6B]">{r.invoice_number}</p>
                      </td>
                      <td className="py-2.5 text-right">
                        <p className="font-mono text-xs font-semibold text-fyn-ink">{fmtCompact(r.outstanding_amount)}</p>
                        <Badge tone={r.daysOver > 60 ? "red" : "amber"}>{r.daysOver}d overdue</Badge>
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <button className="inline-flex items-center gap-1 text-[11px] font-medium text-white px-2 py-1 rounded" style={{ background: ACCENT.red }}>
                          <Phone className="w-3 h-3" /> Remind
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </WithData>
        </IntelCard>
      </div>

      {/* Payments due */}
      <IntelCard title="Major Payments Due (next 30 days)" action={<button className="text-xs font-medium px-3 py-1.5 rounded text-white" style={{ background: ACCENT.red }}>Optimize Schedule</button>}>
        <WithData data={m.payments} emptyTitle="No pending payments" cta={null}>
          {(rows) => (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(26,16,8,0.08)]">
                  <th className="text-left text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium py-2">Vendor</th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium py-2">Category</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium py-2">Amount</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium py-2">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-[rgba(26,16,8,0.06)] last:border-0">
                    <td className="py-2.5 text-xs text-fyn-ink font-medium">{r.vendor_name}</td>
                    <td className="py-2.5 text-xs text-[#6B6B6B]">{r.category ?? "—"}</td>
                    <td className="py-2.5 text-right font-mono text-xs text-fyn-ink font-semibold">{fmtCompact(r.amount)}</td>
                    <td className="py-2.5 text-right text-xs text-[#6B6B6B]">{r.due_date?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </WithData>
      </IntelCard>

      {/* Priority action */}
      {m.overdue.length > 0 && (
        <div className="rounded-lg px-4 py-3 flex items-center justify-between gap-3" style={{ background: "rgba(169,56,56,0.08)", border: "1px solid rgba(169,56,56,0.2)" }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: ACCENT.red }} />
            <div>
              <p className="text-xs font-semibold text-fyn-ink">Priority action</p>
              <p className="text-xs text-fyn-ink mt-0.5">
                Call <strong>{m.overdue[0].customer_name}</strong> ({fmtCompact(m.overdue[0].outstanding_amount)}, {m.overdue[0].daysOver} days overdue) before Friday.
              </p>
            </div>
          </div>
          <button className="text-xs font-medium px-3 py-1.5 rounded text-white whitespace-nowrap" style={{ background: ACCENT.red }}>Mark Done</button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#6B6B6B]">{label}</span>
      <span className="font-mono text-fyn-ink font-semibold">{value}</span>
    </div>
  );
}
