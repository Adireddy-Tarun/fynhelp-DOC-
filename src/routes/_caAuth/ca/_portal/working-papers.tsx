import { createFileRoute } from "@tanstack/react-router";
import { CAWorkingPapersPage } from "@/pages/ca/os/CASkeletonPages";

export const Route = createFileRoute("/_caAuth/ca/_portal/working-papers")({
  component: CAWorkingPapersPage,
});
