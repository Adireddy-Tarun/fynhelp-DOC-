import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";

type FilingRow = { status: string; due_date: string };

const CompliancePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["compliance-gst", businessId] });
    await queryClient.invalidateQueries({ queryKey: ["compliance-tds", businessId] });
    setIsRefreshing(false);
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

  const threeMonthsAgo = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split("T")[0];
  })();

  const { data: gstFilings, isLoading: loadingGst } = useQuery({
    queryKey: ["compliance-gst", businessId],
    queryFn: async (): Promise<any[]> => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("gst_filings" as never)
        .select("status, due_date, filed_date, return_type, filing_period")
        .eq("business_id", businessId)
        .gte("due_date", threeMonthsAgo)
        .order("due_date", { ascending: false });
      return ((data as unknown) as any[]) || [];
    },
    enabled: !!businessId,
  });

  const { data: tdsFilings, isLoading: loadingTds } = useQuery({
    queryKey: ["compliance-tds", businessId],
    queryFn: async (): Promise<any[]> => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("tds_filings" as never)
        .select("status, due_date, filed_date, form_type, quarter")
        .eq("business_id", businessId)
        .gte("due_date", threeMonthsAgo)
        .order("due_date", { ascending: false });
      return ((data as unknown) as any[]) || [];
    },
    enabled: !!businessId,
  });

  const [openTable, setOpenTable] = useState<"gst" | "tds" | null>(null);

  const isLoading = loadingGst || loadingTds;
  const allFilings = [...(gstFilings || []), ...(tdsFilings || [])];
  const totalFilings = allFilings.length;
  const filedOnTime = allFilings.filter((f) => f.status === "filed").length;
  const complianceScore = totalFilings > 0 ? Math.round((filedOnTime / totalFilings) * 100) : 0;

  const gstFiled = gstFilings?.filter((f) => f.status === "filed").length || 0;
  const gstTotal = gstFilings?.length || 0;
  const tdsFiled = tdsFilings?.filter((f) => f.status === "filed").length || 0;
  const tdsTotal = tdsFilings?.length || 0;

  const isEmpty = !isLoading && totalFilings === 0;

  const scoreColor =
    complianceScore > 80 ? "#1A6B3C" : complianceScore > 50 ? "#8B5A00" : "#C41E1E";

  return (
    <DashboardLayout>
      <div className="flex justify-end mb-4">
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
          </div>

          {/* GST */}
          <button
            type="button"
            onClick={() => setOpenTable(openTable === "gst" ? null : "gst")}
            className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6 text-left hover:border-fyn-ink/30 transition-colors"
          >
            <p className="text-fyn-ink/40 text-[12px] fyn-label mb-2">GST FILINGS {openTable === "gst" ? "▾" : "▸"}</p>
            <p className="text-fyn-ink text-[28px] font-bold font-sans">
              {gstFiled}<span className="text-fyn-ink/40 text-lg font-normal">/{gstTotal}</span>
            </p>
            <p className="text-fyn-ink/60 text-xs mt-2">filed on time · click to view</p>
            <div className="w-full bg-fyn-ink/10 rounded-full h-2 mt-3">
              <div
                className="bg-[#1A6B3C] h-2 rounded-full transition-all"
                style={{ width: gstTotal > 0 ? `${(gstFiled / gstTotal) * 100}%` : "0%" }}
              />
            </div>
          </button>

          {/* TDS */}
          <button
            type="button"
            onClick={() => setOpenTable(openTable === "tds" ? null : "tds")}
            className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6 text-left hover:border-fyn-ink/30 transition-colors"
          >
            <p className="text-fyn-ink/40 text-[12px] fyn-label mb-2">TDS FILINGS {openTable === "tds" ? "▾" : "▸"}</p>
            <p className="text-fyn-ink text-[28px] font-bold font-sans">
              {tdsFiled}<span className="text-fyn-ink/40 text-lg font-normal">/{tdsTotal}</span>
            </p>
            <p className="text-fyn-ink/60 text-xs mt-2">filed on time · click to view</p>
            <div className="w-full bg-fyn-ink/10 rounded-full h-2 mt-3">
              <div
                className="bg-[#1A6B3C] h-2 rounded-full transition-all"
                style={{ width: tdsTotal > 0 ? `${(tdsFiled / tdsTotal) * 100}%` : "0%" }}
              />
            </div>
          </button>
        </div>
      )}

      {!isLoading && openTable && (
        <div className="mt-4 bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-fyn-ink-10 flex items-center justify-between">
            <h3 className="text-fyn-ink font-serif text-lg">
              {openTable === "gst" ? "GST Filings" : "TDS Filings"} (last 3 months)
            </h3>
            <button onClick={() => setOpenTable(null)} className="text-fyn-ink/60 text-sm hover:text-fyn-ink">Close ✕</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-fyn-ink/50 text-[11px] uppercase tracking-wide">
                  <th className="py-3 px-6">{openTable === "gst" ? "Return / Period" : "Form / Quarter"}</th>
                  <th className="py-3 px-6">Due Date</th>
                  <th className="py-3 px-6">Filed Date</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {(openTable === "gst" ? gstFilings : tdsFilings)?.map((f: any, i: number) => {
                  const statusColor =
                    f.status === "filed" ? "bg-[#1A6B3C]/10 text-[#1A6B3C]" :
                    f.status === "overdue" || f.status === "late" ? "bg-[#C41E1E]/10 text-[#C41E1E]" :
                    "bg-[#8B5A00]/10 text-[#8B5A00]";
                  return (
                    <tr key={i} className="border-t border-fyn-ink-10">
                      <td className="py-3 px-6 font-medium">
                        {openTable === "gst" ? `${f.return_type} · ${f.filing_period}` : `${f.form_type} · ${f.quarter}`}
                      </td>
                      <td className="py-3 px-6">{f.due_date}</td>
                      <td className="py-3 px-6">{f.filed_date || "—"}</td>
                      <td className="py-3 px-6">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>{f.status}</span>
                      </td>
                    </tr>
                  );
                })}
                {(openTable === "gst" ? gstFilings : tdsFilings)?.length === 0 && (
                  <tr><td colSpan={4} className="py-6 px-6 text-center text-fyn-ink/50">No filings in this window.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CompliancePage;
