import { createFileRoute } from "@tanstack/react-router";
import DemoModeBanner from "@/components/demo/DemoModeBanner";
import { CAPartnerComingSoon } from "@/pages/coming-soon/ComingSoonPages";

export const Route = createFileRoute("/_main/_demoGate/demo/ca-partner")({
  component: () => (
    <DemoModeBanner>
      <CAPartnerComingSoon />
    </DemoModeBanner>
  ),
});
