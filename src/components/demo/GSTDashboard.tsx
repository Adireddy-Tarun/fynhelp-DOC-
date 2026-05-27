import { motion } from 'framer-motion'
import { CFOCard } from '@/components/ui/CFOCard'
import { GalaxyButton } from '@/components/ui/GalaxyButton'
import { RollingText } from '@/components/ui/RollingText'
import { Card } from '@/components/ui/card'
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  IndianRupee,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Percent,
  Shield,
  Target,
  Calendar,
  Calculator,
  Receipt,
  Activity,
} from 'lucide-react'
import { colors } from '@/lib/design-system'

interface GSTDashboardProps {
  data: any
}

const fmtL = (n: number) => {
  const v = (n || 0) / 100000
  const sign = v < 0 ? '−' : ''
  return `${sign}₹${Math.abs(v).toFixed(2)}L`
}
const fmtK = (n: number) => `₹${((n || 0) / 1000).toFixed(0)}K`
const fmtPct = (n: number) => `${(n || 0).toFixed(1)}%`

const STATUS_GOOD = 'good' as const
const STATUS_WARNING = 'warning' as const
const STATUS_DANGER = 'danger' as const

function filingTone(status: string) {
  const s = String(status || '').toLowerCase()
  if (s === 'filed') return colors.success.main
  if (s === 'overdue') return colors.danger.main
  if (s === 'not due') return colors.text.tertiary
  return colors.warning.main
}

function filingIcon(status: string) {
  const s = String(status || '').toLowerCase()
  if (s === 'filed') return CheckCircle
  if (s === 'overdue') return XCircle
  return Clock
}

function reconTone(status: string) {
  const s = String(status || '').toLowerCase()
  if (s === 'matched') return colors.success.main
  if (s === 'mismatch') return colors.warning.main
  return colors.danger.main
}

function calendarTone(status: string) {
  const s = String(status || '').toLowerCase()
  if (s === 'overdue') return colors.danger.main
  if (s === 'due soon') return colors.warning.main
  return colors.primary[400]
}

function noticeTone(status: string) {
  const s = String(status || '').toLowerCase()
  if (s === 'action required') return colors.danger.main
  if (s === 'response submitted') return colors.warning.main
  return colors.success.main
}

function riskTone(level: string) {
  const r = String(level || '').toLowerCase()
  if (r === 'high') return colors.danger.main
  if (r === 'medium') return colors.warning.main
  return colors.success.main
}

function fmtDate(d: string) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

