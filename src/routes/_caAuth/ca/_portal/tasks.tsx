import { createFileRoute } from "@tanstack/react-router";
import { CATasksPage } from "@/pages/ca/os/CASkeletonPages";

export const Route = createFileRoute("/_caAuth/ca/_portal/tasks")({
  component: CATasksPage,
});
