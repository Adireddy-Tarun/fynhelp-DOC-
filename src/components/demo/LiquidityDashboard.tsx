import { TrendingDown, AlertCircle, Calendar, Droplet } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CASH_FLOW_DATA = [
  { date: 'Jan 1', balance: 850000 },
  { date: 'Jan 15', balance: 920000 },
  { date: 'Feb 1', balance: 880000 },
  { date: 'Feb 15', balance: 790000 },
  { date: 'Mar 1', balance: 720000 },
  { date: 'Mar 15', balance: 650000 },
  { date: 'Apr 1', balance: 580000 },
  { date: 'Apr 15', balance: 520000 },
  { date: 'May 1', balance: 450000 },
  { date: 'May 15', balance: 380000 }
]

const TOP_EXPENSES = [
  { category: 'Salaries', amount: 180000, percent: 42 },
  { category: 'Rent', amount: 45000, percent: 11 },
  { category: 'Vendors', amount: 85000, percent: 20 },
  { category: 'Software', amount: 32000, percent: 7 },
  { category: 'Marketing', amount: 28000, percent: 7 }
]

const UPCOMING_PAYABLES = [
  { name: 'Salary Payout', date: 'May 30', amount: 180000 },
  { name: 'Office Rent', date: 'Jun 1', amount: 45000 },
  { name: 'Vendor Payment - Acme Co', date: 'Jun 5', amount: 32000 },
  { name: 'AWS Bill', date: 'Jun 8', amount: 12000 }
]

export function LiquidityDashboard() {
  const currentCash = 380000
  const monthlyBurn = 210000
  const runway = (currentCash / monthlyBurn).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-white font-semibold mb-1">Critical: Low Runway</p>
          <p className="text-white/80 text-sm">
            At current burn rate, you have {runway} months of cash remaining. Consider reducing expenses or accelerating revenue.
          </p>
        </div>
      </div>

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
          <div className="flex items-center gap-1 text-red-400 text-sm">
            <TrendingDown size={16} />
            <span>₹1.8L this month</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70 text-sm font-semibold uppercase">Runway</span>
            <Calendar size={20} className="text-amber-400" />
          </div>
          <div className="text-4xl font-georgia font-bold text-white mb-2">
            {runway} months
          </div>
          <div className="text-white/60 text-sm">
            At ₹{(monthlyBurn / 100000).toFixed(1)}L/month burn
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
          <div className="flex items-center gap-1 text-red-400 text-sm">
            <TrendingDown size={16} />
            <span>+12% vs last month</span>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-georgia font-bold text-white mb-6">
          Cash Flow Trend (Last 90 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={CASH_FLOW_DATA}>
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
                color: '#fff'
              }}
              formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Cash Balance']}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#C41E1E"
              strokeWidth={3}
              dot={{ fill: '#C41E1E', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-georgia font-bold text-white mb-6">
            Top Expense Categories
          </h3>
          <div className="space-y-4">
            {TOP_EXPENSES.map((expense, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90 font-semibold text-sm">{expense.category}</span>
                  <span className="text-white font-bold">₹{(expense.amount / 1000).toFixed(0)}K</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#C41E1E] to-[#E85D5D]"
                    style={{ width: `${expense.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-georgia font-bold text-white mb-6">
            Upcoming Payables (Next 30 Days)
          </h3>
          <div className="space-y-3">
            {UPCOMING_PAYABLES.map((payable, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div>
                  <p className="text-white font-semibold text-sm mb-1">{payable.name}</p>
                  <p className="text-white/60 text-xs">Due: {payable.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">₹{(payable.amount / 1000).toFixed(0)}K</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/70 font-semibold">Total Due</span>
              <span className="text-xl font-bold text-white">
                ₹{(UPCOMING_PAYABLES.reduce((sum, p) => sum + p.amount, 0) / 100000).toFixed(1)}L
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
