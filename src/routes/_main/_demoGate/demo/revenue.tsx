import { createFileRoute } from "@tanstack/react-router";
import DemoIntelligencePage from "@/demo/pages/DemoIntelligencePage";

export const Route = createFileRoute("/_main/_demoGate/demo/revenue")({
  component: () => <DemoIntelligencePage tab="revenue" />,
});
