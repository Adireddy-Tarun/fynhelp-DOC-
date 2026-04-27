import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CostPage = () => {
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

  const { data: payables, isLoading } = useQuery({
    queryKey: ["cost-payables", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("payables")
        .select("*")
        .eq("business_id", businessId)
        .order("due_date", { ascending: false });
      return data || [];
    },
    enabled: !!businessId,
  });

  if (isLoading || !businessId) {
    return (
      <DashboardLayout>
        <div className="text-fyn-ink/60 text-sm">Loading cost intelligence…</div>
      </DashboardLayout>
    );
  }

  if (!payables || payables.length === 0) {
    return (
      <DashboardLayout>
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-10 text-center">
          <h2 className="text-fyn-ink text-2xl font-sans font-semibold mb-2">
            No Cost Data
          </h2>
          <p className="text-fyn-ink/60 text-sm mb-6">
            Upload vendor bills to analyze your costs
          </p>
          <button
            onClick={() => navigate("/dashboard/data-import")}
            className="bg-fyn-red text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition"
          >
            Upload Data →
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const totalSpend = payables.reduce(
    (sum, p: any) => sum + (Number(p.amount) || 0),
    0
  );
  const totalOutstanding = payables.reduce(
    (sum, p: any) => sum + (Number(p.outstanding) || 0),
    0
  );

  const byCategory = payables.reduce((acc: Record<string, number>, p: any) => {
    const category = p.vendor_name || "Uncategorized";
    if (!acc[category]) acc[category] = 0;
    acc[category] += Number(p.amount) || 0;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(byCategory).sort(
    ([, a], [, b]) => (b as number) - (a as number)
  );
  const top5 = topCategories.slice(0, 5);

  const chartData = top5.map(([category, amount]) => ({
    category,
    amount: amount as number,
  }));

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-fyn-ink p-5 border-0">
          <p className="text-white/40 text-[13px] fyn-label">TOTAL SPEND</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">
            ₹{totalSpend.toLocaleString("en-IN")}
          </p>
        </Card>
        <Card className="bg-fyn-ink p-5 border-0">
          <p className="text-white/40 text-[13px] fyn-label">OUTSTANDING</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </p>
        </Card>
        <Card className="bg-fyn-ink p-5 border-0">
          <p className="text-white/40 text-[13px] fyn-label">TOP CATEGORY</p>
          <p className="text-white text-lg font-semibold mt-1 font-sans truncate">
            {topCategories[0]?.[0] || "—"}
          </p>
          <p className="text-white/70 text-sm mt-1 fyn-metric">
            ₹{((topCategories[0]?.[1] as number) || 0).toLocaleString("en-IN")}
          </p>
        </Card>
      </div>

      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
        <h3 className="text-fyn-ink text-lg mb-4 font-sans">
          Spend by Category
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
            <XAxis dataKey="category" fontSize={12} />
            <YAxis
              tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
              fontSize={12}
            />
            <Tooltip
              formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`}
            />
            <Bar dataKey="amount" fill="#C41E1E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
};

export default CostPage;
