import { createFileRoute } from "@tanstack/react-router";
import DemoCustomersPage from "@/demo/pages/DemoCustomersPage";

export const Route = createFileRoute("/_main/_demoGate/demo/customers/")({
  component: DemoCustomersPage,
});
