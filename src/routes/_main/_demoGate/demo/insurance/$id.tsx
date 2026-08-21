import { createFileRoute } from "@tanstack/react-router";
import DemoInsurancePage from "@/demo/pages/details/DemoInsurancePage";

export const Route = createFileRoute("/_main/_demoGate/demo/insurance/$id")({
  component: DemoInsurancePage,
});
