import { createFileRoute } from "@tanstack/react-router";
import CADemoPage from "@/pages/demo/CADemoPage";

export const Route = createFileRoute("/_main/_demoGate/demo/ca")({
  component: CADemoPage,
});
