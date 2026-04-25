import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type FilingRow = { status: string; due_date: string; filed_date?: string | null };

const CompliancePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [fromDate, setFromDate] = useState<Date>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d;
  });
  const [toDate, setToDate] = useState<Date>(() => new Date());
  const fromStr = format(fromDate, "yyyy-MM-dd");
  const toStr = format(toDate, "yyyy-MM-dd");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["compliance-gst", businessId, fromStr, toStr] }),
        queryClient.refetchQueries({ queryKey: ["compliance-tds", businessId, fromStr, toStr] }),
      ]);
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };
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

  const { data: gstFilings, isLoading: loadingGst, isFetching: fetchingGst } = useQuery({
    queryKey: ["compliance-gst", businessId, fromStr, toStr],
    queryFn: async (): Promise<FilingRow[]> => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("gst_filings" as never)
        .select("status, due_date, filed_date")
        .eq("business_id", businessId)
        .gte("due_date", fromStr)
        .lte("due_date", toStr);
      return ((data as unknown) as FilingRow[]) || [];
    },
    enabled: !!businessId,
  });

  const { data: tdsFilings, isLoading: loadingTds, isFetching: fetchingTds } = useQuery({
    queryKey: ["compliance-tds", businessId, fromStr, toStr],
    queryFn: async (): Promise<FilingRow[]> => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("tds_filings" as never)
        .select("status, due_date, filed_date")
        .eq("business_id", businessId)
        .gte("due_date", fromStr)
        .lte("due_date", toStr);
      return ((data as unknown) as FilingRow[]) || [];
    },
    enabled: !!businessId,
  });

  const isLoading = loadingGst || loadingTds;
  const isFetching = fetchingGst || fetchingTds;

  useEffect(() => {
    if (!isFetching && (gstFilings || tdsFilings) && !lastUpdated) {
      setLastUpdated(new Date());
    }
  }, [isFetching, gstFilings, tdsFilings, lastUpdated]);
  const allFilings = [...(gstFilings || []), ...(tdsFilings || [])];
  const totalFilings = allFilings.length;
  const filedOnTime = allFilings.filter((f) => f.status === "filed").length;
  const complianceScore = totalFilings > 0 ? Math.round((filedOnTime / totalFilings) * 100) : 0;

  const gstFiled = gstFilings?.filter((f) => f.status === "filed").length || 0;
  const gstTotal = gstFilings?.length || 0;
  const tdsFiled = tdsFilings?.filter((f) => f.status === "filed").length || 0;
  const tdsTotal = tdsFilings?.length || 0;

  // Urgency: count overdue (past due, not filed) and due soon (≤7 days, not filed)
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysOut = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  })();
  const countUrgency = (rows: FilingRow[] = []) => {
    const overdue = rows.filter((r) => r.status !== "filed" && r.due_date < today).length;
    const dueSoon = rows.filter(
      (r) => r.status !== "filed" && r.due_date >= today && r.due_date <= sevenDaysOut
    ).length;
    return { overdue, dueSoon };
  };
  const gstUrgency = countUrgency(gstFilings || []);
  const tdsUrgency = countUrgency(tdsFilings || []);
  const totalOverdue = gstUrgency.overdue + tdsUrgency.overdue;
  const totalDueSoon = gstUrgency.dueSoon + tdsUrgency.dueSoon;

  const isEmpty = !isLoading && totalFilings === 0;

  const scoreColor =
    complianceScore > 80 ? "#1A6B3C" : complianceScore > 50 ? "#8B5A00" : "#C41E1E";

  // Build 3-month on-time % trend per source
  const trendData = (() => {
    const months: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("en-IN", { month: "short" }),
      });
    }
    const rate = (rows: FilingRow[], monthKey: string) => {
      const inMonth = rows.filter((r) => r.due_date?.startsWith(monthKey));
      if (inMonth.length === 0) return null;
      const onTime = inMonth.filter(
        (r) => r.status === "filed" && r.filed_date && r.filed_date <= r.due_date
      ).length;
      return Math.round((onTime / inMonth.length) * 100);
    };
    return months.map((m) => ({
      month: m.label,
      GST: rate(gstFilings || [], m.key),
      TDS: rate(tdsFilings || [], m.key),
    }));
  })();

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
        <span className="text-fyn-ink/60 text-xs mr-1">Period:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("h-9 justify-start text-left font-normal text-sm", !fromDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, "dd MMM yyyy") : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={(d) => d && setFromDate(d)}
              disabled={(d) => d > toDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <span className="text-fyn-ink/40 text-xs">→</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("h-9 justify-start text-left font-normal text-sm", !toDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, "dd MMM yyyy") : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={(d) => d && setToDate(d)}
              disabled={(d) => d < fromDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || !businessId}
          className="inline-flex items-center gap-2 bg-fyn-ink text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-fyn-ink/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-12 text-center">
          <h3 className="text-fyn-ink text-xl font-serif mb-2">No Compliance Data</h3>
          <p className="text-fyn-ink/60 text-sm mb-6">
            Connect your accounting system to track compliance health
          </p>
          <button
            onClick={() => navigate("/dashboard/settings/integrations")}
            className="bg-fyn-ink text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-fyn-ink/90 transition-colors"
          >
            Connect Accounting →
          </button>
        </div>
      )}

      {!isLoading && totalFilings > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* SCORE CARD */}
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6 lg:col-span-1">
            <p className="text-fyn-ink/40 text-[12px] fyn-label mb-2">COMPLIANCE HEALTH SCORE</p>
            <p className="text-[48px] font-bold font-sans leading-none" style={{ color: scoreColor }}>
              {complianceScore}%
            </p>
            <p className="text-fyn-ink/60 text-xs mt-2">
              Based on {totalFilings} filings (last 3 months)
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {totalOverdue > 0 && (
                <span className="inline-flex items-center gap-1 bg-[#C41E1E]/10 text-[#C41E1E] text-xs font-medium px-2 py-1 rounded">
                  ● {totalOverdue} overdue
                </span>
              )}
              {totalDueSoon > 0 && (
                <span className="inline-flex items-center gap-1 bg-[#8B5A00]/10 text-[#8B5A00] text-xs font-medium px-2 py-1 rounded">
                  ● {totalDueSoon} due in 7 days
                </span>
              )}
              {totalOverdue === 0 && totalDueSoon === 0 && (
                <span className="inline-flex items-center gap-1 bg-[#1A6B3C]/10 text-[#1A6B3C] text-xs font-medium px-2 py-1 rounded">
                  ● All clear
                </span>
              )}
            </div>
          </div>

          {/* GST */}
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6 relative">
            <p className="text-fyn-ink/40 text-[12px] fyn-label mb-2 flex items-center gap-2">
              GST FILINGS
              {fetchingGst && <RefreshCw className="h-3 w-3 animate-spin text-fyn-ink/40" />}
            </p>
            <p className={cn("text-fyn-ink text-[28px] font-bold font-sans transition-opacity", fetchingGst && "opacity-40")}>
              {gstFiled}<span className="text-fyn-ink/40 text-lg font-normal">/{gstTotal}</span>
            </p>
            <p className="text-fyn-ink/60 text-xs mt-2">filed on time</p>
            {(gstUrgency.overdue > 0 || gstUrgency.dueSoon > 0) && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {gstUrgency.overdue > 0 && (
                  <span className="bg-[#C41E1E]/10 text-[#C41E1E] text-[10px] font-medium px-2 py-0.5 rounded">
                    {gstUrgency.overdue} overdue
                  </span>
                )}
                {gstUrgency.dueSoon > 0 && (
                  <span className="bg-[#8B5A00]/10 text-[#8B5A00] text-[10px] font-medium px-2 py-0.5 rounded">
                    {gstUrgency.dueSoon} due soon
                  </span>
                )}
              </div>
            )}
            <div className="w-full bg-fyn-ink/10 rounded-full h-2 mt-3">
              <div
                className="bg-[#1A6B3C] h-2 rounded-full transition-all"
                style={{ width: gstTotal > 0 ? `${(gstFiled / gstTotal) * 100}%` : "0%" }}
              />
            </div>
          </div>

          {/* TDS */}
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6 relative">
            <p className="text-fyn-ink/40 text-[12px] fyn-label mb-2 flex items-center gap-2">
              TDS FILINGS
              {fetchingTds && <RefreshCw className="h-3 w-3 animate-spin text-fyn-ink/40" />}
            </p>
            <p className={cn("text-fyn-ink text-[28px] font-bold font-sans transition-opacity", fetchingTds && "opacity-40")}>
              {tdsFiled}<span className="text-fyn-ink/40 text-lg font-normal">/{tdsTotal}</span>
            </p>
            <p className="text-fyn-ink/60 text-xs mt-2">filed on time</p>
            {(tdsUrgency.overdue > 0 || tdsUrgency.dueSoon > 0) && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tdsUrgency.overdue > 0 && (
                  <span className="bg-[#C41E1E]/10 text-[#C41E1E] text-[10px] font-medium px-2 py-0.5 rounded">
                    {tdsUrgency.overdue} overdue
                  </span>
                )}
                {tdsUrgency.dueSoon > 0 && (
                  <span className="bg-[#8B5A00]/10 text-[#8B5A00] text-[10px] font-medium px-2 py-0.5 rounded">
                    {tdsUrgency.dueSoon} due soon
                  </span>
                )}
              </div>
            )}
            <div className="w-full bg-fyn-ink/10 rounded-full h-2 mt-3">
              <div
                className="bg-[#1A6B3C] h-2 rounded-full transition-all"
                style={{ width: tdsTotal > 0 ? `${(tdsFiled / tdsTotal) * 100}%` : "0%" }}
              />
            </div>
          </div>
        </div>
      )}

      {!isLoading && totalFilings > 0 && (
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6 mt-4">
          <p className="text-fyn-ink/40 text-[12px] fyn-label mb-4">
            ON-TIME FILING RATE — LAST 3 MONTHS
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,16,8,0.08)" />
              <XAxis dataKey="month" stroke="#1A1008" fontSize={12} />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                stroke="#1A1008"
                fontSize={12}
              />
              <Tooltip
                formatter={(v: number | null) => (v === null ? "No filings" : `${v}%`)}
                contentStyle={{ background: "#F4EDDA", border: "1px solid rgba(26,16,8,0.1)" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="GST"
                stroke="#1A6B3C"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="TDS"
                stroke="#8B6914"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-fyn-ink/50 text-xs mt-3">
            On-time = filed on or before due date. Months with no filings appear as gaps.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CompliancePage;
