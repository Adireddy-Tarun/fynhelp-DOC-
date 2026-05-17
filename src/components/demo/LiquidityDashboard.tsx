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
  AlertTriangle,
  IndianRupee,
  Calendar,
  Clock,
  Zap,
  Target,
  Shield,
} from 'lucide-react'
import { colors } from '@/lib/design-system'

interface LiquidityDashboardProps {
  data: any
}

type Scenario = 'best' | 'base' | 'worst'

const fmtL = (n: number) => `₹${((n || 0) / 100000).toFixed(1)}L`
const fmtK = (n: number) => `₹${((n || 0) / 1000).toFixed(0)}K`

export function LiquidityDashboard({ data }: LiquidityDashboardProps) {
  const liq = data?.liquidity || {}
  const [selectedScenario, setSelectedScenario] = useState<Scenario>('base')

  const runwayMonths = liq.burnRunway?.runway || 0
  const isRunwayCritical = runwayMonths < 3

  const scenarios = [
    { key: 'best' as const, label: 'Best Case (+20% revenue)', color: colors.success.main },
    { key: 'base' as const, label: 'Base Case (current trajectory)', color: colors.primary[500] },
    { key: 'worst' as const, label: 'Worst Case (-20% revenue)', color: colors.danger.main },
  ]

  return (
    <div className="flex flex-col gap-10" style={{ color: colors.text.primary }}>
      {/* SECTION 1: CRITICAL RUNWAY ALERT */}
      {isRunwayCritical && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, ${colors.danger.main}33, ${colors.danger.dark}22)`,
            border: `1px solid ${colors.danger.main}55`,
          }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 20% 0%, ${colors.danger.main}40, transparent 60%)` }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: colors.danger.main }}
            >
              <AlertTriangle size={24} color="#fff" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                CRITICAL: Runway Below 3 Months
              </h2>
              <p className="mt-1" style={{ color: colors.text.secondary }}>
                Zero cash date:{' '}
                <span style={{ color: colors.danger.light, fontWeight: 600 }}>
                  {liq.burnRunway?.zeroCashDate || 'unknown'}
                </span>
              </p>
            </div>
          </div>

          {/* 3 Action Cards */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <ActionCard
              icon={Zap}
              tone={colors.warning.main}
              title="Immediate Action"
              body="Delay non-critical vendor payments by 30 days"
              impact="Impact: +0.5 months runway"
            />
            <ActionCard
              icon={Target}
              tone={colors.success.main}
              title="Quick Win"
              body="Accelerate receivables collection (30-60 day bucket)"
              impact={`Impact: +${fmtL(liq.receivablesPayables?.arAging?.bucket_31_60 || 0)} cash`}
            />
            <ActionCard
              icon={Shield}
              tone={colors.primary[500]}
              title="Defensive Move"
              body="Freeze non-essential hiring and marketing spend"
              impact="Impact: +1.2 months runway"
            />
          </div>

          <div className="relative mt-6 flex justify-end">
            <GalaxyButton variant="danger">
              <RollingText text="Generate Emergency Action Plan" />
            </GalaxyButton>
          </div>
        </motion.div>
      )}

      {/* SECTION 2: CASH POSITION OVERVIEW */}
      <section>
        <SectionTitle icon={IndianRupee}>Cash Position</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <CFOCard
            title="Current Cash"
            value={(liq.cashPosition?.currentCash || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={IndianRupee}
            status="good"
            subtitle="Total liquid balance"
          />
          <CFOCard
            title="Operating Cash"
            value={(liq.cashPosition?.operatingCash || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={TrendingUp}
            status="good"
            subtitle="Available for operations"
          />
          <CFOCard
            title="Restricted Cash"
            value={(liq.cashPosition?.restrictedCash || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Shield}
            status="neutral"
            subtitle="Reserved / encumbered"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <CFOCard
            title="DSO"
            value={liq.cashPosition?.dso || 0}
            suffix=" days"
            icon={Clock}
            status={(liq.cashPosition?.dso || 0) > 45 ? 'warning' : 'good'}
            subtitle="Days Sales Outstanding"
          />
          <CFOCard
            title="DIO"
            value={liq.cashPosition?.dio || 0}
            suffix=" days"
            icon={Clock}
            status="neutral"
            subtitle="Days Inventory Outstanding"
          />
          <CFOCard
            title="DPO"
            value={liq.cashPosition?.dpo || 0}
            suffix=" days"
            icon={Clock}
            status="neutral"
            subtitle="Days Payable Outstanding"
          />
          <CFOCard
            title="Cash Conversion Cycle"
            value={liq.cashPosition?.ccc || 0}
            suffix=" days"
            icon={TrendingDown}
            status="neutral"
            subtitle="DSO + DIO − DPO"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CFOCard
            title="Quick Ratio"
            value={liq.cashPosition?.quickRatio || 0}
            icon={Target}
            status={(liq.cashPosition?.quickRatio || 0) > 1.5 ? 'good' : 'warning'}
            subtitle="Immediate liquidity health"
          />
          <CFOCard
            title="Current Ratio"
            value={liq.cashPosition?.currentRatio || 0}
            icon={Target}
            status={(liq.cashPosition?.currentRatio || 0) > 2 ? 'good' : 'warning'}
            subtitle="Overall liquidity position"
          />
        </div>
      </section>

      {/* SECTION 3: BURN & RUNWAY */}
      <section>
        <SectionTitle icon={TrendingDown}>Burn & Runway</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <CFOCard
            title="Gross Burn"
            value={(liq.burnRunway?.grossBurn || 0) / 100000}
            prefix="₹"
            suffix="L/mo"
            icon={TrendingDown}
            status="warning"
            subtitle="Total monthly outflow"
          />
          <CFOCard
            title="Net Burn"
            value={(liq.burnRunway?.netBurn || 0) / 100000}
            prefix="₹"
            suffix="L/mo"
            icon={TrendingDown}
            status="warning"
            subtitle="Burn minus revenue"
          />
          <CFOCard
            title="Runway"
            value={runwayMonths}
            suffix=" months"
            icon={Calendar}
            status={runwayMonths < 3 ? 'danger' : runwayMonths < 6 ? 'warning' : 'good'}
            subtitle="At current net burn"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CFOCard
            title="Zero Cash Date"
            value={liq.burnRunway?.zeroCashDate || '—'}
            icon={Calendar}
            status={isRunwayCritical ? 'danger' : 'warning'}
            subtitle="Projected date cash hits zero"
            animated={false}
          />
          <CFOCard
            title="Burn Multiple"
            value={liq.burnRunway?.burnMultiple || 0}
            icon={Zap}
            status={(liq.burnRunway?.burnMultiple || 0) < 1.5 ? 'good' : 'warning'}
            subtitle="Net burn ÷ net new ARR"
          />
        </div>

        {/* SCENARIO PLANNING */}
        <div className="mt-8 rounded-2xl p-6" style={{ background: colors.bg.secondary, border: `1px solid ${colors.bg.tertiary}` }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
              Scenario Planning
            </h3>
            <div className="flex gap-2">
              {scenarios.map(({ key, color }) => {
                const active = selectedScenario === key
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedScenario(key)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: active ? color : 'transparent',
                      color: active ? '#fff' : colors.text.secondary,
                      border: `1px solid ${active ? color : colors.bg.tertiary}`,
                    }}
                  >
                    {key === 'best' ? 'Best Case' : key === 'base' ? 'Base Case' : 'Worst Case'}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {scenarios.map(({ key, label, color }) => {
              const value = liq.burnRunway?.[`scenario${key.charAt(0).toUpperCase() + key.slice(1)}`] || 0
              const isActive = selectedScenario === key
              return (
                <motion.div
                  key={key}
                  animate={{ scale: isActive ? 1.02 : 1, opacity: isActive ? 1 : 0.7 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl p-5"
                  style={{
                    background: colors.bg.tertiary,
                    border: `1px solid ${isActive ? color : 'transparent'}`,
                    boxShadow: isActive ? `0 0 24px ${color}55` : 'none',
                  }}
                >
                  <div className="text-xs uppercase tracking-wide" style={{ color: colors.text.secondary }}>
                    {label}
                  </div>
                  <div
                    className="text-4xl font-bold mt-2"
                    style={{ color, fontFamily: "'SF Mono', monospace" }}
                  >
                    {Number(value).toFixed(1)}
                  </div>
                  <div className="text-sm mt-1" style={{ color: colors.text.tertiary }}>
                    months runway
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <GalaxyButton variant="primary">
              <RollingText text="Model Custom Scenario" />
            </GalaxyButton>
          </div>
        </div>
      </section>

      {/* SECTION 4: 13-WEEK CASH FORECAST */}
      <section>
        <SectionTitle icon={Calendar}>13-Week Cash Forecast</SectionTitle>

        <div className="mt-5 rounded-2xl p-6" style={{ background: colors.bg.secondary, border: `1px solid ${colors.bg.tertiary}` }}>
          <InteractiveGraph
            data={(liq.cashFlow?.thirteenWeekForecast || []).map((w: any) => ({
              label: `W${w.week}`,
              value: w.projected,
            }))}
            height={320}
            formatValue={(v) => fmtL(v)}
            barColor={colors.primary[500]}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
            {(liq.cashFlow?.thirteenWeekForecast || []).slice(0, 7).map((w: any) => (
              <div
                key={w.week}
                className="rounded-lg p-3 text-center"
                style={{ background: colors.bg.tertiary }}
              >
                <div className="text-xs" style={{ color: colors.text.secondary }}>W{w.week}</div>
                <div className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>
                  {(w.date || '').split('-').slice(1).join('/')}
                </div>
                <div
                  className="text-base font-bold mt-1"
                  style={{ color: colors.text.primary, fontFamily: "'SF Mono', monospace" }}
                >
                  {fmtL(w.projected || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: AR AGING */}
      <section>
        <SectionTitle icon={Clock}>Accounts Receivable Aging</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <CFOCard
            title="Current (0-30d)"
            value={(liq.receivablesPayables?.arAging?.bucket_0_30 || 0) / 100000}
            prefix="₹" suffix="L"
            icon={IndianRupee} status="good"
          />
          <CFOCard
            title="31-60 days"
            value={(liq.receivablesPayables?.arAging?.bucket_31_60 || 0) / 100000}
            prefix="₹" suffix="L"
            icon={Clock} status="warning"
          />
          <CFOCard
            title="61-90 days"
            value={(liq.receivablesPayables?.arAging?.bucket_61_90 || 0) / 100000}
            prefix="₹" suffix="L"
            icon={AlertTriangle} status="warning"
          />
          <CFOCard
            title="90+ days"
            value={(liq.receivablesPayables?.arAging?.bucket_90_plus || 0) / 100000}
            prefix="₹" suffix="L"
            icon={AlertTriangle} status="danger"
          />
        </div>

        <Card className="mt-6 p-6" style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
            Overdue Invoices Requiring Action
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: colors.text.secondary, borderBottom: `1px solid ${colors.bg.tertiary}` }}>
                  <th className="text-left py-2 px-3 font-semibold">Customer</th>
                  <th className="text-right py-2 px-3 font-semibold">Amount</th>
                  <th className="text-right py-2 px-3 font-semibold">Days Overdue</th>
                  <th className="text-center py-2 px-3 font-semibold">Credit Risk</th>
                  <th className="text-right py-2 px-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {(liq.receivablesPayables?.overdueInvoices || []).map((inv: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${colors.bg.tertiary}80` }}>
                    <td className="py-3 px-3" style={{ color: colors.text.primary }}>{inv.customer}</td>
                    <td className="py-3 px-3 text-right" style={{ color: colors.text.primary, fontFamily: "'SF Mono', monospace" }}>
                      {fmtK(inv.amount)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold" style={{
                      color: inv.daysOverdue > 60 ? colors.danger.main
                        : inv.daysOverdue > 30 ? colors.warning.main
                        : colors.warning.light,
                      fontFamily: "'SF Mono', monospace",
                    }}>
                      {inv.daysOverdue}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <RiskBadge risk={inv.creditRisk} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        className="px-3 py-1.5 rounded-md text-xs font-semibold"
                        style={{ background: colors.primary[500], color: '#fff' }}
                      >
                        Send Reminder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* SECTION 6: MAJOR PAYMENTS */}
      <section>
        <SectionTitle icon={Calendar}>Major Payments Due (Next 30 Days)</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {(liq.alerts?.majorPaymentsDue || []).map((payment: any, idx: number) => (
            <Card
              key={idx}
              className="p-5 flex items-center justify-between"
              style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${colors.warning.main}22` }}
                >
                  <Calendar size={18} color={colors.warning.main} />
                </div>
                <div>
                  <div className="font-semibold" style={{ color: colors.text.primary }}>
                    {payment.vendor}
                  </div>
                  <div className="text-xs" style={{ color: colors.text.tertiary }}>
                    {payment.category}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="font-bold text-lg"
                  style={{ color: colors.text.primary, fontFamily: "'SF Mono', monospace" }}
                >
                  {fmtK(payment.amount)}
                </div>
                <div className="text-xs" style={{ color: colors.text.tertiary }}>
                  Due: {payment.dueDate}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <GalaxyButton variant="secondary">
            <RollingText text="Optimize Payment Schedule" />
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
      <h2 className="text-2xl font-bold" style={{ color: colors.text.primary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {children}
      </h2>
    </div>
  )
}

function ActionCard({
  icon: Icon, tone, title, body, impact,
}: { icon: any; tone: string; title: string; body: string; impact: string }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: colors.bg.secondary, border: `1px solid ${tone}44` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} color={tone} />
        <h4 className="font-semibold text-sm" style={{ color: colors.text.primary }}>{title}</h4>
      </div>
      <p className="text-sm" style={{ color: colors.text.secondary }}>{body}</p>
      <div className="text-xs mt-2 font-semibold" style={{ color: tone }}>{impact}</div>
    </div>
  )
}

function RiskBadge({ risk }: { risk: string }) {
  const r = String(risk || '').toLowerCase()
  const tone =
    r === 'high' ? colors.danger.main :
    r === 'medium' ? colors.warning.main :
    colors.success.main
  return (
    <span
      className="inline-block px-2 py-1 rounded-md text-xs font-semibold"
      style={{ background: `${tone}22`, color: tone, border: `1px solid ${tone}55` }}
    >
      {risk || '—'}
    </span>
  )
}

export default LiquidityDashboard
