import { useState } from 'react'
import { motion } from 'framer-motion'
import { CFOCard } from '@/components/ui/CFOCard'
import { GalaxyButton } from '@/components/ui/GalaxyButton'
import { InteractiveGraph } from '@/components/ui/InteractiveGraph'
import { RollingText } from '@/components/ui/RollingText'
import { Card } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  Target,
  Repeat,
  Layers,
  Activity,
  PieChart,
  AlertTriangle,
  Briefcase,
  Zap,
} from 'lucide-react'
import { colors } from '@/lib/design-system'

interface RevenueDashboardProps {
  data: any
  timeRange?: '12m' | '24m' | 'all'
}

type BreakdownKey = 'byProduct' | 'bySegment' | 'byChannel'

const fmtL = (n: number) => `₹${((n || 0) / 100000).toFixed(1)}L`
const fmtCr = (n: number) => `₹${((n || 0) / 10000000).toFixed(2)}Cr`
const fmtK = (n: number) => `₹${((n || 0) / 1000).toFixed(0)}K`
const fmtPct = (n: number) => `${(n || 0).toFixed(1)}%`

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const fmtMonthKey = (ym: string) => {
  const [y, mo] = ym.split('-')
  const mi = Math.max(0, Math.min(11, parseInt(mo || '1', 10) - 1))
  return `${MONTH_NAMES[mi]} ${y}`
}

