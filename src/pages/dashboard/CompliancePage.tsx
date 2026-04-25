import { useState, useEffect, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, CalendarIcon, ChevronDown, ChevronRight, Download } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type FilingRow = { status: string; due_date: string | null; filed_date?: string | null };

const CompliancePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const BREAKDOWN_FILTER_KEY = "compliance:breakdownFilter";
  type BreakdownFilter = "on-time" | "late" | "overdue" | "pending" | "unknown" | null;
  const isValidFilter = (v: unknown): v is Exclude<BreakdownFilter, null> =>
    v === "on-time" || v === "late" || v === "overdue" || v === "pending" || v === "unknown";
  const [breakdownFilter, setBreakdownFilter] = useState<BreakdownFilter>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(BREAKDOWN_FILTER_KEY);
    return isValidFilter(stored) ? stored : null;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (breakdownFilter) window.localStorage.setItem(BREAKDOWN_FILTER_KEY, breakdownFilter);
    else window.localStorage.removeItem(BREAKDOWN_FILTER_KEY);
  }, [breakdownFilter]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const breakdownTableRef = useRef<HTMLDivElement | null>(null);

  // Collapse any expanded row when the breakdown filter changes (or clears).
  useEffect(() => {
    setExpandedRow(null);
  }, [breakdownFilter]);

  // Collapse on outside click / Escape key while a row is expanded.
  useEffect(() => {
    if (!expandedRow) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = breakdownTableRef.current;
      if (el && !el.contains(e.target as Node)) setExpandedRow(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedRow(null);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [expandedRow]);

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
  const [gstConnected, setGstConnected] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.business_id) {
        setBusinessId(data.business_id);
        const { data: biz } = await supabase
          .from("businesses")
          .select("gstin")
          .eq("id", data.business_id)
          .maybeSingle();
        if (biz?.gstin && biz.gstin.trim().length > 0) setGstConnected(true);
      }
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
  const allFilings = [...(gstFilings || []).map(f => ({ ...f, _src: "GST" as const })), ...(tdsFilings || []).map(f => ({ ...f, _src: "TDS" as const }))];
  const totalFilings = allFilings.length;

  // Classification rules (mutually exclusive, exhaustive over rows with a known due_date):
  //   on-time = filed AND filed_date present AND filed_date ≤ due_date
  //   late    = filed AND (filed_date missing OR filed_date > due_date)
  //   overdue = not filed AND due_date < today
  //   pending = not filed AND due_date ≥ today
  //   unknown = due_date missing  → excluded from score denominator
  const todayStr = new Date().toISOString().split("T")[0];
  const isFiledStatus = (f: FilingRow) => f.status === "filed";
  const isUnknown = (f: FilingRow) => !f.due_date;
  const isOnTime = (f: FilingRow) =>
    !isUnknown(f) && isFiledStatus(f) && !!f.filed_date && f.filed_date <= (f.due_date as string);
  const isLate = (f: FilingRow) =>
    !isUnknown(f) && isFiledStatus(f) && (!f.filed_date || (f.filed_date as string) > (f.due_date as string));
  const isOverdueNotFiled = (f: FilingRow) =>
    !isUnknown(f) && !isFiledStatus(f) && (f.due_date as string) < todayStr;
  const isPending = (f: FilingRow) =>
    !isUnknown(f) && !isFiledStatus(f) && (f.due_date as string) >= todayStr;

  const daysBetween = (a: string, b: string) => {
    const ms = new Date(a).getTime() - new Date(b).getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  };
  const explainFiling = (f: FilingRow) => {
    if (isUnknown(f)) {
      return {
        label: "Unknown",
        color: "#475569",
        rule: "due_date missing",
        detail: "No due date on record; excluded from score.",
      };
    }
    const due = f.due_date as string;
    if (isOnTime(f)) {
      const diff = daysBetween(due, f.filed_date!);
      return {
        label: "On time",
        color: "#1A6B3C",
        rule: "filed AND filed_date ≤ due_date",
        detail: `Filed ${diff === 0 ? "exactly on" : `${diff} day${diff === 1 ? "" : "s"} before`} the due date.`,
      };
    }
    if (isLate(f)) {
      if (!f.filed_date) {
        return {
          label: "Filed late",
          color: "#8B5A00",
          rule: "filed AND filed_date missing",
          detail: "Marked filed but the filed date is missing — counted as late.",
        };
      }
      const diff = daysBetween(f.filed_date, due);
      return {
        label: "Filed late",
        color: "#8B5A00",
        rule: "filed AND filed_date > due_date",
        detail: `Filed ${diff} day${diff === 1 ? "" : "s"} after the due date.`,
      };
    }
    if (isOverdueNotFiled(f)) {
      const diff = daysBetween(todayStr, due);
      return {
        label: "Overdue",
        color: "#C41E1E",
        rule: "status ≠ filed AND due_date < today",
        detail: `Not yet filed; due date passed ${diff} day${diff === 1 ? "" : "s"} ago.`,
      };
    }
    const diff = daysBetween(due, todayStr);
    return {
      label: "Pending",
      color: "#1A1008",
      rule: "status ≠ filed AND due_date ≥ today",
      detail: `Not yet filed; ${diff === 0 ? "due today" : `due in ${diff} day${diff === 1 ? "" : "s"}`}.`,
    };
  };

  const onTimeCount = allFilings.filter(isOnTime).length;
  const lateCount = allFilings.filter(isLate).length;
  const overdueCount = allFilings.filter(isOverdueNotFiled).length;
  const pendingCount = allFilings.filter(isPending).length;
  const unknownCount = allFilings.filter(isUnknown).length;
  // Score denominator excludes unknowns so the formula matches the visible breakdown.
  const scoredTotal = onTimeCount + lateCount + overdueCount + pendingCount;
  const complianceScore = scoredTotal > 0 ? Math.round((onTimeCount / scoredTotal) * 100) : 0;

  const gstFiled = gstFilings?.filter((f) => f.status === "filed").length || 0;
  const gstTotal = gstFilings?.length || 0;
  const tdsFiled = tdsFilings?.filter((f) => f.status === "filed").length || 0;
  const tdsTotal = tdsFilings?.length || 0;

  // Urgency: count overdue (past due, not filed) and due soon (≤7 days, not filed). Skip rows without a due_date.
  const today = todayStr;
  const sevenDaysOut = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  })();
  const countUrgency = (rows: FilingRow[] = []) => {
    const overdue = rows.filter((r) => !!r.due_date && r.status !== "filed" && r.due_date < today).length;
    const dueSoon = rows.filter(
      (r) => !!r.due_date && r.status !== "filed" && r.due_date >= today && r.due_date <= sevenDaysOut
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

  const controlsLocked = isRefreshing || isFetching;

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
        <span className="text-fyn-ink/60 text-xs mr-1">Period:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={controlsLocked}
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
              disabled={controlsLocked}
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
          disabled={controlsLocked || !businessId}
          className="inline-flex items-center gap-2 bg-fyn-ink text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-fyn-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${controlsLocked ? "animate-spin" : ""}`} />
          {controlsLocked ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {lastUpdated && (
        <div className="flex justify-end -mt-2 mb-4">
          <span className="text-fyn-ink/50 text-xs">
            Last updated {format(lastUpdated, "dd MMM yyyy, HH:mm:ss")}
          </span>
        </div>
      )}
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
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate("/dashboard/settings/integrations")}
              className="bg-fyn-ink text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-fyn-ink/90 transition-colors"
            >
              Connect Accounting →
            </button>
            <button
              onClick={handleRefresh}
              disabled={controlsLocked || !businessId}
              className="inline-flex items-center gap-2 border border-fyn-ink/20 text-fyn-ink px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-fyn-ink/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${controlsLocked ? "animate-spin" : ""}`} />
              {controlsLocked ? "Retrying..." : "Retry"}
            </button>
          </div>
          <TroubleshootingCard navigate={navigate} missingGst missingTds />
        </div>
      )}

      {!isLoading && totalFilings > 0 && (gstTotal === 0 || tdsTotal === 0) && (
        <TroubleshootingCard
          navigate={navigate}
          missingGst={gstTotal === 0}
          missingTds={tdsTotal === 0}
          compact
        />
      )}

      {!isLoading && totalFilings > 0 && (
        <div className="relative">
          {/* TDS / TRACES connection banner */}
          {(() => {
            const tdsConnected = tdsTotal > 0;
            return (
              <div
                className={cn(
                  "mb-3 flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs",
                  tdsConnected
                    ? "bg-[#1A6B3C]/5 border-[#1A6B3C]/20 text-[#1A6B3C]"
                    : "bg-[#8B5A00]/5 border-[#8B5A00]/20 text-[#8B5A00]"
                )}
              >
                <span className="inline-flex items-center gap-2 font-medium">
                  <span
                    className={cn(
                      "inline-block w-2 h-2 rounded-full",
                      tdsConnected ? "bg-[#1A6B3C]" : "bg-[#8B5A00]"
                    )}
                  />
                  {tdsConnected
                    ? `TDS / TRACES connected · ${tdsTotal} filing${tdsTotal === 1 ? "" : "s"} tracked`
                    : "TDS / TRACES disconnected · no filings synced yet"}
                </span>
                <button
                  onClick={tdsConnected ? handleRefresh : () => navigate("/onboarding?step=tds")}
                  disabled={tdsConnected && controlsLocked}
                  className="inline-flex items-center gap-1 font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {tdsConnected ? (
                    <>
                      <RefreshCw className={cn("h-3 w-3", controlsLocked && "animate-spin")} />
                      {controlsLocked ? "Refreshing…" : "Refresh card"}
                    </>
                  ) : (
                    <>Connect TDS →</>
                  )}
                </button>
              </div>
            );
          })()}
          {isFetching && (
            <div className="absolute inset-0 z-10 pointer-events-none flex items-start justify-end p-2">
              <span className="inline-flex items-center gap-1.5 bg-fyn-beige-card/95 border border-fyn-ink-10 text-fyn-ink/70 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Updating…
              </span>
            </div>
          )}
          <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-4 transition-opacity", isFetching && "opacity-70")}>
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
            {gstTotal === 0 && !fetchingGst ? (
              <div className="mt-1">
                {gstConnected ? (
                  <>
                    <p className="text-fyn-ink text-[28px] font-bold font-sans">0<span className="text-fyn-ink/40 text-lg font-normal">/0</span></p>
                    <p className="text-fyn-ink/60 text-xs mt-2">No filings in this date range</p>
                    <span className="inline-flex items-center gap-1 mt-3 bg-[#1A6B3C]/10 text-[#1A6B3C] text-[10px] font-medium px-2 py-0.5 rounded">
                      ● GST connected
                    </span>
                  </>
                ) : (
                  <>
                    <p className="text-fyn-ink/60 text-xs mb-2">No GST filings tracked yet.</p>
                    <p className="text-fyn-ink/70 text-[11px] fyn-label mb-1.5">YOU'LL NEED</p>
                    <ul className="text-fyn-ink/70 text-xs space-y-1 mb-3">
                      <li className="flex items-start gap-1.5"><span className="text-fyn-ink/40 mt-0.5">•</span><span>15-character GSTIN</span></li>
                      <li className="flex items-start gap-1.5"><span className="text-fyn-ink/40 mt-0.5">•</span><span>Filing frequency (monthly or QRMP)</span></li>
                      <li className="flex items-start gap-1.5"><span className="text-fyn-ink/40 mt-0.5">•</span><span>GST portal username (for OTP sync)</span></li>
                      <li className="flex items-start gap-1.5"><span className="text-fyn-ink/40 mt-0.5">•</span><span>Authorised signatory mobile / email</span></li>
                    </ul>
                    <button
                      onClick={() => navigate("/onboarding?step=gst")}
                      className="inline-flex items-center gap-1 bg-fyn-ink text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-fyn-ink/90 transition-colors"
                    >
                      Connect GST →
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* TDS */}
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6 relative">
            <p className="text-fyn-ink/40 text-[12px] fyn-label mb-2 flex items-center gap-2">
              TDS FILINGS
              {fetchingTds && <RefreshCw className="h-3 w-3 animate-spin text-fyn-ink/40" />}
            </p>
            {tdsTotal === 0 && !fetchingTds ? (
              <div className="mt-1">
                <p className="text-fyn-ink/60 text-xs mb-2">No TDS / TRACES filings tracked yet.</p>
                <p className="text-fyn-ink/70 text-[11px] fyn-label mb-1.5">WHAT WE'LL IMPORT</p>
                <ul className="text-fyn-ink/70 text-xs space-y-1 mb-2">
                  <li className="flex items-start gap-1.5"><span className="text-fyn-ink/40 mt-0.5">•</span><span>Form 24Q / 26Q / 27Q quarterly returns</span></li>
                  <li className="flex items-start gap-1.5"><span className="text-fyn-ink/40 mt-0.5">•</span><span>Challan numbers, ARNs &amp; deposit dates</span></li>
                  <li className="flex items-start gap-1.5"><span className="text-fyn-ink/40 mt-0.5">•</span><span>Default notices &amp; demand status from TRACES</span></li>
                </ul>
                <p className="text-fyn-ink/50 text-[11px] mb-3">Auto-syncs daily · manual refresh anytime</p>
                <button
                  onClick={() => navigate("/onboarding?step=tds")}
                  className="inline-flex items-center gap-1 bg-fyn-ink text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-fyn-ink/90 transition-colors"
                >
                  Connect TDS →
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
        </div>
      )}

      {!isLoading && businessId && gstTotal === 0 && tdsTotal === 0 && (
        <div className="text-center mt-3">
          <button
            onClick={() => navigate("/dashboard/settings/integrations")}
            className="text-fyn-ink/70 hover:text-fyn-ink text-xs underline underline-offset-2"
          >
            Or manage all integrations →
          </button>
        </div>
      )}

      {!isLoading && totalFilings > 0 && (
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6 mt-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-fyn-ink/40 text-[12px] fyn-label mb-1">HEALTH SCORE BREAKDOWN</p>
              <p className="text-fyn-ink/70 text-xs font-mono">
                Score = on-time ÷ scored × 100 = {onTimeCount} ÷ {scoredTotal} × 100 = <span className="font-bold" style={{ color: scoreColor }}>{complianceScore}%</span>
              </p>
              {unknownCount > 0 && (
                <p className="text-fyn-ink/50 text-[11px] mt-1">
                  {unknownCount} filing{unknownCount === 1 ? "" : "s"} excluded (missing due_date).
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {breakdownFilter && (() => {
                const bucketLabel: Record<string, string> = {
                  "on-time": "on-time",
                  late: "late",
                  overdue: "overdue",
                  pending: "pending",
                  unknown: "unknown",
                };
                const matchesBucket = (f: typeof allFilings[number]) =>
                  breakdownFilter === "on-time" ? isOnTime(f) :
                  breakdownFilter === "late" ? isLate(f) :
                  breakdownFilter === "overdue" ? isOverdueNotFiled(f) :
                  breakdownFilter === "unknown" ? isUnknown(f) :
                  isPending(f);
                const rows = allFilings.filter(matchesBucket);
                const escape = (v: string | null | undefined) => {
                  const s = v == null ? "" : String(v);
                  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
                };
                const handleExport = () => {
                  const header = ["Source", "Due date", "Filed date", "Status"];
                  const body = rows.map((f) => [
                    escape(f._src),
                    escape(f.due_date),
                    escape(f.filed_date ?? ""),
                    escape(f.status),
                  ].join(","));
                  const csv = [header.join(","), ...body].join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `compliance-${breakdownFilter}-${format(new Date(), "yyyy-MM-dd")}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                };
                const handleExportReasonsCsv = () => {
                  const header = ["Source", "Due date", "Filed date", "Status", "Classification", "Rule", "Explanation"];
                  const body = rows.map((f) => {
                    const exp = explainFiling(f);
                    return [
                      escape(f._src),
                      escape(f.due_date),
                      escape(f.filed_date ?? ""),
                      escape(f.status),
                      escape(exp.label),
                      escape(exp.rule),
                      escape(exp.detail),
                    ].join(",");
                  });
                  const csv = [header.join(","), ...body].join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `compliance-${breakdownFilter}-reasons-${format(new Date(), "yyyy-MM-dd")}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                };
                const escapeHtml = (v: string | null | undefined) => {
                  const s = v == null ? "" : String(v);
                  return s
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;");
                };
                const handleExportReasonsPdf = () => {
                  const today = format(new Date(), "dd MMM yyyy");
                  const rowsHtml = rows.map((f) => {
                    const exp = explainFiling(f);
                    return `<tr>
                      <td>${escapeHtml(f._src)}</td>
                      <td>${escapeHtml(f.due_date)}</td>
                      <td>${escapeHtml(f.filed_date ?? "—")}</td>
                      <td>${escapeHtml(f.status)}</td>
                      <td><span class="lbl" style="background:${exp.color}1A;color:${exp.color}">${escapeHtml(exp.label)}</span></td>
                      <td><code>${escapeHtml(exp.rule)}</code></td>
                      <td>${escapeHtml(exp.detail)}</td>
                    </tr>`;
                  }).join("");
                  const html = `<!doctype html><html><head><meta charset="utf-8" />
                    <title>Compliance reasons — ${escapeHtml(bucketLabel[breakdownFilter])} — ${today}</title>
                    <style>
                      body { font-family: Inter, system-ui, -apple-system, sans-serif; color: #1A1008; padding: 24px; }
                      h1 { font-family: Georgia, serif; font-size: 20px; margin: 0 0 4px; }
                      .meta { color: rgba(26,16,8,0.6); font-size: 12px; margin-bottom: 16px; }
                      table { width: 100%; border-collapse: collapse; font-size: 11px; }
                      th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid rgba(26,16,8,0.1); vertical-align: top; }
                      th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(26,16,8,0.5); }
                      code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; }
                      .lbl { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
                      @media print { body { padding: 12mm; } }
                    </style></head><body>
                    <h1>Compliance — ${escapeHtml(bucketLabel[breakdownFilter])} reasons</h1>
                    <p class="meta">${rows.length} filing${rows.length === 1 ? "" : "s"} · Period ${escapeHtml(fromStr)} to ${escapeHtml(toStr)} · Generated ${today}</p>
                    <table>
                      <thead><tr>
                        <th>Source</th><th>Due date</th><th>Filed date</th><th>Status</th>
                        <th>Classification</th><th>Rule</th><th>Explanation</th>
                      </tr></thead>
                      <tbody>${rowsHtml}</tbody>
                    </table>
                    <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));<\/script>
                    </body></html>`;
                  const w = window.open("", "_blank", "noopener,noreferrer");
                  if (!w) return;
                  w.document.open();
                  w.document.write(html);
                  w.document.close();
                };
                return (
                  <>
                    <button
                      onClick={handleExport}
                      disabled={rows.length === 0}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-fyn-ink-10 rounded hover:border-fyn-ink/30 hover:bg-white/40 text-fyn-ink disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Export ${rows.length} ${bucketLabel[breakdownFilter]} filing${rows.length === 1 ? "" : "s"} as CSV`}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export breakdown CSV ({rows.length})
                    </button>
                    <button
                      onClick={handleExportReasonsCsv}
                      disabled={rows.length === 0}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-fyn-ink-10 rounded hover:border-fyn-ink/30 hover:bg-white/40 text-fyn-ink disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Export ${rows.length} explained ${bucketLabel[breakdownFilter]} filing${rows.length === 1 ? "" : "s"} as CSV`}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export reasons CSV
                    </button>
                    <button
                      onClick={handleExportReasonsPdf}
                      disabled={rows.length === 0}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-fyn-ink-10 rounded hover:border-fyn-ink/30 hover:bg-white/40 text-fyn-ink disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Export ${rows.length} explained ${bucketLabel[breakdownFilter]} filing${rows.length === 1 ? "" : "s"} as PDF`}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export reasons PDF
                    </button>
                  </>
                );
              })()}
              {breakdownFilter && (
                <button onClick={() => setBreakdownFilter(null)} className="text-fyn-ink/60 text-xs hover:text-fyn-ink">
                  Clear filter ✕
                </button>
              )}
            </div>
          </div>

          <div className={cn("grid grid-cols-2 gap-2 mb-4", unknownCount > 0 ? "md:grid-cols-5" : "md:grid-cols-4") }>
            {[
              { key: "on-time" as const, label: "On time", count: onTimeCount, color: "#1A6B3C" },
              { key: "late" as const, label: "Filed late", count: lateCount, color: "#8B5A00" },
              { key: "overdue" as const, label: "Overdue", count: overdueCount, color: "#C41E1E" },
              { key: "pending" as const, label: "Pending", count: pendingCount, color: "#1A1008" },
              ...(unknownCount > 0 ? [{ key: "unknown" as const, label: "Unknown", count: unknownCount, color: "#475569" }] : []),
            ].map((b) => {
              const active = breakdownFilter === b.key;
              const denom = b.key === "unknown" ? totalFilings : scoredTotal;
              return (
                <button
                  key={b.key}
                  onClick={() => setBreakdownFilter(active ? null : b.key)}
                  className={cn(
                    "text-left border rounded-md p-3 transition-colors",
                    active ? "border-fyn-ink bg-white/60" : "border-fyn-ink-10 hover:border-fyn-ink/30 bg-white/30"
                  )}
                >
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: b.color }}>{b.label}</p>
                  <p className="text-2xl font-bold font-sans mt-1" style={{ color: b.color }}>{b.count}</p>
                  <p className="text-fyn-ink/40 text-[10px] mt-1">
                    {denom > 0 ? Math.round((b.count / denom) * 100) : 0}% {b.key === "unknown" ? "of all rows" : "of scored"}
                  </p>
                </button>
              );
            })}
          </div>

          {breakdownFilter && (
            <div className="border-t border-fyn-ink-10 pt-3">
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <p className="text-fyn-ink/60 text-xs">
                  Filings classified as <span className="font-medium text-fyn-ink">{breakdownFilter}</span>:
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <button
                    onClick={() => {
                      const qs = new URLSearchParams({ from: fromStr, to: toStr });
                      if (breakdownFilter) qs.set("bucket", breakdownFilter);
                      navigate(`/dashboard/gst?${qs.toString()}`);
                    }}
                    className="text-fyn-ink/70 hover:text-fyn-ink underline underline-offset-2"
                  >
                    View full GST page →
                  </button>
                  <button
                    onClick={() => {
                      const qs = new URLSearchParams({ from: fromStr, to: toStr });
                      if (breakdownFilter) qs.set("bucket", breakdownFilter);
                      navigate(`/dashboard/tds-tax?${qs.toString()}`);
                    }}
                    className="text-fyn-ink/70 hover:text-fyn-ink underline underline-offset-2"
                  >
                    View full TDS page →
                  </button>
                </div>
              </div>
              <div ref={breakdownTableRef} className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-fyn-ink/50 text-[11px] uppercase">
                      <th className="py-2 w-6"></th>
                      <th className="py-2">Source</th>
                      <th className="py-2">Due Date</th>
                      <th className="py-2">Filed Date</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFilings
                      .filter((f) =>
                        breakdownFilter === "on-time" ? isOnTime(f) :
                        breakdownFilter === "late" ? isLate(f) :
                        breakdownFilter === "overdue" ? isOverdueNotFiled(f) :
                        breakdownFilter === "unknown" ? isUnknown(f) :
                        isPending(f)
                      )
                      .sort((a, b) => ((a.due_date || "") < (b.due_date || "") ? 1 : -1))
                      .map((f, i) => {
                        const rowKey = `${f._src}-${i}-${f.due_date}`;
                        const expanded = expandedRow === rowKey;
                        const exp = explainFiling(f);
                        return (
                          <Fragment key={rowKey}>
                            <tr
                              key={rowKey}
                              className="border-t border-fyn-ink-10 cursor-pointer hover:bg-white/40"
                              onClick={() => setExpandedRow(expanded ? null : rowKey)}
                            >
                              <td className="py-2 text-fyn-ink/50">
                                {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                              </td>
                              <td className="py-2 font-medium">{f._src}</td>
                              <td className="py-2">{f.due_date}</td>
                              <td className="py-2">{f.filed_date || "—"}</td>
                              <td className="py-2">{f.status}</td>
                            </tr>
                            {expanded && (() => {
                              // Delta vs due date: filed_date if available, else today (for not-yet-filed rows).
                              // Negative = before due (good), positive = after due (bad), zero = exactly on due.
                              const ref = f.filed_date || todayStr;
                              const hasDue = !!f.due_date;
                              const delta = hasDue ? daysBetween(ref, f.due_date as string) : null;
                              const refLabel = f.filed_date ? "filed" : "today";
                              const badge = (() => {
                                if (delta === null) {
                                  return { sign: "?", color: "#475569", text: "no due date" };
                                }
                                if (delta < 0) {
                                  return {
                                    sign: `−${Math.abs(delta)}d`,
                                    color: "#1A6B3C",
                                    text: `${refLabel} ${Math.abs(delta)} day${Math.abs(delta) === 1 ? "" : "s"} before due`,
                                  };
                                }
                                if (delta > 0) {
                                  return {
                                    sign: `+${delta}d`,
                                    color: "#C41E1E",
                                    text: `${refLabel} ${delta} day${delta === 1 ? "" : "s"} after due`,
                                  };
                                }
                                return { sign: "0d", color: "#8B5A00", text: `${refLabel} exactly on due date` };
                              })();
                              return (
                                <tr key={`${rowKey}-exp`} className="bg-white/30">
                                  <td></td>
                                  <td colSpan={4} className="py-3 pr-3">
                                    <div className="text-xs space-y-1.5">
                                      <p className="flex flex-wrap items-center gap-2">
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: `${exp.color}1A`, color: exp.color }}>
                                          {exp.label}
                                        </span>
                                        <span
                                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border"
                                          style={{ background: `${badge.color}14`, color: badge.color, borderColor: `${badge.color}40` }}
                                          title={badge.text}
                                          aria-label={badge.text}
                                        >
                                          {badge.sign}
                                        </span>
                                        <span className="text-fyn-ink/70">{exp.detail}</span>
                                      </p>
                                      <p className="font-mono text-fyn-ink/60">
                                        Rule: <span className="text-fyn-ink">{exp.rule}</span>
                                      </p>
                                      <p className="font-mono text-fyn-ink/60">
                                        due_date = <span className="text-fyn-ink">{f.due_date}</span>
                                        {"  ·  "}
                                        filed_date = <span className="text-fyn-ink">{f.filed_date || "null"}</span>
                                        {"  ·  "}
                                        status = <span className="text-fyn-ink">{f.status}</span>
                                        {"  ·  "}
                                        today = <span className="text-fyn-ink">{todayStr}</span>
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })()}
                          </Fragment>
                        );
                      })}
                    {allFilings.filter((f) =>
                      breakdownFilter === "on-time" ? isOnTime(f) :
                      breakdownFilter === "late" ? isLate(f) :
                      breakdownFilter === "overdue" ? isOverdueNotFiled(f) :
                      breakdownFilter === "unknown" ? isUnknown(f) :
                      isPending(f)
                    ).length === 0 && (() => {
                      const empty: Record<string, { title: string; body: string; emoji: string }> = {
                        "on-time": { emoji: "🎯", title: "No on-time filings in this range", body: "Nothing was filed on or before its due date for the selected period." },
                        late: { emoji: "✅", title: "No late filings — nice work", body: "Every filed return for this period went out on time." },
                        overdue: { emoji: "🎉", title: "No overdue filings", body: "All past-due returns have been filed. You're caught up." },
                        pending: { emoji: "📭", title: "No upcoming pending filings", body: "Nothing is due later in the selected window." },
                        unknown: { emoji: "✨", title: "No rows missing a due date", body: "Every filing in this period has a valid due date on record." },
                      };
                      const e = empty[breakdownFilter ?? "pending"];
                      return (
                        <tr>
                          <td colSpan={5} className="py-10">
                            <div className="flex flex-col items-center text-center gap-3">
                              <div className="text-3xl" aria-hidden>{e.emoji}</div>
                              <div>
                                <p className="text-fyn-ink text-sm font-medium">{e.title}</p>
                                <p className="text-fyn-ink/60 text-xs mt-1 max-w-sm">{e.body}</p>
                              </div>
                              <button
                                onClick={() => setBreakdownFilter(null)}
                                className="mt-1 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-fyn-ink-10 rounded hover:border-fyn-ink/30 hover:bg-white/50 text-fyn-ink"
                              >
                                Reset filter
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

type TroubleshootingCardProps = {
  navigate: (path: string) => void;
  missingGst: boolean;
  missingTds: boolean;
  compact?: boolean;
};

const TroubleshootingCard = ({ navigate, missingGst, missingTds, compact }: TroubleshootingCardProps) => {
  const items: { label: string; href: string; show: boolean }[] = [
    {
      label: "Verify your GSTIN in Business Profile",
      href: "/dashboard/settings/business-profile",
      show: missingGst,
    },
    {
      label: "Re-link the GST portal connection",
      href: "/onboarding?step=gst",
      show: missingGst,
    },
    {
      label: "Add your TAN and re-link TRACES",
      href: "/onboarding?step=tds",
      show: missingTds,
    },
    {
      label: "Check accounting integration sync status",
      href: "/dashboard/settings/integrations",
      show: missingGst || missingTds,
    },
    {
      label: "Confirm the selected date range covers a filing period",
      href: "#",
      show: true,
    },
  ].filter((i) => i.show);

  return (
    <div
      className={cn(
        "rounded-lg border border-fyn-ink-10 bg-fyn-beige-dark",
        compact ? "mt-4 p-4" : "mt-4 p-5 text-left"
      )}
    >
      <p className="text-fyn-ink/40 text-[11px] fyn-label mb-2">WHY AM I MISSING FILINGS?</p>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i.label} className="flex items-start gap-2 text-xs text-fyn-ink/80">
            <span className="text-fyn-ink/40 mt-0.5">•</span>
            {i.href === "#" ? (
              <span>{i.label}</span>
            ) : (
              <button
                onClick={() => navigate(i.href)}
                className="text-left hover:text-fyn-ink hover:underline transition-colors"
              >
                {i.label} →
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompliancePage;

