import { createFileRoute } from "@tanstack/react-router";
import DemoInvoicesPage from "@/demo/pages/DemoInvoicesPage";

export const Route = createFileRoute("/_main/_demoGate/demo/invoices/")({
  component: DemoInvoicesPage,
});
