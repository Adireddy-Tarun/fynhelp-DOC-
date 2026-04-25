import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";

interface GSTFiling {
  id: string;
  business_id: string;
  return_type: string;
  filing_period: string;
  due_date: string;
  filed_date: string | null;
  status: string;
  taxable_sales: number | null;
  output_tax: number | null;
  input_tax_credit: number | null;
  tax_payable: number | null;
  arn_number: string | null;
  acknowledgement_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const GSTPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const isValidDate = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const fromFilter = isValidDate(fromParam) ? (fromParam as string) : null;
  const toFilter = isValidDate(toParam) ? (toParam as string) : null;
  const hasDateFilter = !!(fromFilter || toFilter);
  const fmtRange = (s: string) =>
    new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const clearDateFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("from");
    next.delete("to");
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

  const { data: gstFilings, isLoading } = useQuery({
    queryKey: ["gst-filings", businessId],
    queryFn: async (): Promise<GSTFiling[]> => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("gst_filings" as never)
        .select("*")
        .eq("business_id", businessId)
        .order("due_date", { ascending: false })
        .limit(12);
      return ((data as unknown) as GSTFiling[]) || [];
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
    ? (gstFilings || []).filter((f) => inRange(f.due_date))
    : gstFilings || [];
  const upcomingFilings = visibleFilings.filter((f) => new Date(f.due_date) >= now && f.status === "pending");
  const overdueFilings = visibleFilings.filter((f) => new Date(f.due_date) < now && f.status === "pending");
  const totalTaxPayable = visibleFilings.reduce((sum, f) => sum + Number(f.tax_payable || 0), 0);
  const totalInputCredit = visibleFilings.reduce((sum, f) => sum + Number(f.input_tax_credit || 0), 0);

  const isEmpty = !isLoading && (!gstFilings || gstFilings.length === 0);
  const isFilteredEmpty = !isLoading && !isEmpty && hasDateFilter && visibleFilings.length === 0;

  const getStatusStyle = (filing: GSTFiling) => {
    const dueDate = new Date(filing.due_date);
    const isOverdue = dueDate < now && filing.status === "pending";
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
          <p className="text-white/40 text-[11px] mt-1">Next 90 days</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-[13px] fyn-label">OVERDUE FILINGS</p>
          <p className={`text-[28px] font-bold mt-1 font-sans ${overdueFilings.length > 0 ? "text-[#C41E1E]" : "text-white"}`}>
            {overdueFilings.length}
          </p>
          <p className="text-white/40 text-[11px] mt-1">
            {overdueFilings.length > 0 ? "Requires attention" : "All on track"}
          </p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-[13px] fyn-label">TAX PAYABLE (YTD)</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">{formatINR(totalTaxPayable)}</p>
          <p className="text-white/40 text-[11px] mt-1">Across all returns</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-[13px] fyn-label">INPUT TAX CREDIT</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">{formatINR(totalInputCredit)}</p>
          <p className="text-white/40 text-[11px] mt-1">Total ITC claimed</p>
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
          <h3 className="text-fyn-ink text-xl font-serif mb-2">No GST Data</h3>
          <p className="text-fyn-ink/60 text-sm mb-6">
            GST filings will appear here once you connect your accounting system or add them manually
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
          <h3 className="text-fyn-ink text-lg font-serif mb-1">No GST filings in this date range</h3>
          <p className="text-fyn-ink/60 text-xs mb-5 max-w-md mx-auto">
            You have {gstFilings?.length || 0} GST filing{(gstFilings?.length || 0) === 1 ? "" : "s"} on record, but none fall between
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
          <h3 className="text-fyn-ink font-serif text-lg mb-4">GST Returns</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
                  <th className="text-left py-2">Return Type</th>
                  <th className="text-left py-2">Period</th>
                  <th className="text-left py-2">Due Date</th>
                  <th className="text-right py-2">Taxable Sales</th>
                  <th className="text-right py-2">Tax Payable</th>
                  <th className="text-right py-2">ITC</th>
                  <th className="text-center py-2">Status</th>
                  <th className="text-left py-2">ARN</th>
                </tr>
              </thead>
              <tbody>
                {visibleFilings.map((f, i) => {
                  const badge = getStatusStyle(f);
                  return (
                    <tr key={f.id} className={`border-b border-fyn-ink-10 last:border-0 ${i % 2 === 0 ? "bg-[#FAF7F0]" : "bg-white"}`}>
                      <td className="py-3 text-fyn-ink font-medium">{f.return_type}</td>
                      <td className="py-3 text-fyn-ink/70">{f.filing_period}</td>
                      <td className="py-3 text-fyn-ink/70 fyn-metric">
                        {new Date(f.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 text-right fyn-metric">{f.taxable_sales ? formatINR(Number(f.taxable_sales)) : "—"}</td>
                      <td className="py-3 text-right fyn-metric">{f.tax_payable ? formatINR(Number(f.tax_payable)) : "—"}</td>
                      <td className="py-3 text-right fyn-metric">{f.input_tax_credit ? formatINR(Number(f.input_tax_credit)) : "—"}</td>
                      <td className="py-3 text-center">
                        <span className={`text-[11px] px-2 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
                      </td>
                      <td className="py-3 text-fyn-ink/70 fyn-metric">{f.arn_number || "—"}</td>
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

export default GSTPage;
