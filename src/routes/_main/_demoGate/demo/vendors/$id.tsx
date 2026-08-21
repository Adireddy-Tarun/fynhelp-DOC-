import { createFileRoute } from "@tanstack/react-router";
import DemoVendorPage from "@/demo/pages/details/DemoVendorPage";

export const Route = createFileRoute("/_main/_demoGate/demo/vendors/$id")({
  component: DemoVendorPage,
});
