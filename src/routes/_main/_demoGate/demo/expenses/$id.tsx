import { createFileRoute } from "@tanstack/react-router";
import DemoExpensePage from "@/demo/pages/details/DemoExpensePage";

export const Route = createFileRoute("/_main/_demoGate/demo/expenses/$id")({
  component: DemoExpensePage,
});
