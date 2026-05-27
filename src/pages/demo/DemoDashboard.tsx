import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Droplet, TrendingUp, DollarSign, FileText, Bot, ShieldCheck, Briefcase } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { LiquidityDashboard } from '@/components/demo/LiquidityDashboard'
import { FynnyChat } from '@/components/demo/FynnyChat'
import { RevenueDashboard } from '@/components/demo/RevenueDashboard'
import { CostDashboard } from '@/components/demo/CostDashboard'
import { GSTDashboard } from '@/components/demo/GSTDashboard'
import { GovernanceDashboard } from '@/components/demo/GovernanceDashboard'
import { InvestorDashboard } from '@/components/demo/InvestorDashboard'
import { TransactionUpload } from '@/components/demo/TransactionUpload'
import { C, A, T, FONT } from '@/components/demo/_design/tokens'
import { CFOBriefing, RecommendedAction, Pill, PrimaryBtn, SecondaryBtn, Badge } from '@/components/demo/_design/primitives'

const MODULES = [
  { id: 'liquidity',  name: 'Liquidity',     icon: Droplet },
  { id: 'revenue',    name: 'Revenue',       icon: TrendingUp },
  { id: 'cost',       name: 'Cost',          icon: DollarSign },
  { id: 'gst',        name: 'GST & Tax',     icon: FileText },
  { id: 'governance', name: 'Governance',    icon: ShieldCheck },
  { id: 'investor',   name: 'Investor View', icon: Briefcase },
  { id: 'fynny',      name: 'Ask Fynny',     icon: Bot },
]

// Per-module CFO verdicts
const VERDICTS: Record<string, React.ReactNode> = {
  liquidity: (<>Your cash conversion cycle is <strong style={{color:C.beige,fontWeight:600}}>35 days</strong> — 13 days slower than sector median of 22 days. This ties up <strong style={{color:C.beige,fontWeight:600}}>₹18.4L</strong> in unnecessary working capital annually. Acme Corp, TechStart Ltd, and Global Inc account for <strong style={{color:C.beige,fontWeight:600}}>78%</strong> of overdue receivables. Call them this week.</>),
  revenue: (<>MRR is <strong style={{color:C.beige,fontWeight:600}}>₹14.2L</strong> growing at <strong style={{color:C.beige,fontWeight:600}}>8.3% MoM</strong> and <strong style={{color:C.beige,fontWeight:600}}>127.4% YoY</strong> — faster than 94% of Indian B2B SaaS at your stage. At this trajectory you cross <strong style={{color:C.beige,fontWeight:600}}>₹5Cr ARR</strong> in 8 months. Immediate risk: TechStart Solutions shows <strong style={{color:C.beige,fontWeight:600}}>72% churn probability</strong> — their renewal is in 6 weeks.</>),
  cost: (<>AWS spend of <strong style={{color:C.beige,fontWeight:600}}>₹125K</strong> is 34% above median for companies at your revenue stage. Reserved instances would cost <strong style={{color:C.beige,fontWeight:600}}>₹82K</strong> — saving <strong style={{color:C.beige,fontWeight:600}}>₹43K/month</strong>. Vendor concentration at <strong style={{color:C.beige,fontWeight:600}}>32.4%</strong> from top 3 vendors is above the 25% safe threshold.</>),
  gst: (<>Compliance score <strong style={{color:C.beige,fontWeight:600}}>28/100</strong> is in the safe zone — scores above 50 trigger audit selection. However <strong style={{color:C.beige,fontWeight:600}}>₹0.96L</strong> penalty exposure requires resolution within 7 days before escalation under Section 73. ITC reversal of <strong style={{color:C.beige,fontWeight:600}}>₹0.10L</strong> needed because your supplier has not filed their return.</>),
  governance: (<>No critical governance flags this month. <strong style={{color:C.beige,fontWeight:600}}>3 ROC filings</strong> due in the next 60 days. MSME compliance score: <strong style={{color:C.beige,fontWeight:600}}>94/100</strong>.</>),
}

