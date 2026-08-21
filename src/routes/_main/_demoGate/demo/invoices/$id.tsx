import { createFileRoute } from "@tanstack/react-router";
import DemoInvoicePage from "@/demo/pages/details/DemoInvoicePage";

export const Route = createFileRoute("/_main/_demoGate/demo/invoices/$id")({
  component: DemoInvoicePage,
});
