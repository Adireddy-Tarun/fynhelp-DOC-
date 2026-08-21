import { createFileRoute } from "@tanstack/react-router";
import DemoCustomerPage from "@/demo/pages/details/DemoCustomerPage";

export const Route = createFileRoute("/_main/_demoGate/demo/customers/$id")({
  component: DemoCustomerPage,
});
