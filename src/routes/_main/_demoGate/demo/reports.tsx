import { createFileRoute } from "@tanstack/react-router";
import DemoReportsPage from "@/demo/pages/DemoReportsPage";

export const Route = createFileRoute("/_main/_demoGate/demo/reports")({
  component: DemoReportsPage,
});
