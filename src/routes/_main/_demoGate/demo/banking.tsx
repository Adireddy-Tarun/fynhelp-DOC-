import { createFileRoute } from "@tanstack/react-router";
import DemoModeBanner from "@/components/demo/DemoModeBanner";
import { BankingComingSoon } from "@/pages/coming-soon/ComingSoonPages";

export const Route = createFileRoute("/_main/_demoGate/demo/banking")({
  component: () => (
    <DemoModeBanner>
      <BankingComingSoon />
    </DemoModeBanner>
  ),
});
