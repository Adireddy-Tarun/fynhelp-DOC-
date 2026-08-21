import { createFileRoute } from "@tanstack/react-router";
import DemoEmployeePage from "@/demo/pages/details/DemoEmployeePage";

export const Route = createFileRoute("/_main/_demoGate/demo/employees/$id")({
  component: DemoEmployeePage,
});
