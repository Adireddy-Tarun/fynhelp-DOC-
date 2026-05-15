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
      currentCash: 380000,
      monthlyBurn: 210000,
      runway: 1.8,
      ccc: { dso: 45, dio: 30, dpo: 60, value: 15 },
      scenarios: {
        base: { revenue: 140000, expenses: 210000, runway: 1.8 },
        best: { revenue: 168000, expenses: 199500, runway: 12.5 },
        worst: { revenue: 112000, expenses: 231000, runway: 3.2 },
      },
      arAging: [
        { bucket: '0-30 days', amount: 125000, percent: 45 },
        { bucket: '31-60 days', amount: 85000, percent: 30 },
        { bucket: '61-90 days', amount: 45000, percent: 16 },
        { bucket: '90+ days', amount: 25000, percent: 9 },
      ],
      burnMultiple: 1.5,
      forecast13Week: Array.from({ length: 13 }, (_, i) => ({
        week: i + 1,
        projected: 380000 - 70000 * i,
        actual: i < 2 ? 380000 - 70000 * i : null,
      })),
      topExpenses: [
        { category: 'salary', amount: 180000 },
        { category: 'rent', amount: 45000 },
        { category: 'vendor', amount: 85000 },
        { category: 'software', amount: 32000 },
        { category: 'marketing', amount: 28000 },
      ],
      cashFlowTimeline: [
        { date: '2026-03-01', balance: 850000 },
        { date: '2026-03-15', balance: 780000 },
        { date: '2026-04-01', balance: 650000 },
        { date: '2026-04-15', balance: 520000 },
        { date: '2026-05-01', balance: 450000 },
        { date: '2026-05-15', balance: 380000 },
      ],
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
                className="font-serif font-bold"
                style={{ fontSize: 32, color: "#F8FAFC", lineHeight: 1.1 }}
              >
                {businessName}
              </h1>
              <p style={{ color: "#CBD5E1" }} className="text-sm mt-1">Data: {fileName}</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Exit demo? All data will be cleared.')) {
                  sessionStorage.clear()
                  window.location.href = '/demo/login'
                }
              }}
              className="text-sm font-semibold border rounded-lg transition-colors"
              style={{
                padding: "16px 32px",
                color: "#CBD5E1",
                borderColor: "rgba(255,255,255,0.2)",
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