const ACTIONS: Record<string, string> = {
  liquidity: "Call Acme Corp (₹145K, 42 days overdue) and TechStart Ltd (₹98K, 35 days overdue) before Friday. Together they represent 78% of your overdue balance.",
  revenue:   "Contact TechStart Solutions this week — 72% churn probability, renewal in 6 weeks. Schedule a QBR and address their export feature request before they evaluate alternatives.",
  cost:      "Move AWS infrastructure to reserved instances this month — estimated saving ₹43K/month or ₹5.16L annually. Requires 1-year commitment. At current runway this pays back in month 1.",
  gst:       "Resolve ₹0.96L penalty exposure this week — contact your CA to file the amended return before 27 July. After 7 days this escalates to Section 73 proceedings. Also chase your ITC supplier to file their GSTR-1 to protect ₹0.24L in credit.",
  governance:"File Annual Return (MGT-7) due in 38 days. Your CS has been notified. Estimated time: 2 hours. No penalties if filed before due date.",
}

const TICKER_ALERTS = [
  "⚠ GST filing due in 3 days",
  "⚠ Receivables ₹3.72L overdue 60+ days",
  "⚠ Burn multiple above Series A threshold — 2.4x",
]

interface OrgOption {
  demo_org_id: string
  name: string | null
  business_name: string | null
}

export type TimeRange = '12m' | '24m' | 'all'

