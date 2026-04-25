import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type FilingRow = { status: string; due_date: string; filed_date?: string | null };

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
    queryFn: async (): Promise<FilingRow[]> => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("gst_filings" as never)
        .select("status, due_date, filed_date")
        .eq("business_id", businessId)
        .gte("due_date", threeMonthsAgo);
      return ((data as unknown) as FilingRow[]) || [];
    },
    enabled: !!businessId,
  });

  const { data: tdsFilings, isLoading: loadingTds } = useQuery({
    queryKey: ["compliance-tds", businessId],
    queryFn: async (): Promise<FilingRow[]> => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("tds_filings" as never)
        .select("status, due_date")
        .eq("business_id", businessId)
        .gte("due_date", threeMonthsAgo);
      return ((data as unknown) as FilingRow[]) || [];
    },
    enabled: !!businessId,
  });

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
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6">
            <p className="text-fyn-ink/40 text-[12px] fyn-label mb-2">GST FILINGS</p>
            <p className="text-fyn-ink text-[28px] font-bold font-sans">
              {gstFiled}<span className="text-fyn-ink/40 text-lg font-normal">/{gstTotal}</span>
            </p>
            <p className="text-fyn-ink/60 text-xs mt-2">filed on time</p>
            <div className="w-full bg-fyn-ink/10 rounded-full h-2 mt-3">
              <div
                className="bg-[#1A6B3C] h-2 rounded-full transition-all"
                style={{ width: gstTotal > 0 ? `${(gstFiled / gstTotal) * 100}%` : "0%" }}
              />
            </div>
          </div>

          {/* TDS */}
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6">
            <p className="text-fyn-ink/40 text-[12px] fyn-label mb-2">TDS FILINGS</p>
            <p className="text-fyn-ink text-[28px] font-bold font-sans">
              {tdsFiled}<span className="text-fyn-ink/40 text-lg font-normal">/{tdsTotal}</span>
            </p>
            <p className="text-fyn-ink/60 text-xs mt-2">filed on time</p>
            <div className="w-full bg-fyn-ink/10 rounded-full h-2 mt-3">
              <div
                className="bg-[#1A6B3C] h-2 rounded-full transition-all"
                style={{ width: tdsTotal > 0 ? `${(tdsFiled / tdsTotal) * 100}%` : "0%" }}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CompliancePage;
