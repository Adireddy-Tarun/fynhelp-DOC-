import { motion } from 'framer-motion'
import { CFOCard } from '@/components/ui/CFOCard'
import { GalaxyButton } from '@/components/ui/GalaxyButton'
import { InteractiveGraph } from '@/components/ui/InteractiveGraph'
import { RollingText } from '@/components/ui/RollingText'
import { Card } from '@/components/ui/card'
import {
  Shield,
  CheckCircle,
  Target,
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle,
  DollarSign,
  Globe,
  Users,
  AlertCircle,
  XCircle,
  ClipboardCheck,
  BarChart3,
  Briefcase,
  Activity,
  Percent,
} from 'lucide-react'
import { colors } from '@/lib/design-system'

interface GovernanceDashboardProps {
  data: any
}

const STATUS_GOOD = 'good' as const
const STATUS_WARNING = 'warning' as const
const STATUS_DANGER = 'danger' as const

const fmtL = (n: number) => {
  const v = (n || 0) / 100000
  const sign = v < 0 ? '−' : ''
  return `${sign}₹${Math.abs(v).toFixed(2)}L`
}
const fmtPct = (n: number) => `${(n || 0).toFixed(1)}%`
const fmtSignedPct = (n: number) => `${n > 0 ? '+' : ''}${(n || 0).toFixed(1)}%`

function fmtDate(d?: string) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

function statementTone(status: string) {
  const s = String(status || '').toLowerCase()
  if (s === 'complete') return colors.success.main
  if (s === 'draft' || s === 'in progress') return colors.warning.main
  return colors.danger.main
}

function statementIcon(status: string) {
  const s = String(status || '').toLowerCase()
  if (s === 'complete') return CheckCircle
  if (s === 'draft' || s === 'in progress') return Clock
  return XCircle
}

function riskTone(level: string) {
  const r = String(level || '').toLowerCase()
  if (r === 'high') return colors.danger.main
  if (r === 'medium') return colors.warning.main
  return colors.success.main
}

function pctStatus(v: number) {
  if (v >= 90) return STATUS_GOOD
  if (v >= 75) return STATUS_WARNING
  return STATUS_DANGER
}

function boardTone(ready: boolean, daysRemaining: number) {
  if (ready) return colors.success.main
  if (daysRemaining <= 7) return colors.danger.main
  return colors.warning.main
}

