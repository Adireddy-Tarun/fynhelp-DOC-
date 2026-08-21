import { createFileRoute } from "@tanstack/react-router";
import DemoVendorsPage from "@/demo/pages/DemoVendorsPage";

export const Route = createFileRoute("/_main/_demoGate/demo/vendors/")({
  component: DemoVendorsPage,
});
