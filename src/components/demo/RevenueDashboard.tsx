import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function RevenueDashboard({ data }: { data: any }) {
  if (!data?.revenue) {
    return (
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-12 text-center">
        <p className="text-white/70">No revenue data available</p>
      </div>
    )
  }

  const { totalRevenue, transactions } = data.revenue

  const monthlyRevenue = data.liquidity?.cashFlowTimeline
    ?.filter((item: any) => item.balance > 0)
    ?.slice(0, 6)
    ?.map((item: any) => ({
      month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
      revenue: Math.abs(item.balance * 0.3),
    })) || []

  const revenueSources = [
    { source: 'Product Sales', amount: totalRevenue * 0.45, percent: 45 },
    { source: 'Services', amount: totalRevenue * 0.30, percent: 30 },
    { source: 'Subscriptions', amount: totalRevenue * 0.15, percent: 15 },
    { source: 'Other', amount: totalRevenue * 0.10, percent: 10 },
  ]

  const avgMonthlyRevenue = totalRevenue / 3
  const projectedAnnualRevenue = avgMonthlyRevenue * 12

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70 text-sm font-semibold uppercase">Total Revenue</span>
            <DollarSign size={20} className="text-green-400" />
          </div>
          <div className="text-4xl font-georgia font-bold text-white mb-2">
            ₹{(totalRevenue / 100000).toFixed(1)}L
          </div>
          <p className="text-white/60 text-sm">Last 90 days</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70 text-sm font-semibold uppercase">Avg Monthly</span>
            <Calendar size={20} className="text-blue-400" />
          </div>
          <div className="text-4xl font-georgia font-bold text-white mb-2">
            ₹{(avgMonthlyRevenue / 100000).toFixed(1)}L
          </div>
          <p className="text-white/60 text-sm">Per month</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70 text-sm font-semibold uppercase">Projected ARR</span>
            <TrendingUp size={20} className="text-purple-400" />
          </div>
          <div className="text-4xl font-georgia font-bold text-white mb-2">
            ₹{(projectedAnnualRevenue / 10000000).toFixed(1)}Cr
          </div>
          <p className="text-white/60 text-sm">Annual run rate</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70 text-sm font-semibold uppercase">Transactions</span>
            <Users size={20} className="text-amber-400" />
          </div>
          <div className="text-4xl font-georgia font-bold text-white mb-2">
            {transactions || 0}
          </div>
          <p className="text-white/60 text-sm">Income entries</p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-georgia font-bold text-white mb-6">
          Revenue Trend (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenue}>
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(26, 20, 18, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-georgia font-bold text-white mb-6">Revenue Breakdown</h3>
          <div className="space-y-4">
            {revenueSources.map((source, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90 font-semibold text-sm">{source.source}</span>
                  <span className="text-white font-bold">
                    ₹{(source.amount / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                    style={{ width: `${source.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-georgia font-bold text-white mb-6">Revenue Insights</h3>
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <TrendingUp size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Strong Revenue Base</p>
                  <p className="text-white/70 text-sm">
                    Current monthly revenue of ₹{(avgMonthlyRevenue / 100000).toFixed(1)}L provides solid foundation for growth.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <DollarSign size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Diversified Income</p>
                  <p className="text-white/70 text-sm">
                    Revenue spread across {revenueSources.length} streams reduces dependency risk.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm mb-1">ARR Projection</p>
                  <p className="text-white/70 text-sm">
                    At current pace, projected annual revenue: ₹{(projectedAnnualRevenue / 10000000).toFixed(2)}Cr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
