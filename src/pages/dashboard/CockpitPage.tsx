import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatINR, getRunwayColor, getDaysOverdueColor } from "@/lib/indian-format";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

// Mock cash flow data for chart
const cashFlowData = Array.from({ length: 90 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 90 + i);
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    cashIn: Math.round(15000 + Math.random() * 35000),
    cashOut: Math.round(18000 + Math.random() * 25000),
  };
});

const CockpitPage = () => {
  const { businessId } = useAuth();

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data } = await supabase.from("alerts").select("*").eq("business_id", businessId).eq("dismissed", false).order("created_at", { ascending: false }).limit(3);
      return data || [];
    },
    enabled: !!businessId,
  });

  const { data: receivables = [] } = useQuery({
    queryKey: ["receivables-top", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data } = await supabase.from("receivables").select("*").eq("business_id", businessId).eq("status", "outstanding").order("due_date", { ascending: true }).limit(5);
      return data || [];
    },
    enabled: !!businessId,
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ["compliance-upcoming", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data } = await supabase.from("compliance_events").select("*").eq("business_id", businessId).order("due_date", { ascending: true }).limit(5);
      return data || [];
    },
    enabled: !!businessId,
  });

  const { data: brief } = useQuery({
    queryKey: ["nidhi-brief", businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const { data } = await supabase.from("nidhi_briefs").select("*").eq("business_id", businessId).order("brief_date", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
    enabled: !!businessId,
  });

  // Mock static data (replace with real queries once seeded)
  const metrics = {
    cashBalance: 1240000,
    runway: 52,
    dailyBurn: 23846,
    receivablesOverdue: 2210000,
    dueThisWeek: 870000,
    itcSafe: 360000,
    itcAtRisk: 320000,
    noticeRisk: 34,
  };

  const mockAlerts = alerts.length > 0 ? alerts : [
    { id: "1", severity: "critical", title: "ITC at risk: ₹3.2L", body: "4 vendor mismatches not in GSTR-2B. GSTR-3B due in 8 days.", action_url: "/dashboard/gst" },
    { id: "2", severity: "warning", title: "ABC Electronics: ₹8.4L, 62 days overdue", body: "Runway impact: −15 days if uncollected.", action_url: "/dashboard/receivables" },
    { id: "3", severity: "info", title: "GSTR-1 due April 11", body: "2 days remaining. Data ready for review.", action_url: "/dashboard/filing-calendar" },
  ];

  const mockReceivables = receivables.length > 0 ? receivables : [
    { id: "1", customer_name: "ABC Electronics", invoice_number: "INV-2025-0342", amount: 840000, outstanding: 840000, due_date: "2025-02-10" },
    { id: "2", customer_name: "Sharma & Sons", invoice_number: "INV-2025-0298", amount: 310000, outstanding: 310000, due_date: "2025-03-05" },
    { id: "3", customer_name: "Delhi Distributors", invoice_number: "INV-2025-0401", amount: 570000, outstanding: 570000, due_date: "2025-04-01" },
    { id: "4", customer_name: "Kumar Fabrics", invoice_number: "INV-2025-0412", amount: 220000, outstanding: 220000, due_date: "2025-04-15" },
  ];

  const borderColor: Record<string, string> = {
    critical: "border-l-4 border-l-[#C41E1E]",
    warning: "border-l-4 border-l-amber-500",
    info: "border-l-4 border-l-blue-500",
  };

  const daysOverdue = (dueDate: string) => {
    const d = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
    return d > 0 ? d : 0;
  };

  return (
    <DashboardLayout>
      {/* Nidhi header */}
      <div className="bg-fyn-ink rounded-xl p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-fyn-red flex items-center justify-center text-white font-bold">N</div>
          <div>
            <p className="text-white font-serif text-lg">Good morning. Here's your business today.</p>
            <p className="text-fyn-gold text-xs">Last brief: Today 8:03 AM</p>
          </div>
        </div>
        <Link to="/dashboard/nidhi" className="bg-fyn-red text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90">
          Ask Nidhi →
        </Link>
      </div>

      {/* Alert strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {mockAlerts.map((a) => (
          <div key={a.id} className={`bg-fyn-beige-dark rounded-lg p-4 ${borderColor[a.severity] || ""}`}>
            <p className="text-fyn-ink font-medium text-sm mb-1">{a.title}</p>
            <p className="text-fyn-ink/60 text-xs mb-2">{a.body}</p>
            <Link to={a.action_url || "#"} className="text-fyn-red text-xs font-medium hover:underline">
              {a.severity === "critical" ? "Fix Now →" : a.severity === "warning" ? "Chase Now →" : "Review →"}
            </Link>
          </div>
        ))}
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-xs fyn-label mb-1">Cash in Bank Today</p>
          <p className="text-white text-3xl fyn-metric font-serif">{formatINR(metrics.cashBalance)}</p>
          <p className="text-fyn-success text-xs mt-1">↑ ₹40K from yesterday</p>
          <p className="text-fyn-gold text-[10px] mt-0.5">As of HDFC CA · 09:14 AM</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-xs fyn-label mb-1">Runway</p>
          <p className={`text-3xl fyn-metric font-serif ${getRunwayColor(metrics.runway)}`}>{metrics.runway} days</p>
          <p className="text-white/60 text-xs mt-1">At {formatINR(metrics.dailyBurn)} daily burn</p>
          <div className="mt-2 h-1.5 bg-white/10 rounded-full">
            <div className="h-1.5 bg-amber-500 rounded-full" style={{ width: `${(metrics.runway / 180) * 100}%` }} />
          </div>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-xs fyn-label mb-1">Receivables Overdue</p>
          <p className="text-fyn-red text-3xl fyn-metric font-serif">{formatINR(metrics.receivablesOverdue)}</p>
          <p className="text-white/60 text-xs mt-1">4 customers · Avg 48 days</p>
          <p className="text-white/40 text-[10px]">← Oldest: 62 days</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-xs fyn-label mb-1">Due This Week</p>
          <p className="text-white text-3xl fyn-metric font-serif">{formatINR(metrics.dueThisWeek)}</p>
          <p className="text-white/60 text-xs mt-1">3 vendors · 1 TDS payment</p>
          <p className="text-fyn-gold text-[10px]">Next: Raj Textiles ₹3.4L · Thu</p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left - 60% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Cash flow chart */}
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-fyn-ink font-serif text-lg">Cash Flow — Last 90 Days</h3>
              <div className="flex gap-1">
                {["30D", "90D", "6M", "1Y"].map((p) => (
                  <button key={p} className={`text-xs px-2 py-1 rounded ${p === "90D" ? "bg-fyn-ink text-white" : "text-fyn-ink/40 hover:bg-fyn-ink/5"}`}>{p}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cashFlowData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={14} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]} />
                <Area type="monotone" dataKey="cashIn" stroke="#1A6B3C" fill="#1A6B3C" fillOpacity={0.15} />
                <Area type="monotone" dataKey="cashOut" stroke="#C41E1E" fill="#C41E1E" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Receivables aging table */}
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
            <h3 className="text-fyn-ink font-serif text-lg mb-4">Top Overdue Receivables</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
                    <th className="text-left py-2">Customer</th>
                    <th className="text-left py-2">Invoice</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-right py-2">Days Overdue</th>
                    <th className="text-right py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReceivables.map((r) => {
                    const days = daysOverdue(r.due_date || "");
                    return (
                      <tr key={r.id} className="border-b border-fyn-ink-10 last:border-0">
                        <td className="py-3 text-fyn-ink font-medium">{r.customer_name}</td>
                        <td className="py-3 text-fyn-ink/60">{r.invoice_number}</td>
                        <td className="py-3 text-right fyn-metric">{formatINR(r.outstanding || r.amount)}</td>
                        <td className={`py-3 text-right fyn-metric ${getDaysOverdueColor(days)}`}>{days > 0 ? `${days}d` : "Current"}</td>
                        <td className="py-3 text-right">
                          {days > 0 && <button className="text-fyn-red text-xs font-medium hover:underline">Chase</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Link to="/dashboard/receivables" className="text-fyn-red text-sm font-medium hover:underline mt-3 inline-block">View all overdue invoices →</Link>
          </div>
        </div>

        {/* Right - 40% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Runway gauge (simplified) */}
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 text-center">
            <h3 className="text-fyn-ink font-serif text-lg mb-4">Cash Runway</h3>
            <div className="relative w-48 h-24 mx-auto mb-2">
              <svg viewBox="0 0 200 100" className="w-full">
                <path d="M 10 95 A 90 90 0 0 1 190 95" fill="none" stroke="#1A100814" strokeWidth="12" strokeLinecap="round" />
                {/* Red zone 0-30 */}
                <path d="M 10 95 A 90 90 0 0 1 40 22" fill="none" stroke="#C41E1E" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
                {/* Amber zone 30-90 */}
                <path d="M 40 22 A 90 90 0 0 1 160 22" fill="none" stroke="#D97706" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
                {/* Green zone 90-180 */}
                <path d="M 160 22 A 90 90 0 0 1 190 95" fill="none" stroke="#1A6B3C" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
                {/* Needle */}
                <circle cx={100 + 70 * Math.cos(Math.PI * (1 - metrics.runway / 180))} cy={95 - 70 * Math.sin(Math.PI * (1 - metrics.runway / 180))} r="5" fill="#C41E1E" />
              </svg>
            </div>
            <p className={`text-4xl fyn-metric font-serif ${getRunwayColor(metrics.runway)}`}>{metrics.runway}</p>
            <p className="text-fyn-ink/50 text-sm">days of runway</p>
            <div className="flex gap-2 mt-4 text-xs">
              <span className="bg-fyn-ink/5 border border-fyn-ink-10 text-fyn-ink px-2 py-1 rounded">Collect faster (+15d)</span>
              <span className="bg-fyn-ink/5 border border-fyn-ink-10 text-fyn-ink px-2 py-1 rounded">Slow payments (+8d)</span>
              <span className="bg-fyn-ink/5 border border-fyn-ink-10 text-fyn-ink px-2 py-1 rounded">Cut burn (+6d)</span>
            </div>
          </div>

          {/* Nidhi insight */}
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
            <h3 className="text-fyn-ink font-serif text-lg mb-3">Nidhi's read on today</h3>
            <p className="text-fyn-ink/70 text-sm leading-relaxed mb-4">
              {brief?.content || "Your runway dropped 8 days this week — mainly due to a ₹4.2L vendor payment on Monday. ABC Electronics is your biggest lever: collecting their ₹8.4L overdue adds 15 days instantly. I'd prioritize that call this morning."}
            </p>
            <div className="flex gap-2">
              <input placeholder="Ask Nidhi a follow-up..." className="flex-1 h-9 px-3 bg-fyn-beige border border-fyn-ink-10 rounded text-sm text-fyn-ink outline-none focus:ring-2 focus:ring-fyn-red" aria-label="Ask Nidhi" />
              <button className="bg-fyn-red text-white px-3 rounded text-sm">→</button>
            </div>
          </div>

          {/* Upcoming compliance */}
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
            <h3 className="text-fyn-ink font-serif text-lg mb-3">Filing Calendar</h3>
            <div className="space-y-2">
              {(compliance.length > 0 ? compliance : [
                { id: "1", filing_name: "GSTR-3B", due_date: "2025-04-20", urgency: "warning", status: "pending" },
                { id: "2", filing_name: "TDS Return Q4", due_date: "2025-04-30", urgency: "normal", status: "pending" },
                { id: "3", filing_name: "GSTR-1 May", due_date: "2025-05-11", urgency: "normal", status: "pending" },
                { id: "4", filing_name: "Advance Tax Q1", due_date: "2025-06-15", urgency: "normal", status: "pending" },
              ]).map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${c.urgency === "warning" ? "bg-amber-500" : c.urgency === "critical" ? "bg-fyn-red" : "bg-fyn-ink/20"}`} />
                  <span className="text-fyn-ink flex-1">{c.filing_name}</span>
                  <span className="text-fyn-ink/40 text-xs fyn-metric">{c.due_date}</span>
                </div>
              ))}
            </div>
            <Link to="/dashboard/filing-calendar" className="text-fyn-red text-sm font-medium hover:underline mt-3 inline-block">View full calendar →</Link>
          </div>

          {/* GST Health */}
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
            <h3 className="text-fyn-ink font-serif text-lg mb-3">GST Health</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-fyn-success fyn-metric text-lg font-bold">{formatINR(metrics.itcSafe)}</p>
                <p className="text-fyn-ink/40 text-xs">ITC Safe</p>
              </div>
              <div className="text-center">
                <p className="text-fyn-red fyn-metric text-lg font-bold">{formatINR(metrics.itcAtRisk)}</p>
                <p className="text-fyn-ink/40 text-xs">ITC at Risk</p>
              </div>
              <div className="text-center">
                <p className="text-fyn-warning fyn-metric text-lg font-bold">{metrics.noticeRisk}/100</p>
                <p className="text-fyn-ink/40 text-xs">Notice Risk</p>
              </div>
            </div>
            <Link to="/dashboard/gst" className="text-fyn-red text-sm font-medium hover:underline mt-3 inline-block">View GST Intelligence →</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CockpitPage;
