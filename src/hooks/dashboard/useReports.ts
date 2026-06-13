import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type GeneratedReport = {
  id: string;
  business_id: string;
  report_type: string;
  report_name: string;
  generated_by: string | null;
  generated_at: string;
  file_url: string | null;
  file_size: number | null;
  status: string;
  parameters: Record<string, unknown>;
};

export function useGeneratedReports(businessId: string | null) {
  return useQuery({
    queryKey: ["reports", businessId],
    queryFn: async (): Promise<GeneratedReport[]> => {
      if (!businessId) return [];
      const { data, error } = await (supabase as any)
        .from("generated_reports")
        .select("*")
        .eq("business_id", businessId)
        .order("generated_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data as GeneratedReport[]) || [];
    },
    enabled: !!businessId,
  });
}

export function useGenerateReport(businessId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { report_type: string; report_name: string; generated_by: string }) => {
      if (!businessId) throw new Error("No business selected");
      const { data, error } = await (supabase as any)
        .from("generated_reports")
        .insert({
          business_id: businessId,
          report_type: args.report_type,
          report_name: args.report_name,
          generated_by: args.generated_by,
          status: "generating",
        })
        .select()
        .single();
      if (error) throw error;
      const newRow = data as GeneratedReport;

      // Simulate processing
      await new Promise((r) => setTimeout(r, 2000));

      await (supabase as any)
        .from("generated_reports")
        .update({ status: "completed", file_size: Math.floor(150000 + Math.random() * 300000) })
        .eq("id", newRow.id);

      return newRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports", businessId] });
    },
  });
}
