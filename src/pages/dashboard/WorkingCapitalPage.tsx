import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet } from "lucide-react";

const WorkingCapitalPage = () => {
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  const { data: receivables, isLoading: rLoading } = useQuery({
    queryKey: ["wc-receivables", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("receivables")
        .select("outstanding")
        .eq("business_id", businessId);
      return data || [];
    },
    enabled: !!businessId,
  });

  const { data: payables, isLoading: pLoading } = useQuery({
    queryKey: ["wc-payables", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("payables")
        .select("outstanding")
        .eq("business_id", businessId);
      return data || [];
    },
    enabled: !!businessId,
  });

  const isLoading = rLoading || pLoading;

  const totalReceivables =
    receivables?.reduce((sum, r) => sum + (Number(r.outstanding) || 0), 0) || 0;
  const totalPayables =
    payables?.reduce((sum, p) => sum + (Number(p.outstanding) || 0), 0) || 0;
  const workingCapital = totalReceivables - totalPayables;
  const wcRatio =
    totalPayables > 0 ? (totalReceivables / totalPayables).toFixed(2) : "—";
  const isHealthy = workingCapital > 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <Skeleton className="h-32 rounded-lg mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (
    (!receivables || receivables.length === 0) &&
    (!payables || payables.length === 0)
  ) {
    return (
      <DashboardLayout>
        <Card className="p-12 text-center bg-fyn-beige-dark border-fyn-ink-10">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-fyn-beige flex items-center justify-center">
              <Wallet className="w-7 h-7 text-fyn-ink/50" />
            </div>
          </div>
          <h3 className="font-serif text-xl text-fyn-ink mb-2">
            No Working Capital Data
          </h3>
          <p className="text-sm text-fyn-ink/60 max-w-md mx-auto">
            Upload receivables and payables to calculate working capital
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card
        className="p-6 mb-6 border-fyn-ink-10"
        style={{ background: isHealthy ? "#1A6B3C" : "#C41E1E" }}
      >
        <p className="text-[13px] fyn-label text-white/80">Working Capital</p>
        <p className="text-white text-[36px] font-bold mt-1 font-sans">
          ₹{workingCapital.toLocaleString("en-IN")}
        </p>
        <p className="text-sm text-white/80 mt-1">
          {isHealthy ? "Healthy cash position" : "Negative working capital"}
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 bg-fyn-beige-card border-fyn-ink-10">
          <p className="text-[13px] fyn-label text-secondary-foreground">
            Current Ratio
          </p>
          <p className="text-fyn-ink text-[28px] font-bold mt-1 font-sans">
            {wcRatio}
          </p>
          <p className="text-xs text-fyn-ink/60 mt-1">
            Receivables / Payables
          </p>
        </Card>

        <Card className="p-5 bg-fyn-beige-card border-fyn-ink-10">
          <p className="text-[13px] fyn-label text-secondary-foreground">
            Receivables
          </p>
          <p className="text-fyn-ink text-[28px] font-bold mt-1 font-sans">
            ₹{totalReceivables.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-fyn-ink/60 mt-1">Money owed to you</p>
        </Card>

        <Card className="p-5 bg-fyn-beige-card border-fyn-ink-10">
          <p className="text-[13px] fyn-label text-secondary-foreground">
            Payables
          </p>
          <p className="text-fyn-ink text-[28px] font-bold mt-1 font-sans">
            ₹{totalPayables.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-fyn-ink/60 mt-1">Money you owe</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WorkingCapitalPage;
