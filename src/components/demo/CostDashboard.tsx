import { motion } from 'framer-motion'
import {
  TrendingDown,
  DollarSign,
  Users,
  AlertTriangle,
  Package,
  Percent,
  Target,
  Award,
  Zap,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { CFOCard } from '@/components/ui/CFOCard'
import { RotatingButton } from '@/components/ui/RotatingButton'
import { colors, staggerContainer, fadeInUp } from '@/lib/design-system'

const cardStyle = {
  background: colors.bg.card,
  border: `1px solid rgba(255,255,255,0.08)`,
}

const sectionTitle = {
  fontFamily: 'Georgia, serif',
  fontSize: 24,
  color: colors.text.primary,
}

export function CostDashboard({ data }: { data: any }) {
  const costData = data?.cost || {
    totalCost: 630000,
    topCategories: [
      { category: 'salary', amount: 180000 },
      { category: 'rent', amount: 45000 },
      { category: 'vendor', amount: 85000 },
    ],
  }

  const { totalCost } = costData
  const revenue = data?.revenue?.totalRevenue || 420000

  // METRIC 1: COGS & Gross Margin
  const cogs = totalCost * 0.28
  const grossProfit = revenue - cogs
  const grossMargin = (grossProfit / revenue) * 100

  // METRIC 2: OpEx Breakdown
  const opex = totalCost - cogs
  const salesMarketing = opex * 0.35
  const researchDev = opex * 0.28
  const generalAdmin = opex * 0.22
  const other = opex * 0.15

  const opexBreakdown = [
    { name: 'Sales & Marketing', value: salesMarketing, color: colors.primary[500], percent: 35 },
    { name: 'R&D', value: researchDev, color: colors.accent[500], percent: 28 },
    { name: 'G&A', value: generalAdmin, color: colors.info.main, percent: 22 },
    { name: 'Other', value: other, color: colors.success.main, percent: 15 },
  ]

  // METRIC 3: EBITDA
  const ebitda = revenue - opex
  const ebitdaMargin = (ebitda / revenue) * 100

  // METRIC 4: Fixed vs Variable
  const fixedCosts = totalCost * 0.62
  const variableCosts = totalCost * 0.38

  // METRIC 5: Top 10 Vendors
  const topVendors = [
    { vendor: 'AWS', amount: 85000, percent: 13.5, paymentTerms: 'Net 30', renewalDate: '2026-08-15', risk: 'high' },
    { vendor: 'Google Workspace', amount: 45000, percent: 7.1, paymentTerms: 'Net 15', renewalDate: '2026-06-01', risk: 'low' },
    { vendor: 'Salesforce', amount: 38000, percent: 6.0, paymentTerms: 'Net 45', renewalDate: '2026-09-20', risk: 'medium' },
    { vendor: 'Office Rent', amount: 45000, percent: 7.1, paymentTerms: 'Net 7', renewalDate: '2027-01-01', risk: 'low' },
    { vendor: 'Stripe', amount: 32000, percent: 5.1, paymentTerms: 'Net 7', renewalDate: 'Rolling', risk: 'low' },
    { vendor: 'HubSpot', amount: 28000, percent: 4.4, paymentTerms: 'Net 30', renewalDate: '2026-07-10', risk: 'medium' },
    { vendor: 'LinkedIn Ads', amount: 42000, percent: 6.7, paymentTerms: 'Prepaid', renewalDate: 'Monthly', risk: 'high' },
    { vendor: 'Slack', amount: 18000, percent: 2.9, paymentTerms: 'Net 30', renewalDate: '2026-11-05', risk: 'low' },
    { vendor: 'Zoom', amount: 12000, percent: 1.9, paymentTerms: 'Net 30', renewalDate: '2026-10-15', risk: 'low' },
    { vendor: 'GitHub', amount: 15000, percent: 2.4, paymentTerms: 'Net 30', renewalDate: '2026-12-01', risk: 'low' },
  ]
  const topVendorsTotal = topVendors.reduce((s, v) => s + v.amount, 0)
  const vendorConcentration = (topVendorsTotal / totalCost) * 100

  // METRIC 6: Efficiency
  const headcount = 12
  const revenuePerEmployee = revenue / headcount
  const grossProfitPerEmployee = grossProfit / headcount
  const netNewArr = revenue * 0.25
  const salesEfficiency = netNewArr / salesMarketing

  // METRIC 7: G&A
  const gaPercent = (generalAdmin / revenue) * 100

  // METRIC 8: Unit economics
  const customers = 28
  const transactions = data?.revenue?.transactions || 8
  const costPerCustomer = totalCost / customers
  const costToServe = opex / customers
  const costPerTransaction = totalCost / transactions

  // METRIC 9: Trend
  const costTrend = [
    { month: 'Oct', opex: opex * 0.78, cogs: cogs * 0.82 },
    { month: 'Nov', opex: opex * 0.85, cogs: cogs * 0.88 },
    { month: 'Dec', opex: opex * 0.91, cogs: cogs * 0.93 },
    { month: 'Jan', opex: opex * 0.95, cogs: cogs * 0.96 },
    { month: 'Feb', opex: opex * 0.98, cogs: cogs * 0.99 },
    { month: 'Mar', opex, cogs },
  ]

  // METRIC 10: Optimization
  const optimizationFlags = [
    { issue: 'Over-provisioned AWS', savings: 28000, priority: 'high', action: 'Right-size 3 EC2 instances, remove unused EBS volumes' },
    { issue: 'Duplicate Slack + Teams', savings: 9000, priority: 'medium', action: 'Consolidate to single platform, cancel redundant licenses' },
    { issue: 'Unused Salesforce seats', savings: 12000, priority: 'high', action: '8 inactive users for 60+ days, downgrade tier' },
    { issue: 'LinkedIn Ads ROI < 1.5x', savings: 18000, priority: 'medium', action: 'Pause underperforming campaigns, reallocate to organic' },
    { issue: 'Vendor payment terms', savings: 0, priority: 'low', action: 'Renegotiate AWS to Net 45, free up ₹85K cash flow' },
  ]
  const totalOptimizationSavings = optimizationFlags.reduce((s, f) => s + f.savings, 0)
  const highPriority = optimizationFlags.filter((f) => f.priority === 'high')
  const highPrioritySavings = highPriority.reduce((s, f) => s + f.savings, 0)

  const riskColor = (r: string) =>
    r === 'high' ? colors.danger.main : r === 'medium' ? colors.warning.main : colors.success.main
  const priorityColor = (p: string) =>
    p === 'high' ? colors.danger.main : p === 'medium' ? colors.warning.main : colors.info.main

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Banner */}
      <motion.div
        variants={fadeInUp}
        className="rounded-2xl p-8"
        style={{
          background: `linear-gradient(135deg, ${colors.bg.secondary} 0%, ${colors.bg.tertiary} 100%)`,
          border: `1px solid ${colors.warning.main}40`,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle size={20} style={{ color: colors.warning.main }} />
          <span className="font-inter font-semibold uppercase tracking-wider text-xs" style={{ color: colors.warning.main }}>
            Cost Optimization Potential: ₹{(totalOptimizationSavings / 1000).toFixed(0)}K/month
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>Total Monthly Costs</p>
            <p className="font-mono font-bold text-3xl" style={{ color: colors.text.primary }}>₹{(totalCost / 100000).toFixed(1)}L</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>Gross Margin</p>
            <p className="font-mono font-bold text-3xl" style={{ color: grossMargin > 70 ? colors.success.main : colors.warning.main }}>
              {grossMargin.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>EBITDA Margin</p>
            <p className="font-mono font-bold text-3xl" style={{ color: ebitda > 0 ? colors.success.main : colors.danger.main }}>
              {ebitdaMargin.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>OpEx</p>
            <p className="font-mono font-semibold text-xl" style={{ color: colors.text.secondary }}>₹{(opex / 100000).toFixed(1)}L</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>COGS</p>
            <p className="font-mono font-semibold text-xl" style={{ color: colors.text.secondary }}>₹{(cogs / 100000).toFixed(1)}L</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>G&A % Revenue</p>
            <p className="font-mono font-semibold text-xl" style={{ color: gaPercent < 15 ? colors.success.main : colors.warning.main }}>
              {gaPercent.toFixed(1)}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* 5 CFO Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <CFOCard
          title="Total Costs"
          value={(totalCost / 100000).toFixed(1)}
          prefix="₹"
          suffix="L"
          icon={DollarSign}
          trend="Monthly burn"
          status="warning"
          subtitle="All-in expenses"
        />
        <CFOCard
          title="Gross Margin"
          value={grossMargin.toFixed(1)}
          suffix="%"
          icon={Percent}
          trend={grossMargin > 70 ? 'Healthy' : 'Needs work'}
          status={grossMargin > 70 ? 'good' : 'warning'}
          subtitle="Revenue - COGS"
        />
        <CFOCard
          title="EBITDA"
          value={(ebitda / 100000).toFixed(1)}
          prefix="₹"
          suffix="L"
          icon={Target}
          trend={ebitda > 0 ? 'Profitable' : 'Burning'}
          status={ebitda > 0 ? 'good' : 'danger'}
          subtitle="Revenue - OpEx"
        />
        <CFOCard
          title="Rev / Employee"
          value={(revenuePerEmployee / 1000).toFixed(0)}
          prefix="₹"
          suffix="K"
          icon={Users}
          trend={revenuePerEmployee > 50000 ? 'Above target' : 'Below target'}
          status={revenuePerEmployee > 50000 ? 'good' : 'warning'}
          subtitle={`${headcount} employees`}
        />
        <CFOCard
          title="Vendor Concentration"
          value={vendorConcentration.toFixed(0)}
          suffix="%"
          icon={Package}
          trend={vendorConcentration > 60 ? 'Concentrated' : 'Diversified'}
          status={vendorConcentration > 60 ? 'warning' : 'good'}
          subtitle="Top 10 vendors"
        />
      </motion.div>

      {/* COGS & Gross Margin */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
        <h3 style={sectionTitle} className="mb-6">COGS & Gross Margin Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl p-5" style={{ background: colors.bg.secondary }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>Revenue</p>
            <p className="font-mono font-bold text-2xl" style={{ color: colors.text.primary }}>₹{(revenue / 100000).toFixed(1)}L</p>
          </div>
          <div className="rounded-xl p-5" style={{ background: colors.bg.secondary }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>COGS</p>
            <p className="font-mono font-bold text-2xl" style={{ color: colors.warning.main }}>₹{(cogs / 100000).toFixed(1)}L</p>
            <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>{((cogs / revenue) * 100).toFixed(1)}% of revenue</p>
          </div>
          <div className="rounded-xl p-5" style={{ background: colors.bg.secondary }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>Gross Profit</p>
            <p className="font-mono font-bold text-2xl" style={{ color: colors.success.main }}>₹{(grossProfit / 100000).toFixed(1)}L</p>
            <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>{grossMargin.toFixed(1)}% margin</p>
          </div>
        </div>
        <div
          className="mt-6 p-4 rounded-xl"
          style={{
            background: `${grossMargin > 70 ? colors.success.main : colors.warning.main}15`,
            border: `1px solid ${grossMargin > 70 ? colors.success.main : colors.warning.main}40`,
          }}
        >
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            <strong style={{ color: colors.text.primary }}>Benchmark:</strong>{' '}
            {grossMargin > 75
              ? 'Excellent GM >75%. Strong pricing power.'
              : grossMargin > 70
              ? 'Good GM 70-75%. Healthy SaaS margins.'
              : grossMargin > 60
              ? 'Moderate GM 60-70%. Room for improvement in COGS.'
              : 'Low GM <60%. Investigate COGS structure urgently.'}
          </p>
        </div>
      </motion.div>

      {/* OpEx + EBITDA */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OpEx Pie */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 style={sectionTitle} className="mb-6">Operating Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={opexBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {opexBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: colors.bg.secondary, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                formatter={(value: number) => `₹${(value / 1000).toFixed(0)}K`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {opexBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{ background: colors.bg.secondary }}>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm" style={{ color: colors.text.secondary }}>{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm" style={{ color: colors.text.primary }}>₹{(item.value / 1000).toFixed(0)}K</span>
                  <span className="text-xs" style={{ color: colors.text.tertiary }}>{item.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EBITDA */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 style={sectionTitle} className="mb-6">EBITDA Calculation</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: colors.bg.secondary }}>
              <span style={{ color: colors.text.secondary }}>Revenue</span>
              <span className="font-mono font-semibold" style={{ color: colors.success.main }}>+₹{(revenue / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: colors.bg.secondary }}>
              <span style={{ color: colors.text.secondary }}>Operating Expenses</span>
              <span className="font-mono font-semibold" style={{ color: colors.danger.main }}>-₹{(opex / 100000).toFixed(1)}L</span>
            </div>
            <div
              className="flex items-center justify-between p-4 rounded-lg"
              style={{
                background: ebitda > 0 ? `${colors.success.main}20` : `${colors.danger.main}20`,
                border: `2px solid ${ebitda > 0 ? colors.success.main : colors.danger.main}`,
              }}
            >
              <span className="font-semibold" style={{ color: colors.text.primary }}>EBITDA</span>
              <span className="font-mono font-bold text-xl" style={{ color: ebitda > 0 ? colors.success.main : colors.danger.main }}>
                ₹{(ebitda / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="p-4 rounded-lg" style={{ background: colors.bg.secondary }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: colors.text.secondary }}>EBITDA Margin</span>
                <span className="font-mono font-bold text-lg" style={{ color: ebitda > 0 ? colors.success.main : colors.danger.main }}>
                  {ebitdaMargin.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs" style={{ color: colors.text.tertiary }}>
                {ebitdaMargin > 20
                  ? 'Excellent profitability'
                  : ebitdaMargin > 10
                  ? 'Good profitability'
                  : ebitdaMargin > 0
                  ? 'Break-even, room to improve'
                  : 'Negative EBITDA - prioritize path to profitability'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fixed vs Variable */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
        <h3 style={sectionTitle} className="mb-6">Fixed vs Variable Cost Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl p-5" style={{ background: colors.bg.secondary, border: `1px solid ${colors.primary[500]}40` }}>
            <div className="flex items-center gap-2 mb-3">
              <Package size={18} style={{ color: colors.primary[500] }} />
              <h4 className="font-semibold" style={{ color: colors.text.primary }}>Fixed Costs</h4>
            </div>
            <p className="font-mono font-bold text-3xl mb-1" style={{ color: colors.text.primary }}>₹{(fixedCosts / 100000).toFixed(1)}L</p>
            <p className="text-xs mb-4" style={{ color: colors.text.tertiary }}>{((fixedCosts / totalCost) * 100).toFixed(0)}% of total costs</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span style={{ color: colors.text.secondary }}>Salaries</span><span className="font-mono" style={{ color: colors.text.primary }}>₹{((fixedCosts * 0.58) / 1000).toFixed(0)}K</span></div>
              <div className="flex justify-between"><span style={{ color: colors.text.secondary }}>Rent</span><span className="font-mono" style={{ color: colors.text.primary }}>₹{((fixedCosts * 0.14) / 1000).toFixed(0)}K</span></div>
              <div className="flex justify-between"><span style={{ color: colors.text.secondary }}>Software</span><span className="font-mono" style={{ color: colors.text.primary }}>₹{((fixedCosts * 0.28) / 1000).toFixed(0)}K</span></div>
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: colors.bg.secondary, border: `1px solid ${colors.accent[500]}40` }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} style={{ color: colors.accent[500] }} />
              <h4 className="font-semibold" style={{ color: colors.text.primary }}>Variable Costs</h4>
            </div>
            <p className="font-mono font-bold text-3xl mb-1" style={{ color: colors.text.primary }}>₹{(variableCosts / 100000).toFixed(1)}L</p>
            <p className="text-xs mb-4" style={{ color: colors.text.tertiary }}>{((variableCosts / totalCost) * 100).toFixed(0)}% of total costs</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span style={{ color: colors.text.secondary }}>COGS</span><span className="font-mono" style={{ color: colors.text.primary }}>₹{((variableCosts * 0.74) / 1000).toFixed(0)}K</span></div>
              <div className="flex justify-between"><span style={{ color: colors.text.secondary }}>Commissions</span><span className="font-mono" style={{ color: colors.text.primary }}>₹{((variableCosts * 0.18) / 1000).toFixed(0)}K</span></div>
              <div className="flex justify-between"><span style={{ color: colors.text.secondary }}>Usage-based</span><span className="font-mono" style={{ color: colors.text.primary }}>₹{((variableCosts * 0.08) / 1000).toFixed(0)}K</span></div>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 rounded-xl" style={{ background: `${colors.info.main}15`, border: `1px solid ${colors.info.main}40` }}>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            <strong style={{ color: colors.text.primary }}>Cost Structure:</strong>{' '}
            {fixedCosts / totalCost > 0.7
              ? 'High fixed cost base (>70%) reduces flexibility. Consider variable alternatives.'
              : 'Balanced cost structure with healthy variable component. Scales with revenue.'}
          </p>
        </div>
      </motion.div>

      {/* Top 10 Vendors */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-6">
          <h3 style={sectionTitle}>Top 10 Vendors by Spend</h3>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Vendor Concentration</p>
            <p className="font-mono font-bold text-xl" style={{ color: colors.warning.main }}>{vendorConcentration.toFixed(1)}%</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl" style={{ background: colors.bg.secondary }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['VENDOR', 'MONTHLY', '% TOTAL', 'TERMS', 'RENEWAL', 'RISK'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider font-semibold" style={{ color: colors.text.tertiary }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topVendors.map((v, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: colors.text.primary }}>{v.vendor}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: colors.text.primary }}>₹{(v.amount / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-3 font-mono" style={{ color: colors.text.secondary }}>{v.percent.toFixed(1)}%</td>
                  <td className="px-4 py-3" style={{ color: colors.text.secondary }}>{v.paymentTerms}</td>
                  <td className="px-4 py-3" style={{ color: colors.text.secondary }}>{v.renewalDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{ background: `${riskColor(v.risk)}20`, color: riskColor(v.risk) }}
                    >
                      {v.risk.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl" style={{ background: colors.bg.secondary }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>High Risk Vendors</p>
            <p className="font-mono font-bold text-2xl" style={{ color: colors.danger.main }}>{topVendors.filter((v) => v.risk === 'high').length}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: colors.bg.secondary }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>Avg Payment Terms</p>
            <p className="font-mono font-bold text-2xl" style={{ color: colors.text.primary }}>Net 28</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: colors.bg.secondary }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>Top 3 = % Total</p>
            <p className="font-mono font-bold text-2xl" style={{ color: colors.warning.main }}>
              {(((topVendors[0].amount + topVendors[1].amount + topVendors[2].amount) / totalCost) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* Efficiency + Unit Economics */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 style={sectionTitle} className="mb-6">Efficiency Metrics</h3>
          <div className="space-y-3">
            {[
              { label: 'Revenue per Employee', value: `₹${(revenuePerEmployee / 1000).toFixed(0)}K`, sub: `${headcount} employees • Target: >₹50K/employee`, color: revenuePerEmployee > 50000 ? colors.success.main : colors.warning.main },
              { label: 'Gross Profit per Employee', value: `₹${(grossProfitPerEmployee / 1000).toFixed(0)}K`, sub: 'After COGS • Target: >₹40K/employee', color: grossProfitPerEmployee > 40000 ? colors.success.main : colors.warning.main },
              { label: 'Sales Efficiency', value: `${salesEfficiency.toFixed(2)}x`, sub: 'Net New ARR / S&M Spend • Target: >0.75x', color: salesEfficiency > 0.75 ? colors.success.main : colors.warning.main },
              { label: 'G&A as % of Revenue', value: `${gaPercent.toFixed(1)}%`, sub: gaPercent < 15 ? '✓ Within target <15%' : '⚠ Above target, optimize overhead', color: gaPercent < 15 ? colors.success.main : colors.warning.main },
            ].map((m, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: colors.bg.secondary }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm" style={{ color: colors.text.secondary }}>{m.label}</span>
                  <span className="font-mono font-bold text-lg" style={{ color: m.color }}>{m.value}</span>
                </div>
                <p className="text-xs" style={{ color: colors.text.tertiary }}>{m.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Unit Economics */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 style={sectionTitle} className="mb-6">Unit Economics</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl" style={{ background: colors.bg.secondary }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm" style={{ color: colors.text.secondary }}>Cost per Customer</span>
                <span className="font-mono font-bold text-lg" style={{ color: colors.accent[500] }}>₹{(costPerCustomer / 1000).toFixed(0)}K</span>
              </div>
              <p className="text-xs" style={{ color: colors.text.tertiary }}>Total costs / {customers} customers</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: colors.bg.secondary }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm" style={{ color: colors.text.secondary }}>Cost to Serve</span>
                <span className="font-mono font-bold text-lg" style={{ color: colors.info.main }}>₹{(costToServe / 1000).toFixed(0)}K</span>
              </div>
              <p className="text-xs" style={{ color: colors.text.tertiary }}>OpEx only (excluding COGS)</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: colors.bg.secondary }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm" style={{ color: colors.text.secondary }}>Cost per Transaction</span>
                <span className="font-mono font-bold text-lg" style={{ color: colors.primary[500] }}>₹{(costPerTransaction / 1000).toFixed(0)}K</span>
              </div>
              <p className="text-xs" style={{ color: colors.text.tertiary }}>{transactions} revenue transactions</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: `${colors.success.main}15`, border: `1px solid ${colors.success.main}40` }}>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                <strong style={{ color: colors.text.primary }}>Key Insight:</strong> As you scale to 100+ customers, cost/customer should drop by 40-60% through operational leverage.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cost Trend */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
        <h3 style={sectionTitle} className="mb-6">Cost Trend Analysis (6 Months)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={costTrend}>
            <XAxis dataKey="month" stroke={colors.text.tertiary} style={{ fontFamily: 'JetBrains Mono, monospace' }} />
            <YAxis stroke={colors.text.tertiary} style={{ fontFamily: 'JetBrains Mono, monospace' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
            <Tooltip
              contentStyle={{ background: colors.bg.secondary, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
            />
            <Legend />
            <Line type="monotone" dataKey="opex" stroke={colors.primary[500]} strokeWidth={3} dot={{ fill: colors.primary[500], r: 4 }} name="OpEx" />
            <Line type="monotone" dataKey="cogs" stroke={colors.accent[500]} strokeWidth={3} dot={{ fill: colors.accent[500], r: 4 }} name="COGS" />
          </LineChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-xl" style={{ background: colors.bg.secondary }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>OpEx Growth (6mo)</p>
            <p className="font-mono font-bold text-xl" style={{ color: colors.warning.main }}>+28%</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: colors.bg.secondary }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>COGS Growth (6mo)</p>
            <p className="font-mono font-bold text-xl" style={{ color: colors.warning.main }}>+22%</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: colors.bg.secondary }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>Total Growth (6mo)</p>
            <p className="font-mono font-bold text-xl" style={{ color: colors.warning.main }}>+26%</p>
          </div>
        </div>
      </motion.div>

      {/* Optimization Opportunities */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-6">
          <h3 style={sectionTitle}>Cost Optimization Opportunities</h3>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Total Potential Savings</p>
            <p className="font-mono font-bold text-xl" style={{ color: colors.success.main }}>
              ₹{(totalOptimizationSavings / 1000).toFixed(0)}K/mo
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {optimizationFlags.map((flag, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              style={{ background: colors.bg.secondary, border: `1px solid ${priorityColor(flag.priority)}30` }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-bold"
                    style={{ background: `${priorityColor(flag.priority)}20`, color: priorityColor(flag.priority) }}
                  >
                    {flag.priority.toUpperCase()}
                  </span>
                  <h4 className="font-semibold" style={{ color: colors.text.primary }}>{flag.issue}</h4>
                </div>
                <p className="text-sm" style={{ color: colors.text.secondary }}>{flag.action}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Saves</p>
                <p className="font-mono font-bold text-lg" style={{ color: colors.success.main }}>
                  {flag.savings > 0 ? `₹${(flag.savings / 1000).toFixed(0)}K` : 'Cash flow'}
                </p>
              </div>
              <div className="flex gap-2">
                <RotatingButton variant="primary">Take Action</RotatingButton>
                <RotatingButton variant="secondary">Snooze</RotatingButton>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl" style={{ background: `${colors.success.main}15`, border: `1px solid ${colors.success.main}40` }}>
          <p className="font-semibold mb-1" style={{ color: colors.text.primary }}>💰 Quick Wins Available</p>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            {highPriority.length} high-priority actions identified. Implementing top 3 would save ₹{(highPrioritySavings / 1000).toFixed(0)}K/month, adding{' '}
            {((highPrioritySavings / (totalCost / 3)) * 30).toFixed(0)} days to runway.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CostDashboard
