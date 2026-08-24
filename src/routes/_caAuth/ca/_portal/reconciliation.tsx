import { createFileRoute } from "@tanstack/react-router";
import { CAReconciliationPage } from "@/pages/ca/os/CASkeletonPages";

export const Route = createFileRoute("/_caAuth/ca/_portal/reconciliation")({
  component: CAReconciliationPage,
});
