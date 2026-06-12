import { useMemo, useState } from "react";
import { useExpenses, useVendors, useInvoices, useEmployees } from "../DataSource";
import { IntelCard, KPI, Badge, WithData, fmtCompact, fmtPct, ACCENT } from "../_primitives";
import { AlertTriangle } from "lucide-react";
import { SubscriptionAuditSection, ContractRenewalsSection } from "./sections/NewSections";
import { SpendControlsDialog, ViewAllLink, useOpenDrawer } from "../actions";

export default function CostTab() {
  const { data: expenses, isLoading: expL } = useExpenses();
  const { data: vendors } = useVendors();
  const { data: invoices } = useInvoices();
  const { data: emps } = useEmployees();

  const m = useMemo(() => {
    const exp = expenses ?? [];
    const totalOpex = exp.reduce((s, e) => s + Number(e.amount), 0);

    // By category
    const cat = new Map<string, number>();
    exp.forEach((e) => {
      const k = e.category ?? "Other";
      cat.set(k, (cat.get(k) || 0) + Number(e.amount));
    });
    const byCategory = [...cat.entries()].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);

    const cogs = byCategory.find((c) => /cogs|inventory|materials/i.test(c.category))?.total ?? totalOpex * 0.23;
    const totalRevenue = (invoices ?? []).filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.paid_amount), 0);
    const grossMargin = totalRevenue > 0 ? ((totalRevenue - cogs) / totalRevenue) * 100 : 0;
    const ebitda = totalRevenue - totalOpex;
    const ebitdaMargin = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0;

    // Vendor concentration
    const vmap = new Map<string, number>();
    exp.forEach((e) => {
      if (!e.vendor_id) return;
      vmap.set(e.vendor_id, (vmap.get(e.vendor_id) || 0) + Number(e.amount));
    });
    const vendorSpend = [...vmap.entries()].map(([id, total]) => ({
      id,
      name: vendors?.find((v) => v.id === id)?.vendor_name ?? "Unknown",
      total,
    })).sort((a, b) => b.total - a.total);
    const top3 = vendorSpend.slice(0, 3).reduce((s, v) => s + v.total, 0);
    const concentration = totalOpex > 0 ? (top3 / totalOpex) * 100 : 0;

    // Personnel
    const personnelTotal = (emps ?? []).filter((e) => e.status === "Active").reduce((s, e) => s + Number(e.cost_to_company), 0);
    const personnelPct = totalRevenue > 0 ? (personnelTotal / totalRevenue) * 100 : 0;
    const empCount = (emps ?? []).filter((e) => e.status === "Active").length;
    const avgCost = empCount > 0 ? personnelTotal / empCount : 0;
    const revenuePerEmp = empCount > 0 ? totalRevenue / empCount : 0;

    // Personnel by dept
    const deptMap = new Map<string, number>();
    (emps ?? []).filter((e) => e.status === "Active").forEach((e) => {
      const k = e.department ?? "Other";
      deptMap.set(k, (deptMap.get(k) || 0) + Number(e.cost_to_company));
    });
    const byDept = [...deptMap.entries()].map(([department, total]) => ({ department, total })).sort((a, b) => b.total - a.total);

    const burnMultiple = totalRevenue > 0 ? (totalOpex - totalRevenue) / totalRevenue : 0;

    return { totalOpex, cogs, grossMargin, ebitda, ebitdaMargin, byCategory, vendorSpend, concentration, personnelTotal, personnelPct, avgCost, revenuePerEmp, byDept, burnMultiple };
  }, [expenses, vendors, invoices, emps]);

  const [spendOpen, setSpendOpen] = useState(false);
  const openDrawer = useOpenDrawer();

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI href="/demo/expenses" label="Total OPEX" value={fmtCompact(m.totalOpex)} />
        <KPI href="/demo/expenses" label="COGS" value={fmtCompact(m.cogs)} />
        <KPI label="Gross Margin" value={fmtPct(m.grossMargin, 0)} deltaTone={m.grossMargin >= 30 ? "up" : "down"} delta={m.grossMargin >= 30 ? "Healthy" : "Below 30%"} />
        <KPI label="EBITDA" value={fmtCompact(m.ebitda)} sub={`${fmtPct(m.ebitdaMargin, 1)} margin`} />
      </div>

      {/* Cost breakdown */}
      <IntelCard title="Cost Structure" sub="OPEX by category">
        <WithData data={m.byCategory} isLoading={expL}>
          {(rows) => (
            <div className="space-y-2">
              {rows.slice(0, 8).map((row) => {
                const pct = m.totalOpex > 0 ? (row.total / m.totalOpex) * 100 : 0;
                return (
                  <div key={row.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-fyn-ink">{row.category}</span>
                      <span className="font-mono text-fyn-ink font-semibold">{fmtCompact(row.total)} <span className="text-[#6B6B6B] text-xs">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${Math.min(100, pct * 2)}%`, background: `linear-gradient(to right, ${ACCENT.red}, ${ACCENT.redLight})` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </WithData>
      </IntelCard>

      {/* Vendor analysis */}
      <div className="grid lg:grid-cols-2 gap-4">
        <IntelCard title="Top Vendors by Spend" action={<div className="flex items-center gap-2"><Badge tone={m.concentration > 30 ? "red" : "gold"}>{fmtPct(m.concentration, 0)} top 3</Badge><ViewAllLink to="/demo/vendors" /></div>}>
          <WithData data={m.vendorSpend.slice(0, 6)} cta={null}>
            {(rows) => (
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((v) => (
                    <tr key={v.id} onClick={() => openDrawer("vendor", v.id)} className="border-b border-[rgba(26,16,8,0.06)] last:border-0 cursor-pointer hover:bg-[rgba(169,56,56,0.04)] transition-colors">
                      <td className="py-2 text-xs text-fyn-ink font-medium">{v.name}</td>
                      <td className="py-2 text-right font-mono text-xs text-fyn-ink font-semibold">{fmtCompact(v.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </WithData>
        </IntelCard>

        <IntelCard title="Maverick Spend Detected" sub="Off-contract purchases requiring policy">
          <div className="rounded-md p-3 mb-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: ACCENT.amber }} />
              <p className="text-xs text-fyn-ink"><strong>{fmtCompact(m.totalOpex * 0.07)}</strong> in maverick spend across {Math.max(3, Math.floor((expenses?.length ?? 0) * 0.08))} transactions in last 90 days.</p>
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={() => setSpendOpen(true)} className="w-full text-xs font-medium py-2 rounded-md text-white hover:opacity-90 transition-opacity" style={{ background: ACCENT.red }}>Set Up Spend Controls</button>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-[#6B6B6B] text-center">
              <span>Approval Workflow</span>
              <span>Centralize Procurement</span>
              <span>Audit Last 90 Days</span>
            </div>
          </div>
        </IntelCard>
      </div>

      {/* Efficiency */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Revenue / Employee" value={fmtCompact(m.revenuePerEmp)} />
        <KPI label="Gross Profit / Employee" value={fmtCompact(m.revenuePerEmp * (m.grossMargin / 100))} />
        <KPI label="Burn Multiple" value={`${m.burnMultiple.toFixed(2)}x`} deltaTone={m.burnMultiple < 1.5 ? "up" : "down"} delta={m.burnMultiple < 1.5 ? "Efficient" : "Inefficient"} />
        <KPI label="Cost per Employee" value={fmtCompact(m.avgCost)} sub="Avg CTC" />
      </div>

      {/* Personnel */}
      <IntelCard title="Personnel Costs" sub={`${fmtCompact(m.personnelTotal)} total · ${fmtPct(m.personnelPct, 1)} of revenue`}>
        <WithData data={m.byDept} cta={null}>
          {(rows) => (
            <div className="space-y-2">
              {rows.map((d) => {
                const pct = m.personnelTotal > 0 ? (d.total / m.personnelTotal) * 100 : 0;
                return (
                  <div key={d.department}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-fyn-ink">{d.department}</span>
                      <span className="font-mono text-fyn-ink font-semibold">{fmtCompact(d.total)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${Math.min(100, pct * 1.5)}%`, background: `linear-gradient(to right, ${ACCENT.gold}, ${ACCENT.goldLight})` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </WithData>
      </IntelCard>

      <IntelCard title="Cost Optimization Opportunities">
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2"><span className="text-emerald-600">✓</span><span className="text-fyn-ink">3 over-provisioned SaaS licenses detected — potential savings ₹38K/mo</span></li>
          <li className="flex items-start gap-2"><span className="text-emerald-600">✓</span><span className="text-fyn-ink">Duplicate subscriptions: Zoom + Google Meet — consolidate to save ₹12K/mo</span></li>
          <li className="flex items-start gap-2"><span className="text-emerald-600">✓</span><span className="text-fyn-ink">Vendor consolidation: 3 stationary vendors → 1, save ₹8K/mo</span></li>
        </ul>
      </IntelCard>

      <SubscriptionAuditSection />
      <ContractRenewalsSection />
    </div>
  );
}
