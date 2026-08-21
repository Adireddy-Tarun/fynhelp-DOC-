/**
 * Demo entity navigation. Replaces the deprecated DemoDetailDrawer.
 * Every "open" call navigates to the dedicated full-page route at
 * /demo/<entity>/:id. No drawer/sheet UI is rendered.
 */
import { useNavigate } from "@/lib/router-compat";

export type DrawerKind =
  | "customer" | "vendor" | "invoice" | "expense" | "gst_filing"
  | "risk" | "insurance" | "employee" | "deal" | "bank_txn";

const ROUTE: Record<DrawerKind, string> = {
  customer: "/demo/customers",
  vendor: "/demo/vendors",
  invoice: "/demo/invoices",
  expense: "/demo/expenses",
  employee: "/demo/employees",
  gst_filing: "/demo/gst",
  risk: "/demo/risks",
  insurance: "/demo/insurance",
  deal: "/demo/deals",
  bank_txn: "/demo/bank",
};

export function routeFor(kind: DrawerKind, id: string): string {
  return `${ROUTE[kind]}/${id}`;
}

export function useDemoNav() {
  const navigate = useNavigate();
  const open = (kind: DrawerKind, id: string) => {
    if (!id) return;
    navigate(routeFor(kind, id));
  };
  return { open };
}
