import { createFileRoute } from "@tanstack/react-router";
import { CAExceptionsPage } from "@/pages/ca/os/CASkeletonPages";

export const Route = createFileRoute("/_caAuth/ca/_portal/exceptions")({
  component: CAExceptionsPage,
});
