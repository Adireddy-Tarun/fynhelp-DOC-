import { useState, useEffect } from 'react'
import { Droplet, TrendingUp, DollarSign, FileText, Bot, Loader } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { LiquidityDashboard } from '@/components/demo/LiquidityDashboard'

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

  const hasAccess = sessionStorage.getItem('demo_access') === 'true'
  if (!hasAccess) {
    window.location.href = '/demo/login'
    return null
  }

  const orgId = sessionStorage.getItem('demo_org_id')
  const fileName = sessionStorage.getItem('demo_file') || 'uploaded-data.csv'
  const answersStr = sessionStorage.getItem('demo_answers')
  const answers: string[] = answersStr ? JSON.parse(answersStr) : []
  const businessName = answers[0] || 'Your Business'

  useEffect(() => {
    const fetchInsights = async () => {
      if (!orgId) {
        alert('Session expired. Please restart demo.')
        window.location.href = '/demo/login'
        return
      }

      try {
        const { data, error } = await supabase
          .from('demo_insights')
          .select('*')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) throw error
        setInsightsData(data?.data ?? null)
      } catch (error) {
        console.error('Error fetching insights:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [orgId])

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
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-12 text-center">
      <TrendingUp size={64} className="text-green-500 mx-auto mb-6" />
      <h2 className="text-3xl font-georgia font-bold text-white mb-4">Revenue Intelligence</h2>
      <p className="text-white/70 text-lg">
        Total Revenue: ₹{data?.revenue?.totalRevenue?.toLocaleString('en-IN') || 'N/A'}
      </p>
      <div className="mt-8 text-white/50 text-sm">Building full dashboard...</div>
    </div>
  )
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

function FynnyModule({ answers, orgId: _orgId }: { answers: string[]; orgId: string | null }) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-12 text-center">
      <Bot size={64} className="text-[#C41E1E] mx-auto mb-6" />
      <h2 className="text-3xl font-georgia font-bold text-white mb-4">Ask Fynny Anything</h2>
      <p className="text-white/70 text-lg mb-8">
        Your AI CFO is ready to answer questions about your finances
      </p>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left max-w-2xl mx-auto">
        <p className="text-white/80 text-sm font-semibold mb-4">Business context:</p>
        <ul className="space-y-2 text-white/70 text-sm">
          <li>📌 Business: {answers[0]}</li>
          <li>🏭 Industry: {answers[1]}</li>
          <li>👥 Employees: {answers[2]}</li>
          <li>💰 Revenue: {answers[3]}</li>
          <li>🎯 Challenge: {answers[4]}</li>
        </ul>
      </div>

      <div className="mt-8 text-white/50 text-sm">Building AI chat interface...</div>
    </div>
  )
}

export default DemoDashboard
