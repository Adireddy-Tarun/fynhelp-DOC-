/**
 * Reusable detail drawer for the dashboard drill-downs.
 *
 * Open state is controlled via URL search params (?drawer=customer&id=...)
 * so cockpit cards and list rows produce shareable, refresh-safe links.
 *
 * Built on shadcn Sheet (right side, ESC + backdrop close handled).
 */
import { useSearchParams } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMemo } from "react";
import CustomerDetail from "./detail/CustomerDetail";
import VendorDetail from "./detail/VendorDetail";
import InvoiceDetail from "./detail/InvoiceDetail";
import ExpenseDetail from "./detail/ExpenseDetail";

export type DrawerKind = "customer" | "vendor" | "invoice" | "expense";

export function useDrawer() {
  const [params, setParams] = useSearchParams();
  const drawer = params.get("drawer") as DrawerKind | null;
  const id = params.get("id");
  const open = (kind: DrawerKind, id: string) => {
    const next = new URLSearchParams(params);
    next.set("drawer", kind);
    next.set("id", id);
    setParams(next, { replace: false });
  };
  const close = () => {
    const next = new URLSearchParams(params);
    next.delete("drawer");
    next.delete("id");
    setParams(next, { replace: true });
  };
  return { drawer, id, open, close };
}

export default function DetailDrawer() {
  const { drawer, id, close } = useDrawer();
  const isOpen = !!drawer && !!id;

  const content = useMemo(() => {
    if (!isOpen) return null;
    switch (drawer) {
      case "customer":
        return <CustomerDetail id={id!} onClose={close} />;
      case "vendor":
        return <VendorDetail id={id!} onClose={close} />;
      case "invoice":
        return <InvoiceDetail id={id!} onClose={close} />;
      case "expense":
        return <ExpenseDetail id={id!} onClose={close} />;
      default:
        return null;
    }
  }, [drawer, id, isOpen, close]);

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[500px] p-0 bg-fyn-beige border-l border-fyn-ink-10 overflow-y-auto"
      >
        {content}
      </SheetContent>
    </Sheet>
  );
}
