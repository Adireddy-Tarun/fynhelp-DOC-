import { createFileRoute } from "@tanstack/react-router";
import DemoModeBanner from "@/components/demo/DemoModeBanner";
import { DecisionSimulatorComingSoon } from "@/pages/coming-soon/ComingSoonPages";

export const Route = createFileRoute("/_main/_demoGate/demo/decision-simulator")({
  component: () => (
    <DemoModeBanner>
      <DecisionSimulatorComingSoon />
    </DemoModeBanner>
  ),
});
