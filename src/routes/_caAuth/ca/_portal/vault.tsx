import { createFileRoute } from "@tanstack/react-router";
import CAEvidenceVaultPage from "@/pages/ca/os/CAEvidenceVaultPage";

export const Route = createFileRoute("/_caAuth/ca/_portal/vault")({
  component: CAEvidenceVaultPage,
});
