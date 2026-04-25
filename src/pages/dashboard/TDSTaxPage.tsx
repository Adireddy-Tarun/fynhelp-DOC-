import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";

type TdsFiling = {
  id: string;
  business_id: string;
  quarter: string;
  form_type: string;
  due_date: string;
  filed_date: string | null;
  status: string;
  total_tds_deducted: number | null;
  total_tds_deposited: number | null;
  acknowledgement_number: string | null;
  challan_number: string | null;
  notes: string | null;
};

const TDSTaxPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const isValidDate = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const fromFilter = isValidDate(fromParam) ? (fromParam as string) : null;
  const toFilter = isValidDate(toParam) ? (toParam as string) : null;
  const hasDateFilter = !!(fromFilter || toFilter);
  type Bucket = "on-time" | "late" | "overdue" | "pending" | "unknown";
  const validBuckets = ["on-time", "late", "overdue", "pending", "unknown"] as const;
  const bucketParam = searchParams.get("bucket");
  const bucketFilter: Bucket | null =
    bucketParam && (validBuckets as readonly string[]).includes(bucketParam)
      ? (bucketParam as Bucket)
      : null;
  const bucketMeta: Record<Bucket, { label: string; color: string }> = {
    "on-time": { label: "On time", color: "#1A6B3C" },
    late: { label: "Filed late", color: "#8B5A00" },
    overdue: { label: "Overdue", color: "#C41E1E" },
    pending: { label: "Pending", color: "#1A1008" },
    unknown: { label: "Unknown", color: "#475569" },
  };
  const fmtRange = (s: string) =>
    new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const clearDateFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("from");
    next.delete("to");
    setSearchParams(next, { replace: true });
  };
  const clearBucketFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("bucket");
    setSearchParams(next, { replace: true });
  };
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

  const { data: tdsFilings, isLoading } = useQuery({
    queryKey: ["tds-filings", businessId],
    queryFn: async (): Promise<TdsFiling[]> => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("tds_filings" as never)
        .select("*")
        .eq("business_id", businessId)
        .order("due_date", { ascending: false })
        .limit(12);
      return ((data as unknown) as TdsFiling[]) || [];
    },
    enabled: !!businessId,
  });

  const now = new Date();
  const inRange = (d: string | null | undefined) => {
    if (!d) return false;
    if (fromFilter && d < fromFilter) return false;
    if (toFilter && d > toFilter) return false;
    return true;
  };
  const visibleFilings = hasDateFilter
    ? (tdsFilings || []).filter((f) => inRange(f.due_date))
    : tdsFilings || [];
  const upcomingFilings = visibleFilings.filter((f) => new Date(f.due_date) >= now && f.status === "pending");
  const overdueFilings = visibleFilings.filter((f) => new Date(f.due_date) < now && f.status === "pending");
  const totalDeducted = visibleFilings.reduce((sum, f) => sum + Number(f.total_tds_deducted || 0), 0);
  const totalDeposited = visibleFilings.reduce((sum, f) => sum + Number(f.total_tds_deposited || 0), 0);

  const isEmpty = !isLoading && (!tdsFilings || tdsFilings.length === 0);
  const isFilteredEmpty = !isLoading && !isEmpty && hasDateFilter && visibleFilings.length === 0;

  // Bucket classification — mirrors CompliancePage rules.
  const todayStr = new Date().toISOString().split("T")[0];
  const classifyBucket = (f: TdsFiling): Bucket => {
    if (!f.due_date) return "unknown";
    const filed = f.status === "filed";
    if (filed && f.filed_date && f.filed_date <= f.due_date) return "on-time";
    if (filed) return "late";
    if (f.due_date < todayStr) return "overdue";
    return "pending";
  };
  const matchesBucket = (f: TdsFiling) => !bucketFilter || classifyBucket(f) === bucketFilter;
  const bucketMatchCount = bucketFilter ? visibleFilings.filter(matchesBucket).length : visibleFilings.length;
  const isBucketEmpty =
    !isLoading && !isEmpty && !isFilteredEmpty && !!bucketFilter && bucketMatchCount === 0;

  const getStatusStyle = (filing: TdsFiling) => {
    const isOverdue = new Date(filing.due_date) < now && filing.status === "pending";
    if (filing.status === "filed") return { label: "Filed", className: "bg-[#1A6B3C]/10 text-[#1A6B3C]" };
    if (isOverdue) return { label: "Late", className: "bg-[#C41E1E]/10 text-[#C41E1E]" };
    return { label: "Pending", className: "bg-gray-100 text-gray-500" };
  };

  return (
    <DashboardLayout>
      {hasDateFilter && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 px-3 py-2 bg-fyn-beige-card border border-fyn-ink-10 rounded-md text-xs">
          <span className="text-fyn-ink/70">
            Showing filings due
            {fromFilter && <> from <span className="text-fyn-ink font-medium">{fmtRange(fromFilter)}</span></>}
            {toFilter && <> to <span className="text-fyn-ink font-medium">{fmtRange(toFilter)}</span></>}.
          </span>
          <button
            onClick={clearDateFilter}
            className="text-fyn-ink/70 hover:text-fyn-ink underline underline-offset-2"
          >
            Clear date filter ✕
          </button>
        </div>
      )}
      {/* TOP METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-[13px] fyn-label">UPCOMING FILINGS</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">{upcomingFilings.length}</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-[13px] fyn-label">OVERDUE FILINGS</p>
          <p className={`text-[28px] font-bold mt-1 font-sans ${overdueFilings.length > 0 ? "text-[#C41E1E]" : "text-white"}`}>
            {overdueFilings.length}
          </p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-[13px] fyn-label">TOTAL TDS DEDUCTED</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">{formatINR(totalDeducted)}</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-[13px] fyn-label">TOTAL TDS DEPOSITED</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">{formatINR(totalDeposited)}</p>
        </div>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {isEmpty && (
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-12 text-center">
          <h3 className="text-fyn-ink text-xl font-serif mb-2">No TDS Data</h3>
          <p className="text-fyn-ink/60 text-sm mb-6">
            TDS filings will appear here once you connect your accounting system
          </p>
          <button
            onClick={() => navigate("/dashboard/settings/integrations")}
            className="bg-[#C41E1E] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Connect Accounting →
          </button>
        </div>
      )}

      {/* FILTERED EMPTY STATE — has data overall, but date range returned nothing */}
      {isFilteredEmpty && (
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-10 text-center">
          <div className="text-3xl mb-3" aria-hidden>📅</div>
          <h3 className="text-fyn-ink text-lg font-serif mb-1">No TDS filings in this date range</h3>
          <p className="text-fyn-ink/60 text-xs mb-5 max-w-md mx-auto">
            You have {tdsFilings?.length || 0} TDS filing{(tdsFilings?.length || 0) === 1 ? "" : "s"} on record, but none fall between
            {fromFilter && <> <span className="text-fyn-ink">{fmtRange(fromFilter)}</span></>}
            {fromFilter && toFilter && " and"}
            {toFilter && <> <span className="text-fyn-ink">{fmtRange(toFilter)}</span></>}.
            Try widening the period or clear the filter.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={clearDateFilter}
              className="bg-fyn-ink text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-fyn-ink/90 transition-colors"
            >
              Clear date filter
            </button>
            <button
              onClick={() => navigate("/dashboard/compliance")}
              className="border border-fyn-ink/20 text-fyn-ink px-4 py-2 rounded-md text-xs font-medium hover:bg-fyn-ink/5 transition-colors"
            >
              Back to Compliance
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      {!isLoading && visibleFilings.length > 0 && (
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
          <h3 className="text-fyn-ink font-serif text-lg mb-4">TDS Returns</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
                  <th className="text-left py-2">Quarter</th>
                  <th className="text-left py-2">Form Type</th>
                  <th className="text-left py-2">Due Date</th>
                  <th className="text-right py-2">TDS Deducted</th>
                  <th className="text-right py-2">TDS Deposited</th>
                  <th className="text-center py-2">Status</th>
                  <th className="text-left py-2">ACK Number</th>
                </tr>
              </thead>
              <tbody>
                {visibleFilings.map((f, i) => {
                  const badge = getStatusStyle(f);
                  return (
                    <tr key={f.id} className={`border-b border-fyn-ink-10 last:border-0 ${i % 2 === 0 ? "bg-[#FAF7F0]" : "bg-white"}`}>
                      <td className="py-3 text-fyn-ink font-medium">{f.quarter}</td>
                      <td className="py-3 text-fyn-ink/70">{f.form_type}</td>
                      <td className="py-3 text-fyn-ink/70 fyn-metric">
                        {new Date(f.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 text-right fyn-metric">{formatINR(Number(f.total_tds_deducted || 0))}</td>
                      <td className="py-3 text-right fyn-metric">{formatINR(Number(f.total_tds_deposited || 0))}</td>
                      <td className="py-3 text-center">
                        <span className={`text-[11px] px-2 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
                      </td>
                      <td className="py-3 text-fyn-ink/70 fyn-metric">{f.acknowledgement_number || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TDSTaxPage;
