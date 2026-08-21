import { createFileRoute } from "@tanstack/react-router";
import DemoBankTxnPage from "@/demo/pages/details/DemoBankTxnPage";

export const Route = createFileRoute("/_main/_demoGate/demo/bank/$id")({
  component: DemoBankTxnPage,
});
