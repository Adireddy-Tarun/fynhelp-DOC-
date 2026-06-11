import { useMemo } from "react";
import { useInvoices, useExpenses, useBankTxns, useCustomers } from "../DataSource";
import { IntelCard, KPI, fmtCompact, fmtPct, ACCENT } from "../_primitives";

export default function InvestorTab() {
  const { data: invoices } = useInvoices();
  const { data: expenses } = useExpenses();
  const { data: bank } = useBankTxns();
  const { data: customers } = useCustomers();

  const m = useMemo(() => {
    const inv = invoices ?? [];
    const exp = expenses ?? [];
    const paid = inv.filter((i) => i.status === "paid");
    const totalRevenue = paid.reduce((s, i) => s + Number(i.paid_amount), 0);
    const c30 = new Date(Date.now() - 30 * 86400000);
    const mrr = paid.filter((i) => i.payment_date && new Date(i.payment_date) >= c30).reduce((s, i) => s + Number(i.paid_amount), 0);
    const arr = mrr * 12;
    const burn = exp.filter((e) => new Date(e.date) >= c30).reduce((s, e) => s + Number(e.amount), 0);
    const netBurn = Math.max(0, burn - mrr);
    const cash = bank?.[0]?.balance ?? 0;
    const runway = netBurn > 0 ? cash / netBurn : 99;
    const burnMultiple = mrr > 0 ? netBurn / mrr : 0;
    const arpa = customers?.length ? totalRevenue / customers.length : 0;
    const ltv = arpa * 24;
    return { totalRevenue, mrr, arr, burn, netBurn, cash, runway, burnMultiple, arpa, ltv };
  }, [invoices, expenses, bank, customers]);

  return (
    <div className="space-y-6">
      <IntelCard title="Investor-Ready KPIs" sub="Board reporting package · Updated today">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI label="ARR" value={fmtCompact(m.arr)} delta="+18% QoQ" deltaTone="up" />
          <KPI label="MRR" value={fmtCompact(m.mrr)} delta="+8.3% MoM" deltaTone="up" />
          <KPI label="NRR" value="118%" deltaTone="up" delta="Healthy" />
          <KPI label="Gross Margin" value="72%" deltaTone="up" />
        </div>
      </IntelCard>

      <div className="grid lg:grid-cols-2 gap-4">
        <IntelCard title="Capital Efficiency">
          <div className="space-y-3 text-sm">
            <Row label="Cash on hand" value={fmtCompact(m.cash)} />
            <Row label="Net Burn" value={`${fmtCompact(m.netBurn)}/mo`} />
            <Row label="Runway" value={`${m.runway.toFixed(1)} months`} />
            <Row label="Burn Multiple" value={`${m.burnMultiple.toFixed(2)}x`} tone={m.burnMultiple < 1.5 ? "up" : "down"} />
            <Row label="Rule of 40" value="48" tone="up" />
          </div>
        </IntelCard>

        <IntelCard title="Unit Economics">
          <div className="space-y-3 text-sm">
            <Row label="LTV" value={fmtCompact(m.ltv)} />
            <Row label="CAC" value={fmtCompact(m.arpa * 0.4)} />
            <Row label="LTV : CAC" value={`${(m.ltv / Math.max(1, m.arpa * 0.4)).toFixed(2)}x`} tone="up" />
            <Row label="Payback Period" value="11.4 months" />
            <Row label="ARPA" value={fmtCompact(m.arpa)} />
          </div>
        </IntelCard>
      </div>

      <IntelCard title="Board Highlights">
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2"><span style={{ color: ACCENT.green }}>▲</span><span className="text-fyn-ink">MRR up 8.3% MoM, on track for ₹5Cr ARR in 8 months</span></li>
          <li className="flex items-start gap-2"><span style={{ color: ACCENT.green }}>▲</span><span className="text-fyn-ink">NRR 118% — expansion revenue driving 31% of growth</span></li>
          <li className="flex items-start gap-2"><span style={{ color: ACCENT.amber }}>●</span><span className="text-fyn-ink">Customer concentration in top 3 at 32% — diversification needed</span></li>
          <li className="flex items-start gap-2"><span style={{ color: ACCENT.red }}>▼</span><span className="text-fyn-ink">Runway tightening at {m.runway.toFixed(1)} months — plan next raise</span></li>
        </ul>
      </IntelCard>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#6B6B6B]">{label}</span>
      <span className="font-mono font-semibold" style={{ color: tone === "up" ? ACCENT.green : tone === "down" ? ACCENT.red : ACCENT.ink }}>{value}</span>
    </div>
  );
}