export function GovernanceDashboard({ data }: GovernanceDashboardProps) {
  const gov = data?.governance || {}
  const controls = gov.controls || {}
  const reporting = gov.reporting || {}
  const budgeting = gov.budgeting || {}
  const risk = gov.risk || {}
  const reconciliation = gov.reconciliation || {}
  const audit = gov.audit || {}

  const overallScore = controls.overallScore || 0
  const controlColor =
    overallScore > 80 ? colors.success.main : overallScore >= 60 ? colors.warning.main : colors.danger.main

  const riskScore = risk.financialRiskScore || 0
  const riskColor =
    riskScore < 30 ? colors.success.main : riskScore < 60 ? colors.warning.main : colors.danger.main

  const variancePct = budgeting.variancePercent || 0
  const varianceStatus =
    Math.abs(variancePct) > 20 ? STATUS_DANGER : Math.abs(variancePct) > 10 ? STATUS_WARNING : STATUS_GOOD
  const varianceColor =
    Math.abs(variancePct) > 20 ? colors.danger.main : Math.abs(variancePct) > 10 ? colors.warning.main : colors.success.main

  const boardReady = !!reporting.boardPackageReady
  const boardColor = boardTone(boardReady, reporting.daysRemaining || 0)

  const hasGovernanceIssues =
    overallScore < 60 ||
    (reconciliation.completeness || 0) < 95 ||
    (audit.openFindings || 0) > 3 ||
    !boardReady ||
    Math.abs(variancePct) > 20

  const closeTimeStatus = (reconciliation.avgCloseTime || 0) < 7 ? STATUS_GOOD : (reconciliation.avgCloseTime || 0) <= 10 ? STATUS_WARNING : STATUS_DANGER
  const findingsStatus = (audit.openFindings || 0) === 0 ? STATUS_GOOD : (audit.openFindings || 0) <= 3 ? STATUS_WARNING : STATUS_DANGER
  const lastAuditStatus = (audit.monthsSinceAudit || 0) <= 6 ? STATUS_GOOD : (audit.monthsSinceAudit || 0) <= 12 ? STATUS_WARNING : STATUS_DANGER

  return (
    <div className="flex flex-col gap-10" style={{ color: colors.text.primary }}>
      {/* GOVERNANCE ALERTS BANNER (top, conditional) */}
      {hasGovernanceIssues && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, ${colors.warning.main}26, ${colors.warning.dark}1A)`,
            border: `1px solid ${colors.warning.main}55`,
          }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 80% 0%, ${colors.warning.main}33, transparent 60%)` }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: colors.warning.main }}
            >
              <AlertTriangle size={24} color="#1A1008" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                Governance Issues Requiring Attention
              </h2>
              <p className="mt-1" style={{ color: colors.text.secondary }}>
                {[
                  overallScore < 60 && `Control score ${overallScore}/100`,
                  (reconciliation.completeness || 0) < 95 && `Reconciliation ${fmtPct(reconciliation.completeness || 0)}`,
                  (audit.openFindings || 0) > 3 && `${audit.openFindings} open audit findings`,
                  !boardReady && 'Board package not ready',
                  Math.abs(variancePct) > 20 && `Budget variance ${fmtSignedPct(variancePct)}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
            <ActionCard
              icon={ClipboardCheck}
              title="Tighten Controls"
              desc="Reinforce SoD and approval workflows on weak processes."
              tone={colors.warning.main}
            />
            <ActionCard
              icon={CheckCircle}
              title="Close Reconciliations"
              desc="Resolve open recs and shorten the monthly close cycle."
              tone={colors.warning.main}
            />
            <ActionCard
              icon={FileText}
              title="Remediate Findings"
              desc="Address open audit findings and refresh policy docs."
              tone={colors.warning.main}
            />
          </div>

          <div className="relative mt-5 flex justify-end">
            <GalaxyButton variant="danger">
              <RollingText text="Create Governance Action Plan" />
            </GalaxyButton>
          </div>
        </motion.div>
      )}

      {/* SECTION 1: CONTROL EFFECTIVENESS */}
      <section>
        <SectionTitle icon={Shield}>
          <RollingText text="Control Effectiveness" />
        </SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
          <Card
            className="p-6 flex flex-col items-center justify-center"
            style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
          >
            <ScoreRing score={overallScore} color={controlColor} />
            <div className="text-sm mt-3" style={{ color: colors.text.secondary }}>
              Overall Control Score
            </div>
            <div className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
              {overallScore > 80 ? 'Strong' : overallScore >= 60 ? 'Adequate' : 'Weak'}
            </div>
          </Card>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <CFOCard
              title="Segregation of Duties"
              value={controls.segregationOfDuties || 0}
              suffix="%"
              icon={Users}
              status={pctStatus(controls.segregationOfDuties || 0)}
              subtitle="Conflicting roles separated"
            />
            <CFOCard
              title="Approval Workflows"
              value={controls.approvalWorkflows || 0}
              suffix="%"
              icon={CheckCircle}
              status={pctStatus(controls.approvalWorkflows || 0)}
              subtitle="Coverage on key processes"
            />
            <CFOCard
              title="Reconciliation Status"
              value={controls.reconciliationStatus || 0}
              suffix="%"
              icon={ClipboardCheck}
              status={pctStatus(controls.reconciliationStatus || 0)}
              subtitle="Accounts reconciled"
            />
            <CFOCard
              title="Policy Compliance"
              value={controls.policyCompliance || 0}
              suffix="%"
              icon={FileText}
              status={pctStatus(controls.policyCompliance || 0)}
              subtitle="Adherence to SOPs"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: REPORTING READINESS */}
      <section>
        <SectionTitle icon={Briefcase}>
          <RollingText text="Reporting Readiness" />
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Card
            className="p-5"
            style={{
              background: colors.bg.secondary,
              borderColor: colors.bg.tertiary,
              borderLeft: `3px solid ${boardColor}`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: colors.text.tertiary }}>
                  Board Package
                </div>
                <div className="text-lg font-bold mt-1" style={{ color: colors.text.primary }}>
                  {boardReady ? 'Ready' : (reporting.daysRemaining || 0) <= 7 ? 'Not Ready' : 'In Progress'}
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${boardColor}22`, color: boardColor }}
              >
                <Briefcase size={18} />
              </div>
            </div>
            <div className="text-xs" style={{ color: colors.text.secondary }}>
              Meeting:{' '}
              <span style={{ color: colors.text.primary, fontFamily: "'SF Mono', monospace" }}>
                {fmtDate(reporting.boardMeetingDate)}
              </span>
            </div>
            <div className="text-xs mt-1" style={{ color: boardColor, fontFamily: "'SF Mono', monospace" }}>
              {reporting.daysRemaining ?? 0} days remaining
            </div>
          </Card>

          <CFOCard
            title="P&L Accuracy"
            value={reporting.pnlAccuracy || 0}
            suffix="%"
            icon={TrendingUp}
            status={pctStatus(reporting.pnlAccuracy || 0)}
            subtitle="Reconciled to ledger"
          />
          <CFOCard
            title="Balance Sheet Health"
            value={reporting.balanceSheetHealth || 0}
            suffix="%"
            icon={BarChart3}
            status={pctStatus(reporting.balanceSheetHealth || 0)}
            subtitle="Tie-out completeness"
          />
        </div>

        <Card
          className="mt-5 overflow-hidden"
          style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: colors.bg.tertiary }}>
                  {['Statement', 'Status', 'Last Updated', 'Variance', 'Unreconciled', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: colors.text.tertiary }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(reporting.statements || []).map((s: any, i: number) => {
                  const tone = statementTone(s.status)
                  const Icon = statementIcon(s.status)
                  const v = s.variance || 0
                  const varTone =
                    Math.abs(v) > 10 ? colors.danger.main : Math.abs(v) > 5 ? colors.warning.main : colors.success.main
                  return (
                    <tr key={i} className="border-t" style={{ borderColor: colors.bg.tertiary }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon size={14} color={tone} />
                          <span style={{ color: colors.text.primary, fontWeight: 600 }}>{s.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Pill tone={tone} label={s.status} />
                      </td>
                      <td className="px-4 py-3" style={{ color: colors.text.tertiary, fontFamily: "'SF Mono', monospace" }}>
                        {fmtDate(s.lastUpdated)}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: varTone, fontFamily: "'SF Mono', monospace" }}>
                        {fmtSignedPct(v)}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: colors.text.secondary, fontFamily: "'SF Mono', monospace" }}>
                        {s.unreconciled != null ? fmtL(s.unreconciled) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="text-xs px-3 py-1 rounded-md font-semibold"
                          style={{
                            background: `${colors.primary[500]}22`,
                            color: colors.primary[300],
                            border: `1px solid ${colors.primary[500]}44`,
                          }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* SECTION 3: BUDGET VS ACTUAL */}
      <section>
        <SectionTitle icon={Target}>
          <RollingText text="Budget vs Actual" />
        </SectionTitle>

        <Card
          className="p-6 mt-5"
          style={{
            background: colors.bg.secondary,
            borderColor: colors.bg.tertiary,
            borderLeft: `3px solid ${varianceColor}`,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: colors.text.tertiary }}>
                Total Budget
              </div>
              <div className="text-2xl font-bold mt-1" style={{ color: colors.text.primary, fontFamily: "'SF Mono', monospace" }}>
                {fmtL(budgeting.totalBudget || 0)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: colors.text.tertiary }}>
                Actual Spend
              </div>
              <div className="text-2xl font-bold mt-1" style={{ color: colors.text.primary, fontFamily: "'SF Mono', monospace" }}>
                {fmtL(budgeting.actualSpend || 0)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: colors.text.tertiary }}>
                Variance
              </div>
              <div className="text-2xl font-bold mt-1" style={{ color: varianceColor, fontFamily: "'SF Mono', monospace" }}>
                {fmtL(budgeting.variance || 0)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: colors.text.tertiary }}>
                Variance %
              </div>
              <div className="text-2xl font-bold mt-1" style={{ color: varianceColor, fontFamily: "'SF Mono', monospace" }}>
                {fmtSignedPct(variancePct)}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {(budgeting.byDepartment || []).map((d: any, i: number) => {
            const v = d.variancePercent || 0
            const tone =
              Math.abs(v) > 20 ? colors.danger.main : Math.abs(v) > 10 ? colors.warning.main : colors.success.main
            return (
              <Card
                key={i}
                className="p-4"
                style={{
                  background: colors.bg.secondary,
                  borderColor: colors.bg.tertiary,
                  borderLeft: `3px solid ${tone}`,
                }}
              >
                <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: colors.text.tertiary }}>
                  {d.department}
                </div>
                <div className="text-xl font-bold mt-1" style={{ color: tone, fontFamily: "'SF Mono', monospace" }}>
                  {fmtSignedPct(v)}
                </div>
                <div className="text-xs mt-2" style={{ color: colors.text.secondary }}>
                  Budget <span style={{ color: colors.text.primary, fontFamily: "'SF Mono', monospace" }}>{fmtL(d.budget || 0)}</span>
                </div>
                <div className="text-xs" style={{ color: colors.text.secondary }}>
                  Actual <span style={{ color: colors.text.primary, fontFamily: "'SF Mono', monospace" }}>{fmtL(d.actual || 0)}</span>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
          <Card
            className="p-5"
            style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
          >
            <div className="text-sm font-semibold mb-3" style={{ color: colors.text.secondary }}>
              Budget (monthly)
            </div>
            <InteractiveGraph
              data={(budgeting.trends || []).map((t: any) => ({ label: t.month, value: t.budget }))}
              height={240}
              formatValue={(v) => fmtL(v)}
              barColor={colors.primary[400]}
            />
          </Card>
          <Card
            className="p-5"
            style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
          >
            <div className="text-sm font-semibold mb-3" style={{ color: colors.text.secondary }}>
              Actual (monthly)
            </div>
            <InteractiveGraph
              data={(budgeting.trends || []).map((t: any) => ({ label: t.month, value: t.actual }))}
              height={240}
              formatValue={(v) => fmtL(v)}
              barColor={colors.warning.main}
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CFOCard
            title="Forecast Accuracy"
            value={budgeting.forecastAccuracy || 0}
            suffix="%"
            icon={Target}
            status={pctStatus(budgeting.forecastAccuracy || 0)}
            subtitle="Forecast vs actual"
          />
          <CFOCard
            title="Budget Adherence"
            value={budgeting.budgetAdherence || 0}
            suffix="%"
            icon={CheckCircle}
            status={pctStatus(budgeting.budgetAdherence || 0)}
            subtitle="Within ±5% threshold"
          />
        </div>
      </section>

      {/* SECTION 4: RISK MANAGEMENT */}
      <section>
        <SectionTitle icon={AlertTriangle}>
          <RollingText text="Risk Management" />
        </SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
          <Card
            className="p-6 flex flex-col items-center justify-center"
            style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
          >
            <ScoreRing score={riskScore} color={riskColor} reverse />
            <div className="text-sm mt-3" style={{ color: colors.text.secondary }}>
              Financial Risk Score
            </div>
            <div className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
              Lower is better
            </div>
          </Card>

          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
            <RiskTile
              label="FX Exposure"
              level={(risk.fxExposurePercent || 0) > 25 ? 'High' : (risk.fxExposurePercent || 0) > 10 ? 'Medium' : 'Low'}
              icon={Globe}
              valueOverride={fmtL(risk.fxExposure || 0)}
              extra={`${fmtPct(risk.fxExposurePercent || 0)} of revenue · ${fmtPct(risk.fxHedged || 0)} hedged`}
            />
            <RiskTile
              label="Credit Concentration"
              level={(risk.creditConcentration || 0) > 30 ? 'High' : (risk.creditConcentration || 0) > 20 ? 'Medium' : 'Low'}
              icon={Users}
              valueOverride={fmtPct(risk.creditConcentration || 0)}
              extra="Top 3 customers"
            />
            <RiskTile label="Liquidity Risk" level={risk.liquidityRisk} icon={DollarSign} />
            <RiskTile label="Counterparty Risk" level={risk.counterpartyRisk} icon={Shield} />
            <RiskTile
              label="Insurance Coverage"
              level={(risk.insuranceCoverage || 0) >= 80 ? 'Low' : (risk.insuranceCoverage || 0) >= 50 ? 'Medium' : 'High'}
              icon={CheckCircle}
              valueOverride={fmtPct(risk.insuranceCoverage || 0)}
              extra="Of assessed assets"
            />
            <RiskTile label="Operational Risk" level={risk.operationalRisk} icon={Activity} />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <GalaxyButton>
            <RollingText text="Generate Risk Register" />
          </GalaxyButton>
        </div>
      </section>

      {/* SECTION 5: RECONCILIATION STATUS */}
      <section>
        <SectionTitle icon={ClipboardCheck}>
          <RollingText text="Monthly Close & Reconciliation" />
        </SectionTitle>

        <Card
          className="p-5 mt-5"
          style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
        >
          <ul className="space-y-2">
            {(reconciliation.tasks || []).map((t: any, i: number) => {
              const tone = statementTone(t.status)
              const Icon = statementIcon(t.status)
              return (
                <li
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg"
                  style={{ background: colors.bg.tertiary, borderLeft: `3px solid ${tone}` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${tone}22`, color: tone }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: colors.text.primary }}>
                      {t.name}
                    </div>
                    <div className="text-xs" style={{ color: colors.text.tertiary }}>
                      Owner: <span style={{ color: colors.text.secondary }}>{t.owner}</span>
                    </div>
                  </div>
                  <div className="text-xs hidden md:block" style={{ color: colors.text.tertiary, fontFamily: "'SF Mono', monospace" }}>
                    Due {fmtDate(t.dueDate)}
                  </div>
                  <Pill tone={tone} label={t.status} />
                  <button
                    className="text-xs px-3 py-1 rounded-md font-semibold"
                    style={{
                      background: `${tone}22`,
                      color: tone,
                      border: `1px solid ${tone}55`,
                    }}
                  >
                    Open
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CFOCard
            title="Reconciliation Completeness"
            value={reconciliation.completeness || 0}
            suffix="%"
            icon={CheckCircle}
            status={pctStatus(reconciliation.completeness || 0)}
            subtitle="Accounts fully reconciled"
          />
          <CFOCard
            title="Avg Close Time"
            value={reconciliation.avgCloseTime || 0}
            suffix=" days"
            icon={Clock}
            status={closeTimeStatus}
            subtitle="Best-in-class < 7 days"
          />
        </div>
      </section>

      {/* SECTION 6: AUDIT PREPAREDNESS */}
      <section>
        <SectionTitle icon={FileText}>
          <RollingText text="Audit Preparedness" />
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <CFOCard
            title="Documentation Completeness"
            value={audit.documentationCompleteness || 0}
            suffix="%"
            icon={FileText}
            status={pctStatus(audit.documentationCompleteness || 0)}
            subtitle="Supporting docs on file"
          />
          <CFOCard
            title="Policy Documentation"
            value={audit.policyDocumentation || 0}
            suffix="%"
            icon={ClipboardCheck}
            status={pctStatus(audit.policyDocumentation || 0)}
            subtitle="SOPs current & approved"
          />
          <CFOCard
            title="Audit Trail Quality"
            value={audit.auditTrailQuality || 0}
            suffix="%"
            icon={Activity}
            status={pctStatus(audit.auditTrailQuality || 0)}
            subtitle="Traceable transactions"
          />
        </div>

        <Card
          className="p-5 mt-4"
          style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: colors.text.primary }}>
            Audit Readiness Checklist
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(audit.checklist || []).map((c: any, i: number) => {
              const tone = statementTone(c.status)
              const Icon = statementIcon(c.status)
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: colors.bg.tertiary }}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: `${tone}22`, color: tone }}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 text-sm" style={{ color: colors.text.primary }}>
                    {c.item}
                  </div>
                  <Pill tone={tone} label={c.status} />
                </li>
              )
            })}
          </ul>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CFOCard
            title="Last Internal Audit"
            value={audit.monthsSinceAudit || 0}
            suffix=" mo ago"
            icon={Clock}
            status={lastAuditStatus}
            subtitle={audit.lastInternalAudit ? fmtDate(audit.lastInternalAudit) : '—'}
          />
          <CFOCard
            title="Open Audit Findings"
            value={audit.openFindings || 0}
            icon={AlertCircle}
            status={findingsStatus}
            subtitle="Pending remediation"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <GalaxyButton variant="secondary">
            <RollingText text="Prepare Audit Package" />
          </GalaxyButton>
        </div>
      </section>
    </div>
  )
}

/* ───────── Helpers ───────── */

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

function Pill({ tone, label }: { tone: string; label: string }) {
  return (
    <span
      className="inline-block px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap"
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

function ActionCard({
  icon: Icon,
  title,
  desc,
  tone,
}: {
  icon: any
  title: string
  desc: string
  tone: string
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: colors.bg.secondary, border: `1px solid ${tone}44` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: `${tone}22`, color: tone }}
        >
          <Icon size={14} />
        </div>
        <div className="text-sm font-semibold" style={{ color: colors.text.primary }}>
          {title}
        </div>
      </div>
      <div className="text-xs" style={{ color: colors.text.secondary }}>
        {desc}
      </div>
    </div>
  )
}

function ScoreRing({
  score,
  color,
  reverse,
}: {
  score: number
  color: string
  reverse?: boolean
}) {
  const pct = Math.max(0, Math.min(100, score))
  const visualPct = reverse ? 100 - pct : pct
  const r = 56
  const c = 2 * Math.PI * r
  const offset = c - (visualPct / 100) * c
  return (
    <div className="relative" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} stroke={colors.bg.tertiary} strokeWidth="10" fill="none" />
        <motion.circle
          cx="70"
          cy="70"
          r={r}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ strokeDasharray: c }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold" style={{ color, fontFamily: "'SF Mono', monospace" }}>
          {pct}
        </div>
        <div className="text-xs" style={{ color: colors.text.tertiary }}>
          / 100
        </div>
      </div>
    </div>
  )
}

function RiskTile({
  label,
  level,
  icon: Icon,
  valueOverride,
  extra,
}: {
  label: string
  level?: string
  icon?: any
  valueOverride?: string
  extra?: string
}) {
  const tone = riskTone(level || 'low')
  const descMap: Record<string, string> = {
    high: 'Immediate action required',
    medium: 'Monitor closely',
    low: 'Within tolerance',
  }
  const key = String(level || 'low').toLowerCase()
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: colors.bg.secondary, border: `1px solid ${tone}44` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: `${tone}22`, color: tone }}
            >
              <Icon size={12} />
            </div>
          )}
          <div className="text-xs font-semibold" style={{ color: colors.text.tertiary }}>
            {label}
          </div>
        </div>
        <Pill tone={tone} label={level || 'Low'} />
      </div>
      {valueOverride && (
        <div className="text-lg font-bold" style={{ color: tone, fontFamily: "'SF Mono', monospace" }}>
          {valueOverride}
        </div>
      )}
      <div className="text-xs mt-1" style={{ color: colors.text.secondary }}>
        {extra || descMap[key] || descMap.low}
      </div>
    </div>
  )
}

export default GovernanceDashboard
