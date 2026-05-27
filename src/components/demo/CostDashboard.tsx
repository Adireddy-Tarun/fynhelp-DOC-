import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CFOCard } from '@/components/ui/CFOCard'
import { GalaxyButton } from '@/components/ui/GalaxyButton'
import { InteractiveGraph } from '@/components/ui/InteractiveGraph'
import { RollingText } from '@/components/ui/RollingText'
import { Card } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  IndianRupee,
  Package,
  Target,
  Users,
  User,
  Percent,
  CreditCard,
  Flame,
  Shield,
  Copy,
  Layers,
  Calendar,
  Globe,
  Activity,
  Briefcase,
  Zap,
} from 'lucide-react'
import { colors } from '@/lib/design-system'

interface CostDashboardProps {
  data: any
}

const fmtL = (n: number) => `₹${((n || 0) / 100000).toFixed(1)}L`
const fmtK = (n: number) => `₹${((n || 0) / 1000).toFixed(0)}K`
const fmtPct = (n: number) => `${(n || 0).toFixed(1)}%`

const STATUS_GOOD = 'good' as const
const STATUS_WARNING = 'warning' as const
const STATUS_DANGER = 'danger' as const

function impactTone(impact: string) {
  const i = String(impact || '').toLowerCase()
  if (i === 'high') return colors.success.main
  if (i === 'medium') return colors.warning.main
  return colors.primary[400]
}

function renewalTone(status: string) {
  const s = String(status || '').toLowerCase()
  if (s === 'expired') return colors.danger.main
  if (s === 'upcoming') return colors.warning.main
  return colors.success.main
}

function riskTone(level: string) {
  const r = String(level || '').toLowerCase()
  if (r === 'high') return colors.danger.main
  if (r === 'medium') return colors.warning.main
  return colors.success.main
}

const OPP_META: Record<string, { icon: any; title: string }> = {
  'over-provisioned': { icon: AlertCircle, title: 'Over-Provisioned Licenses' },
  'duplicate': { icon: Copy, title: 'Duplicate Subscriptions' },
  'consolidation': { icon: Layers, title: 'Vendor Consolidation' },
  'payment-terms': { icon: Calendar, title: 'Payment Terms' },
  'volume-discount': { icon: TrendingDown, title: 'Volume Discounts' },
  'offshore': { icon: Globe, title: 'Offshore Opportunities' },
}

function oppMeta(type: string, fallbackIdx: number) {
  const key = String(type || '').toLowerCase()
  const direct = OPP_META[key]
  if (direct) return direct
  // try fuzzy
  if (key.includes('over')) return OPP_META['over-provisioned']
  if (key.includes('dup')) return OPP_META['duplicate']
  if (key.includes('consol')) return OPP_META['consolidation']
  if (key.includes('payment')) return OPP_META['payment-terms']
  if (key.includes('volume') || key.includes('discount')) return OPP_META['volume-discount']
  if (key.includes('offshore') || key.includes('outsource')) return OPP_META['offshore']
  const fallbacks = Object.values(OPP_META)
  return fallbacks[fallbackIdx % fallbacks.length]
}

