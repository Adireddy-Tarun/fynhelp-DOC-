import { useState, useEffect } from 'react'
// Demo access guards temporarily disabled — re-enable when design review complete
import { Droplet, TrendingUp, DollarSign, FileText, Bot, Loader } from 'lucide-react'
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1412] to-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader size={48} className="text-[#C41E1E] animate-spin" />
          <p className="text-white/70 font-semibold">Loading insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1412] to-[#0a0a0a]">
      {/* Top Nav */}
      <nav className="border-b border-white/10 bg-[#1a1412]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-georgia font-bold text-white">{businessName}</h1>
              <p className="text-white/60 text-sm mt-0.5">Data: {fileName}</p>
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

export default DemoDashboard
