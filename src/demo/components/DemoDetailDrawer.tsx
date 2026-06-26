/**
 * Demo entity navigation hub.
 * Drawer/sheet UI has been removed — every "open" call now navigates to the
 * dedicated full-page route at /demo/<entity>/:id. The `useDrawer` name is
 * preserved so existing call sites (tabs, sections, list pages, detail pages)
 * rewire without edits.
 */
import { useNavigate } from "react-router-dom";

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

export function useDrawer() {
  const navigate = useNavigate();
  const open = (kind: DrawerKind, id: string) => {
    if (!id) return;
    navigate(routeFor(kind, id));
  };
  // close is a no-op now — kept for backward compat with consumers.
  const close = () => {};
  return { drawer: null as DrawerKind | null, id: null as string | null, open, close };
}

// Mount point kept so existing pages that render <DemoDetailDrawer /> don't break.
// Renders nothing — full pages handle every detail view.
export default function DemoDetailDrawer() {
  return null;
}
