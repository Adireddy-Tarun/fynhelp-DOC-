import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine,
} from "recharts";

type RunwayData = {
  cashBalance: number;
  monthlyBurn: number;
  runwayMonths: number;
  runwayDays: number;
};

const RunwayPage = () => {
  const navigate = useNavigate();
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.business_id) setBusinessId(data.business_id);
    };
    fetchBusiness();
  }, []);

  const { data: runwayData, isLoading } = useQuery<RunwayData | null>({
    queryKey: ["runway", businessId],
    queryFn: async () => {
      if (!businessId) return null;

      const { data: accounts } = await supabase
        .from("bank_accounts")
        .select("balance")
        .eq("business_id", businessId);

      const cashBalance = accounts?.reduce((sum, a) => sum + Number(a.balance || 0), 0) || 0;

      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount, direction, date")
        .eq("business_id", businessId)
        .gte("date", threeMonthsAgo.toISOString().split("T")[0]);

      if (!transactions || transactions.length === 0) {
        return { cashBalance, monthlyBurn: 0, runwayMonths: 0, runwayDays: 0 };
      }

      const totalOutflow = transactions
        .filter((t) => t.direction === "debit")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthlyBurn = totalOutflow / 3;
      const runwayMonths = monthlyBurn > 0 ? cashBalance / monthlyBurn : 999;
      const runwayDays = Math.floor(runwayMonths * 30);

      return { cashBalance, monthlyBurn, runwayMonths, runwayDays };
    },
    enabled: !!businessId,
  });

  const hasData =
    !!runwayData && (runwayData.cashBalance > 0 || runwayData.monthlyBurn > 0);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg animate-pulse" style={{ background: "rgba(26,16,8,0.06)", height: 120 }} />
          ))}
        </div>
        <div className="rounded-lg animate-pulse" style={{ background: "rgba(26,16,8,0.06)", height: 320 }} />
      </DashboardLayout>
    );
  }

  if (!hasData) {
    return (
      <DashboardLayout>
        <div className="rounded-lg p-12 text-center" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
          <div className="mx-auto mb-6 flex items-center justify-center" style={{ width: 64, height: 64, background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", boxShadow: "inset 0 -2px 0 0 #C41E1E", color: "#C41E1E" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" shapeRendering="crispEdges">
              <path d="M3 3v18h18M7 14l4-4 4 4 6-6" />
            </svg>
          </div>
          <h2 className="font-serif text-fyn-ink" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No Financial Data</h2>
          <p style={{ fontSize: 14, color: "rgba(26,16,8,0.60)", marginBottom: 20 }}>
            Upload bank statements to calculate runway
          </p>
          <button
            onClick={() => navigate("/dashboard/data-import")}
            className="inline-flex items-center gap-2 transition-colors hover:opacity-90"
            style={{ background: "#C41E1E", color: "#FFFFFF", padding: "10px 20px", borderRadius: 6, fontSize: 14, fontWeight: 500 }}
          >
            Upload Data →
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { cashBalance, monthlyBurn, runwayMonths, runwayDays } = runwayData!;

  // Color tiers
  const tierColor =
    runwayMonths > 6 ? "#1A6B3C" : runwayMonths > 3 ? "#8B5A00" : "#C41E1E";
  const tierLabel =
    runwayMonths > 6 ? "Safe" : runwayMonths > 3 ? "Watch" : "Critical";

  const progressPct = Math.min((runwayMonths / 12) * 100, 100);

  // 6-month forecast
  const forecastMonths = Array.from({ length: 6 }, (_, i) => {
    const monthsFromNow = i + 1;
    const projected = cashBalance - monthlyBurn * monthsFromNow;
    const d = new Date();
    d.setMonth(d.getMonth() + monthsFromNow);
    return {
      month: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      balance: Math.max(projected, 0),
    };
  });

  return (
    <DashboardLayout>
      {/* HERO */}
      <div className="rounded-xl p-8 lg:p-10 mb-6 text-center" style={{ background: "#1A1008" }}>
        <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Runway</p>
        <p className="font-sans" style={{ color: tierColor, fontSize: 72, fontWeight: 700, lineHeight: 1, marginTop: 8 }}>
          {runwayMonths >= 999 ? "∞" : runwayMonths.toFixed(1)}
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.60)", fontWeight: 500, marginLeft: 8 }}>months</span>
        </p>
        <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 14, marginTop: 6 }}>
          {runwayMonths >= 999 ? "No burn detected" : `${runwayDays} days`} · <span style={{ color: tierColor, fontWeight: 600 }}>{tierLabel}</span>
        </p>

        {/* Progress bar */}
        <div className="mx-auto mt-6" style={{ maxWidth: 480 }}>
          <div style={{ height: 8, background: "rgba(255,255,255,0.10)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: tierColor, transition: "width 0.6s ease" }} />
          </div>
          <div className="flex justify-between mt-2" style={{ fontSize: 11, color: "rgba(255,255,255,0.40)" }}>
            <span>0</span><span>3 mo</span><span>6 mo</span><span>12 mo</span>
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)", padding: "20px 24px" }}>
          <p style={{ color: "rgba(26,16,8,0.50)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Cash Balance</p>
          <p className="fyn-metric" style={{ color: "#1A1008", fontSize: 26, fontWeight: 700, marginTop: 6 }}>
            ₹{cashBalance.toLocaleString("en-IN")}
          </p>
          <p style={{ color: "rgba(26,16,8,0.50)", fontSize: 12, marginTop: 4 }}>Across all bank accounts</p>
        </div>
        <div className="rounded-lg" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)", padding: "20px 24px" }}>
          <p style={{ color: "rgba(26,16,8,0.50)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Monthly Burn Rate</p>
          <p className="fyn-metric" style={{ color: "#C41E1E", fontSize: 26, fontWeight: 700, marginTop: 6 }}>
            ₹{Math.round(monthlyBurn).toLocaleString("en-IN")}
            <span style={{ fontSize: 13, color: "rgba(26,16,8,0.50)", fontWeight: 500 }}> /month</span>
          </p>
          <p style={{ color: "rgba(26,16,8,0.50)", fontSize: 12, marginTop: 4 }}>3-month average outflow</p>
        </div>
        <div className="rounded-lg" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)", padding: "20px 24px" }}>
          <p style={{ color: "rgba(26,16,8,0.50)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Crisis Date</p>
          <p className="fyn-metric" style={{ color: tierColor, fontSize: 22, fontWeight: 700, marginTop: 6 }}>
            {runwayMonths >= 999
              ? "—"
              : new Date(Date.now() + runwayDays * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <p style={{ color: "rgba(26,16,8,0.50)", fontSize: 12, marginTop: 4 }}>If burn rate continues</p>
        </div>
      </div>

      {/* FORECAST CHART */}
      <div className="rounded-lg p-5 mb-6" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-fyn-ink font-sans" style={{ fontSize: 15, fontWeight: 600 }}>Cash Runway Forecast — Next 6 Months</h3>
          <Link to="/dashboard/cash-flow" style={{ fontSize: 13, color: "#C41E1E", fontWeight: 500 }}>View cash flow →</Link>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={forecastMonths}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(26,16,8,0.45)" }} />
            <YAxis tick={{ fontSize: 11, fill: "rgba(26,16,8,0.45)" }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
            <Tooltip
              contentStyle={{ background: "#1A1008", border: "none", borderRadius: 8, color: "#fff", fontSize: 13 }}
              formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Projected Balance"]}
            />
            <ReferenceArea y1={0} y2={cashBalance * 0.1} fill="#C41E1E" fillOpacity={0.06} />
            <ReferenceLine y={0} stroke="#C41E1E" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="balance" stroke={tierColor} strokeWidth={2.5} dot={{ r: 4, fill: tierColor }} />
          </LineChart>
        </ResponsiveContainer>
        <p style={{ fontSize: 12, color: "rgba(26,16,8,0.50)", marginTop: 8 }}>
          Projection assumes constant burn of ₹{Math.round(monthlyBurn).toLocaleString("en-IN")}/month.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default RunwayPage;
