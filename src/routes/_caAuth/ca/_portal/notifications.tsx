import { createFileRoute } from "@tanstack/react-router";
import CANotificationsPage from "@/pages/ca/CANotificationsPage";

export const Route = createFileRoute("/_caAuth/ca/_portal/notifications")({
  component: CANotificationsPage,
});
