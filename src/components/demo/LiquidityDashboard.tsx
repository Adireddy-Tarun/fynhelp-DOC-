import { Card } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Calendar,
  Clock,
} from 'lucide-react'

export function LiquidityDashboard({ data }: { data: any }) {
  const liq = data?.liquidity || {}

  const fmtL = (v: number) => `₹${((v || 0) / 100000).toFixed(1)}L`
  const fmtK = (v: number) => `₹${((v || 0) / 1000).toFixed(0)}K`

  const agingColors = ['text-green-500', 'text-yellow-500', 'text-orange-500', 'text-red-500']
  const arAging = liq.receivablesPayables?.arAging || {}
  const agingBuckets = [
    { label: '0-30 days', value: arAging['0-30'] ?? arAging.bucket0_30 ?? 0 },
    { label: '31-60 days', value: arAging['31-60'] ?? arAging.bucket31_60 ?? 0 },
    { label: '61-90 days', value: arAging['61-90'] ?? arAging.bucket61_90 ?? 0 },
    { label: '90+ days', value: arAging['90+'] ?? arAging.bucket90plus ?? 0 },
  ]

  const riskBadge = (level: string) => {
    const l = (level || '').toLowerCase()
    if (l === 'high') return 'bg-red-500/10 text-red-500 border border-red-500/30'
    if (l === 'medium') return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
    return 'bg-green-500/10 text-green-500 border border-green-500/30'
  }

  return (
    <div className="space-y-10">
      {/* SECTION 1 — Runway Alert */}
      {liq.alerts?.runwayAlert && (
        <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-bold text-red-500">
              CRITICAL: Runway Below 3 Months
            </h3>
          </div>
          <p className="mt-2 text-sm">
            <strong>Zero cash date:</strong> {liq.burnRunway?.zeroCashDate}
          </p>
        </div>
      )}

      {/* SECTION 2 — Cash Position */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Cash Position & Forecasting</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Current Cash" value={fmtL(liq.cashPosition?.currentCash)} icon={DollarSign} color="text-green-500" />
          <StatCard label="Operating Cash" value={fmtL(liq.cashPosition?.operatingCash)} icon={DollarSign} color="text-blue-500" />
          <StatCard label="Restricted Cash" value={fmtL(liq.cashPosition?.restrictedCash)} icon={DollarSign} color="text-gray-500" />
          <StatCard label="DSO" value={`${liq.cashPosition?.dso ?? 0} days`} />
          <StatCard label="DIO" value={`${liq.cashPosition?.dio ?? 0} days`} />
          <StatCard label="DPO" value={`${liq.cashPosition?.dpo ?? 0} days`} />
          <StatCard label="Cash Conversion Cycle" value={`${liq.cashPosition?.ccc ?? 0} days`} />
          <StatCard label="Quick Ratio" value={(liq.cashPosition?.quickRatio ?? 0).toFixed(2)} />
          <StatCard label="Current Ratio" value={(liq.cashPosition?.currentRatio ?? 0).toFixed(2)} />
        </div>
      </section>

      {/* SECTION 3 — Burn & Runway */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Burn & Runway</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Gross Burn" value={`${fmtL(liq.burnRunway?.grossBurn)}/mo`} icon={TrendingDown} color="text-red-500" />
          <StatCard label="Net Burn" value={`${fmtL(liq.burnRunway?.netBurn)}/mo`} icon={TrendingDown} color="text-orange-500" />
          <StatCard label="Runway" value={`${(liq.burnRunway?.runway ?? 0).toFixed(1)} mo`} icon={Clock} color="text-purple-500" />
          <StatCard label="Zero Cash Date" value={liq.burnRunway?.zeroCashDate || '-'} icon={Calendar} />
          <StatCard label="Burn Multiple" value={`${(liq.burnRunway?.burnMultiple ?? 0).toFixed(2)}x`} icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <Card className="bg-green-500/10 border-green-500 p-5">
            <p className="text-sm font-semibold text-green-500 mb-2">Best Case (+20% rev)</p>
            <p className="text-2xl font-bold font-mono text-green-500">
              {(liq.burnRunway?.scenarioBest ?? 0).toFixed(1)} mo
            </p>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500 p-5">
            <p className="text-sm font-semibold text-blue-500 mb-2">Base Case</p>
            <p className="text-2xl font-bold font-mono text-blue-500">
              {(liq.burnRunway?.scenarioBase ?? 0).toFixed(1)} mo
            </p>
          </Card>
          <Card className="bg-red-500/10 border-red-500 p-5">
            <p className="text-sm font-semibold text-red-500 mb-2">Worst Case (-20% rev)</p>
            <p className="text-2xl font-bold font-mono text-red-500">
              {(liq.burnRunway?.scenarioWorst ?? 0).toFixed(1)} mo
            </p>
          </Card>
        </div>
      </section>

      {/* SECTION 4 — 13-Week Forecast */}
      <section>
        <h2 className="text-2xl font-bold mb-4">13-Week Cash Forecast</h2>
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Week</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-right px-4 py-3 font-semibold">Projected Cash</th>
                </tr>
              </thead>
              <tbody>
                {(liq.cashFlow?.thirteenWeekForecast || []).map((w: any) => (
                  <tr key={w.week} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono">W{w.week}</td>
                    <td className="px-4 py-3 font-mono">{w.date}</td>
                    <td className="px-4 py-3 text-right font-mono">{fmtL(w.projected)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* SECTION 5 — AR Aging */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Accounts Receivable Aging</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {agingBuckets.map((b, idx) => (
            <StatCard key={b.label} label={b.label} value={fmtL(b.value)} color={agingColors[idx]} />
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3">Overdue Invoices</h3>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Customer</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-right px-4 py-3 font-semibold">Days Overdue</th>
                    <th className="text-center px-4 py-3 font-semibold">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {(liq.receivablesPayables?.overdueInvoices || []).map((inv: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="px-4 py-3">{inv.customer}</td>
                      <td className="px-4 py-3 text-right font-mono">{fmtK(inv.amount)}</td>
                      <td className="px-4 py-3 text-right font-mono">{inv.daysOverdue}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${riskBadge(inv.creditRisk)}`}>
                          {inv.creditRisk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 6 — Major Payments */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Major Payments Due (Next 30 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(liq.alerts?.majorPaymentsDue || []).map((p: any, idx: number) => (
            <Card key={idx} className="p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold">{p.vendor}</p>
                <p className="text-sm text-muted-foreground">{p.category}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-mono">{fmtK(p.amount)}</p>
                <p className="text-xs text-muted-foreground font-mono">Due: {p.dueDate}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color = 'text-gray-700' }: any) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
      </div>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
    </Card>
  )
}
