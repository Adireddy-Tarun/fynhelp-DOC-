import { AlertCircle, Calendar, Droplet } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function LiquidityDashboard({ data }: { data?: any }) {
  if (!data?.liquidity) {
    return (
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-12 text-center">
        <p className="text-white/70">No liquidity data available</p>
      </div>
    )
  }

  const { currentCash, monthlyBurn, runway, topExpenses, cashFlowTimeline } = data.liquidity

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {runway < 3 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold mb-1">Critical: Low Runway</p>
            <p className="text-white/80 text-sm">
              At current burn rate, you have {runway.toFixed(1)} months of cash remaining.
            </p>
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70 text-sm font-semibold uppercase">Current Cash</span>
            <Droplet size={20} className="text-blue-400" />
          </div>
          <div className="text-4xl font-georgia font-bold text-white mb-2">
            ₹{(currentCash / 100000).toFixed(1)}L
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70 text-sm font-semibold uppercase">Runway</span>
            <Calendar size={20} className="text-amber-400" />
          </div>
          <div className="text-4xl font-georgia font-bold text-white mb-2">
            {runway.toFixed(1)} months
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70 text-sm font-semibold uppercase">Monthly Burn</span>
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <div className="text-4xl font-georgia font-bold text-white mb-2">
            ₹{(monthlyBurn / 100000).toFixed(1)}L
          </div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-georgia font-bold text-white mb-6">Cash Flow Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cashFlowTimeline}>
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
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
              formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Balance']}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#C41E1E"
              strokeWidth={3}
              dot={{ fill: '#C41E1E', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Expenses */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-georgia font-bold text-white mb-6">Top Expense Categories</h3>
        <div className="space-y-4">
          {topExpenses?.map((expense: any, idx: number) => {
            const percent = (expense.amount / monthlyBurn) * 100
            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90 font-semibold text-sm capitalize">
                    {expense.category}
                  </span>
                  <span className="text-white font-bold">
                    ₹{(expense.amount / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#C41E1E] to-[#E85D5D]"
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
