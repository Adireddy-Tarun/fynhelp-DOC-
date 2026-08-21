import { createFileRoute } from "@tanstack/react-router";
import DemoDealPage from "@/demo/pages/details/DemoDealPage";

export const Route = createFileRoute("/_main/_demoGate/demo/deals/$id")({
  component: DemoDealPage,
});
