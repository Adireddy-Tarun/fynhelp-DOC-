import { createFileRoute } from "@tanstack/react-router";
import DemoUpload from "@/pages/demo/DemoUpload";

export const Route = createFileRoute("/_main/_demoGate/demo/upload")({
  component: DemoUpload,
});
