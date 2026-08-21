import { createFileRoute } from "@tanstack/react-router";
import UseCasesPage from "@/pages/UseCasesPage";

export const Route = createFileRoute("/_main/use-cases")({
  component: UseCasesPage,
});