export function DemoDashboard() {
  const [activeModule, setActiveModule] = useState('liquidity')
  const [insightsData, setInsightsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [orgId, setOrgId] = useState<string | null>(() => sessionStorage.getItem('demo_org_id'))
  const [availableOrgs, setAvailableOrgs] = useState<OrgOption[]>([])
  const [orgReady, setOrgReady] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('12m')
  const [zohoConnected, setZohoConnected] = useState(false)
  const [zohoSyncing, setZohoSyncing] = useState(false)

  const fileName = sessionStorage.getItem('demo_file') || 'uploaded-data.csv'
  const answersStr = sessionStorage.getItem('demo_answers')
  const answers: string[] = answersStr ? JSON.parse(answersStr) : []
  const currentOrgMeta = availableOrgs.find((o) => o.demo_org_id === orgId)
  const businessName =
    currentOrgMeta?.name || currentOrgMeta?.business_name || answers[0] || 'Your Business'

  // Initialize or create org on mount
  useEffect(() => {
    let cancelled = false
    const initOrg = async () => {
      let id = sessionStorage.getItem('demo_org_id')
      if (!id) {
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
          const res = await fetch(`${supabaseUrl}/functions/v1/create-demo-org`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseAnonKey}`,
              apikey: supabaseAnonKey,
            },
            body: JSON.stringify({ name: 'Demo Session' }),
          })
          const json = await res.json()
          if (json?.organization_id) {
            id = json.organization_id as string
            sessionStorage.setItem('demo_org_id', id)
          }
        } catch (e) {
          console.error('create-demo-org failed:', e)
        }
      }
      if (!cancelled) {
        setOrgId(id)
        setOrgReady(true)
      }
    }
    initOrg()
    return () => {
      cancelled = true
    }
  }, [])

  // Load recent orgs for the switcher
  useEffect(() => {
    if (!orgReady) return
    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('demo_organizations')
        .select('demo_org_id, name, business_name')
        .order('created_at', { ascending: false })
        .limit(10)
      if (!cancelled) setAvailableOrgs((data as OrgOption[]) ?? [])
    })()
    return () => {
      cancelled = true
    }
  }, [orgReady, refreshKey])

  const switchOrg = (nextId: string) => {
    if (!nextId || nextId === orgId) return
    sessionStorage.setItem('demo_org_id', nextId)
    setOrgId(nextId)
    setLoading(true)
    setRefreshKey((k) => k + 1)
  }

  // Check Zoho connection status whenever org changes
  useEffect(() => {
    if (!orgId) return
    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('integrations')
        .select('id')
        .eq('organization_id', orgId)
        .eq('provider', 'zoho_books')
        .maybeSingle()
      if (!cancelled) setZohoConnected(!!data)
    })()
    return () => {
      cancelled = true
    }
  }, [orgId, refreshKey])

  // Handle OAuth callback redirect params (edge function handles the token exchange)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('zoho') === 'connected') {
      setZohoConnected(true)
      toast.success('Zoho Books connected successfully!')
      window.history.replaceState({}, '', '/demo/dashboard')
      return
    }
    if (params.get('zoho') === 'error') {
      toast.error(`Zoho connection failed: ${params.get('message') || 'Unknown error'}`)
      window.history.replaceState({}, '', '/demo/dashboard')
    }
  }, [])

  const connectZoho = async () => {
    if (!orgId) {
      toast.error('Demo organization not ready yet')
      return
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoho-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ organization_id: orgId }),
        }
      )
      const { authorization_url, error } = await response.json()
      if (error) throw new Error(error)
      window.location.href = authorization_url
    } catch (error) {
      console.error('Zoho auth error:', error)
      toast.error('Failed to connect Zoho Books')
    }
  }

  const syncZoho = async () => {
    if (!orgId) return
    try {
      setZohoSyncing(true)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoho-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ organization_id: orgId }),
        }
      )
      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      toast.success(`Successfully synced ${result.synced || 0} transactions from Zoho Books!`)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      console.error('Zoho sync error:', error)
      toast.error(`Sync failed: ${(error as Error).message}`)
    } finally {
      setZohoSyncing(false)
    }
  }

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
      structure: {
        totalOpex: 1847000,
        cogs: 425000,
        grossMargin: 77.0,
        salesMarketing: 685000,
        rnd: 842000,
        generalAdmin: 320000,
        ebitda: -267000,
        ebitdaMargin: -14.5,
      },
      breakdown: {
        fixed: 1420000,
        variable: 427000,
        fixedVariableRatio: '77:23',
        byCategory: [
          { category: 'Personnel', amount: 1245000, percent: 67.4 },
          { category: 'Infrastructure', amount: 287000, percent: 15.5 },
          { category: 'Software', amount: 158000, percent: 8.6 },
          { category: 'Marketing', amount: 98000, percent: 5.3 },
          { category: 'Operations', amount: 42000, percent: 2.3 },
          { category: 'Facilities', amount: 17000, percent: 0.9 },
        ],
        direct: 425000,
        indirect: 1422000,
      },
      vendors: {
        topTen: [
          { name: 'AWS', monthlySpend: 245000, category: 'Infrastructure', contractEnd: '2026-08-15', paymentTerms: 'Net 30', renewalStatus: 'Active', riskLevel: 'High' },
          { name: 'Google Workspace', monthlySpend: 87000, category: 'Software', contractEnd: '2026-06-30', paymentTerms: 'Net 30', renewalStatus: 'Upcoming', riskLevel: 'Medium' },
          { name: 'Salesforce', monthlySpend: 142000, category: 'Software', contractEnd: '2026-09-20', paymentTerms: 'Net 45', renewalStatus: 'Active', riskLevel: 'High' },
          { name: 'HubSpot', monthlySpend: 68000, category: 'Marketing', contractEnd: '2026-07-10', paymentTerms: 'Net 30', renewalStatus: 'Upcoming', riskLevel: 'Low' },
          { name: 'Zoom', monthlySpend: 24000, category: 'Software', contractEnd: '2026-11-05', paymentTerms: 'Net 30', renewalStatus: 'Active', riskLevel: 'Low' },
          { name: 'Slack', monthlySpend: 38000, category: 'Software', contractEnd: '2026-10-12', paymentTerms: 'Net 30', renewalStatus: 'Active', riskLevel: 'Low' },
          { name: 'Razorpay', monthlySpend: 52000, category: 'Infrastructure', contractEnd: '2027-01-18', paymentTerms: 'Net 15', renewalStatus: 'Active', riskLevel: 'Medium' },
          { name: 'LinkedIn Ads', monthlySpend: 95000, category: 'Marketing', contractEnd: '2026-06-25', paymentTerms: 'Prepaid', renewalStatus: 'Upcoming', riskLevel: 'Medium' },
          { name: 'Supabase', monthlySpend: 34000, category: 'Infrastructure', contractEnd: '2026-12-08', paymentTerms: 'Net 30', renewalStatus: 'Active', riskLevel: 'Low' },
          { name: 'WeWork', monthlySpend: 125000, category: 'Facilities', contractEnd: '2026-05-31', paymentTerms: 'Net 15', renewalStatus: 'Upcoming', riskLevel: 'High' },
        ],
        vendorConcentration: 32.4,
        spendUnderManagement: 87.3,
        maverickSpend: 112000,
      },
      unitEconomics: {
        cac: 82000,
        costToServe: 12400,
        costPerTransaction: 18,
        revenuePerEmployee: 6142000,
        grossProfitPerEmployee: 4729000,
        burnMultiple: 0.66,
      },
      personnel: {
        totalCost: 1245000,
        percentOfRevenue: 67.4,
        avgCostPerEmployee: 138333,
        byDepartment: [
          { department: 'Engineering', headcount: 12, totalCost: 684000, avgCost: 57000 },
          { department: 'Sales', headcount: 8, totalCost: 432000, avgCost: 54000 },
          { department: 'Marketing', headcount: 5, totalCost: 245000, avgCost: 49000 },
          { department: 'Operations', headcount: 3, totalCost: 156000, avgCost: 52000 },
          { department: 'G&A', headcount: 2, totalCost: 108000, avgCost: 54000 },
        ],
      },
      optimization: {
        opportunities: [
          { type: 'Over-Provisioned Licenses', savings: 34000, impact: 'Medium', description: '18 unused Salesforce seats, 12 unused Zoom licenses' },
          { type: 'Duplicate Subscriptions', savings: 28000, impact: 'High', description: 'Slack + Microsoft Teams, HubSpot + Salesforce overlap' },
          { type: 'Vendor Consolidation', savings: 42000, impact: 'Medium', description: 'Bundle AWS + Supabase for 15% volume discount' },
          { type: 'Payment Terms Extension', savings: 0, impact: 'High', description: 'Extend Net 30 → Net 60 with AWS, Salesforce (cash flow benefit)' },
          { type: 'Volume Discounts', savings: 67000, impact: 'Medium', description: 'Annual commit on AWS (20% discount), Google Workspace (12% discount)' },
          { type: 'Offshore Opportunities', savings: 185000, impact: 'High', description: '4 engineering roles + 2 operations roles eligible' },
        ],
        totalSavings: 356000,
        runwayExtension: 1.8,
      },
      efficiency: {
        salesEfficiency: 1.24,
        rndEfficiency: 0.87,
        gaAsPercent: 17.3,
        ruleOf40: 51.7,
        trends: [
          { month: 'Jul 2024', grossMargin: 71.2, opexPercent: 94.5, burnMultiple: 0.89 },
          { month: 'Aug 2024', grossMargin: 72.8, opexPercent: 91.3, burnMultiple: 0.82 },
          { month: 'Sep 2024', grossMargin: 73.5, opexPercent: 88.7, burnMultiple: 0.78 },
          { month: 'Oct 2024', grossMargin: 74.1, opexPercent: 86.2, burnMultiple: 0.74 },
          { month: 'Nov 2024', grossMargin: 74.8, opexPercent: 83.9, burnMultiple: 0.71 },
          { month: 'Dec 2024', grossMargin: 75.3, opexPercent: 81.6, burnMultiple: 0.69 },
          { month: 'Jan 2025', grossMargin: 75.9, opexPercent: 79.4, burnMultiple: 0.68 },
          { month: 'Feb 2025', grossMargin: 76.2, opexPercent: 77.8, burnMultiple: 0.67 },
          { month: 'Mar 2025', grossMargin: 76.5, opexPercent: 76.2, burnMultiple: 0.66 },
          { month: 'Apr 2025', grossMargin: 76.8, opexPercent: 74.9, burnMultiple: 0.66 },
          { month: 'May 2025', grossMargin: 76.9, opexPercent: 73.5, burnMultiple: 0.66 },
          { month: 'Jun 2025', grossMargin: 77.0, opexPercent: 72.1, burnMultiple: 0.66 },
        ],
      },
    },
    gst: {
      compliance: {
        gstr1: {
          status: 'Filed' as const,
          dueDate: '2025-07-11',
          lastFiled: '2025-07-09',
          period: 'Jun 2025',
        },
        gstr3b: {
          status: 'Pending' as const,
          dueDate: '2025-07-20',
          netTaxPaid: 184500,
          period: 'Jun 2025',
        },
        gstr9: {
          status: 'Not Due' as const,
          dueDate: '2025-12-31',
          fyear: 'FY 2024-25',
        },
        penalties: 12500,
        interest: 8400,
      },
      itc: {
        totalAvailable: 342800,
        claimed: 318600,
        gap: 24200,
        gapPercent: 7.06,
        reconciliation: [
          { vendorGstin: '29AABCU9603R1ZJ', invoiceNumber: 'AWS-IN-24891', invoiceDate: '2025-06-02', invoiceValue: 285000, gstAmount: 51300, status: 'Matched' as const },
          { vendorGstin: '07AAACG2115R1ZN', invoiceNumber: 'GW-2025-0612', invoiceDate: '2025-06-05', invoiceValue: 142000, gstAmount: 25560, status: 'Matched' as const },
          { vendorGstin: '27AAACS8577K1Z0', invoiceNumber: 'SF-IND-7821', invoiceDate: '2025-06-08', invoiceValue: 198000, gstAmount: 35640, status: 'Matched' as const },
          { vendorGstin: '06AAFCS1234A1Z5', invoiceNumber: 'SLK-INV-3344', invoiceDate: '2025-06-12', invoiceValue: 84000, gstAmount: 15120, status: 'Mismatch' as const },
          { vendorGstin: '29AAGCN8821B1ZT', invoiceNumber: 'NTN-9821', invoiceDate: '2025-06-15', invoiceValue: 56000, gstAmount: 10080, status: 'Missing in 2A' as const },
          { vendorGstin: '07AABCZ4567D1Z2', invoiceNumber: 'ZHO-2025-115', invoiceDate: '2025-06-18', invoiceValue: 38500, gstAmount: 6930, status: 'Matched' as const },
          { vendorGstin: '27AAACL9988M1ZB', invoiceNumber: 'LNK-IN-0644', invoiceDate: '2025-06-20', invoiceValue: 72000, gstAmount: 12960, status: 'Mismatch' as const },
          { vendorGstin: '29AABCF7766G1ZX', invoiceNumber: 'FRS-2025-228', invoiceDate: '2025-06-22', invoiceValue: 45000, gstAmount: 8100, status: 'Matched' as const },
        ],
        ineligible: 14600,
        atRisk: 24200,
        reversal: 9800,
        matchingRate: 92.94,
      },
      liability: {
        outputGst: 503100,
        inputGst: 318600,
        netPayable: 184500,
        paidToDate: 0,
        outstanding: 184500,
        interest: 8400,
        cashFlowImpact: 192900,
      },
      auditReadiness: {
        overallScore: 84,
        invoiceMatchingRate: 92.94,
        gstinValidation: 98.5,
        hsnAccuracy: 87.2,
        ewayCompliance: 91.8,
        auditTrail: 95.4,
        placeOfSupply: 89.6,
      },
      taxPlanning: {
        etr: 22.4,
        deferredTax: 184000,
        lossCarryforwards: 1240000,
        lossExpiryYear: 'FY 2031-32',
        depreciation: 268000,
        section80IAC: {
          eligible: true,
          status: 'Active' as const,
          savings: 425000,
        },
        optimizations: [
          { strategy: 'Maximize Section 80IAC startup deduction', impact: '₹4.25L tax savings (100% deduction on profits)' },
          { strategy: 'Accelerate R&D depreciation under Section 35', impact: '₹68K additional deduction this year' },
          { strategy: 'Restructure inter-state billing for IGST optimization', impact: '₹32K working capital benefit' },
          { strategy: 'Carry forward unabsorbed losses strategically', impact: 'Shelters ₹12.4L of future profits' },
        ],
      },
      filingCalendar: [
        { date: '2025-07-20', type: 'GSTR-3B (Jun 2025)', status: 'Due Soon' as const },
        { date: '2025-08-11', type: 'GSTR-1 (Jul 2025)', status: 'Upcoming' as const },
        { date: '2025-08-20', type: 'GSTR-3B (Jul 2025)', status: 'Upcoming' as const },
        { date: '2025-09-11', type: 'GSTR-1 (Aug 2025)', status: 'Upcoming' as const },
        { date: '2025-09-20', type: 'GSTR-3B (Aug 2025)', status: 'Upcoming' as const },
        { date: '2025-12-31', type: 'GSTR-9 (FY 2024-25)', status: 'Upcoming' as const },
      ],
      notices: [
        { type: 'ITC reversal demand', number: 'DRC-01/2025/4421', issueDate: '2025-05-18', deadline: '2025-07-25', status: 'Action Required' as const, disputedAmount: 84500 },
        { type: 'GSTR-2A mismatch query', number: 'ASMT-10/2025/1188', issueDate: '2025-04-22', deadline: '2025-06-15', status: 'Response Submitted' as const, disputedAmount: 32000 },
        { type: 'Late filing penalty', number: 'GST-PEN/2025/0892', issueDate: '2025-03-10', deadline: '2025-04-10', status: 'Closed' as const, disputedAmount: 12500 },
      ],
      risk: {
        complianceScore: 28,
        factors: {
          lateFiling: 'Low' as const,
          itcMismatch: 'Medium' as const,
          invoiceAccuracy: 'Low' as const,
          cashFlow: 'Medium' as const,
          auditSelection: 'Low' as const,
          penaltyExposure: 96500,
        },
      },
    },
    governance: {
      controls: {
        overallScore: 82,
        segregationOfDuties: 88,
        approvalWorkflows: 94,
        reconciliationStatus: 96,
        policyCompliance: 85,
      },
      reporting: {
        boardPackageReady: true,
        boardMeetingDate: '2026-05-25',
        daysRemaining: 8,
        pnlAccuracy: 98.5,
        balanceSheetHealth: 96.2,
        statements: [
          { type: 'P&L' as const, status: 'Complete' as const, lastUpdated: '2026-05-15', variance: 3.2 },
          { type: 'Balance Sheet' as const, status: 'Complete' as const, lastUpdated: '2026-05-15', variance: 1.8, unreconciled: 2 },
          { type: 'Cash Flow' as const, status: 'Complete' as const, lastUpdated: '2026-05-15', variance: -2.4 },
        ],
      },
      budgeting: {
        totalBudget: 1847000,
        actualSpend: 1923000,
        variance: 76000,
        variancePercent: 4.1,
        byDepartment: [
          { department: 'Sales & Marketing', budget: 685000, actual: 712000, variance: 27000, variancePercent: 3.9 },
          { department: 'R&D', budget: 842000, actual: 867000, variance: 25000, variancePercent: 3.0 },
          { department: 'G&A', budget: 320000, actual: 344000, variance: 24000, variancePercent: 7.5 },
        ],
        trends: [
          { month: 'Jul 2024', budget: 1245000, actual: 1198000 },
          { month: 'Aug 2024', budget: 1298000, actual: 1267000 },
          { month: 'Sep 2024', budget: 1342000, actual: 1321000 },
          { month: 'Oct 2024', budget: 1389000, actual: 1378000 },
          { month: 'Nov 2024', budget: 1435000, actual: 1442000 },
          { month: 'Dec 2024', budget: 1487000, actual: 1523000 },
          { month: 'Jan 2025', budget: 1542000, actual: 1589000 },
          { month: 'Feb 2025', budget: 1598000, actual: 1645000 },
          { month: 'Mar 2025', budget: 1657000, actual: 1712000 },
          { month: 'Apr 2025', budget: 1718000, actual: 1789000 },
          { month: 'May 2025', budget: 1782000, actual: 1856000 },
          { month: 'Jun 2025', budget: 1847000, actual: 1923000 },
        ],
        forecastAccuracy: 92.3,
        budgetAdherence: 88.7,
      },
      risk: {
        financialRiskScore: 28,
        fxExposure: 425000,
        fxExposurePercent: 12.4,
        fxHedged: 65,
        creditConcentration: 18.4,
        liquidityRisk: 'Low' as const,
        counterpartyRisk: 'Medium' as const,
        insuranceCoverage: 78,
        operationalRisk: 'Low' as const,
      },
      reconciliation: {
        tasks: [
          { name: 'Bank Reconciliation', status: 'Complete' as const, owner: 'Priya Shah', dueDate: '2026-05-05' },
          { name: 'Credit Card Reconciliation', status: 'Complete' as const, owner: 'Priya Shah', dueDate: '2026-05-05' },
          { name: 'Accounts Receivable Aging', status: 'Complete' as const, owner: 'Rahul Verma', dueDate: '2026-05-07' },
          { name: 'Accounts Payable Aging', status: 'Complete' as const, owner: 'Rahul Verma', dueDate: '2026-05-07' },
          { name: 'Inventory Reconciliation', status: 'Not Started' as const, owner: 'Amit Kumar', dueDate: '2026-05-10' },
          { name: 'Fixed Assets Verification', status: 'In Progress' as const, owner: 'Neha Reddy', dueDate: '2026-05-12' },
          { name: 'Prepaid Expenses Roll-forward', status: 'Complete' as const, owner: 'Priya Shah', dueDate: '2026-05-08' },
          { name: 'Deferred Revenue Schedule', status: 'Complete' as const, owner: 'Rahul Verma', dueDate: '2026-05-08' },
        ],
        completeness: 87.5,
        avgCloseTime: 6,
      },
      audit: {
        documentationCompleteness: 92,
        policyDocumentation: 95,
        auditTrailQuality: 89,
        checklist: [
          { item: 'Revenue recognition policy documented', status: 'Complete' as const },
          { item: 'Expense approval matrix defined', status: 'Complete' as const },
          { item: 'Capitalization policy approved', status: 'Complete' as const },
          { item: 'Fixed asset register updated', status: 'In Progress' as const },
          { item: 'Stock option plan documented', status: 'Complete' as const },
          { item: 'Related party transactions disclosed', status: 'In Progress' as const },
          { item: 'Bank reconciliations current', status: 'Complete' as const },
          { item: 'AR/AP aging reports available', status: 'Complete' as const },
          { item: 'Tax filings up to date', status: 'Complete' as const },
          { item: 'Internal audit completed', status: 'Not Started' as const },
        ],
        lastInternalAudit: '2025-11-15',
        monthsSinceAudit: 6,
        openFindings: 2,
      },
    },
  }

  useEffect(() => {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

    const fetchInsights = async (organizationId: string) => {
      // 1. Try cache
      const { data: cached } = await supabase
        .from('demo_insights')
        .select('*')
        .eq('org_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // 2. Fresh cache hit (<24h)
      if (cached?.data) {
        const cacheAge = Date.now() - new Date(cached.created_at).getTime()
        if (cacheAge < TWENTY_FOUR_HOURS) {
          return cached.data
        }
      }

      // 3. Cache miss/stale -> call Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({ organization_id: organizationId }),
        }
      )

      if (!response.ok) {
        throw new Error(`generate-insights failed: ${response.status}`)
      }

      const freshData = await response.json()

      // 4. Persist for next time (best-effort)
      await supabase
        .from('demo_insights')
        .insert({ org_id: organizationId, data: freshData })

      return freshData
    }

    const run = async () => {
      if (!orgId) {
        setInsightsData(FALLBACK_DATA)
        setLoading(false)
        return
      }
      try {
        const data = await fetchInsights(orgId)
        setInsightsData(data ?? FALLBACK_DATA)
      } catch (error) {
        console.error('Error fetching insights:', error)
        setInsightsData(FALLBACK_DATA)
      } finally {
        setLoading(false)
      }
    }

    if (orgReady) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, orgReady, orgId])

  if (loading) {
    return <DashboardSkeleton businessName={businessName} fileName={fileName} />
  }

  const renderActive = () => {
    switch (activeModule) {
      case 'liquidity':  return <LiquidityDashboard data={insightsData} />
      case 'revenue':    return <RevenueDashboard data={insightsData} timeRange={timeRange} />
      case 'cost':       return <CostDashboard data={insightsData} />
      case 'gst':        return <GSTDashboard data={insightsData} />
      case 'governance': return <GovernanceDashboard data={insightsData} />
      case 'investor':   return <InvestorDashboard data={insightsData} />
      case 'fynny':      return <FynnyChat data={insightsData} orgId={orgId} answers={answers} />
      default: return null
    }
  }

  const showBriefing = activeModule !== 'fynny' && activeModule !== 'investor'
  const showAction   = activeModule !== 'fynny' && activeModule !== 'investor'

  return (
    <div style={{ minHeight: '100vh', background: C.ink, color: C.beige, fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        .fyn-page-bg {
          background:
            repeating-linear-gradient(45deg, transparent 0, transparent 32px, rgba(139,105,20,0.015) 32px, rgba(139,105,20,0.015) 33px),
            ${C.ink};
        }
        @keyframes fyn-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .fyn-ticker:hover .fyn-ticker-track { animation-play-state: paused; }
        .fyn-tabs::-webkit-scrollbar { display: none; }
      `}</style>

      {/* HEADER */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          height: 64, background: C.ink, borderBottom: `1px solid ${A.beige08}`,
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 24,
        }}
      >
        <div style={{ flexShrink: 0, minWidth: 0 }}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: C.beige, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            {businessName}
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 10, color: A.beige30, letterSpacing: 1, marginTop: 2 }}>
            Data: {fileName}
          </div>
        </div>

        <div
          className="fyn-ticker"
          style={{
            flex: 1, overflow: 'hidden', height: 28, position: 'relative',
            maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
          }}
        >
          <div
            className="fyn-ticker-track"
            style={{
              display: 'inline-flex', whiteSpace: 'nowrap',
              animation: 'fyn-marquee 30s linear infinite',
              fontFamily: FONT, fontWeight: 500, fontSize: 11, color: C.red,
              alignItems: 'center', height: '100%',
            }}
          >
            {[...TICKER_ALERTS, ...TICKER_ALERTS, ...TICKER_ALERTS].map((t, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 40, paddingRight: 40 }}>
                {t}
                <span style={{ color: A.beige20 }}>·</span>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['12m','24m','all'] as TimeRange[]).map((r) => (
              <Pill key={r} active={timeRange === r} onClick={() => setTimeRange(r)}>
                {r === '12m' ? '12M' : r === '24m' ? '24M' : 'All'}
              </Pill>
            ))}
          </div>
          {availableOrgs.length > 1 && (
            <select
              value={orgId ?? ''}
              onChange={(e) => switchOrg(e.target.value)}
              style={{
                background: 'transparent', color: A.beige65,
                border: `1px solid ${A.beige15}`, borderRadius: 4,
                padding: '6px 10px', fontSize: 11, fontFamily: FONT, fontWeight: 500,
                maxWidth: 160,
              }}
            >
              {availableOrgs.map(o => (
                <option key={o.demo_org_id} value={o.demo_org_id} style={{ background: C.inkCard }}>
                  {o.name || o.business_name || o.demo_org_id}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowUpload(true)}
            style={{
              background: C.gold, color: C.beige, border: 'none', borderRadius: 4,
              padding: '7px 16px', fontFamily: FONT, fontWeight: 500, fontSize: 12, cursor: 'pointer',
            }}
          >
            Upload Data
          </button>
          {!zohoConnected ? (
            <SecondaryBtn onClick={connectZoho}>Connect Zoho Books</SecondaryBtn>
          ) : (
            <>
              <SecondaryBtn onClick={syncZoho}>{zohoSyncing ? 'Syncing…' : 'Sync Zoho'}</SecondaryBtn>
              <Badge variant="online">Online</Badge>
            </>
          )}
          <button
            onClick={() => {
              if (confirm('Exit demo? All data will be cleared.')) {
                sessionStorage.clear()
                window.location.href = '/demo/login'
              }
            }}
            style={{
              background: 'transparent', color: A.red80,
              border: `1px solid ${A.red30}`, borderRadius: 4,
              padding: '7px 16px', fontFamily: FONT, fontWeight: 500, fontSize: 12, cursor: 'pointer',
            }}
          >
            Exit Demo
          </button>
        </div>
      </header>

      {/* TAB BAR */}
      <nav
        style={{
          position: 'sticky', top: 64, zIndex: 99,
          height: 48, background: C.ink, borderBottom: `1px solid ${A.beige07}`,
        }}
      >
        <div className="fyn-tabs" style={{ display: 'flex', overflowX: 'auto', height: '100%', padding: '0 24px' }}>
          {MODULES.map(m => {
            const Icon = m.icon
            const active = activeModule === m.id
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0 20px', height: '100%', flexShrink: 0,
                  background: 'transparent', border: 'none',
                  borderBottom: active ? `2px solid ${C.red}` : '2px solid transparent',
                  color: active ? C.beige : A.beige42,
                  fontFamily: FONT, fontWeight: active ? 600 : 500, fontSize: 12,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease, background 0.15s ease',
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = A.beige72; e.currentTarget.style.background = A.beige03; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = A.beige42; e.currentTarget.style.background = 'transparent'; } }}
              >
                <Icon size={14} color={active ? C.red : A.beige35} />
                <span>{m.name}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* CONTENT */}
      <main className="fyn-page-bg" style={{ minHeight: 'calc(100vh - 112px)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px clamp(16px, 3vw, 32px)' }}>
          {showBriefing && VERDICTS[activeModule] && <CFOBriefing verdict={VERDICTS[activeModule]} />}
          {renderActive()}
          {showAction && ACTIONS[activeModule] && <RecommendedAction action={ACTIONS[activeModule]} />}
        </div>
      </main>

      {showUpload && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            overflow: 'auto', padding: 24,
            background: 'rgba(26,16,8,0.85)', backdropFilter: 'blur(6px)',
          }}
          onClick={() => setShowUpload(false)}
        >
          <div style={{ width: '100%', maxWidth: 960, marginTop: 48 }} onClick={(e) => e.stopPropagation()}>
            <TransactionUpload
              organizationId={orgId ?? ''}
              onClose={() => setShowUpload(false)}
              onUploadComplete={() => setRefreshKey((k) => k + 1)}
            />
          </div>
        </div>
      )}
    </div>
  )
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
    <div className="min-h-screen bg-gradient-to-b from-[#2A1209] to-[#1A1008]">
      {/* Top Nav (real, so no flash) */}
      <nav className="border-b border-white/10 bg-[#2A1209]/80 backdrop-blur sticky top-0 z-50">
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
      <div className="border-b border-white/10 bg-[#2A1209]/50 sticky top-[73px] z-40">
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
