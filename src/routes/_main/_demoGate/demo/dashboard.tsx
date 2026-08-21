import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

export const Route = createFileRoute("/_main/_demoGate/demo/dashboard")({
  component: () => <Navigate to="/demo/liquidity" replace />,
});
