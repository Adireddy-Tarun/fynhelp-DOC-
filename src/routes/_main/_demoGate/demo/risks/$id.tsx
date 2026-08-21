import { createFileRoute } from "@tanstack/react-router";
import DemoRiskPage from "@/demo/pages/details/DemoRiskPage";

export const Route = createFileRoute("/_main/_demoGate/demo/risks/$id")({
  component: DemoRiskPage,
});
