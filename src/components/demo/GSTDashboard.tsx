import { motion } from 'framer-motion'
import {
  FileText,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  XCircle,
  Bell,
  Shield,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { CFOCard } from '@/components/ui/CFOCard'
import { GalaxyButton } from '@/components/ui/GalaxyButton'
import { RollingText } from '@/components/ui/RollingText'
import { colors, staggerContainer, fadeInUp } from '@/lib/design-system'

export function GSTDashboard({ data }: { data: any }) {
  const revenue = data?.revenue?.totalRevenue || 420000
  const costs = data?.cost?.totalCost || 630000

  // METRIC 1: GST Liability & ITC
  const outputGst = revenue * 0.18
  const inputGst = costs * 0.18
  const itcAvailable = inputGst * 0.92
  const gstPayable = outputGst - itcAvailable
  const itcUtilization = (itcAvailable / inputGst) * 100

  // METRIC 2: Filings
  const filings = [
    { return: 'GSTR-1', month: 'Feb 2026', dueDate: '2026-03-11', status: 'filed', filedOn: '2026-03-09' },
    { return: 'GSTR-3B', month: 'Feb 2026', dueDate: '2026-03-20', status: 'filed', filedOn: '2026-03-18' },
    { return: 'GSTR-1', month: 'Mar 2026', dueDate: '2026-04-11', status: 'pending', filedOn: null },
    { return: 'GSTR-3B', month: 'Mar 2026', dueDate: '2026-04-20', status: 'pending', filedOn: null },
    { return: 'GSTR-1', month: 'Apr 2026', dueDate: '2026-05-11', status: 'upcoming', filedOn: null },
    { return: 'GSTR-3B', month: 'Apr 2026', dueDate: '2026-05-20', status: 'upcoming', filedOn: null },
  ]
  const pendingFilings = filings.filter((f) => f.status === 'pending')
  const upcomingFilings = filings.filter((f) => f.status === 'upcoming')

  // METRIC 3: ITC Reconciliation
  const itcReconciliation = {
    asPerBooks: inputGst,
    asPerGstr2A: inputGst * 0.96,
    asPerGstr2B: inputGst * 0.94,
    mismatch: inputGst - inputGst * 0.94,
    blockedCredit: inputGst * 0.08,
  }
  const reconciliationGap = ((itcReconciliation.mismatch / itcReconciliation.asPerBooks) * 100).toFixed(1)

  // METRIC 4: TDS
  const tdsOnSalaries = costs * 0.12 * 0.1
  const tdsOnProfessional = costs * 0.08 * 0.1
  const totalTdsDeducted = tdsOnSalaries + tdsOnProfessional
  const tdsPayableDate = '2026-05-07'

  // METRIC 5: Tax Calendar
  const taxPayments = [
    { type: 'GST (Mar)', amount: gstPayable * 0.33, dueDate: '2026-04-20', status: 'pending', daysLeft: 5 },
    { type: 'TDS (Apr)', amount: totalTdsDeducted, dueDate: '2026-05-07', status: 'upcoming', daysLeft: 22 },
    { type: 'Advance Tax Q1', amount: 85000, dueDate: '2026-06-15', status: 'upcoming', daysLeft: 61 },
    { type: 'GST (Apr)', amount: gstPayable * 0.33, dueDate: '2026-05-20', status: 'upcoming', daysLeft: 35 },
  ]
  const totalTaxDue30Days = taxPayments.filter((t) => t.daysLeft <= 30).reduce((s, t) => s + t.amount, 0)

  // METRIC 6: GST Rate
  const gstRates = [
    { rate: '0%', transactions: 2, revenue: 25000, gst: 0 },
    { rate: '5%', transactions: 5, revenue: 85000, gst: 4250 },
    { rate: '12%', transactions: 8, revenue: 120000, gst: 14400 },
    { rate: '18%', transactions: 45, revenue: 190000, gst: 34200 },
  ]
  const totalRateRevenue = gstRates.reduce((s, r) => s + r.revenue, 0)
  const avgEffectiveRate = ((gstRates.reduce((s, r) => s + r.gst, 0) / totalRateRevenue) * 100).toFixed(1)

  // METRIC 7: Notices
  const notices = [
    { id: 'GST-NOT-2026-001', type: 'Mismatch in GSTR-3B', date: '2026-03-25', severity: 'medium', status: 'responded', dueDate: '2026-04-10' },
    { id: 'GST-NOT-2026-002', type: 'ITC reversal demand', date: '2026-04-02', severity: 'high', status: 'pending', dueDate: '2026-04-20' },
  ]
  const activeNotices = notices.filter((n) => n.status === 'pending')

  // METRIC 8: Compliance Score
  const complianceFactors: Record<string, number> = {
    filingOnTime: 85,
    itcReconciled: 94,
    tdsCompliance: 100,
    gstPaymentOnTime: 90,
    noticeResponse: 50,
  }
  const overallComplianceScore =
    Object.values(complianceFactors).reduce((s, v) => s + v, 0) / Object.keys(complianceFactors).length

  // METRIC 9: GST Trend
  const gstTrend = [0.72, 0.81, 0.88, 0.94, 0.97, 1].map((m, i) => {
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
    const oFactor = [0.68, 0.78, 0.86, 0.92, 0.96, 1][i]
    const input = inputGst * m
    const output = outputGst * oFactor
    return { month: months[i], input, output, payable: output - input * 0.92 }
  })

  // METRIC 10: Vendor compliance
  const vendors = [
    { name: 'AWS India', gstin: '07AABCA1234F1Z5', itc: 85000, filingStatus: 'compliant', lastFiled: 'Mar 2026' },
    { name: 'Google India', gstin: '27AABCG5678M1Z8', itc: 45000, filingStatus: 'compliant', lastFiled: 'Mar 2026' },
    { name: 'Vendor ABC', gstin: '29AABCV9012P1ZA', itc: 38000, filingStatus: 'non-compliant', lastFiled: 'Jan 2026' },
    { name: 'Supplier XYZ', gstin: '19AABCS3456K1ZD', itc: 32000, filingStatus: 'delayed', lastFiled: 'Feb 2026' },
  ]
  const nonCompliantVendors = vendors.filter((v) => v.filingStatus !== 'compliant')
  const atRiskItc = nonCompliantVendors.reduce((s, v) => s + v.itc, 0)
  const totalVendorItc = vendors.reduce((s, v) => s + v.itc, 0)

  const cardStyle = {
    background: colors.bg.card,
    border: `1px solid rgba(255,255,255,0.08)`,
  }

  const statusColor = (s: string) =>
    s === 'filed' || s === 'compliant' || s === 'responded'
      ? colors.success.main
      : s === 'pending' || s === 'non-compliant'
      ? colors.danger.main
      : s === 'delayed' || s === 'upcoming'
      ? colors.warning.main
      : colors.text.tertiary

  const severityColor = (s: string) =>
    s === 'high' ? colors.danger.main : s === 'medium' ? colors.warning.main : colors.info.main

  const scoreColor =
    overallComplianceScore > 80
      ? colors.success.main
      : overallComplianceScore > 60
      ? colors.warning.main
      : colors.danger.main

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
      {/* Compliance Alert Banner */}
      {(pendingFilings.length > 0 || activeNotices.length > 0) && (
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, ${colors.danger.main}25, ${colors.warning.main}15)`,
            border: `1px solid ${colors.danger.main}50`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: colors.danger.main }}
            >
              <AlertTriangle size={24} color="#fff" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif font-bold mb-2" style={{ fontSize: 20, color: colors.text.primary }}>
                ⚠️ URGENT: {pendingFilings.length} Pending Filings + {activeNotices.length} Active Notices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {pendingFilings.slice(0, 2).map((filing, idx) => (
                  <div key={idx} className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)' }}>
                    <div className="font-semibold text-sm" style={{ color: colors.text.primary }}>
                      {filing.return} - {filing.month}
                    </div>
                    <div className="text-xs mt-1" style={{ color: colors.text.secondary }}>
                      Due:{' '}
                      {new Date(filing.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                <GalaxyButton variant="danger"><RollingText text="File Now" /></GalaxyButton>
                <GalaxyButton variant="secondary">
                  View All ({pendingFilings.length + upcomingFilings.length})
                </GalaxyButton>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Stats: 5 KPI Cards */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6"
      >
        <CFOCard
          title="GST Payable"
          value={(gstPayable / 1000).toFixed(0)}
          prefix="₹"
          suffix="K"
          icon={DollarSign}
          trend={`Due Apr 20`}
          status="warning"
          subtitle="Output - ITC"
        />
        <CFOCard
          title="ITC Available"
          value={(itcAvailable / 1000).toFixed(0)}
          prefix="₹"
          suffix="K"
          icon={Shield}
          trend={`${itcUtilization.toFixed(0)}% utilized`}
          status="good"
          subtitle="Of input GST"
        />
        <CFOCard
          title="Pending Filings"
          value={pendingFilings.length}
          icon={FileText}
          trend={pendingFilings.length > 0 ? 'Action needed' : 'All clear'}
          status={pendingFilings.length > 0 ? 'danger' : 'good'}
          subtitle="GST returns"
        />
        <CFOCard
          title="Tax Due (30d)"
          value={(totalTaxDue30Days / 1000).toFixed(0)}
          prefix="₹"
          suffix="K"
          icon={Calendar}
          trend={`${taxPayments.filter((t) => t.daysLeft <= 30).length} payments`}
          status="warning"
          subtitle="GST + TDS + Advance"
        />
        <CFOCard
          title="Compliance Score"
          value={overallComplianceScore.toFixed(0)}
          suffix="%"
          icon={CheckCircle}
          trend={overallComplianceScore > 80 ? 'Healthy' : 'Needs work'}
          status={overallComplianceScore > 80 ? 'good' : 'warning'}
          subtitle="Overall health"
        />
      </motion.div>

      {/* METRIC 1: GST Liability Breakdown */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
        <h3 className="font-serif font-bold mb-6" style={{ fontSize: 22, color: colors.text.primary }}>
          GST Liability Calculation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Output GST', value: outputGst, sub: `18% on ₹${(revenue / 100000).toFixed(1)}L`, color: colors.info.main },
            { label: 'Input GST', value: inputGst, sub: `18% on ₹${(costs / 100000).toFixed(1)}L`, color: colors.primary[500] },
            { label: 'ITC Available', value: itcAvailable, sub: `${itcUtilization.toFixed(0)}% of input`, color: colors.success.main },
            { label: 'GST Payable', value: gstPayable, sub: 'Due Apr 20', color: colors.warning.main },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl"
              style={{ background: `${item.color}15`, border: `1px solid ${item.color}40` }}
            >
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.text.secondary }}>
                {item.label}
              </p>
              <p className="font-mono font-bold mb-1" style={{ fontSize: 28, color: item.color }}>
                ₹{(item.value / 1000).toFixed(0)}K
              </p>
              <p className="text-xs" style={{ color: colors.text.tertiary }}>
                {item.sub}
              </p>
            </div>
          ))}
        </div>
        <div
          className="mt-6 p-4 rounded-xl"
          style={{ background: `${colors.accent[500]}15`, border: `1px solid ${colors.accent[500]}40` }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: colors.text.primary }}>
            Formula: Output GST − ITC Available = GST Payable
          </p>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            ₹{(outputGst / 1000).toFixed(0)}K − ₹{(itcAvailable / 1000).toFixed(0)}K = ₹
            {(gstPayable / 1000).toFixed(0)}K • Blocked credit: ₹
            {((inputGst - itcAvailable) / 1000).toFixed(0)}K (ineligible expenses)
          </p>
        </div>
      </motion.div>

      {/* METRIC 2 & 3: Filing Status + ITC Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filing Status */}
        <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="font-serif font-bold mb-5" style={{ fontSize: 20, color: colors.text.primary }}>
            GST Filing Status
          </h3>
          <div className="space-y-3">
            {filings.map((filing, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex items-center gap-3">
                  {filing.status === 'filed' ? (
                    <CheckCircle size={18} color={colors.success.main} />
                  ) : filing.status === 'pending' ? (
                    <AlertTriangle size={18} color={colors.danger.main} />
                  ) : (
                    <Clock size={18} color={colors.warning.main} />
                  )}
                  <div>
                    <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                      {filing.return} — {filing.month}
                    </p>
                    <p className="text-xs" style={{ color: colors.text.tertiary }}>
                      Due:{' '}
                      {new Date(filing.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className="text-xs font-bold uppercase px-2 py-1 rounded"
                    style={{
                      background: `${statusColor(filing.status)}20`,
                      color: statusColor(filing.status),
                    }}
                  >
                    {filing.status}
                  </span>
                  {filing.filedOn && (
                    <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
                      Filed{' '}
                      {new Date(filing.filedOn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Filed', count: filings.filter((f) => f.status === 'filed').length, color: colors.success.main },
              { label: 'Pending', count: pendingFilings.length, color: colors.danger.main },
              { label: 'Upcoming', count: upcomingFilings.length, color: colors.warning.main },
            ].map((s, i) => (
              <div
                key={i}
                className="p-3 rounded-lg text-center"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}
              >
                <p className="text-xs uppercase" style={{ color: colors.text.secondary }}>
                  {s.label}
                </p>
                <p className="font-mono font-bold text-2xl" style={{ color: s.color }}>
                  {s.count}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ITC Reconciliation */}
        <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="font-serif font-bold mb-5" style={{ fontSize: 20, color: colors.text.primary }}>
            ITC Reconciliation (2A vs 2B vs Books)
          </h3>
          <div className="space-y-3">
            {[
              { label: 'As per Books', value: itcReconciliation.asPerBooks, sub: 'Internal records', color: colors.primary[500] },
              { label: 'As per GSTR-2A', value: itcReconciliation.asPerGstr2A, sub: 'Vendor-reported', color: colors.info.main },
              { label: 'As per GSTR-2B', value: itcReconciliation.asPerGstr2B, sub: 'Auto-drafted (final)', color: colors.success.main },
            ].map((row, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                    {row.label}
                  </p>
                  <p className="text-xs" style={{ color: colors.text.tertiary }}>
                    {row.sub}
                  </p>
                </div>
                <p className="font-mono font-bold text-xl" style={{ color: row.color }}>
                  ₹{(row.value / 1000).toFixed(0)}K
                </p>
              </div>
            ))}
            <div
              className="p-4 rounded-lg"
              style={{ background: `${colors.warning.main}15`, border: `1px solid ${colors.warning.main}40` }}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                  Reconciliation Gap
                </p>
                <p className="font-mono font-bold text-xl" style={{ color: colors.warning.main }}>
                  ₹{(itcReconciliation.mismatch / 1000).toFixed(0)}K
                </p>
              </div>
              <p className="text-xs" style={{ color: colors.text.secondary }}>
                {reconciliationGap}% variance • Action: verify {nonCompliantVendors.length} vendor invoices
              </p>
            </div>
          </div>
          <div
            className="mt-5 p-3 rounded-lg"
            style={{ background: `${colors.danger.main}15`, border: `1px solid ${colors.danger.main}30` }}
          >
            <p className="text-xs" style={{ color: colors.text.secondary }}>
              <strong style={{ color: colors.text.primary }}>Blocked ITC:</strong> ₹
              {(itcReconciliation.blockedCredit / 1000).toFixed(0)}K ineligible (personal use, exempt supplies)
            </p>
          </div>
        </motion.div>
      </div>

      {/* METRIC 4: TDS */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
        <h3 className="font-serif font-bold mb-5" style={{ fontSize: 22, color: colors.text.primary }}>
          TDS Deducted & Payable
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'TDS on Salaries', value: tdsOnSalaries, sub: 'Section 192', color: colors.primary[500] },
            { label: 'TDS on Professional Fees', value: tdsOnProfessional, sub: 'Section 194J', color: colors.info.main },
            {
              label: 'Total Payable',
              value: totalTdsDeducted,
              sub: `Due ${new Date(tdsPayableDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
              color: colors.warning.main,
            },
          ].map((t, i) => (
            <div
              key={i}
              className="p-5 rounded-xl"
              style={{ background: `${t.color}15`, border: `1px solid ${t.color}40` }}
            >
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.text.secondary }}>
                {t.label}
              </p>
              <p className="font-mono font-bold mb-1" style={{ fontSize: 28, color: t.color }}>
                ₹{(t.value / 1000).toFixed(0)}K
              </p>
              <p className="text-xs" style={{ color: colors.text.tertiary }}>
                {t.sub}
              </p>
            </div>
          ))}
        </div>
        <div
          className="mt-5 p-4 rounded-xl"
          style={{ background: `${colors.info.main}15`, border: `1px solid ${colors.info.main}40` }}
        >
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            <strong style={{ color: colors.text.primary }}>Monthly TDS Filing:</strong> Form 24Q (salaries) + 26Q
            (others) must be filed by the 7th of the next month. Current month deductions: ₹
            {(totalTdsDeducted / 1000).toFixed(0)}K.
          </p>
        </div>
      </motion.div>

      {/* METRIC 5: Tax Calendar */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif font-bold" style={{ fontSize: 22, color: colors.text.primary }}>
            Upcoming Tax Payments
          </h3>
          <div className="text-right">
            <p className="text-xs uppercase" style={{ color: colors.text.secondary }}>
              Due in 30 days
            </p>
            <p className="font-mono font-bold text-2xl" style={{ color: colors.warning.main }}>
              ₹{(totalTaxDue30Days / 1000).toFixed(0)}K
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {taxPayments.map((payment, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div className="flex items-center gap-3">
                <Calendar size={20} color={payment.daysLeft <= 7 ? colors.danger.main : colors.warning.main} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                    {payment.type}
                  </p>
                  <p className="text-xs" style={{ color: colors.text.tertiary }}>
                    Due:{' '}
                    {new Date(payment.dueDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-lg" style={{ color: colors.text.primary }}>
                  ₹{(payment.amount / 1000).toFixed(0)}K
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: payment.daysLeft <= 7 ? colors.danger.main : colors.text.secondary }}
                >
                  {payment.daysLeft} days left
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* METRIC 6 & 7: GST Rate Analysis + Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GST Rate Analysis */}
        <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="font-serif font-bold mb-5" style={{ fontSize: 20, color: colors.text.primary }}>
            GST Rate-wise Breakdown
          </h3>
          <div className="space-y-4">
            {gstRates.map((rate, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono font-bold text-lg"
                      style={{ color: colors.accent[500] }}
                    >
                      {rate.rate}
                    </span>
                    <span className="text-xs" style={{ color: colors.text.tertiary }}>
                      {rate.transactions} transactions
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                      ₹{(rate.gst / 1000).toFixed(1)}K GST
                    </p>
                    <p className="text-xs" style={{ color: colors.text.tertiary }}>
                      on ₹{(rate.revenue / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: colors.primary[500] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(rate.revenue / totalRateRevenue) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-5 p-3 rounded-lg"
            style={{ background: `${colors.accent[500]}15`, border: `1px solid ${colors.accent[500]}30` }}
          >
            <p className="text-xs" style={{ color: colors.text.secondary }}>
              <strong style={{ color: colors.text.primary }}>Avg Effective Rate:</strong> {avgEffectiveRate}% • Most
              transactions at the 18% standard rate
            </p>
          </div>
        </motion.div>

        {/* Notices */}
        <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif font-bold" style={{ fontSize: 20, color: colors.text.primary }}>
              Notices & Communications
            </h3>
            <Bell size={20} color={colors.warning.main} />
          </div>
          {notices.length > 0 ? (
            <div className="space-y-3">
              {notices.map((notice, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${severityColor(notice.severity)}30` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-bold uppercase px-2 py-0.5 rounded"
                          style={{
                            background: `${severityColor(notice.severity)}25`,
                            color: severityColor(notice.severity),
                          }}
                        >
                          {notice.severity}
                        </span>
                        <span className="text-xs font-mono" style={{ color: colors.text.tertiary }}>
                          {notice.id}
                        </span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                        {notice.type}
                      </p>
                      <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
                        Received:{' '}
                        {new Date(notice.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} •
                        Reply by:{' '}
                        {new Date(notice.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold uppercase px-2 py-1 rounded"
                      style={{
                        background: `${statusColor(notice.status)}20`,
                        color: statusColor(notice.status),
                      }}
                    >
                      {notice.status}
                    </span>
                  </div>
                  {notice.status === 'pending' && (
                    <div className="mt-3">
                      <GalaxyButton variant="danger"><RollingText text="Respond Now" /></GalaxyButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle size={48} color={colors.success.main} className="mx-auto mb-3" />
              <p className="font-semibold" style={{ color: colors.text.primary }}>
                No Active Notices
              </p>
              <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                All clear! No pending communications.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs uppercase" style={{ color: colors.text.secondary }}>
                Total Notices
              </p>
              <p className="font-mono font-bold text-2xl" style={{ color: colors.text.primary }}>
                {notices.length}
              </p>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs uppercase" style={{ color: colors.text.secondary }}>
                Pending
              </p>
              <p className="font-mono font-bold text-2xl" style={{ color: colors.danger.main }}>
                {activeNotices.length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* METRIC 8: Compliance Score */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif font-bold" style={{ fontSize: 22, color: colors.text.primary }}>
            Compliance Health Score
          </h3>
          <div className="text-right">
            <p className="font-mono font-bold" style={{ fontSize: 48, color: scoreColor, lineHeight: 1 }}>
              {overallComplianceScore.toFixed(0)}%
            </p>
            <p className="text-xs uppercase mt-1" style={{ color: colors.text.secondary }}>
              {overallComplianceScore > 80
                ? 'Excellent'
                : overallComplianceScore > 60
                ? 'Good'
                : 'Needs Attention'}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {Object.entries(complianceFactors).map(([key, value], idx) => {
            const c = value > 80 ? colors.success.main : value > 60 ? colors.warning.main : colors.danger.main
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm capitalize" style={{ color: colors.text.secondary }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm font-mono font-bold" style={{ color: c }}>
                    {value}%
                  </p>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: c }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div
          className="mt-6 p-4 rounded-xl"
          style={{
            background: `${overallComplianceScore > 80 ? colors.success.main : colors.warning.main}15`,
            border: `1px solid ${overallComplianceScore > 80 ? colors.success.main : colors.warning.main}40`,
          }}
        >
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            <strong style={{ color: colors.text.primary }}>Action Required:</strong>{' '}
            {overallComplianceScore > 80
              ? 'Excellent compliance standing. Maintain current practices.'
              : 'Notice response rate at 50% needs immediate attention. Reply to pending GST notice within 3 days to avoid penalties.'}
          </p>
        </div>
      </motion.div>

      {/* METRIC 9: GST Trend Chart */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
        <h3 className="font-serif font-bold mb-5" style={{ fontSize: 22, color: colors.text.primary }}>
          GST Trend (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={gstTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke={colors.text.tertiary} />
            <YAxis stroke={colors.text.tertiary} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{
                background: colors.bg.secondary,
                border: `1px solid ${colors.primary[500]}40`,
                borderRadius: 8,
                color: colors.text.primary,
              }}
              formatter={(v: number) => `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            />
            <Legend wrapperStyle={{ color: colors.text.secondary }} />
            <Line type="monotone" dataKey="output" stroke={colors.info.main} strokeWidth={2} name="Output GST" />
            <Line type="monotone" dataKey="input" stroke={colors.primary[500]} strokeWidth={2} name="Input GST" />
            <Line type="monotone" dataKey="payable" stroke={colors.warning.main} strokeWidth={2} name="Payable" />
          </LineChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-4 mt-5">
          {[
            { label: 'Avg Output GST', value: gstTrend.reduce((s, m) => s + m.output, 0) / gstTrend.length, color: colors.info.main },
            { label: 'Avg Input GST', value: gstTrend.reduce((s, m) => s + m.input, 0) / gstTrend.length, color: colors.primary[500] },
            { label: 'Avg Payable', value: gstTrend.reduce((s, m) => s + m.payable, 0) / gstTrend.length, color: colors.warning.main },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs uppercase" style={{ color: colors.text.secondary }}>
                {s.label}
              </p>
              <p className="font-mono font-bold text-xl" style={{ color: s.color }}>
                ₹{(s.value / 1000).toFixed(0)}K
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* METRIC 10: Vendor Compliance */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif font-bold" style={{ fontSize: 22, color: colors.text.primary }}>
            Vendor GST Compliance (ITC Eligibility)
          </h3>
          <div className="text-right">
            <p className="text-xs uppercase" style={{ color: colors.text.secondary }}>
              ITC at Risk
            </p>
            <p className="font-mono font-bold text-2xl" style={{ color: colors.danger.main }}>
              ₹{(atRiskItc / 1000).toFixed(0)}K
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {vendors.map((vendor, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                  {vendor.name}
                </p>
                <p className="text-xs font-mono" style={{ color: colors.text.tertiary }}>
                  GSTIN: {vendor.gstin}
                </p>
                <p className="text-xs" style={{ color: colors.text.tertiary }}>
                  Last Filed: {vendor.lastFiled}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-lg" style={{ color: colors.text.primary }}>
                  ₹{(vendor.itc / 1000).toFixed(0)}K
                </p>
                <span
                  className="text-xs font-bold uppercase px-2 py-1 rounded inline-block mt-1"
                  style={{
                    background: `${statusColor(vendor.filingStatus)}20`,
                    color: statusColor(vendor.filingStatus),
                  }}
                >
                  {vendor.filingStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div
          className="mt-5 p-4 rounded-xl"
          style={{ background: `${colors.danger.main}15`, border: `1px solid ${colors.danger.main}40` }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: colors.text.primary }}>
            ⚠️ Action Required: {nonCompliantVendors.length} Non-Compliant Vendors
          </p>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            ITC worth ₹{(atRiskItc / 1000).toFixed(0)}K at risk. Contact vendors immediately to ensure timely GST
            filing. If vendors remain non-compliant for 2+ months, ITC may be reversed.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs uppercase" style={{ color: colors.text.secondary }}>
              Compliant
            </p>
            <p className="font-mono font-bold text-xl" style={{ color: colors.success.main }}>
              {vendors.filter((v) => v.filingStatus === 'compliant').length}/{vendors.length}
            </p>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs uppercase" style={{ color: colors.text.secondary }}>
              Total ITC
            </p>
            <p className="font-mono font-bold text-xl" style={{ color: colors.text.primary }}>
              ₹{(totalVendorItc / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs uppercase" style={{ color: colors.text.secondary }}>
              At Risk
            </p>
            <p className="font-mono font-bold text-xl" style={{ color: colors.danger.main }}>
              {((atRiskItc / totalVendorItc) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default GSTDashboard
