import { createFileRoute } from "@tanstack/react-router";
import { CAPracticeAnalyticsPage } from "@/pages/ca/os/CASkeletonPages";

export const Route = createFileRoute("/_caAuth/ca/_portal/practice-analytics")({
  component: CAPracticeAnalyticsPage,
});
