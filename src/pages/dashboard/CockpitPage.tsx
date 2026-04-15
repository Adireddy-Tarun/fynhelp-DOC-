import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatINR, getDaysOverdueColor } from "@/lib/indian-format";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

const cashFlowData = Array.from({ length: 90 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 90 + i);
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    cashIn: Math.round(15000 + Math.random() * 35000),
    cashOut: Math.round(18000 + Math.random() * 25000),
  };
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const cashIn = payload.find((p: any) => p.dataKey === "cashIn")?.value || 0;
  const cashOut = payload.find((p: any) => p.dataKey === "cashOut")?.value || 0;
  const net = cashIn - cashOut;
  return (
    <div style={{ background: "#1A1008", borderRadius: 8, padding: "12px 16px", border: "none" }}>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 6 }}>{label}</p>
      <p style={{ color: "#4ADE80", fontSize: 14, fontWeight: 600 }}>In: ₹{cashIn.toLocaleString("en-IN")}</p>
      <p style={{ color: "#F87171", fontSize: 14, fontWeight: 600 }}>Out: ₹{cashOut.toLocaleString("en-IN")}</p>
      <p style={{ color: net >= 0 ? "#FFFFFF" : "#F87171", fontSize: 14, fontWeight: 600 }}>Net: ₹{net.toLocaleString("en-IN")}</p>
    </div>
  );
};