export function RevenueDashboard({ data, timeRange = '12m' }: RevenueDashboardProps) {
  const rev = data?.revenue || {}
  const historical = data?.historical || null
  const m = rev.metrics || {}
  const breakdown = rev.breakdown || {}
  const cohorts = rev.cohorts || {}
  const pipeline = rev.pipeline || {}
  const health = rev.health || {}
  const mrrTrend: Array<{ month: string; mrr: number }> = rev.mrrTrend || []
  const atRisk = rev.atRiskRevenue || {}

  // Prefer real historical revenueTrend (up to 24 months) when available
  const historicalRevenue: Array<{ month: string; revenue: number }> =
    historical?.revenueTrend?.length
      ? historical.revenueTrend.map((p: any) => ({
          month: fmtMonthKey(p.month),
          revenue: p.revenue,
        }))
      : mrrTrend.map((p) => ({ month: p.month, revenue: p.mrr }))

  const trendLimit =
    timeRange === '12m' ? 12 : timeRange === '24m' ? 24 : historicalRevenue.length
  const trendForChart = historicalRevenue.slice(-trendLimit)

  const yoyRows: Array<{
    month: string
    current: number
    previous: number
    growth: number
  }> = historical?.yoyComparison?.revenueGrowth || []

  const [breakdownTab, setBreakdownTab] = useState<BreakdownKey>('byProduct')

  const ltvCac = m.ltvCacRatio || 0
  const ltvCacStatus: 'good' | 'warning' | 'danger' =
    ltvCac >= 3 ? 'good' : ltvCac >= 1.5 ? 'warning' : 'danger'

  const ruleOf40 = m.ruleOf40 || 0
  const ruleStatus: 'good' | 'warning' | 'danger' =
    ruleOf40 >= 40 ? 'good' : ruleOf40 >= 20 ? 'warning' : 'danger'

  const nrr = m.nrr || 0
  const nrrStatus: 'good' | 'warning' | 'danger' =
    nrr >= 110 ? 'good' : nrr >= 100 ? 'warning' : 'danger'

  const breakdownTabs: Array<{ key: BreakdownKey; label: string }> = [
    { key: 'byProduct', label: 'By Product' },
    { key: 'bySegment', label: 'By Segment' },
    { key: 'byChannel', label: 'By Channel' },
  ]

  const breakdownRows: Array<{ name: string; revenue: number; percent: number }> =
    (breakdown[breakdownTab] || []).map((r: any) => ({
      name: r.name || r.segment || r.channel || '—',
      revenue: r.revenue || 0,
      percent: r.percent || 0,
    }))

  const revType = breakdown.revenueType || {}

  return (
    <div className="flex flex-col gap-10" style={{ color: colors.text.primary }}>
      {/* SECTION 1: HEADLINE METRICS */}
      <section>
        <SectionTitle icon={TrendingUp}>Revenue Overview</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <CFOCard
            title="Total Revenue (MTD)"
            value={(m.totalRevenue || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={IndianRupee}
            status="good"
            subtitle="This month"
          />
          <CFOCard
            title="MRR"
            value={(m.mrr || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Repeat}
            status="good"
            subtitle="Monthly recurring"
          />
          <CFOCard
            title="ARR"
            value={(m.arr || 0) / 10000000}
            prefix="₹"
            suffix="Cr"
            icon={TrendingUp}
            status="good"
            subtitle="Annual run rate"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <CFOCard
            title="Growth MoM"
            value={m.growthMoM || 0}
            suffix="%"
            icon={TrendingUp}
            status={(m.growthMoM || 0) >= 5 ? 'good' : (m.growthMoM || 0) >= 0 ? 'warning' : 'danger'}
            subtitle="Month over month"
          />
          <CFOCard
            title="Growth QoQ"
            value={m.growthQoQ || 0}
            suffix="%"
            icon={TrendingUp}
            status={(m.growthQoQ || 0) >= 15 ? 'good' : (m.growthQoQ || 0) >= 0 ? 'warning' : 'danger'}
            subtitle="Quarter over quarter"
          />
          <CFOCard
            title="Growth YoY"
            value={m.growthYoY || 0}
            suffix="%"
            icon={TrendingUp}
            status={(m.growthYoY || 0) >= 40 ? 'good' : (m.growthYoY || 0) >= 0 ? 'warning' : 'danger'}
            subtitle="Year over year"
          />
        </div>
      </section>

      {/* SECTION 2: UNIT ECONOMICS */}
      <section>
        <SectionTitle icon={Target}>Unit Economics</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <CFOCard
            title="LTV"
            value={(m.ltv || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Users}
            status="good"
            subtitle="Customer lifetime value"
          />
          <CFOCard
            title="CAC"
            value={(m.cac || 0) / 1000}
            prefix="₹"
            suffix="K"
            icon={Target}
            status="neutral"
            subtitle="Acquisition cost"
          />
          <CFOCard
            title="LTV / CAC"
            value={ltvCac}
            icon={Activity}
            status={ltvCacStatus}
            subtitle="Healthy when > 3"
          />
          <CFOCard
            title="CAC Payback"
            value={m.paybackPeriod || 0}
            suffix=" mo"
            icon={Repeat}
            status={(m.paybackPeriod || 0) <= 12 ? 'good' : (m.paybackPeriod || 0) <= 18 ? 'warning' : 'danger'}
            subtitle="Months to recover CAC"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <CFOCard
            title="NRR"
            value={m.nrr || 0}
            suffix="%"
            icon={TrendingUp}
            status={nrrStatus}
            subtitle="Net revenue retention"
          />
          <CFOCard
            title="GRR"
            value={m.grr || 0}
            suffix="%"
            icon={Activity}
            status={(m.grr || 0) >= 90 ? 'good' : (m.grr || 0) >= 80 ? 'warning' : 'danger'}
            subtitle="Gross revenue retention"
          />
          <CFOCard
            title="Magic Number"
            value={m.magicNumber || 0}
            icon={Zap}
            status={(m.magicNumber || 0) >= 1 ? 'good' : (m.magicNumber || 0) >= 0.5 ? 'warning' : 'danger'}
            subtitle="Net new ARR ÷ S&M"
          />
          <CFOCard
            title="Rule of 40"
            value={m.ruleOf40 || 0}
            suffix=""
            icon={Target}
            status={ruleStatus}
            subtitle="Growth% + EBITDA%"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CFOCard
            title="Avg Deal Size"
            value={(m.avgDealSize || 0) / 1000}
            prefix="₹"
            suffix="K"
            icon={Briefcase}
            status="neutral"
            subtitle="Per closed deal"
          />
          <CFOCard
            title="Total Revenue (Period)"
            value={(m.totalRevenue || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={IndianRupee}
            status="good"
            subtitle="Cumulative this period"
          />
        </div>
      </section>

      {/* SECTION 3: 12-MONTH MRR TREND */}
      <section>
        <SectionTitle icon={Activity}>12-Month MRR Trend</SectionTitle>

        <div
          className="mt-5 rounded-2xl p-6"
          style={{ background: colors.bg.secondary, border: `1px solid ${colors.bg.tertiary}` }}
        >
          <InteractiveGraph
            data={mrrTrend.map((p) => ({ label: p.month, value: p.mrr }))}
            height={320}
            formatValue={(v) => fmtL(v)}
            barColor={colors.success.main}
          />
        </div>
      </section>

      {/* SECTION 4: REVENUE BREAKDOWN */}
      <section>
        <SectionTitle icon={PieChart}>Revenue Breakdown</SectionTitle>

        <div
          className="mt-5 rounded-2xl p-6"
          style={{ background: colors.bg.secondary, border: `1px solid ${colors.bg.tertiary}` }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
              Composition
            </h3>
            <div className="flex gap-2">
              {breakdownTabs.map(({ key, label }) => {
                const active = breakdownTab === key
                return (
                  <button
                    key={key}
                    onClick={() => setBreakdownTab(key)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: active ? colors.primary[500] : 'transparent',
                      color: active ? '#fff' : colors.text.secondary,
                      border: `1px solid ${active ? colors.primary[500] : colors.bg.tertiary}`,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {breakdownRows.length === 0 && (
              <div className="text-sm py-6 text-center" style={{ color: colors.text.tertiary }}>
                No breakdown data available.
              </div>
            )}
            {breakdownRows.map((row, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: colors.text.primary, fontWeight: 600 }}>{row.name}</span>
                  <span style={{ color: colors.text.secondary, fontFamily: "'SF Mono', monospace" }}>
                    {fmtL(row.revenue)} · {fmtPct(row.percent)}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: colors.bg.tertiary }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, row.percent || 0)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${colors.primary[500]}, ${colors.success.main})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Type split */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
          <RevenueTypeCard label="New" value={revType.new || 0} tone={colors.success.main} />
          <RevenueTypeCard label="Expansion" value={revType.expansion || 0} tone={colors.primary[500]} />
          <RevenueTypeCard label="Renewal" value={revType.renewal || 0} tone={colors.primary[300]} />
          <RevenueTypeCard label="Recurring" value={revType.recurring || 0} tone={colors.success.dark} />
          <RevenueTypeCard label="One-Time" value={revType.oneTime || 0} tone={colors.warning.main} />
        </div>
      </section>

      {/* SECTION 5: COHORT RETENTION */}
      <section>
        <SectionTitle icon={Layers}>Cohort Retention</SectionTitle>

        <Card
          className="mt-5 p-6"
          style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: colors.text.secondary, borderBottom: `1px solid ${colors.bg.tertiary}` }}>
                  <th className="text-left py-2 px-3 font-semibold">Cohort</th>
                  {Array.from({ length: 13 }).map((_, i) => (
                    <th key={i} className="text-center py-2 px-2 font-semibold text-xs">M{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(cohorts.retentionCurves || []).map((c: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${colors.bg.tertiary}80` }}>
                    <td className="py-2 px-3 font-semibold" style={{ color: colors.text.primary }}>
                      {c.cohort}
                    </td>
                    {Array.from({ length: 13 }).map((_, i) => {
                      const cell = (c.months || []).find((mm: any) => mm.month === i)
                      if (!cell) return <td key={i} className="py-2 px-2" />
                      const v = cell.retained || 0
                      const intensity = Math.max(0.08, Math.min(1, v / 100))
                      const tone =
                        v >= 90 ? colors.success.main : v >= 75 ? colors.primary[500] : v >= 50 ? colors.warning.main : colors.danger.main
                      return (
                        <td key={i} className="py-1 px-1">
                          <div
                            className="rounded-md py-1.5 text-center text-xs font-semibold"
                            style={{
                              background: `${tone}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
                              color: colors.text.primary,
                              fontFamily: "'SF Mono', monospace",
                            }}
                          >
                            {v}%
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {(!cohorts.retentionCurves || cohorts.retentionCurves.length === 0) && (
                  <tr>
                    <td colSpan={14} className="py-6 text-center" style={{ color: colors.text.tertiary }}>
                      No cohort data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <CohortMiniCard
            title="Revenue per Cohort"
            items={(cohorts.revenuePerCohort || []).map((c: any) => ({
              label: c.cohort,
              value: fmtL(c.revenue || 0),
            }))}
            tone={colors.success.main}
          />
          <CohortMiniCard
            title="Churn by Cohort"
            items={(cohorts.churnByCohort || []).map((c: any) => ({
              label: c.cohort,
              value: fmtPct(c.churnRate || 0),
            }))}
            tone={colors.danger.main}
          />
          <CohortMiniCard
            title="Expansion by Cohort"
            items={(cohorts.expansionByCohort || []).map((c: any) => ({
              label: c.cohort,
              value: fmtPct(c.expansionRate || 0),
            }))}
            tone={colors.primary[500]}
          />
        </div>
      </section>

      {/* SECTION 6: PIPELINE */}
      <section>
        <SectionTitle icon={Briefcase}>Sales Pipeline</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <CFOCard
            title="Pipeline Value"
            value={(pipeline.pipelineValue || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Briefcase}
            status="good"
            subtitle="Open opportunities"
          />
          <CFOCard
            title="Win Rate"
            value={pipeline.winRate || 0}
            suffix="%"
            icon={Target}
            status={(pipeline.winRate || 0) >= 25 ? 'good' : 'warning'}
            subtitle="Closed-won ratio"
          />
          <CFOCard
            title="Avg Deal Size"
            value={(pipeline.avgDealSize || 0) / 1000}
            prefix="₹"
            suffix="K"
            icon={IndianRupee}
            status="neutral"
            subtitle="Per opportunity"
          />
          <CFOCard
            title="Sales Cycle"
            value={pipeline.salesCycleLength || 0}
            suffix=" days"
            icon={Activity}
            status="neutral"
            subtitle="Lead to close"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <CFOCard
            title="Bookings"
            value={(pipeline.bookings || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={TrendingUp}
            status="good"
          />
          <CFOCard
            title="Billings"
            value={(pipeline.billings || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={IndianRupee}
            status="good"
          />
          <CFOCard
            title="Deferred Revenue"
            value={(pipeline.deferredRevenue || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Repeat}
            status="neutral"
          />
          <CFOCard
            title="Unbilled Revenue"
            value={(pipeline.unbilledRevenue || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Layers}
            status="neutral"
          />
        </div>

        {/* Funnel */}
        <Card
          className="mt-6 p-6"
          style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
            Pipeline Funnel
          </h3>
          <div className="flex flex-col gap-3">
            {(pipeline.stages || []).map((s: any, idx: number) => {
              const maxDeals = Math.max(...(pipeline.stages || []).map((x: any) => x.deals || 0), 1)
              const widthPct = ((s.deals || 0) / maxDeals) * 100
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-semibold shrink-0" style={{ color: colors.text.primary }}>
                    {s.stage}
                  </div>
                  <div
                    className="flex-1 h-10 rounded-lg overflow-hidden relative"
                    style={{ background: colors.bg.tertiary }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.06 }}
                      className="h-full flex items-center px-3"
                      style={{
                        background: `linear-gradient(90deg, ${colors.primary[500]}, ${colors.success.main})`,
                      }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {s.deals} deals · {fmtL(s.value || 0)}
                      </span>
                    </motion.div>
                  </div>
                  <div
                    className="w-20 text-right text-sm font-semibold shrink-0"
                    style={{ color: colors.text.secondary, fontFamily: "'SF Mono', monospace" }}
                  >
                    {fmtPct(s.conversionRate || 0)}
                  </div>
                </div>
              )
            })}
            {(!pipeline.stages || pipeline.stages.length === 0) && (
              <div className="text-sm py-4 text-center" style={{ color: colors.text.tertiary }}>
                No stage data available.
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* SECTION 7: REVENUE HEALTH */}
      <section>
        <SectionTitle icon={Activity}>Revenue Health</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-5">
          <CFOCard
            title="Logo Churn"
            value={health.logoChurn || 0}
            suffix="%"
            icon={TrendingDown}
            status={(health.logoChurn || 0) <= 2 ? 'good' : (health.logoChurn || 0) <= 5 ? 'warning' : 'danger'}
            subtitle="Customers lost"
          />
          <CFOCard
            title="Revenue Churn"
            value={health.revenueChurn || 0}
            suffix="%"
            icon={TrendingDown}
            status={(health.revenueChurn || 0) <= 2 ? 'good' : (health.revenueChurn || 0) <= 5 ? 'warning' : 'danger'}
            subtitle="MRR lost"
          />
          <CFOCard
            title="Expansion"
            value={health.expansionRate || 0}
            suffix="%"
            icon={TrendingUp}
            status="good"
            subtitle="MRR from upsells"
          />
          <CFOCard
            title="Contraction"
            value={health.contractionRate || 0}
            suffix="%"
            icon={TrendingDown}
            status="warning"
            subtitle="MRR from downgrades"
          />
          <CFOCard
            title="Top 10 Concentration"
            value={health.revenueConcentration || 0}
            suffix="%"
            icon={Users}
            status={(health.revenueConcentration || 0) <= 40 ? 'good' : (health.revenueConcentration || 0) <= 60 ? 'warning' : 'danger'}
            subtitle="% revenue from top 10"
          />
        </div>
      </section>

      {/* SECTION 8: AT-RISK REVENUE */}
      <section>
        <SectionTitle icon={AlertTriangle}>At-Risk Revenue</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <CFOCard
            title="Total At-Risk MRR"
            value={(atRisk.totalAtRisk || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={AlertTriangle}
            status={(atRisk.totalAtRisk || 0) > 0 ? 'danger' : 'good'}
            subtitle={`${atRisk.customerCount || 0} customers flagged`}
          />
          <CFOCard
            title="At-Risk Accounts"
            value={atRisk.customerCount || 0}
            icon={Users}
            status={(atRisk.customerCount || 0) > 0 ? 'warning' : 'good'}
            subtitle="Customers needing intervention"
          />
        </div>

        <Card
          className="mt-6 p-6"
          style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
            Top At-Risk Accounts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: colors.text.secondary, borderBottom: `1px solid ${colors.bg.tertiary}` }}>
                  <th className="text-left py-2 px-3 font-semibold">Customer</th>
                  <th className="text-right py-2 px-3 font-semibold">MRR</th>
                  <th className="text-right py-2 px-3 font-semibold">Risk Score</th>
                  <th className="text-right py-2 px-3 font-semibold">Churn Probability</th>
                  <th className="text-right py-2 px-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {(atRisk.topAccounts || []).map((acct: any, idx: number) => {
                  const score = acct.riskScore || 0
                  const prob = acct.churnProbability || 0
                  const probTone =
                    prob >= 70 ? colors.danger.main : prob >= 40 ? colors.warning.main : colors.success.main
                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${colors.bg.tertiary}80` }}>
                      <td className="py-3 px-3" style={{ color: colors.text.primary }}>
                        {acct.customer}
                      </td>
                      <td
                        className="py-3 px-3 text-right"
                        style={{ color: colors.text.primary, fontFamily: "'SF Mono', monospace" }}
                      >
                        {fmtK(acct.mrr || 0)}
                      </td>
                      <td
                        className="py-3 px-3 text-right font-semibold"
                        style={{
                          color:
                            score >= 70 ? colors.danger.main : score >= 40 ? colors.warning.main : colors.success.main,
                          fontFamily: "'SF Mono', monospace",
                        }}
                      >
                        {score}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <div
                            className="w-20 h-1.5 rounded-full overflow-hidden"
                            style={{ background: colors.bg.tertiary }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, prob)}%`,
                                height: '100%',
                                background: probTone,
                              }}
                            />
                          </div>
                          <span style={{ color: probTone, fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>
                            {fmtPct(prob)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          className="px-3 py-1.5 rounded-md text-xs font-semibold"
                          style={{ background: colors.primary[500], color: '#fff' }}
                        >
                          Retain
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {(!atRisk.topAccounts || atRisk.topAccounts.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center" style={{ color: colors.text.tertiary }}>
                      No at-risk accounts.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <GalaxyButton variant="secondary">
            <RollingText text="Launch Retention Playbook" />
          </GalaxyButton>
          <GalaxyButton variant="primary">
            <RollingText text="Forecast Next Quarter" />
          </GalaxyButton>
        </div>
      </section>
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────

function SectionTitle({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: `${colors.primary[500]}22`, color: colors.primary[300] }}
      >
        <Icon size={18} />
      </div>
      <h2
        className="text-2xl font-bold"
        style={{ color: colors.text.primary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {children}
      </h2>
    </div>
  )
}

function RevenueTypeCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: colors.bg.secondary, border: `1px solid ${tone}44` }}
    >
      <div className="text-xs uppercase tracking-wide" style={{ color: colors.text.secondary }}>
        {label}
      </div>
      <div
        className="text-2xl font-bold mt-1.5"
        style={{ color: tone, fontFamily: "'SF Mono', monospace" }}
      >
        {fmtL(value)}
      </div>
    </div>
  )
}

function CohortMiniCard({
  title,
  items,
  tone,
}: {
  title: string
  items: Array<{ label: string; value: string }>
  tone: string
}) {
  return (
    <Card
      className="p-5"
      style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
    >
      <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text.primary }}>
        {title}
      </h4>
      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <div className="text-xs" style={{ color: colors.text.tertiary }}>No data.</div>
        )}
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span style={{ color: colors.text.secondary }}>{it.label}</span>
            <span style={{ color: tone, fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>
              {it.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default RevenueDashboard
