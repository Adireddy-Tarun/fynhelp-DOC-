import { createFileRoute } from "@tanstack/react-router";
import DemoLogin from "@/pages/demo/DemoLogin";

export const Route = createFileRoute("/_main/_demoGate/demo/login")({
  component: DemoLogin,
});