const CockpitPage = () => {
  const { businessId } = useAuth();
  const [nidhiInput, setNidhiInput] = useState("");

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

  const alertStyles: Record<string, { bg: string; border: string; titleColor: string; ctaColor: string }> = {
    critical: { bg: "#FDEAEA", border: "#C41E1E", titleColor: "#C41E1E", ctaColor: "#C41E1E" },
    warning: { bg: "#FEF3E2", border: "#8B5A00", titleColor: "#8B5A00", ctaColor: "#8B5A00" },
    info: { bg: "#EAF0FB", border: "#1A4A8B", titleColor: "#1A4A8B", ctaColor: "#1A4A8B" },
  };

  const daysOverdue = (dueDate: string) => {
    const d = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
    return d > 0 ? d : 0;
  };

  const filingData = compliance.length > 0 ? compliance : [
    { id: "1", filing_name: "GSTR-3B", due_date: "2026-04-20", urgency: "critical", status: "pending" },
    { id: "2", filing_name: "TDS Return Q4", due_date: "2026-04-30", urgency: "warning", status: "pending" },
    { id: "3", filing_name: "GSTR-1 May", due_date: "2026-05-11", urgency: "normal", status: "pending" },
    { id: "4", filing_name: "Advance Tax Q1", due_date: "2026-06-15", urgency: "normal", status: "pending" },
  ];

  const getDaysLeft = (dateStr: string) => {
    const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    return d;
  };

  return (
    <DashboardLayout>
      {/* Nidhi header */}
      <div className="rounded-xl p-5 mb-6 flex items-center justify-between" style={{ background: "#1A1008" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#C41E1E" }}>N</div>
          <div>
            <p className="text-white font-serif text-lg">Good morning. Here's your business today.</p>
            <p style={{ color: "#8B6914", fontSize: 13 }}>Last brief: Today 8:03 AM</p>
          </div>
        </div>
        <Link to="/dashboard/nidhi" className="text-white text-[14px] font-medium px-4 py-2 rounded-lg hover-btn-primary" style={{ background: "#C41E1E" }}>
          Ask Nidhi →
        </Link>
      </div>

      {/* Alert strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {mockAlerts.map((a) => {
          const s = alertStyles[a.severity] || alertStyles.info;
          return (
            <div
              key={a.id}
              className="rounded-lg transition-all duration-250 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
              style={{
                background: s.bg,
                borderLeft: `4px solid ${s.border}`,
                padding: "16px 20px",
                minHeight: 72,
              }}
            >
              <div className="flex items-start justify-between">
                <p style={{ color: s.titleColor, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{a.title}</p>
                {a.severity === "critical" && <span className="w-2.5 h-2.5 rounded-full pulse-ring flex-shrink-0 mt-1" style={{ background: "#C41E1E" }} />}
              </div>
              <p style={{ color: "#1A1008", fontSize: 13, marginBottom: 8, opacity: 0.8 }}>{a.body}</p>
              <Link to={a.action_url || "#"} style={{ color: s.ctaColor, fontSize: 13, fontWeight: 500, textDecoration: "underline" }}>
                {a.severity === "critical" ? "Fix Now →" : a.severity === "warning" ? "Chase Now →" : "Review →"}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Cash in Bank */}
        <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#1A1008", padding: "20px 24px", boxShadow: "none" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.25)"; e.currentTarget.style.borderColor = "#C41E1E"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 11, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase" }}>CASH IN BANK TODAY</p>
          <p className="font-serif" style={{ color: "#FFFFFF", fontSize: 36, fontWeight: 700, marginTop: 4 }}>{formatINR(metrics.cashBalance)}</p>
          <p style={{ color: "#4ADE80", fontSize: 12, marginTop: 4 }}>↑ ₹40K from yesterday</p>
        </div>

        {/* Runway */}
        <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#1A1008", padding: "20px 24px" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 11, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase" }}>RUNWAY</p>
          <p className="font-serif" style={{ color: "#FCD34D", fontSize: 36, fontWeight: 700, marginTop: 4 }}>{metrics.runway} days</p>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 12, marginTop: 4 }}>At {formatINR(metrics.dailyBurn)} daily burn</p>
          <div style={{ marginTop: 8, height: 4, background: "rgba(255,255,255,0.10)", borderRadius: 2 }}>
            <div className="progress-fill-animate" style={{ height: 4, background: "#FCD34D", borderRadius: 2, width: `${(metrics.runway / 180) * 100}%` }} />
          </div>
        </div>

        {/* Receivables Overdue */}
        <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#1A1008", padding: "20px 24px" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 11, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase" }}>RECEIVABLES OVERDUE</p>
          <p className="font-serif" style={{ color: "#F87171", fontSize: 36, fontWeight: 700, marginTop: 4 }}>{formatINR(metrics.receivablesOverdue)}</p>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 12, marginTop: 4 }}>4 customers · Avg 48 days</p>
          <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 11, marginTop: 2 }}>← Oldest: 62 days</p>
        </div>

        {/* Due This Week */}
        <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#1A1008", padding: "20px 24px" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 11, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase" }}>DUE THIS WEEK</p>
          <p className="font-serif" style={{ color: "#FFFFFF", fontSize: 36, fontWeight: 700, marginTop: 4 }}>{formatINR(metrics.dueThisWeek)}</p>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 12, marginTop: 4 }}>3 vendors · 1 TDS payment</p>
          <p style={{ color: "#FCD34D", fontSize: 11, marginTop: 2 }}>Next: Raj Textiles ₹3.4L · Thu</p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left - 60% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Cash flow chart */}
          <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-fyn-ink font-serif" style={{ fontSize: 15 }}>Cash Flow — Last 90 Days</h3>
              <div className="flex gap-1">
                {["30D", "90D", "6M", "1Y"].map((p) => (
                  <button key={p} className="transition-colors" style={{
                    fontSize: 13, padding: "4px 10px", borderRadius: 4,
                    background: p === "90D" ? "#C41E1E" : "transparent",
                    color: p === "90D" ? "#FFFFFF" : "rgba(26,16,8,0.40)",
                  }}>{p}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="ckGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16A34A" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#16A34A" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="ckRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(26,16,8,0.45)" }} interval={14} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(26,16,8,0.45)" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cashIn" stroke="#16A34A" strokeWidth={2} fill="url(#ckGreen)" />
                <Area type="monotone" dataKey="cashOut" stroke="#DC2626" strokeWidth={2} fill="url(#ckRed)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-3">
              <span className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#16A34A" }} /> Money In
              </span>
              <span className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#DC2626" }} /> Money Out
              </span>
            </div>
          </div>

          {/* Receivables aging table */}
          <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
            <h3 className="text-fyn-ink font-serif mb-4" style={{ fontSize: 15 }}>Top Overdue Receivables</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(26,16,8,0.10)" }}>
                    <th className="text-left py-2" style={{ fontSize: 12, color: "rgba(26,16,8,0.45)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Customer</th>
                    <th className="text-left py-2" style={{ fontSize: 12, color: "rgba(26,16,8,0.45)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Invoice</th>
                    <th className="text-right py-2" style={{ fontSize: 12, color: "rgba(26,16,8,0.45)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Amount</th>
                    <th className="text-right py-2" style={{ fontSize: 12, color: "rgba(26,16,8,0.45)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Days Overdue</th>
                    <th className="text-right py-2" style={{ fontSize: 12, color: "rgba(26,16,8,0.45)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReceivables.map((r, i) => {
                    const days = daysOverdue(r.due_date || "");
                    return (
                      <tr
                        key={r.id}
                        className="transition-colors hover:cursor-pointer"
                        style={{
                          borderBottom: "1px solid rgba(26,16,8,0.06)",
                          background: i % 2 === 0 ? "#FFFFFF" : "#FAF7F0",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#F4EDDA"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? "#FFFFFF" : "#FAF7F0"; }}
                      >
                        <td className="py-3" style={{ fontSize: 14, fontWeight: 600, color: "#1A1008" }}>{r.customer_name}</td>
                        <td className="py-3" style={{ fontSize: 13, color: "rgba(26,16,8,0.50)" }}>{r.invoice_number}</td>
                        <td className="py-3 text-right fyn-metric" style={{ fontSize: 14 }}>{formatINR(r.outstanding || r.amount)}</td>
                        <td className={`py-3 text-right fyn-metric ${getDaysOverdueColor(days)}`} style={{ fontSize: 14 }}>{days > 0 ? `${days}d` : "Current"}</td>
                        <td className="py-3 text-right">
                          {days > 0 && <button style={{ color: "#C41E1E", fontSize: 13, fontWeight: 500 }} className="hover:underline">Chase</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Link to="/dashboard/receivables" style={{ color: "#C41E1E", fontSize: 14, fontWeight: 500 }} className="hover:underline mt-3 inline-block">View all overdue invoices →</Link>
          </div>
        </div>

        {/* Right - 40% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Runway gauge */}
          <div className="rounded-lg p-5 text-center" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
            <h3 className="text-fyn-ink font-serif mb-4" style={{ fontSize: 15 }}>Cash Runway</h3>
            <div className="relative mx-auto" style={{ width: 280, height: 160 }}>
              <svg viewBox="0 0 280 160" className="w-full">
                {/* Red zone 0-30 */}
                <path d="M 20 145 A 120 120 0 0 1 53 35" fill="none" stroke="#DC2626" strokeWidth="20" strokeLinecap="round" />
                {/* Amber zone 30-90 */}
                <path d="M 53 35 A 120 120 0 0 1 227 35" fill="none" stroke="#F59E0B" strokeWidth="20" strokeLinecap="round" />
                {/* Green zone 90-180 */}
                <path d="M 227 35 A 120 120 0 0 1 260 145" fill="none" stroke="#16A34A" strokeWidth="20" strokeLinecap="round" />
                {/* Needle */}
                {(() => {
                  const angle = Math.PI * (1 - metrics.runway / 180);
                  const nx = 140 + 90 * Math.cos(angle);
                  const ny = 145 - 90 * Math.sin(angle);
                  return (
                    <>
                      <line x1="140" y1="145" x2={nx} y2={ny} stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }} />
                      <circle cx="140" cy="145" r="6" fill="#1A1008" stroke="white" strokeWidth="2" />
                    </>
                  );
                })()}
              </svg>
            </div>
            <p className="font-serif" style={{ color: "#F59E0B", fontSize: 56, fontWeight: 700, lineHeight: 1 }}>{metrics.runway}</p>
            <p style={{ color: "rgba(26,16,8,0.50)", fontSize: 14, marginTop: 4 }}>days of runway</p>
            <p style={{ color: "#8B6914", fontSize: 12, marginTop: 2 }}>At ₹23,846 daily burn</p>
            <div className="flex justify-center gap-4 mt-4" style={{ fontSize: 11 }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#DC2626" }} /> Critical &lt;30d</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#F59E0B" }} /> Watch 30-90d</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#16A34A" }} /> Safe &gt;90d</span>
            </div>
            <div className="flex gap-2 mt-4 justify-center">
              {[
                { text: "Collect faster (+15d)", bg: "#16A34A" },
                { text: "Pay slower (+8d)", bg: "#8B5A00" },
                { text: "Cut burn (+6d)", bg: "#1A4A8B" },
              ].map(b => (
                <span key={b.text} className="text-white rounded-lg cursor-pointer transition-all hover:scale-[1.02] hover:brightness-110" style={{ background: b.bg, fontSize: 12, padding: "6px 12px" }}>{b.text}</span>
              ))}
            </div>
          </div>

          {/* Nidhi insight */}
          <div className="rounded-[10px]" style={{ background: "#1A1008", padding: "20px 24px" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#C41E1E", fontSize: 16 }}>N</div>
                <div>
                  <p className="text-white" style={{ fontSize: 14, fontWeight: 600 }}>Nidhi's read on today</p>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 11 }}>Online · 8:03 AM</p>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 1.75, marginTop: 12 }}>
              {brief?.content || "Your runway dropped 8 days this week — mainly due to a ₹4.2L vendor payment on Monday. ABC Electronics is your biggest lever: collecting their ₹8.4L overdue adds 15 days instantly. I'd prioritize that call this morning."}
            </p>
            <div className="flex gap-2 mt-[14px]">
              <input
                value={nidhiInput}
                onChange={e => setNidhiInput(e.target.value)}
                placeholder="Ask Nidhi a follow-up..."
                className="flex-1 outline-none"
                style={{
                  height: 40,
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.20)",
                  borderRadius: 6,
                  color: "#FFFFFF",
                  fontSize: 13,
                }}
                aria-label="Ask Nidhi"
              />
              <button className="transition-all hover:brightness-90" style={{ width: 40, height: 40, background: "#C41E1E", borderRadius: 6, color: "#FFFFFF", fontSize: 16, fontWeight: 700 }}>→</button>
            </div>
          </div>

          {/* Filing Calendar */}
          <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
            <h3 className="text-fyn-ink font-serif mb-3" style={{ fontSize: 15 }}>Filing Calendar</h3>
            <div className="space-y-1">
              {filingData.map((c) => {
                const daysLeft = getDaysLeft(c.due_date);
                const dotColor = daysLeft <= 3 ? "#DC2626" : daysLeft <= 7 ? "#F59E0B" : daysLeft <= 14 ? "#8B6914" : "rgba(26,16,8,0.30)";
                const badgeBg = daysLeft <= 3 ? "#FDEAEA" : daysLeft <= 7 ? "#FEF3E2" : "rgba(26,16,8,0.06)";
                const badgeColor = daysLeft <= 3 ? "#C41E1E" : daysLeft <= 7 ? "#8B5A00" : "rgba(26,16,8,0.50)";
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-lg transition-colors hover:cursor-pointer"
                    style={{ padding: "8px 10px", height: 36 }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#F4EDDA"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${daysLeft <= 3 ? "pulse-ring" : ""}`} style={{ background: dotColor }} />
                    <span className="flex-1" style={{ color: "#1A1008", fontSize: 13, fontWeight: 500 }}>{c.filing_name}</span>
                    <span style={{ fontSize: 12, color: "rgba(26,16,8,0.60)" }}>{c.due_date}</span>
                    <span className="rounded-full fyn-metric" style={{ background: badgeBg, color: badgeColor, fontSize: 12, fontWeight: daysLeft <= 3 ? 700 : 500, padding: "2px 8px" }}>{daysLeft > 0 ? `${daysLeft}d` : "Due"}</span>
                  </div>
                );
              })}
            </div>
            <Link to="/dashboard/filing-calendar" style={{ color: "#C41E1E", fontSize: 14, fontWeight: 500 }} className="hover:underline mt-3 inline-block">View full calendar →</Link>
          </div>

          {/* GST Health */}
          <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
            <h3 className="text-fyn-ink font-serif mb-3" style={{ fontSize: 15 }}>GST Health</h3>
            <div className="grid grid-cols-3 gap-3">
              {/* ITC Safe */}
              <div className="text-center rounded-lg" style={{ background: "#DCFCE7", padding: "12px 8px" }}>
                <p className="fyn-metric" style={{ color: "#16A34A", fontSize: 20, fontWeight: 700 }}>{formatINR(metrics.itcSafe)}</p>
                <p style={{ color: "#16A34A", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>ITC SAFE</p>
                <p style={{ color: "rgba(22,163,74,0.7)", fontSize: 11, marginTop: 2 }}>Confirmed in 2B</p>
              </div>
              {/* ITC At Risk */}
              <div className="text-center rounded-lg" style={{ background: "#FDEAEA", border: "1px solid #C41E1E", padding: "12px 8px" }}>
                <p className="fyn-metric" style={{ color: "#C41E1E", fontSize: 20, fontWeight: 700 }}>{formatINR(metrics.itcAtRisk)}</p>
                <p style={{ color: "#C41E1E", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>ITC AT RISK</p>
                <p style={{ color: "rgba(196,30,30,0.7)", fontSize: 11, marginTop: 2 }}>Not in 2B — chase vendors</p>
              </div>
              {/* Notice Risk */}
              <div className="text-center rounded-lg" style={{ background: "#FEF3E2", padding: "12px 8px" }}>
                <p className="fyn-metric" style={{ color: "#F59E0B", fontSize: 20, fontWeight: 700 }}>{metrics.noticeRisk}/100</p>
                <p style={{ color: "rgba(26,16,8,0.50)", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>NOTICE RISK</p>
                <p style={{ color: "rgba(26,16,8,0.40)", fontSize: 11, marginTop: 2 }}>Score out of 100 · Medium</p>
              </div>
            </div>
            <Link to="/dashboard/gst" style={{ color: "#C41E1E", fontSize: 14, fontWeight: 500 }} className="hover:underline mt-3 inline-block">View GST Intelligence →</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CockpitPage;
