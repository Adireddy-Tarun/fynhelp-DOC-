import { createFileRoute } from "@tanstack/react-router";
import DemoAccessGate from "@/components/demo/DemoAccessGate";

export const Route = createFileRoute("/_main/_demoGate")({
  component: () => <DemoAccessGate />,
});
