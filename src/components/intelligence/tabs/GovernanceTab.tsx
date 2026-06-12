import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useInvoices, useExpenses } from "../DataSource";
import { IntelCard, KPI, Badge, fmtCompact, ACCENT, CHART, ChartGradients } from "../_primitives";
import { BalanceSheetSection, RiskRegisterSection, InsuranceSection } from "./sections/NewSections";

export default function GovernanceTab() {
  const { data: invoices } = useInvoices();
  const { data: expenses } = useExpenses();

  const trend = useMemo(() => {
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((m, i) => {
      const base = 100000 + i * 8000;
      return { month: m, actual: base + Math.random() * 20000, budget: base * 1.1 };
    });
  }, []);

  const riskScore = 28;
  const fxExposure = 425000;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Risk Score" value={`${riskScore}/100`} deltaTone="up" delta="Low risk" />
        <KPI label="Forecast Accuracy" value="92.3%" deltaTone="up" delta="+2.1% MoM" />
        <KPI label="Budget Adherence" value="88.7%" deltaTone="up" delta="On track" />
        <KPI label="Audit Readiness" value="94%" deltaTone="up" delta="Audit-ready" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <IntelCard title="Risk Score" sub="Composite governance risk">
          <div className="flex flex-col items-center py-2">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(26,16,8,0.08)" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={ACCENT.green} strokeWidth="10" strokeDasharray={`${(riskScore / 100) * 263.9} 263.9`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-mono text-2xl font-bold text-fyn-ink">{riskScore}</p>
                <p className="text-[10px] text-[#6B6B6B]">/ 100</p>
              </div>
            </div>
            <Badge tone="green">Low Risk</Badge>
          </div>
        </IntelCard>

        <IntelCard title="Risk Categories">
          {[
            { label: "FX Exposure", value: fmtCompact(fxExposure), tone: "amber" as const, level: "Medium" },
            { label: "Credit Concentration", value: "18.4%", tone: "green" as const, level: "Low" },
            { label: "Liquidity Risk", value: "Stable", tone: "green" as const, level: "Low" },
            { label: "Operational Risk", value: "Stable", tone: "green" as const, level: "Low" },
            { label: "Regulatory Risk", value: "1 open", tone: "amber" as const, level: "Medium" },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[rgba(26,16,8,0.06)] last:border-0 text-sm">
              <span className="text-fyn-ink">{r.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#6B6B6B]">{r.value}</span>
                <Badge tone={r.tone}>{r.level}</Badge>
              </div>
            </div>
          ))}
        </IntelCard>

        <IntelCard title="Audit Readiness">
          <div className="space-y-3 text-sm">
            <ProgressRow label="Reconciliation Status" pct={96} />
            <ProgressRow label="Approval Workflow" pct={88} />
            <ProgressRow label="Document Completeness" pct={94} />
            <ProgressRow label="Policy Compliance" pct={91} />
          </div>
        </IntelCard>
      </div>

      <IntelCard title="Budget vs Actual" sub="Monthly variance over last 12 months">
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <ChartGradients />
              <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtCompact} />
              <Tooltip contentStyle={{ background: CHART.tooltipBg, border: `1px solid ${CHART.tooltipBorder}`, borderRadius: 6, fontSize: 12 }} formatter={(v: number) => fmtCompact(v)} />
              <Bar dataKey="budget" fill={`url(#${CHART.goldGrad.id})`} radius={[3, 3, 0, 0]} />
              <Bar dataKey="actual" fill={`url(#${CHART.redGrad.id})`} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </IntelCard>

      <BalanceSheetSection />
      <RiskRegisterSection />
      <InsuranceSection />
    </div>
  );
}

function ProgressRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[#6B6B6B] text-xs">{label}</span>
        <span className="font-mono text-xs font-semibold text-fyn-ink">{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%`, background: pct >= 90 ? ACCENT.green : pct >= 70 ? ACCENT.gold : ACCENT.red }} />
      </div>
    </div>
  );
}
