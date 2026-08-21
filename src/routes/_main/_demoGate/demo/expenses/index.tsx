import { createFileRoute } from "@tanstack/react-router";
import DemoExpensesPage from "@/demo/pages/DemoExpensesPage";

export const Route = createFileRoute("/_main/_demoGate/demo/expenses/")({
  component: DemoExpensesPage,
});
