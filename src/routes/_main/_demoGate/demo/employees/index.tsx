import { createFileRoute } from "@tanstack/react-router";
import DemoEmployeesPage from "@/demo/pages/DemoEmployeesPage";

export const Route = createFileRoute("/_main/_demoGate/demo/employees/")({
  component: DemoEmployeesPage,
});
