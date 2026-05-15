import { useState, useEffect } from 'react'
// Demo access guards temporarily disabled — re-enable when design review complete
import { Droplet, TrendingUp, DollarSign, FileText, Bot } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { LiquidityDashboard } from '@/components/demo/LiquidityDashboard'
import { FynnyChat } from '@/components/demo/FynnyChat'
import { RevenueDashboard } from '@/components/demo/RevenueDashboard'

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
    },
    cost: {
      totalCost: 630000,
      byCategory: {},
      topCategories: [
        { category: 'salary', amount: 180000 },
        { category: 'rent', amount: 45000 },
        { category: 'vendor', amount: 85000 },
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
              className="px-4 py-2 text-white/70 hover:text-white text-sm font-semibold border border-white/20 rounded-lg hover:border-white/40 transition-colors"
            >
              Exit Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Module Tabs */}
      <div className="border-b border-white/10 bg-[#1a1412]/50 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {MODULES.map((module) => {
              const Icon = module.icon
              const isActive = activeModule === module.id
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-[#C41E1E] text-white'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                >
                  <Icon size={20} style={{ color: isActive ? module.color : undefined }} />
                  <span className="font-semibold">{module.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeModule === 'liquidity' && <LiquidityDashboard data={insightsData} />}
        {activeModule === 'revenue' && <RevenueModule data={insightsData} />}
        {activeModule === 'cost' && <CostModule data={insightsData} />}
        {activeModule === 'gst' && <GSTModule data={insightsData} />}
        {activeModule === 'fynny' && <FynnyModule answers={answers} orgId={orgId} />}
      </div>
    </div>
  )
}

function RevenueModule({ data }: { data: any }) {
  return <RevenueDashboard data={data} />
}

function CostModule({ data }: { data: any }) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-12 text-center">
      <DollarSign size={64} className="text-amber-500 mx-auto mb-6" />
      <h2 className="text-3xl font-georgia font-bold text-white mb-4">Cost Intelligence</h2>
      <p className="text-white/70 text-lg">
        Total Expenses: ₹{data?.cost?.totalCost?.toLocaleString('en-IN') || 'N/A'}
      </p>
      <div className="mt-8 text-white/50 text-sm">Building full dashboard...</div>
    </div>
  )
}

function GSTModule({ data: _data }: { data: any }) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-12 text-center">
      <FileText size={64} className="text-purple-500 mx-auto mb-6" />
      <h2 className="text-3xl font-georgia font-bold text-white mb-4">GST & Tax Intelligence</h2>
      <p className="text-white/70 text-lg">
        Compliance tracking, ITC reconciliation, deadline alerts
      </p>
      <div className="mt-8 text-white/50 text-sm">Building full dashboard...</div>
    </div>
  )
}

function FynnyModule({ answers, orgId }: { answers: string[]; orgId: string | null }) {
  if (!orgId) return null
  return <FynnyChat orgId={orgId} answers={answers} />
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
