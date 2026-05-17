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
      totalRevenue: 420000,
      transactions: 8,
      avgMonthly: 140000,
      mrr: 98000,
      arr: 1176000,
      arpu: 17500,
      cac: 45000,
      ltv: 625000,
      ltvCacRatio: 13.9,
      magicNumber: 0.42,
      ruleOf40: 0,
      churn: { logo: 2.1, revenue: 1.8 },
      cohorts: [
        { cohort: 'Jan 2026', m0: 100, m1: 92, m2: 87, m3: 85 },
        { cohort: 'Feb 2026', m0: 100, m1: 94, m2: 89, m3: null },
        { cohort: 'Mar 2026', m0: 100, m1: 95, m2: null, m3: null },
      ],
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
