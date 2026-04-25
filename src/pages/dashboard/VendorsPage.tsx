import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/indian-format";

type VendorRow = {
  name: string;
  totalSpend: number;
  outstanding: number;
  billCount: number;
  lastPayment: string | null;
};

const VendorsPage = () => {
  const navigate = useNavigate();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  const { data: vendors, isLoading } = useQuery<VendorRow[]>({
    queryKey: ["vendors-list", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data: payables } = await supabase
        .from("payables")
        .select("vendor_name, amount, outstanding, status, due_date")
        .eq("business_id", businessId);

      if (!payables) return [];

      const vendorMap: Record<string, VendorRow> = {};
      payables.forEach((p) => {
        const name = p.vendor_name;
        if (!vendorMap[name]) {
          vendorMap[name] = {
            name,
            totalSpend: 0,
            outstanding: 0,
            billCount: 0,
            lastPayment: p.due_date,
          };
        }
        vendorMap[name].totalSpend += Number(p.amount || 0);
        vendorMap[name].outstanding += Number(p.outstanding || 0);
        vendorMap[name].billCount += 1;
        if (p.due_date && (!vendorMap[name].lastPayment || p.due_date > (vendorMap[name].lastPayment as string))) {
          vendorMap[name].lastPayment = p.due_date;
        }
      });

      return Object.values(vendorMap).sort((a, b) => b.totalSpend - a.totalSpend);
    },
    enabled: !!businessId,
  });

  const totalVendors = vendors?.length || 0;
  const totalSpend = vendors?.reduce((sum, v) => sum + v.totalSpend, 0) || 0;
  const totalOutstanding = vendors?.reduce((sum, v) => sum + v.outstanding, 0) || 0;

  const filtered = (vendors || []).filter((v) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg animate-pulse" style={{ background: "rgba(26,16,8,0.06)", height: 110 }} />
          ))}
        </div>
        <div className="rounded-lg animate-pulse" style={{ background: "rgba(26,16,8,0.06)", height: 380 }} />
      </DashboardLayout>
    );
  }

  if (!vendors || vendors.length === 0) {
    return (
      <DashboardLayout>
        <div className="rounded-lg p-12 text-center" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
          <div className="mx-auto mb-6 flex items-center justify-center" style={{ width: 64, height: 64, background: "#F4EDDA", border: "1px solid #1A1008", boxShadow: "inset 0 -2px 0 0 #C41E1E", color: "#C41E1E" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" shapeRendering="crispEdges">
              <path d="M3 7h18v13H3zM8 7V4h8v3" />
            </svg>
          </div>
          <h2 className="font-serif text-fyn-ink" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No Vendors Yet</h2>
          <p style={{ fontSize: 14, color: "rgba(26,16,8,0.60)", marginBottom: 20 }}>
            Upload expense CSV to see vendor analytics
          </p>
          <button
            onClick={() => navigate("/dashboard/data-import")}
            className="inline-flex items-center gap-2 transition-colors hover:opacity-90"
            style={{ background: "#C41E1E", color: "#FFFFFF", padding: "10px 20px", borderRadius: 6, fontSize: 14, fontWeight: 500 }}
          >
            Upload Expenses →
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg" style={{ background: "#1A1008", padding: "20px 24px" }}>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Vendors</p>
          <p className="fyn-metric" style={{ color: "#FFFFFF", fontSize: 28, fontWeight: 700, marginTop: 4 }}>{totalVendors}</p>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 12, marginTop: 4 }}>Across all bills</p>
        </div>
        <div className="rounded-lg" style={{ background: "#1A1008", padding: "20px 24px" }}>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Spend</p>
          <p className="fyn-metric" style={{ color: "#FFFFFF", fontSize: 28, fontWeight: 700, marginTop: 4 }}>
            ₹{totalSpend.toLocaleString("en-IN")}
          </p>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 12, marginTop: 4 }}>Lifetime billed amount</p>
        </div>
        <div className="rounded-lg" style={{ background: "#1A1008", padding: "20px 24px" }}>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Outstanding</p>
          <p className="fyn-metric" style={{ color: totalOutstanding > 0 ? "#F87171" : "#FFFFFF", fontSize: 28, fontWeight: 700, marginTop: 4 }}>
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </p>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 12, marginTop: 4 }}>Across all vendors</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-fyn-ink font-serif" style={{ fontSize: 15 }}>Vendors</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-lg" style={{ background: "#FAF7F0" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor name…"
            className="outline-none flex-1 min-w-[160px]"
            style={{ height: 36, padding: "0 12px", background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)", borderRadius: 4, fontSize: 13 }}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center" style={{ fontSize: 14, color: "rgba(26,16,8,0.50)" }}>
            No vendors match the current search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(26,16,8,0.10)" }}>
                  {["Vendor Name", "Total Spend", "Outstanding", "Bill Count", "Last Payment"].map((h, i) => (
                    <th key={h} className={`py-2 ${i === 1 || i === 2 || i === 3 ? "text-right" : "text-left"}`} style={{ fontSize: 12, color: "rgba(26,16,8,0.45)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => (
                  <tr
                    key={v.name}
                    style={{
                      borderBottom: "1px solid rgba(26,16,8,0.06)",
                      background: i % 2 === 0 ? "#FFFFFF" : "#FAF7F0",
                    }}
                  >
                    <td className="py-3" style={{ fontSize: 14, fontWeight: 500, color: "#1A1008" }}>{v.name}</td>
                    <td className="py-3 text-right fyn-metric" style={{ fontSize: 14, color: "rgba(26,16,8,0.80)" }}>
                      {formatINR(v.totalSpend)}
                    </td>
                    <td className="py-3 text-right fyn-metric" style={{ fontSize: 14, fontWeight: 600, color: v.outstanding > 0 ? "#C41E1E" : "rgba(26,16,8,0.40)" }}>
                      {formatINR(v.outstanding)}
                    </td>
                    <td className="py-3 text-right" style={{ fontSize: 13, color: "rgba(26,16,8,0.60)" }}>{v.billCount}</td>
                    <td className="py-3" style={{ fontSize: 13, color: "rgba(26,16,8,0.60)" }}>
                      {v.lastPayment
                        ? new Date(v.lastPayment).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VendorsPage;
