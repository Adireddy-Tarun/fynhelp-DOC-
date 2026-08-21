import { createFileRoute } from "@tanstack/react-router";
import DemoModeBanner from "@/components/demo/DemoModeBanner";
import { MarketGrowthComingSoon } from "@/pages/coming-soon/ComingSoonPages";

export const Route = createFileRoute("/_main/_demoGate/demo/market-growth")({
  component: () => (
    <DemoModeBanner>
      <MarketGrowthComingSoon />
    </DemoModeBanner>
  ),
});
