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

  const fmtL = (n: number) => `₹${((n || 0) / 100000).toFixed(1)}L`
  const fmtK = (n: number) => `₹${((n || 0) / 1000).toFixed(0)}K`

  const riskColor = (level: string) => {
    const l = (level || '').toLowerCase()
    if (l === 'high') return 'bg-red-100 text-red-700 border border-red-200'
    if (l === 'medium') return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
    return 'bg-green-100 text-green-700 border border-green-200'
  }

  const agingColor = (idx: number) => {
    return ['text-green-600', 'text-yellow-600', 'text-orange-600', 'text-red-600'][idx] || 'text-gray-700'
  }

  const arAging = liq.receivablesPayables?.arAging || {}
  const agingBuckets = [
    { label: '0-30 days', value: arAging['0-30'] || arAging.bucket0_30 || 0 },
    { label: '31-60 days', value: arAging['31-60'] || arAging.bucket31_60 || 0 },
    { label: '61-90 days', value: arAging['61-90'] || arAging.bucket61_90 || 0 },
    { label: '90+ days', value: arAging['90+'] || arAging.bucket90plus || 0 },
  ]

  return (
    <div className="space-y-8">
      {/* RUNWAY ALERT */}
      {liq.alerts?.runwayAlert && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-lg font-bold text-red-700">
              CRITICAL: Runway Below 3 Months
            </h3>
          </div>
          <p className="mt-2 text-sm text-red-600 font-mono">
            Zero cash date: {liq.burnRunway?.zeroCashDate}
          </p>
        </div>
      )}

      {/* CASH POSITION */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Cash Position & Forecasting</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Current Cash"
            value={fmtL(liq.cashPosition?.currentCash || 0)}
            icon={DollarSign}
            color="text-green-600"
          />
          <StatCard
            label="Operating Cash"
            value={fmtL(liq.cashPosition?.operatingCash || 0)}
            icon={DollarSign}
            color="text-blue-600"
          />
          <StatCard
            label="Restricted Cash"
            value={fmtL(liq.cashPosition?.restrictedCash || 0)}
            icon={DollarSign}
            color="text-gray-600"
          />
          <StatCard label="DSO" value={`${liq.cashPosition?.dso ?? 0} days`} />
          <StatCard label="DIO" value={`${liq.cashPosition?.dio ?? 0} days`} />
          <StatCard label="DPO" value={`${liq.cashPosition?.dpo ?? 0} days`} />
          <StatCard
            label="Cash Conversion Cycle"
            value={`${liq.cashPosition?.cashConversionCycle ?? 0} days`}
          />
          <StatCard
            label="Quick Ratio"
            value={(liq.cashPosition?.quickRatio ?? 0).toFixed(2)}
          />
          <StatCard
            label="Current Ratio"
            value={(liq.cashPosition?.currentRatio ?? 0).toFixed(2)}
          />
        </div>
      </section>

      {/* BURN & RUNWAY */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Burn & Runway</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Gross Burn"
            value={`${fmtL(liq.burnRunway?.grossBurn || 0)}/mo`}
            icon={TrendingDown}
            color="text-red-600"
          />
          <StatCard
            label="Net Burn"
            value={`${fmtL(liq.burnRunway?.netBurn || 0)}/mo`}
            icon={TrendingDown}
            color="text-orange-600"
          />
          <StatCard
            label="Runway"
            value={`${(liq.burnRunway?.runway || 0).toFixed(1)} months`}
            icon={Clock}
            color="text-purple-600"
          />
          <StatCard
            label="Zero Cash Date"
            value={liq.burnRunway?.zeroCashDate || '-'}
            icon={Calendar}
          />
          <StatCard
            label="Burn Multiple"
            value={`${(liq.burnRunway?.burnMultiple || 0).toFixed(2)}x`}
          />
        </div>

        {/* SCENARIOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-5">
            <h4 className="text-sm font-semibold text-green-700 mb-2">
              Best Case (+20% rev)
            </h4>
            <p className="text-2xl font-bold font-mono text-green-700">
              {(liq.burnRunway?.scenarioBest || 0).toFixed(1)} mo
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
            <h4 className="text-sm font-semibold text-blue-700 mb-2">Base Case</h4>
            <p className="text-2xl font-bold font-mono text-blue-700">
              {(liq.burnRunway?.scenarioBase || 0).toFixed(1)} mo
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-5">
            <h4 className="text-sm font-semibold text-red-700 mb-2">
              Worst Case (-20% rev)
            </h4>
            <p className="text-2xl font-bold font-mono text-red-700">
              {(liq.burnRunway?.scenarioWorst || 0).toFixed(1)} mo
            </p>
          </div>
        </div>
      </section>

      {/* 13-WEEK FORECAST */}
      <section>
        <h2 className="text-2xl font-bold mb-4">13-Week Cash Forecast</h2>
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
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
                    <td className="px-4 py-3 text-right font-mono">
                      {fmtL(w.projected || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* AR AGING */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Accounts Receivable Aging</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {agingBuckets.map((b, idx) => (
            <StatCard
              key={b.label}
              label={b.label}
              value={fmtL(b.value)}
              color={agingColor(idx)}
            />
          ))}
        </div>

        {/* OVERDUE INVOICES */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3">Overdue Invoices</h3>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Customer</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-right px-4 py-3 font-semibold">Days Overdue</th>
                    <th className="text-center px-4 py-3 font-semibold">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {(liq.receivablesPayables?.overdueInvoices || []).map(
                    (inv: any, idx: number) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="px-4 py-3">{inv.customer}</td>
                        <td className="px-4 py-3 text-right font-mono">
                          {fmtK(inv.amount)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {inv.daysOverdue}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${riskColor(
                              inv.creditRisk
                            )}`}
                          >
                            {inv.creditRisk}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* MAJOR PAYMENTS DUE */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          Major Payments Due (Next 30 Days)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(liq.alerts?.majorPaymentsDue || []).map((p: any, idx: number) => (
            <Card key={idx} className="p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold">{p.vendor}</p>
                <p className="text-sm text-gray-500">{p.category}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-mono">{fmtK(p.amount)}</p>
                <p className="text-xs text-gray-500 font-mono">Due: {p.dueDate}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'text-gray-700',
}: {
  label: string
  value: React.ReactNode
  icon?: any
  color?: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {Icon && <Icon className={color} size={18} />}
      </div>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
    </Card>
  )
}
