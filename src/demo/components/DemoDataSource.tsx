/**
 * Demo DataSource — isolated from /dashboard. Always reads seeded DEMO_BIZ data.
 * No mode switching, no auth lookup. The presence of `useMode` and
 * `IntelligenceProvider` symbols below is for API compatibility with the copied
 * intelligence shell/tabs only; they hardcode "demo" and do nothing else.
 */
import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DEMO_BIZ = "4b30494f-4c30-4a74-a6bb-6bf56493a97d";

export type IntelligenceMode = "demo" | "live";
export function IntelligenceProvider({ children }: { mode?: IntelligenceMode; children: ReactNode }) {
  return <>{children}</>;
}
export function useMode(): IntelligenceMode { return "demo"; }

function useScopedTable<T>(table: string, opts?: { order?: string; ascending?: boolean }) {
  return useQuery({
    queryKey: ["demo", table, DEMO_BIZ],
    queryFn: async (): Promise<T[]> => {
      let q = (supabase as any).from(table).select("*").eq("business_id", DEMO_BIZ);
      if (opts?.order) q = q.order(opts.order, { ascending: opts?.ascending ?? false });
      const { data, error } = await q;
      if (error) throw error;
      return (data as T[]) || [];
    },
  });
}

/* ── Domain types ──────────────────────────────────────── */
export type Customer = { id: string; customer_name: string; total_receivable: number; payment_terms_days: number | null; city: string | null; credit_limit?: number; gstin?: string };
export type Vendor = { id: string; vendor_name: string; total_outstanding: number; category?: string; gstin?: string; city: string | null };
export type Invoice = { id: string; customer_id: string | null; invoice_number: string; invoice_date: string; due_date: string | null; total_amount: number; paid_amount: number; outstanding_amount: number; status: string; payment_date: string | null; subtotal: number; tax_amount: number };
export type Expense = { id: string; vendor_id: string | null; amount: number; date: string; due_date: string | null; category: string | null; subcategory: string | null; description: string | null; payment_status: string };
export type BankTxn = { id: string; date: string; amount: number; type: "credit" | "debit"; balance: number; category: string | null; description: string | null };
export type EmployeeDemo = { id: string; name: string; department: string | null; designation: string | null; salary: number; cost_to_company: number; joining_date: string | null; status: string };
export type GstFiling = { id: string; filing_type: string; period: string; due_date: string | null; filed_date: string | null; status: string; tax_liability: number; itc_claimed: number; net_payable: number };

export const useCustomers = () => useScopedTable<Customer>("customers", { order: "customer_name", ascending: true });
export const useVendors = () => useScopedTable<Vendor>("vendors", { order: "vendor_name", ascending: true });
export const useInvoices = () => useScopedTable<Invoice>("invoices", { order: "invoice_date" });
export const useExpenses = () => useScopedTable<Expense>("expenses", { order: "date" });
export const useBankTxns = () => useScopedTable<BankTxn>("bank_transactions", { order: "date" });
export const useEmployees = () => useScopedTable<EmployeeDemo>("employees_demo", { order: "department", ascending: true });
export const useGstFilings = () => useScopedTable<GstFiling>("gst_filings_demo", { order: "due_date" });

export const useCAC = () => useScopedTable<any>("customer_acquisition_costs", { order: "period_start", ascending: true });
export const useCohorts = () => useScopedTable<any>("cohort_data", { order: "cohort_month", ascending: true });
export const useSalesPipeline = () => useScopedTable<any>("sales_pipeline", { order: "deal_value" });
export const useRevenueBreakdowns = () => useScopedTable<any>("revenue_breakdowns", { order: "revenue_amount" });
export const useDeferredRevenue = () => useScopedTable<any>("deferred_revenue", { order: "deferred_balance" });
export const useSubscriptionAudit = () => useScopedTable<any>("subscription_audit", { order: "potential_savings" });
export const useContractRenewals = () => useScopedTable<any>("contract_renewals", { order: "end_date", ascending: true });
export const useEwayBills = () => useScopedTable<any>("eway_bills", { order: "document_date" });
export const useHsnMaster = () => useScopedTable<any>("hsn_master", { order: "usage_count" });
export const useTaxPlanning = () => useScopedTable<any>("tax_planning", { order: "financial_year" });
export const useBalanceSheet = () => useScopedTable<any>("balance_sheet_snapshots", { order: "snapshot_date" });
export const useRiskRegister = () => useScopedTable<any>("risk_register", { order: "risk_score" });
export const useInsurancePolicies = () => useScopedTable<any>("insurance_policies", { order: "coverage_amount" });
export const useEsopGrants = () => useScopedTable<any>("esop_grants", { order: "total_options" });
export const useHiringPipeline = () => useScopedTable<any>("hiring_pipeline", { order: "priority", ascending: true });
export const useCompBenchmarks = () => useScopedTable<any>("compensation_benchmarks", { order: "percentile_position", ascending: true });

export const usePaymentSettlements   = () => useScopedTable<any>("payment_settlements",   { order: "created_at" });
export const useFxExposure           = () => useScopedTable<any>("fx_exposure",           { order: "monthly_amount_inr" });
export const useActionItems          = () => useScopedTable<any>("action_items",          { order: "due_date", ascending: true });
export const useRevenueQuality       = () => useScopedTable<any>("revenue_quality",       { order: "period_start" });
export const useConversionFunnel     = () => useScopedTable<any>("conversion_funnel",     { order: "period_start" });
export const useRevenueAlerts        = () => useScopedTable<any>("revenue_alerts",        { order: "created_at" });
export const usePeopleEfficiency     = () => useScopedTable<any>("people_efficiency",     { order: "period_start" });
export const useProjectsList         = () => useScopedTable<any>("projects",              { order: "gross_margin_pct" });
export const useSupportIntelligence  = () => useScopedTable<any>("support_intelligence",  { order: "period_start" });
export const useTdsIntelligence      = () => useScopedTable<any>("tds_intelligence",      { order: "section_code", ascending: true });
export const useAdvanceTaxSchedule   = () => useScopedTable<any>("advance_tax_schedule",  { order: "instalment_number", ascending: true });
export const useRegulatoryCompliance = () => useScopedTable<any>("regulatory_compliance", { order: "due_date", ascending: true });

export function useHasAnyData(): boolean {
  const c = useCustomers().data?.length ?? 0;
  const i = useInvoices().data?.length ?? 0;
  const e = useExpenses().data?.length ?? 0;
  return c + i + e > 0;
}