export function CostDashboard({ data }: CostDashboardProps) {
  const cost = data?.cost || {}
  const structure = cost.structure || {}
  const breakdown = cost.breakdown || {}
  const vendors = cost.vendors || {}
  const unitEcon = cost.unitEconomics || {}
  const personnel = cost.personnel || {}
  const optimization = cost.optimization || {}
  const efficiency = cost.efficiency || {}

  const totalOpex = structure.totalOpex || 0
  const grossMargin = structure.grossMargin || 0
  const ebitda = structure.ebitda || 0

  const grossMarginStatus = grossMargin > 70 ? STATUS_GOOD : grossMargin >= 50 ? STATUS_WARNING : STATUS_DANGER
  const ebitdaStatus = ebitda > 0 ? STATUS_GOOD : STATUS_DANGER

  const maverick = vendors.maverickSpend || 0
  const hasMaverickSpend = totalOpex > 0 && maverick / totalOpex > 0.05
  const maverickPct = totalOpex > 0 ? (maverick / totalOpex) * 100 : 0

  const trendBars = useMemo(() => {
    const trends = efficiency.trends || []
    return {
      grossMargin: trends.map((t: any) => ({ label: t.month, value: t.grossMargin || 0 })),
      opexPercent: trends.map((t: any) => ({ label: t.month, value: t.opexPercent || 0 })),
      burnMultiple: trends.map((t: any) => ({ label: t.month, value: t.burnMultiple || 0 })),
    }
  }, [efficiency.trends])

  return (
    <div className="flex flex-col gap-10" style={{ color: colors.text.primary }}>
      {/* SECTION 8 (top): MAVERICK SPEND ALERT */}
      {hasMaverickSpend && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, ${colors.warning.main}33, ${colors.warning.dark}22)`,
            border: `1px solid ${colors.warning.main}55`,
          }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 80% 0%, ${colors.warning.main}40, transparent 60%)` }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: colors.warning.main }}
            >
              <AlertTriangle size={24} color="#F4EDDA" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                Maverick Spend Detected
              </h2>
              <p className="mt-1" style={{ color: colors.text.secondary }}>
                {fmtPct(maverickPct)} of OpEx (
                <span style={{ color: colors.warning.light, fontWeight: 600 }}>{fmtL(maverick)}</span>
                ) is flowing through unmanaged channels.
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <ActionCard
              icon={Shield}
              tone={colors.warning.main}
              title="Implement Approval Workflow"
              body="Require finance sign-off on any vendor spend over ₹25K"
              impact="Impact: −60% maverick spend"
            />
            <ActionCard
              icon={CreditCard}
              tone={colors.primary[500]}
              title="Centralize Procurement"
              body="Route all SaaS purchases through a single buyer"
              impact="Impact: +15% volume discounts"
            />
            <ActionCard
              icon={AlertCircle}
              tone={colors.danger.main}
              title="Audit Last 90 Days"
              body="Identify and consolidate shadow vendor relationships"
              impact={`Impact: ${fmtL(maverick * 0.4)} recoverable`}
            />
          </div>

          <div className="relative mt-6 flex justify-end">
            <GalaxyButton variant="secondary">
              <RollingText text="Set Up Spend Controls" />
            </GalaxyButton>
          </div>
        </motion.div>
      )}

      {/* SECTION 1: COST STRUCTURE OVERVIEW */}
      <section>
        <SectionTitle icon={IndianRupee}>
          <RollingText text="Cost Structure Overview" />
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <CFOCard
            title="Total OpEx"
            value={totalOpex / 100000}
            prefix="₹"
            suffix="L"
            icon={IndianRupee}
            status={STATUS_WARNING}
            subtitle="Total operating expenses"
          />
          <CFOCard
            title="COGS"
            value={(structure.cogs || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Package}
            status="neutral"
            subtitle="Cost of goods sold"
          />
          <CFOCard
            title="Gross Margin"
            value={grossMargin}
            suffix="%"
            icon={Percent}
            status={grossMarginStatus}
            subtitle="Revenue minus COGS"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <CFOCard
            title="Sales & Marketing"
            value={(structure.salesMarketing || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Target}
            status="neutral"
            subtitle="S&M spend"
          />
          <CFOCard
            title="R&D"
            value={(structure.rnd || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Zap}
            status="neutral"
            subtitle="Research & development"
          />
          <CFOCard
            title="G&A"
            value={(structure.generalAdmin || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Briefcase}
            status="neutral"
            subtitle="General & admin"
          />
          <CFOCard
            title="EBITDA"
            value={(structure.ebitda || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={TrendingUp}
            status={ebitdaStatus}
            subtitle={`Margin ${fmtPct(structure.ebitdaMargin || 0)}`}
          />
        </div>
      </section>

      {/* SECTION 2: TOP 10 VENDORS */}
      <section>
        <SectionTitle icon={Briefcase}>
          <RollingText text="Top 10 Vendors" />
        </SectionTitle>

        <Card
          className="mt-5 p-6"
          style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr style={{ color: colors.text.secondary, borderBottom: `1px solid ${colors.bg.tertiary}` }}>
                  <th className="text-left py-2 px-3 font-semibold">Vendor</th>
                  <th className="text-right py-2 px-3 font-semibold">Monthly Spend</th>
                  <th className="text-left py-2 px-3 font-semibold">Category</th>
                  <th className="text-left py-2 px-3 font-semibold">Contract End</th>
                  <th className="text-left py-2 px-3 font-semibold">Terms</th>
                  <th className="text-center py-2 px-3 font-semibold">Renewal</th>
                  <th className="text-center py-2 px-3 font-semibold">Risk</th>
                  <th className="text-right py-2 px-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {(vendors.topTen || []).map((v: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${colors.bg.tertiary}80` }}>
                    <td className="py-3 px-3 font-semibold" style={{ color: colors.text.primary }}>
                      {v.name}
                    </td>
                    <td
                      className="py-3 px-3 text-right"
                      style={{ color: colors.text.primary, fontFamily: "'SF Mono', monospace" }}
                    >
                      {fmtK(v.monthlySpend || 0)}
                    </td>
                    <td className="py-3 px-3" style={{ color: colors.text.secondary }}>
                      {v.category || '—'}
                    </td>
                    <td
                      className="py-3 px-3"
                      style={{ color: colors.text.secondary, fontFamily: "'SF Mono', monospace" }}
                    >
                      {v.contractEnd || '—'}
                    </td>
                    <td className="py-3 px-3" style={{ color: colors.text.secondary }}>
                      {v.paymentTerms || '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Pill tone={renewalTone(v.renewalStatus)} label={v.renewalStatus || '—'} />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Pill tone={riskTone(v.riskLevel)} label={v.riskLevel || '—'} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        className="px-3 py-1.5 rounded-md text-xs font-semibold"
                        style={{ background: colors.primary[500], color: '#F4EDDA' }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {(!vendors.topTen || vendors.topTen.length === 0) && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center" style={{ color: colors.text.tertiary }}>
                      No vendor data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <CFOCard
            title="Vendor Concentration"
            value={vendors.vendorConcentration || 0}
            suffix="%"
            icon={Users}
            status={(vendors.vendorConcentration || 0) > 60 ? STATUS_DANGER : (vendors.vendorConcentration || 0) > 40 ? STATUS_WARNING : STATUS_GOOD}
            subtitle="% from top 3 vendors"
          />
          <CFOCard
            title="Spend Under Management"
            value={vendors.spendUnderManagement || 0}
            suffix="%"
            icon={Shield}
            status={(vendors.spendUnderManagement || 0) > 80 ? STATUS_GOOD : (vendors.spendUnderManagement || 0) > 60 ? STATUS_WARNING : STATUS_DANGER}
            subtitle="% routed through procurement"
          />
        </div>
      </section>

      {/* SECTION 3: COST BREAKDOWN */}
      <section>
        <SectionTitle icon={Layers}>
          <RollingText text="Cost Breakdown" />
        </SectionTitle>

        <div
          className="mt-5 rounded-2xl p-6"
          style={{ background: colors.bg.secondary, border: `1px solid ${colors.bg.tertiary}` }}
        >
          <InteractiveGraph
            data={(breakdown.byCategory || []).map((c: any) => ({
              label: c.category,
              value: c.amount || 0,
            }))}
            height={320}
            formatValue={(v) => fmtL(v)}
            barColor={colors.warning.main}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <CFOCard
            title="Fixed Costs"
            value={(breakdown.fixed || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Shield}
            status="neutral"
            subtitle="Recurring obligations"
          />
          <CFOCard
            title="Variable Costs"
            value={(breakdown.variable || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Activity}
            status="neutral"
            subtitle="Scales with volume"
          />
          <CFOCard
            title="Fixed : Variable"
            value={breakdown.fixedVariableRatio || '—'}
            icon={Percent}
            status="neutral"
            subtitle="Cost structure ratio"
            animated={false}
          />
        </div>
      </section>

      {/* SECTION 4: UNIT ECONOMICS */}
      <section>
        <SectionTitle icon={Target}>
          <RollingText text="Unit Economics" />
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <CFOCard
            title="CAC"
            value={(unitEcon.cac || 0) / 1000}
            prefix="₹"
            suffix="K"
            icon={Target}
            status="neutral"
            subtitle="Customer acquisition cost"
          />
          <CFOCard
            title="Cost to Serve"
            value={(unitEcon.costToServe || 0) / 1000}
            prefix="₹"
            suffix="K"
            icon={User}
            status="neutral"
            subtitle="Per customer per month"
          />
          <CFOCard
            title="Cost per Transaction"
            value={unitEcon.costPerTransaction || 0}
            prefix="₹"
            icon={CreditCard}
            status="neutral"
            subtitle="Avg processing cost"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <CFOCard
            title="Revenue per Employee"
            value={(unitEcon.revenuePerEmployee || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={TrendingUp}
            status={
              (unitEcon.revenuePerEmployee || 0) > 5000000
                ? STATUS_GOOD
                : (unitEcon.revenuePerEmployee || 0) >= 3000000
                ? STATUS_WARNING
                : STATUS_DANGER
            }
            subtitle="Per FTE annualized"
          />
          <CFOCard
            title="Gross Profit per Employee"
            value={(unitEcon.grossProfitPerEmployee || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Activity}
            status="good"
            subtitle="Per FTE annualized"
          />
          <CFOCard
            title="Burn Multiple"
            value={unitEcon.burnMultiple || 0}
            suffix="x"
            icon={Flame}
            status={
              (unitEcon.burnMultiple || 0) < 1.5
                ? STATUS_GOOD
                : (unitEcon.burnMultiple || 0) <= 3
                ? STATUS_WARNING
                : STATUS_DANGER
            }
            subtitle="Net burn ÷ net new ARR"
          />
        </div>
      </section>

      {/* SECTION 5: PERSONNEL COSTS */}
      <section>
        <SectionTitle icon={Users}>
          <RollingText text="Personnel Costs" />
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <CFOCard
            title="Total Personnel Cost"
            value={(personnel.totalCost || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Users}
            status="warning"
            subtitle="Salaries + benefits"
          />
          <CFOCard
            title="Personnel % of Revenue"
            value={personnel.percentOfRevenue || 0}
            suffix="%"
            icon={Percent}
            status={
              (personnel.percentOfRevenue || 0) < 50
                ? STATUS_GOOD
                : (personnel.percentOfRevenue || 0) < 70
                ? STATUS_WARNING
                : STATUS_DANGER
            }
            subtitle="Labor cost ratio"
          />
          <CFOCard
            title="Avg Cost per Employee"
            value={(personnel.avgCostPerEmployee || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={User}
            status="neutral"
            subtitle="Fully loaded annual"
          />
        </div>

        <div
          className="mt-5 rounded-2xl p-6"
          style={{ background: colors.bg.secondary, border: `1px solid ${colors.bg.tertiary}` }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
            Cost by Department
          </h3>
          <InteractiveGraph
            data={(personnel.byDepartment || []).map((d: any) => ({
              label: d.department,
              value: d.totalCost || 0,
            }))}
            height={300}
            formatValue={(v) => fmtL(v)}
            barColor={colors.primary[500]}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
            {(personnel.byDepartment || []).map((d: any, idx: number) => (
              <div
                key={idx}
                className="rounded-lg p-3"
                style={{ background: colors.bg.tertiary }}
              >
                <div className="text-xs" style={{ color: colors.text.secondary }}>
                  {d.department}
                </div>
                <div
                  className="text-base font-bold mt-1"
                  style={{ color: colors.text.primary, fontFamily: "'SF Mono', monospace" }}
                >
                  {d.headcount || 0} FTEs
                </div>
                <div className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>
                  Avg {fmtL(d.avgCost || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: COST OPTIMIZATION OPPORTUNITIES */}
      <section>
        <SectionTitle icon={Zap}>
          <RollingText text="Cost Optimization Opportunities" />
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {(optimization.opportunities || []).map((opp: any, idx: number) => {
            const meta = oppMeta(opp.type, idx)
            const tone = impactTone(opp.impact)
            const Icon = meta.icon
            return (
              <Card
                key={idx}
                className="p-5 flex flex-col gap-3"
                style={{
                  background: colors.bg.secondary,
                  borderColor: colors.bg.tertiary,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${tone}22` }}
                    >
                      <Icon size={18} color={tone} />
                    </div>
                    <h4 className="font-semibold text-sm" style={{ color: colors.text.primary }}>
                      {meta.title}
                    </h4>
                  </div>
                  <Pill tone={tone} label={`${opp.impact || '—'} impact`} />
                </div>

                <div
                  className="text-3xl font-bold"
                  style={{ color: tone, fontFamily: "'SF Mono', monospace" }}
                >
                  {opp.type === 'Payment Terms Extension' && opp.savings === 0
                    ? 'Cash flow benefit'
                    : fmtL(opp.savings || 0)}
                </div>

                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  {opp.description}
                </p>

                <button
                  className="self-start mt-1 px-3 py-1.5 rounded-md text-xs font-semibold"
                  style={{ background: colors.primary[500], color: '#F4EDDA' }}
                >
                  Implement
                </button>
              </Card>
            )
          })}
          {(!optimization.opportunities || optimization.opportunities.length === 0) && (
            <div
              className="md:col-span-2 lg:col-span-3 py-8 text-center rounded-2xl"
              style={{ background: colors.bg.secondary, color: colors.text.tertiary }}
            >
              No optimization opportunities surfaced.
            </div>
          )}
        </div>

        <Card
          className="mt-6 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          style={{
            background: `linear-gradient(135deg, ${colors.success.main}22, ${colors.primary[500]}22)`,
            borderColor: `${colors.success.main}55`,
          }}
        >
          <div>
            <div className="text-xs uppercase tracking-wide" style={{ color: colors.text.secondary }}>
              Total Identified Savings
            </div>
            <div
              className="text-3xl font-bold mt-1"
              style={{ color: colors.success.main, fontFamily: "'SF Mono', monospace" }}
            >
              {fmtL(optimization.totalSavings || 0)}
            </div>
            <div className="text-sm mt-1" style={{ color: colors.text.secondary }}>
              Extends runway by{' '}
              <span style={{ color: colors.text.primary, fontWeight: 600 }}>
                {(optimization.runwayExtension || 0).toFixed(1)} months
              </span>
            </div>
          </div>
          <GalaxyButton variant="primary">
            <RollingText text="Generate Cost Optimization Roadmap" />
          </GalaxyButton>
        </Card>
      </section>

      {/* SECTION 7: EFFICIENCY TRENDS */}
      <section>
        <SectionTitle icon={Activity}>
          <RollingText text="Efficiency Trends" />
        </SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
          <TrendCard
            title="Gross Margin %"
            data={trendBars.grossMargin}
            color={colors.success.main}
            formatter={(v) => fmtPct(v)}
          />
          <TrendCard
            title="OpEx % of Revenue"
            data={trendBars.opexPercent}
            color={colors.danger.main}
            formatter={(v) => fmtPct(v)}
          />
          <TrendCard
            title="Burn Multiple"
            data={trendBars.burnMultiple}
            color={colors.primary[500]}
            formatter={(v) => `${(v || 0).toFixed(2)}x`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <CFOCard
            title="Sales Efficiency"
            value={efficiency.salesEfficiency || 0}
            icon={Target}
            status={(efficiency.salesEfficiency || 0) >= 1 ? STATUS_GOOD : STATUS_WARNING}
            subtitle="New ARR ÷ S&M spend"
          />
          <CFOCard
            title="R&D Efficiency"
            value={efficiency.rndEfficiency || 0}
            icon={Zap}
            status="neutral"
            subtitle="New product ARR ÷ R&D"
          />
          <CFOCard
            title="G&A %"
            value={efficiency.gaAsPercent || 0}
            suffix="%"
            icon={Briefcase}
            status={(efficiency.gaAsPercent || 0) < 15 ? STATUS_GOOD : STATUS_WARNING}
            subtitle="G&A as % of revenue"
          />
          <CFOCard
            title="Rule of 40"
            value={efficiency.ruleOf40 || 0}
            icon={Activity}
            status={
              (efficiency.ruleOf40 || 0) >= 40
                ? STATUS_GOOD
                : (efficiency.ruleOf40 || 0) >= 20
                ? STATUS_WARNING
                : STATUS_DANGER
            }
            subtitle="Growth% + EBITDA%"
          />
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
        style={{ color: colors.text.primary, fontFamily: "'Sora', system-ui, sans-serif" }}
      >
        {children}
      </h2>
    </div>
  )
}

function ActionCard({
  icon: Icon,
  tone,
  title,
  body,
  impact,
}: {
  icon: any
  tone: string
  title: string
  body: string
  impact: string
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: colors.bg.secondary, border: `1px solid ${tone}44` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} color={tone} />
        <h4 className="font-semibold text-sm" style={{ color: colors.text.primary }}>
          {title}
        </h4>
      </div>
      <p className="text-sm" style={{ color: colors.text.secondary }}>
        {body}
      </p>
      <div className="text-xs mt-2 font-semibold" style={{ color: tone }}>
        {impact}
      </div>
    </div>
  )
}

function Pill({ tone, label }: { tone: string; label: string }) {
  return (
    <span
      className="inline-block px-2 py-1 rounded-md text-xs font-semibold"
      style={{
        background: `${tone}22`,
        color: tone,
        border: `1px solid ${tone}55`,
      }}
    >
      {label}
    </span>
  )
}

function TrendCard({
  title,
  data,
  color,
  formatter,
}: {
  title: string
  data: Array<{ label: string; value: number }>
  color: string
  formatter: (v: number) => string
}) {
  const latest = data[data.length - 1]?.value ?? 0
  const prev = data[data.length - 2]?.value ?? latest
  const delta = latest - prev
  const deltaTone = delta === 0 ? colors.text.tertiary : delta > 0 ? colors.success.main : colors.danger.main

  return (
    <Card
      className="p-5"
      style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold" style={{ color: colors.text.primary }}>
          {title}
        </h4>
        <span
          className="text-xs font-semibold"
          style={{ color: deltaTone, fontFamily: "'SF Mono', monospace" }}
        >
          {delta > 0 ? '▲' : delta < 0 ? '▼' : '—'} {formatter(Math.abs(delta))}
        </span>
      </div>
      <div
        className="text-2xl font-bold mb-3"
        style={{ color, fontFamily: "'SF Mono', monospace" }}
      >
        {formatter(latest)}
      </div>
      {data.length > 0 ? (
        <InteractiveGraph data={data} height={140} formatValue={formatter} barColor={color} />
      ) : (
        <div className="text-xs text-center py-6" style={{ color: colors.text.tertiary }}>
          No trend data.
        </div>
      )}
    </Card>
  )
}

export default CostDashboard
