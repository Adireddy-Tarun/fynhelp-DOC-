import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";

type TdsFiling = {
  id: string;
  quarter: string | null;
  form_type: string | null;
  due_date: string;
  total_tds_deducted: number | null;
  total_tds_deposited: number | null;
  status: string | null;
};

const TDSTaxPage = () => {
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

  const { data: tdsFilings, isLoading } = useQuery({
    queryKey: ["tds-filings", businessId],
    queryFn: async (): Promise<TdsFiling[]> => {
      // tds_filings table not yet provisioned — return empty until backend is ready
      return [];
    },
    enabled: !!businessId,
  });

  const now = new Date();
  const upcomingFilings = tdsFilings?.filter((f) => new Date(f.due_date) >= now && f.status === "pending") || [];
  const overdueFilings = tdsFilings?.filter((f) => new Date(f.due_date) < now && f.status === "pending") || [];
  const totalDeducted = tdsFilings?.reduce((sum, f) => sum + Number(f.total_tds_deducted || 0), 0) || 0;
  const totalDeposited = tdsFilings?.reduce((sum, f) => sum + Number(f.total_tds_deposited || 0), 0) || 0;

  const isEmpty = !isLoading && (!tdsFilings || tdsFilings.length === 0);

  return (
    <DashboardLayout>
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
            className="bg-fyn-ink text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-fyn-ink/90 transition-colors"
          >
            Connect Accounting →
          </button>
        </div>
      )}

      {/* TABLE */}
      {!isLoading && tdsFilings && tdsFilings.length > 0 && (
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
          <h3 className="text-fyn-ink font-serif text-lg mb-4">TDS Filings</h3>
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
                </tr>
              </thead>
              <tbody>
                {tdsFilings.map((f, i) => (
                  <tr key={f.id} className={`border-b border-fyn-ink-10 last:border-0 ${i % 2 === 0 ? "bg-[#FAF7F0]" : "bg-white"}`}>
                    <td className="py-3 text-fyn-ink font-medium">{f.quarter || "—"}</td>
                    <td className="py-3 text-fyn-ink/70">{f.form_type || "—"}</td>
                    <td className="py-3 text-fyn-ink/70 fyn-metric">{new Date(f.due_date).toLocaleDateString("en-IN")}</td>
                    <td className="py-3 text-right fyn-metric">{formatINR(Number(f.total_tds_deducted || 0))}</td>
                    <td className="py-3 text-right fyn-metric">{formatINR(Number(f.total_tds_deposited || 0))}</td>
                    <td className="py-3 text-center">
                      <span className={`text-[11px] px-2 py-0.5 rounded ${
                        f.status === "filed" ? "bg-[#1A6B3C]/10 text-[#1A6B3C]" :
                        f.status === "late" ? "bg-[#C41E1E]/10 text-[#C41E1E]" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {f.status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TDSTaxPage;
