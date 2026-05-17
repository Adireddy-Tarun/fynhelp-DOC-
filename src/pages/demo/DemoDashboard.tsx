import { useState, useEffect } from 'react'
// Demo access guards temporarily disabled — re-enable when design review complete
import { Droplet, TrendingUp, DollarSign, FileText, Bot } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { LiquidityDashboard } from '@/components/demo/LiquidityDashboard'
import { FynnyChat } from '@/components/demo/FynnyChat'
import { RevenueDashboard } from '@/components/demo/RevenueDashboard'
import { CostDashboard } from '@/components/demo/CostDashboard'
import { GSTDashboard } from '@/components/demo/GSTDashboard'

const MODULES = [
  { id: 'liquidity', name: 'Liquidity', icon: Droplet, color: '#3B82F6' },
  { id: 'revenue', name: 'Revenue', icon: TrendingUp, color: '#10B981' },
  { id: 'cost', name: 'Cost', icon: DollarSign, color: '#F59E0B' },
  { id: 'gst', name: 'GST & Tax', icon: FileText, color: '#8B5CF6' },
  { id: 'fynny', name: 'Ask Fynny', icon: Bot, color: '#C41E1E' },
]

export function DemoDashboard() {
  const [activeModule, setActiveModule] = useState('liquidity')
  const [insightsData, setInsightsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Access guards temporarily disabled for design review
  const orgId = sessionStorage.getItem('demo_org_id')
  const fileName = sessionStorage.getItem('demo_file') || 'uploaded-data.csv'
  const answersStr = sessionStorage.getItem('demo_answers')
  const answers: string[] = answersStr ? JSON.parse(answersStr) : []
  const businessName = answers[0] || 'Your Business'

  const FALLBACK_DATA = {
    liquidity: {
      cashPosition: {
        currentCash: 380000,
        operatingCash: 323000,
        restrictedCash: 57000,
        dso: 42,
        dio: 28,
        dpo: 35,
        ccc: 35,
        quickRatio: 1.85,
        currentRatio: 2.3,
        workingCapital: 247000,
      },
      burnRunway: {
        grossBurn: 210000,
        netBurn: 83333,
        runway: 4.56,
        zeroCashDate: '2026-10-05',
        burnMultiple: 0.66,
        scenarioBest: 6.2,
        scenarioBase: 4.56,
        scenarioWorst: 3.1,
      },
      cashFlow: {
        operatingCashFlow: 233000,
        investingCashFlow: -25200,
        financingCashFlow: 0,
        freeCashFlow: 207800,
        thirteenWeekForecast: [
          { week: 1, date: '2026-05-24', projected: 380000 },
          { week: 2, date: '2026-05-31', projected: 361500 },
          { week: 3, date: '2026-06-07', projected: 343000 },
          { week: 4, date: '2026-06-14', projected: 324500 },
          { week: 5, date: '2026-06-21', projected: 306000 },
          { week: 6, date: '2026-06-28', projected: 287500 },
          { week: 7, date: '2026-07-05', projected: 269000 },
          { week: 8, date: '2026-07-12', projected: 250500 },
          { week: 9, date: '2026-07-19', projected: 232000 },
          { week: 10, date: '2026-07-26', projected: 213500 },
          { week: 11, date: '2026-08-02', projected: 195000 },
          { week: 12, date: '2026-08-09', projected: 176500 },
          { week: 13, date: '2026-08-16', projected: 158000 },
        ],
      },
      receivablesPayables: {
        arAging: {
          bucket_0_30: 372000,
          bucket_31_60: 138000,
          bucket_61_90: 66000,
          bucket_90_plus: 24000,
        },
        overdueInvoices: [
          { customer: 'Acme Corp', amount: 145000, daysOverdue: 42, creditRisk: 'Medium' },
          { customer: 'TechStart Ltd', amount: 98000, daysOverdue: 35, creditRisk: 'Low' },
          { customer: 'Global Inc', amount: 67000, daysOverdue: 28, creditRisk: 'Low' },
        ],
        apAging: {
          bucket_0_30: 142800,
          bucket_31_60: 46200,
          bucket_61_90: 16800,
          bucket_90_plus: 4200,
        },
        paymentTermsOpportunities: [
          { vendor: 'AWS', currentTerms: 30, suggestedTerms: 45, savings: 38000 },
          { vendor: 'Salesforce', currentTerms: 30, suggestedTerms: 60, savings: 52000 },
        ],
        creditRiskScore: {},
      },
      alerts: {
        runwayAlert: true,
        burnIncreaseAlert: false,
        majorPaymentsDue: [
          { vendor: 'AWS', amount: 125000, dueDate: '2026-06-15', category: 'Infrastructure' },
          { vendor: 'Payroll', amount: 420000, dueDate: '2026-06-01', category: 'Salaries' },
          { vendor: 'Office Rent', amount: 95000, dueDate: '2026-06-05', category: 'Facilities' },
        ],
        overdueCustomers: ['Acme Corp', 'TechStart Ltd', 'Global Inc'],
        cashBelowMinimum: true,
      },
    },
    revenue: {
      metrics: {
        totalRevenue: 1847000,
        mrr: 1420000,
        arr: 17040000,
        growthMoM: 8.3,
        growthQoQ: 24.7,
        growthYoY: 127.4,
        nrr: 118,
        grr: 93,
        ltv: 385000,
        cac: 82000,
        ltvCacRatio: 4.7,
        paybackPeriod: 11.2,
        magicNumber: 0.89,
        avgDealSize: 145000,
        ruleOf40: 51.7,
      },
      breakdown: {
        byProduct: [
          { name: 'Liquidity Intelligence', revenue: 567000, percent: 39.9 },
          { name: 'Revenue Intelligence', revenue: 426000, percent: 30.0 },
          { name: 'GST & Tax Intelligence', revenue: 284000, percent: 20.0 },
          { name: 'Cost Intelligence', revenue: 142000, percent: 10.0 },
        ],
        bySegment: [
          { segment: 'SMB (5-50 employees)', revenue: 710000, percent: 50.0 },
          { segment: 'Mid-Market (51-500)', revenue: 497000, percent: 35.0 },
          { segment: 'Enterprise (500+)', revenue: 213000, percent: 15.0 },
        ],
        byChannel: [
          { channel: 'Direct Sales', revenue: 781000, percent: 55.0 },
          { channel: 'Partner Channel', revenue: 426000, percent: 30.0 },
          { channel: 'Self-Serve', revenue: 213000, percent: 15.0 },
        ],
        revenueType: {
          new: 568000,
          expansion: 312000,
          renewal: 540000,
          recurring: 1420000,
          oneTime: 427000,
        },
      },
      cohorts: {
        retentionCurves: [
          {
            cohort: 'Jan 2025',
            months: [
              { month: 0, retained: 100 },
              { month: 1, retained: 94 },
              { month: 2, retained: 89 },
              { month: 3, retained: 85 },
              { month: 4, retained: 82 },
              { month: 5, retained: 78 },
              { month: 6, retained: 76 },
            ],
          },
          {
            cohort: 'Oct 2024',
            months: [
              { month: 0, retained: 100 },
              { month: 1, retained: 92 },
              { month: 2, retained: 87 },
              { month: 3, retained: 83 },
              { month: 4, retained: 80 },
              { month: 5, retained: 77 },
              { month: 6, retained: 74 },
              { month: 7, retained: 72 },
              { month: 8, retained: 71 },
              { month: 9, retained: 69 },
              { month: 10, retained: 68 },
              { month: 11, retained: 67 },
              { month: 12, retained: 66 },
            ],
          },
          {
            cohort: 'Jul 2024',
            months: [
              { month: 0, retained: 100 },
              { month: 1, retained: 90 },
              { month: 2, retained: 84 },
              { month: 3, retained: 80 },
              { month: 4, retained: 76 },
              { month: 5, retained: 73 },
              { month: 6, retained: 70 },
              { month: 7, retained: 68 },
              { month: 8, retained: 66 },
              { month: 9, retained: 64 },
              { month: 10, retained: 63 },
              { month: 11, retained: 62 },
              { month: 12, retained: 61 },
            ],
          },
        ],
        revenuePerCohort: [
          { cohort: 'Jan 2025', revenue: 485000 },
          { cohort: 'Oct 2024', revenue: 412000 },
          { cohort: 'Jul 2024', revenue: 367000 },
          { cohort: 'Apr 2024', revenue: 298000 },
        ],
        churnByCohort: [
          { cohort: 'Jan 2025', churnRate: 6.0 },
          { cohort: 'Oct 2024', churnRate: 8.3 },
          { cohort: 'Jul 2024', churnRate: 9.8 },
          { cohort: 'Apr 2024', churnRate: 11.2 },
        ],
        expansionByCohort: [
          { cohort: 'Jan 2025', expansionRate: 12.5 },
          { cohort: 'Oct 2024', expansionRate: 18.7 },
          { cohort: 'Jul 2024', expansionRate: 24.3 },
          { cohort: 'Apr 2024', expansionRate: 31.8 },
        ],
      },
      pipeline: {
        pipelineValue: 4250000,
        winRate: 28.4,
        avgDealSize: 145000,
        salesCycleLength: 47,
        bookings: 1650000,
        billings: 1580000,
        deferredRevenue: 820000,
        unbilledRevenue: 340000,
        stages: [
          { stage: 'Lead', deals: 142, value: 4250000, conversionRate: 100 },
          { stage: 'Qualified', deals: 89, value: 3180000, conversionRate: 62.7 },
          { stage: 'Demo', deals: 56, value: 2340000, conversionRate: 62.9 },
          { stage: 'Proposal', deals: 34, value: 1680000, conversionRate: 60.7 },
          { stage: 'Negotiation', deals: 18, value: 980000, conversionRate: 52.9 },
          { stage: 'Closed Won', deals: 12, value: 720000, conversionRate: 66.7 },
        ],
      },
      health: {
        logoChurn: 4.2,
        revenueChurn: 7.1,
        expansionRate: 22.0,
        contractionRate: 3.5,
        revenueConcentration: 18.4,
      },
      mrrTrend: [
        { month: 'Jul 2024', mrr: 718000 },
        { month: 'Aug 2024', mrr: 762000 },
        { month: 'Sep 2024', mrr: 814000 },
        { month: 'Oct 2024', mrr: 873000 },
        { month: 'Nov 2024', mrr: 924000 },
        { month: 'Dec 2024', mrr: 982000 },
        { month: 'Jan 2025', mrr: 1045000 },
        { month: 'Feb 2025', mrr: 1098000 },
        { month: 'Mar 2025', mrr: 1165000 },
        { month: 'Apr 2025', mrr: 1230000 },
        { month: 'May 2025', mrr: 1310000 },
        { month: 'Jun 2025', mrr: 1420000 },
      ],
      atRiskRevenue: {
        totalAtRisk: 167000,
        customerCount: 8,
        topAccounts: [
          { customer: 'TechStart Solutions', mrr: 45000, riskScore: 87, churnProbability: 72 },
          { customer: 'CloudSync India', mrr: 38000, riskScore: 79, churnProbability: 65 },
          { customer: 'FinPro Analytics', mrr: 32000, riskScore: 74, churnProbability: 58 },
          { customer: 'DataFlow Systems', mrr: 28000, riskScore: 68, churnProbability: 51 },
          { customer: 'SmartOps Tech', mrr: 24000, riskScore: 63, churnProbability: 47 },
        ],
      },
    },
    cost: {
      totalCost: 630000,
      cogs: 176400,
      grossProfit: 243600,
      grossMargin: 58,
      opex: 453600,
      salesMarketing: 158760,
      researchDev: 127008,
      generalAdmin: 99792,
      ebitda: -33600,
      ebitdaMargin: -8,
      fixedCosts: 390600,
      variableCosts: 239400,
      topVendors: [
        { vendor: 'AWS', amount: 85050, paymentTerms: 'Net 30' },
        { vendor: 'Google Workspace', amount: 44730, paymentTerms: 'Net 15' },
        { vendor: 'Salesforce', amount: 37800, paymentTerms: 'Net 45' },
      ],
      revenuePerEmployee: 35000,
      grossProfitPerEmployee: 20300,
      costPerCustomer: 22500,
      costToServe: 16200,
      topCategories: [
        { category: 'salary', amount: 180000 },
        { category: 'rent', amount: 45000 },
        { category: 'vendor', amount: 85000 },
      ],
    },
    gst: {
      outputGst: 75600,
      inputGst: 113400,
      itcAvailable: 104328,
      gstPayable: -28728,
      filings: [
        { return: 'GSTR-1', month: 'Mar 2026', status: 'pending', dueDate: '2026-04-11' },
        { return: 'GSTR-3B', month: 'Mar 2026', status: 'pending', dueDate: '2026-04-20' },
      ],
      itcReconciliation: {
        asPerBooks: 113400,
        asPerGstr2A: 108864,
        asPerGstr2B: 106596,
        mismatch: 6804,
      },
      tdsDeducted: 7560,
      complianceScore: 83,
      notices: [
        { id: 'GST-NOT-2026-002', type: 'ITC reversal demand', severity: 'high', status: 'pending' },
      ],
    },
  }

  useEffect(() => {
    const fetchInsights = async () => {
      if (!orgId) {
        setInsightsData(FALLBACK_DATA)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('demo_insights')
          .select('*')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (error) throw error
        setInsightsData(data?.data ?? FALLBACK_DATA)
      } catch (error) {
        console.error('Error fetching insights:', error)
        setInsightsData(FALLBACK_DATA)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <DashboardSkeleton businessName={businessName} fileName={fileName} />
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #0A0E27 0%, #1A1F3A 100%)" }}
    >
      {/* Top Nav */}
      <nav className="border-b border-white/10 bg-[#0A0E27]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-4xl font-bold mb-2"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '-0.02em',
                  color: '#F8FAFC',
                  lineHeight: 1.1,
                }}
              >
                {businessName}
              </h1>
              <p
                className="text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#64748B' }}
              >
                Data: {fileName}
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Exit demo? All data will be cleared.')) {
                  sessionStorage.clear()
                  window.location.href = '/demo/login'
                }
              }}
              className="px-6 py-3 rounded-xl font-semibold transition-colors"
              style={{
                background: '#252B48',
                color: '#F8FAFC',
                fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
                border: '1px solid rgba(57, 73, 171, 0.25)',
              }}
            >
              Exit Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Module Tabs */}
      <div className="border-b border-white/10 sticky top-[89px] z-40" style={{ background: "#0A0E27CC" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {MODULES.map((module) => {
              const Icon = module.icon
              const isActive = activeModule === module.id
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap font-inter font-semibold ${
                    isActive ? "text-white" : "text-white/60 hover:text-white/80"
                  }`}
                  style={{ borderColor: isActive ? "#FFA726" : "transparent" }}
                >
                  <Icon size={20} style={{ color: isActive ? "#FFA726" : undefined }} />
                  <span>{module.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {activeModule === 'liquidity' && <LiquidityDashboard data={insightsData} />}
        {activeModule === 'revenue' && <RevenueModule data={insightsData} />}
        {activeModule === 'cost' && <CostModule data={insightsData} />}
        {activeModule === 'gst' && <GSTModule data={insightsData} />}
        {activeModule === 'fynny' && <FynnyModule answers={answers} orgId={orgId} data={insightsData} />}
      </div>
    </div>
  )
}

function RevenueModule({ data }: { data: any }) {
  return <RevenueDashboard data={data} />
}

function CostModule({ data }: { data: any }) {
  return <CostDashboard data={data} />
}

function GSTModule({ data }: { data: any }) {
  return <GSTDashboard data={data} />
}

function FynnyModule({ answers, orgId, data }: { answers: string[]; orgId: string | null; data: any }) {
  return <FynnyChat data={data} orgId={orgId} answers={answers} />
}

function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-white/5 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

function DashboardSkeleton({
  businessName,
  fileName,
}: {
  businessName: string
  fileName: string
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1412] to-[#0a0a0a]">
      {/* Top Nav (real, so no flash) */}
      <nav className="border-b border-white/10 bg-[#1a1412]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-georgia font-bold text-white">{businessName}</h1>
              <p className="text-white/60 text-sm mt-0.5">Data: {fileName}</p>
            </div>
            <div className="px-4 py-2 text-white/40 text-sm font-semibold border border-white/10 rounded-lg">
              Loading…
            </div>
          </div>
        </div>
      </nav>

      {/* Module tab placeholders */}
      <div className="border-b border-white/10 bg-[#1a1412]/50 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Shimmer key={i} className="h-6 w-24" />
            ))}
          </div>
        </div>
      </div>

      {/* Body skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Banner */}
        <Shimmer className="h-28 w-full" />

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
            >
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-8 w-40" />
              <Shimmer className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <Shimmer className="h-5 w-48" />
          <Shimmer className="h-64 w-full" />
        </div>

        {/* Two-column lower section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3"
            >
              <Shimmer className="h-5 w-40" />
              {Array.from({ length: 4 }).map((__, j) => (
                <Shimmer key={j} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DemoDashboard
