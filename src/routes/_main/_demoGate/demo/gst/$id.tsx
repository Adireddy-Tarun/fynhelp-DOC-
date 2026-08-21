import { createFileRoute } from "@tanstack/react-router";
import DemoGstFilingPage from "@/demo/pages/details/DemoGstFilingPage";

export const Route = createFileRoute("/_main/_demoGate/demo/gst/$id")({
  component: DemoGstFilingPage,
});