export function GSTDashboard({ data }: GSTDashboardProps) {
  const gst = data?.gst || {}
  const compliance = gst.compliance || {}
  const itc = gst.itc || {}
  const liability = gst.liability || {}
  const audit = gst.auditReadiness || {}
  const planning = gst.taxPlanning || {}
  const calendar: any[] = gst.filingCalendar || []
  const notices: any[] = gst.notices || []
  const risk = gst.risk || {}

  const hasOverdueFilings =
    compliance.gstr1?.status === 'Overdue' || compliance.gstr3b?.status === 'Overdue'
  const hasNotices = notices.length > 0

  const itcGapPct = itc.gapPercent || 0
  const itcGapStatus = itcGapPct > 10 ? STATUS_DANGER : itcGapPct > 5 ? STATUS_WARNING : STATUS_GOOD

  const etr = planning.etr || 0
  const etrStatus = etr > 30 ? STATUS_DANGER : etr >= 25 ? STATUS_WARNING : STATUS_GOOD

  const auditScore = audit.overallScore || 0
  const auditColor = auditScore > 80 ? colors.success.main : auditScore >= 60 ? colors.warning.main : colors.danger.main

  const riskScore = risk.complianceScore || 0
  const riskColor = riskScore < 30 ? colors.success.main : riskScore < 60 ? colors.warning.main : colors.danger.main

  const totalDisputed = notices.reduce((s, n) => s + (n.disputedAmount || 0), 0)

  return (
    <div className="flex flex-col gap-10" style={{ color: colors.text.primary }}>
      {/* PENALTY BANNER (conditional) */}
      {hasOverdueFilings && (
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
            style={{ background: `radial-gradient(circle at 80% 0%, ${colors.danger.main}40, transparent 60%)` }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: colors.danger.main }}
            >
              <AlertTriangle size={24} color="#F4EDDA" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                Overdue GST Filings
              </h2>
              <p className="mt-1" style={{ color: colors.text.secondary }}>
                Penalties accrued:{' '}
                <span style={{ color: colors.danger.light, fontWeight: 600 }}>{fmtL(compliance.penalties || 0)}</span>
                {' · '}Interest:{' '}
                <span style={{ color: colors.danger.light, fontWeight: 600 }}>{fmtL(compliance.interest || 0)}</span>
              </p>
            </div>
            <GalaxyButton variant="danger">
              <RollingText text="File Immediately" />
            </GalaxyButton>
          </div>
        </motion.div>
      )}

      {/* SECTION 1: COMPLIANCE STATUS */}
      <section>
        <SectionTitle icon={FileText}>
          <RollingText text="Compliance Status" />
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <FilingCard
            label="GSTR-1"
            sub="Outward supplies"
            status={compliance.gstr1?.status}
            dueDate={compliance.gstr1?.dueDate}
            extra={compliance.gstr1?.lastFiled ? `Last filed: ${fmtDate(compliance.gstr1.lastFiled)}` : compliance.gstr1?.period}
          />
          <FilingCard
            label="GSTR-3B"
            sub="Monthly summary"
            status={compliance.gstr3b?.status}
            dueDate={compliance.gstr3b?.dueDate}
            extra={compliance.gstr3b?.netTaxPaid != null ? `Net tax: ${fmtL(compliance.gstr3b.netTaxPaid)}` : compliance.gstr3b?.period}
          />
          <FilingCard
            label="GSTR-9"
            sub="Annual return"
            status={compliance.gstr9?.status}
            dueDate={compliance.gstr9?.dueDate}
            extra={compliance.gstr9?.fyear}
          />
        </div>
      </section>

      {/* SECTION 2: ITC RECONCILIATION */}
      <section>
        <SectionTitle icon={Receipt}>
          <RollingText text="ITC Reconciliation" />
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <CFOCard
            title="Total ITC Available"
            value={(itc.totalAvailable || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={IndianRupee}
            status="neutral"
            subtitle="From GSTR-2A"
          />
          <CFOCard
            title="ITC Claimed"
            value={(itc.claimed || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={CheckCircle}
            status={STATUS_GOOD}
            subtitle="In GSTR-3B"
          />
          <CFOCard
            title="ITC Gap"
            value={itcGapPct}
            suffix="%"
            icon={AlertCircle}
            status={itcGapStatus}
            subtitle={`Gap: ${fmtL(itc.gap || 0)}`}
          />
          <CFOCard
            title="Blocked ITC"
            value={(itc.ineligible || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={XCircle}
            status={STATUS_DANGER}
            subtitle="Ineligible credit"
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
                  {['Vendor GSTIN', 'Invoice #', 'Date', 'Value', 'GST', 'Status', 'Action'].map((h) => (
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
                {(itc.reconciliation || []).map((row: any, i: number) => (
                  <tr
                    key={i}
                    className="border-t"
                    style={{ borderColor: colors.bg.tertiary }}
                  >
                    <td className="px-4 py-3" style={{ fontFamily: "'SF Mono', monospace", color: colors.text.primary }}>
                      {row.vendorGstin}
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.text.secondary }}>
                      {row.invoiceNumber}
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.text.tertiary }}>
                      {fmtDate(row.invoiceDate)}
                    </td>
                    <td className="px-4 py-3 text-right" style={{ fontFamily: "'SF Mono', monospace" }}>
                      ₹{(row.invoiceValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right" style={{ fontFamily: "'SF Mono', monospace", color: colors.text.secondary }}>
                      ₹{(row.gstAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone={reconTone(row.status)} label={row.status} />
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
                        Reconcile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <MiniStat label="ITC at Risk" value={fmtL(itc.atRisk || 0)} tone={colors.warning.main} hint="Not yet uploaded by vendor" />
          <MiniStat label="ITC Reversal Required" value={fmtL(itc.reversal || 0)} tone={colors.danger.main} hint="To be reversed in 3B" />
          <MiniStat label="Invoice Matching Rate" value={fmtPct(itc.matchingRate || 0)} tone={colors.success.main} hint="2A vs Books" />
        </div>
      </section>

      {/* SECTION 3: TAX LIABILITY */}
      <section>
        <SectionTitle icon={Calculator}>
          <RollingText text="Tax Liability" />
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <CFOCard
            title="Output GST"
            value={(liability.outputGst || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={TrendingUp}
            status="neutral"
            subtitle="Tax collected"
          />
          <CFOCard
            title="Input GST"
            value={(liability.inputGst || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={TrendingDown}
            status="neutral"
            subtitle="ITC claimed"
          />
          <CFOCard
            title="Net GST Payable"
            value={(liability.netPayable || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={IndianRupee}
            status={(liability.netPayable || 0) > 0 ? STATUS_WARNING : STATUS_GOOD}
            subtitle={compliance.gstr3b?.dueDate ? `Due ${fmtDate(compliance.gstr3b.dueDate)}` : 'Output − Input'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <CFOCard
            title="Paid to Date"
            value={(liability.paidToDate || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={CheckCircle}
            status="neutral"
            subtitle="Settled"
          />
          <CFOCard
            title="Outstanding GST"
            value={(liability.outstanding || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={AlertCircle}
            status={(liability.outstanding || 0) > 0 ? STATUS_DANGER : STATUS_GOOD}
            subtitle="To be paid"
          />
          <CFOCard
            title="Interest Accrued"
            value={(liability.interest || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Percent}
            status={(liability.interest || 0) > 0 ? STATUS_DANGER : STATUS_GOOD}
            subtitle="On late payment"
          />
          <CFOCard
            title="Cash Flow Impact"
            value={(liability.cashFlowImpact || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Activity}
            status={STATUS_WARNING}
            subtitle="Total cash out"
          />
        </div>
      </section>

      {/* SECTION 4: AUDIT READINESS */}
      <section>
        <SectionTitle icon={Shield}>
          <RollingText text="Audit Readiness" />
        </SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
          <Card
            className="p-6 flex flex-col items-center justify-center"
            style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
          >
            <ScoreRing score={auditScore} color={auditColor} />
            <div className="text-sm mt-3" style={{ color: colors.text.secondary }}>Audit Readiness Score</div>
          </Card>

          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
            <ScoreTile label="Invoice Matching" value={audit.invoiceMatchingRate} />
            <ScoreTile label="GSTIN Validation" value={audit.gstinValidation} />
            <ScoreTile label="HSN Accuracy" value={audit.hsnAccuracy} />
            <ScoreTile label="E-way Compliance" value={audit.ewayCompliance} />
            <ScoreTile label="Audit Trail" value={audit.auditTrail} />
            <ScoreTile label="Place of Supply" value={audit.placeOfSupply} />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <GalaxyButton>
            <RollingText text="Run Full Audit Simulation" />
          </GalaxyButton>
        </div>
      </section>

      {/* SECTION 5: TAX PLANNING */}
      <section>
        <SectionTitle icon={Target}>
          <RollingText text="Tax Planning" />
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <CFOCard
            title="Effective Tax Rate"
            value={etr}
            suffix="%"
            icon={Percent}
            status={etrStatus}
            subtitle="ETR vs statutory"
          />
          <CFOCard
            title="Deferred Tax"
            value={(planning.deferredTax || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Clock}
            status="neutral"
            subtitle="Timing differences"
          />
          <CFOCard
            title="Loss Carryforwards"
            value={(planning.lossCarryforwards || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={TrendingDown}
            status={STATUS_GOOD}
            subtitle={planning.lossExpiryYear ? `Expires ${planning.lossExpiryYear}` : 'Available'}
          />
          <CFOCard
            title="Depreciation"
            value={(planning.depreciation || 0) / 100000}
            prefix="₹"
            suffix="L"
            icon={Calculator}
            status="neutral"
            subtitle="Deductible this year"
          />
        </div>

        <Card
          className="p-6 mt-4"
          style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: colors.text.primary }}>
            Tax Benefits & Optimization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="rounded-xl p-4"
              style={{
                background: planning.section80IAC?.eligible ? `${colors.success.main}11` : colors.bg.tertiary,
                border: `1px solid ${planning.section80IAC?.eligible ? colors.success.main + '44' : colors.bg.tertiary}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.text.tertiary }}>
                  Section 80IAC
                </span>
                <Pill
                  tone={
                    planning.section80IAC?.status === 'Active'
                      ? colors.success.main
                      : planning.section80IAC?.status === 'Expired'
                      ? colors.danger.main
                      : colors.warning.main
                  }
                  label={planning.section80IAC?.status || 'Not Claimed'}
                />
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.success.main, fontFamily: "'SF Mono', monospace" }}>
                {fmtL(planning.section80IAC?.savings || 0)}
              </div>
              <p className="text-xs mt-1" style={{ color: colors.text.secondary }}>
                Startup tax exemption (100% deduction)
              </p>
            </div>

            <div
              className="rounded-xl p-4"
              style={{ background: colors.bg.tertiary, border: `1px solid ${colors.bg.tertiary}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.text.tertiary }}>
                  Section 54GB
                </span>
                <Pill tone={colors.primary[400]} label="Eligible" />
              </div>
              <div className="text-sm" style={{ color: colors.text.primary }}>
                Capital gains exemption on reinvestment in eligible startup equity.
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text.primary }}>
              Optimization Strategies
            </h4>
            <ul className="space-y-2">
              {(planning.optimizations || []).map((opt: any, i: number) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: colors.bg.tertiary }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${colors.primary[500]}33`, color: colors.primary[300], fontSize: 11, fontWeight: 700 }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                      {opt.strategy}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: colors.success.main }}>
                      {opt.impact}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <div className="mt-5 flex justify-end">
          <GalaxyButton variant="secondary">
            <RollingText text="Generate Tax Planning Report" />
          </GalaxyButton>
        </div>
      </section>

      {/* SECTION 6: FILING CALENDAR */}
      <section>
        <SectionTitle icon={Calendar}>
          <RollingText text="Filing Calendar" />
        </SectionTitle>

        <Card
          className="p-5 mt-5"
          style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
        >
          <ul className="space-y-2">
            {calendar.map((item, i) => {
              const tone = calendarTone(item.status)
              return (
                <li
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg"
                  style={{ background: colors.bg.tertiary, borderLeft: `3px solid ${tone}` }}
                >
                  <div className="w-24 text-xs font-semibold" style={{ color: colors.text.tertiary, fontFamily: "'SF Mono', monospace" }}>
                    {fmtDate(item.date)}
                  </div>
                  <div className="flex-1 text-sm font-semibold" style={{ color: colors.text.primary }}>
                    {item.type}
                  </div>
                  <Pill tone={tone} label={item.status} />
                  <button
                    className="text-xs px-3 py-1 rounded-md font-semibold"
                    style={{
                      background: `${tone}22`,
                      color: tone,
                      border: `1px solid ${tone}55`,
                    }}
                  >
                    Prepare
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
      </section>

      {/* SECTION 7: NOTICES (conditional) */}
      {hasNotices && (
        <section>
          <SectionTitle icon={AlertCircle}>
            <RollingText text="Notices & Assessments" />
          </SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {notices.map((n, i) => {
              const tone = noticeTone(n.status)
              return (
                <Card
                  key={i}
                  className="p-5"
                  style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary, borderLeft: `3px solid ${tone}` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                      {n.type}
                    </div>
                    <Pill tone={tone} label={n.status} />
                  </div>
                  <div className="text-xs mb-3" style={{ color: colors.text.tertiary, fontFamily: "'SF Mono', monospace" }}>
                    {n.number}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <div style={{ color: colors.text.tertiary }}>Issued</div>
                      <div style={{ color: colors.text.primary }}>{fmtDate(n.issueDate)}</div>
                    </div>
                    <div>
                      <div style={{ color: colors.text.tertiary }}>Deadline</div>
                      <div style={{ color: colors.text.primary }}>{fmtDate(n.deadline)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs" style={{ color: colors.text.tertiary }}>Disputed</div>
                      <div className="text-lg font-bold" style={{ color: colors.danger.main, fontFamily: "'SF Mono', monospace" }}>
                        {fmtL(n.disputedAmount || 0)}
                      </div>
                    </div>
                    <button
                      className="text-xs px-3 py-1 rounded-md font-semibold"
                      style={{
                        background: `${tone}22`,
                        color: tone,
                        border: `1px solid ${tone}55`,
                      }}
                    >
                      Respond
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>

          <Card
            className="p-5 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
          >
            <SummaryStat label="Total Disputed" value={fmtL(totalDisputed)} tone={colors.danger.main} />
            <SummaryStat label="Provisions Made" value={fmtL(totalDisputed * 0.4)} tone={colors.warning.main} />
            <SummaryStat label="Net Exposure" value={fmtL(totalDisputed * 0.6)} tone={colors.danger.light} />
          </Card>
        </section>
      )}

      {/* SECTION 8: RISK ANALYSIS */}
      <section>
        <SectionTitle icon={Activity}>
          <RollingText text="Risk Analysis" />
        </SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
          <Card
            className="p-6 flex flex-col items-center justify-center"
            style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
          >
            <ScoreRing score={riskScore} color={riskColor} reverse />
            <div className="text-sm mt-3" style={{ color: colors.text.secondary }}>
              Compliance Risk Score
            </div>
            <div className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
              Lower is better
            </div>
          </Card>

          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
            <RiskTile label="Late Filing" level={risk.factors?.lateFiling} />
            <RiskTile label="ITC Mismatch" level={risk.factors?.itcMismatch} />
            <RiskTile label="Invoice Accuracy" level={risk.factors?.invoiceAccuracy} />
            <RiskTile label="Cash Flow" level={risk.factors?.cashFlow} />
            <RiskTile label="Audit Selection" level={risk.factors?.auditSelection} />
            <RiskTile
              label="Penalty Exposure"
              level="High"
              valueOverride={fmtL(risk.factors?.penaltyExposure || 0)}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <GalaxyButton variant="secondary">
            <RollingText text="Generate Risk Mitigation Plan" />
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
        style={{ color: colors.text.primary, fontFamily: "'Sora', system-ui, sans-serif" }}
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

function FilingCard({
  label,
  sub,
  status,
  dueDate,
  extra,
}: {
  label: string
  sub: string
  status?: string
  dueDate?: string
  extra?: string
}) {
  const tone = filingTone(status || '')
  const Icon = filingIcon(status || '')
  return (
    <Card
      className="p-5"
      style={{
        background: colors.bg.secondary,
        borderColor: colors.bg.tertiary,
        borderLeft: `3px solid ${tone}`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-lg font-bold" style={{ color: colors.text.primary }}>
            {label}
          </div>
          <div className="text-xs" style={{ color: colors.text.tertiary }}>
            {sub}
          </div>
        </div>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${tone}22`, color: tone }}
        >
          <Icon size={18} />
        </div>
      </div>
      <Pill tone={tone} label={status || '—'} />
      <div className="mt-3 text-xs" style={{ color: colors.text.secondary }}>
        Due: <span style={{ color: colors.text.primary, fontFamily: "'SF Mono', monospace" }}>{fmtDate(dueDate || '')}</span>
      </div>
      {extra && (
        <div className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
          {extra}
        </div>
      )}
    </Card>
  )
}

function MiniStat({ label, value, tone, hint }: { label: string; value: string; tone: string; hint?: string }) {
  return (
    <Card
      className="p-4"
      style={{ background: colors.bg.secondary, borderColor: colors.bg.tertiary }}
    >
      <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: colors.text.tertiary }}>
        {label}
      </div>
      <div className="text-2xl font-bold mt-1" style={{ color: tone, fontFamily: "'SF Mono', monospace" }}>
        {value}
      </div>
      {hint && (
        <div className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
          {hint}
        </div>
      )}
    </Card>
  )
}

function SummaryStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: colors.text.tertiary }}>
        {label}
      </div>
      <div className="text-2xl font-bold mt-1" style={{ color: tone, fontFamily: "'SF Mono', monospace" }}>
        {value}
      </div>
    </div>
  )
}

function ScoreRing({ score, color, reverse }: { score: number; color: string; reverse?: boolean }) {
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

function ScoreTile({ label, value }: { label: string; value?: number }) {
  const v = value || 0
  const tone = v > 80 ? colors.success.main : v >= 60 ? colors.warning.main : colors.danger.main
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: colors.bg.secondary, border: `1px solid ${colors.bg.tertiary}` }}
    >
      <div className="text-xs font-semibold" style={{ color: colors.text.tertiary }}>
        {label}
      </div>
      <div className="text-xl font-bold mt-1" style={{ color: tone, fontFamily: "'SF Mono', monospace" }}>
        {fmtPct(v)}
      </div>
      <div className="h-1.5 mt-2 rounded-full overflow-hidden" style={{ background: colors.bg.tertiary }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, v)}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ height: '100%', background: tone }}
        />
      </div>
    </div>
  )
}

function RiskTile({
  label,
  level,
  valueOverride,
}: {
  label: string
  level?: string
  valueOverride?: string
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
        <div className="text-xs font-semibold" style={{ color: colors.text.tertiary }}>
          {label}
        </div>
        <Pill tone={tone} label={level || 'Low'} />
      </div>
      {valueOverride && (
        <div className="text-lg font-bold" style={{ color: tone, fontFamily: "'SF Mono', monospace" }}>
          {valueOverride}
        </div>
      )}
      <div className="text-xs mt-1" style={{ color: colors.text.secondary }}>
        {descMap[key] || descMap.low}
      </div>
    </div>
  )
}

export default GSTDashboard
