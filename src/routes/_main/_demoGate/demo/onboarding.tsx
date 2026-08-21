import { createFileRoute } from "@tanstack/react-router";
import DemoOnboarding from "@/pages/demo/DemoOnboarding";

export const Route = createFileRoute("/_main/_demoGate/demo/onboarding")({
  component: DemoOnboarding,
});
