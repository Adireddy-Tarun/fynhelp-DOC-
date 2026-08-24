/**
 * Modules from the CA product architecture that are navigable now and
 * describe exactly what they will do, so nothing in the blueprint is
 * silently missing from the product.
 */
import { ModuleInBuild } from "@/components/ca/os/primitives";

export function CAEngagementsPage() {
  return (
    <ModuleInBuild
      title="Engagements"
      subtitle="Scope, fees and recurring obligations per client, so the calendar and the billing both come from one place."
      capabilities={[
        "Engagement types: bookkeeping, GST, TDS, audit, advisory",
        "Recurring obligation calendar generated from scope",
        "Fee schedule and billing status",
        "Team assignment per engagement",
      ]}
    />
  );
}

export function CAClientPortalAdminPage() {
  return (
    <ModuleInBuild
      title="Client portal"
      subtitle="A scoped login for your clients to upload documents, answer requests and see where their filings stand — without seeing anything belonging to another client."
      capabilities={[
        "Invite a client contact to their own login",
        "Upload against a specific request, straight into intake",
        "Read-only filing and compliance status",
        "Message thread scoped to that client only",
      ]}
      dependsOn="Document requests and intake inbox"
    />
  );
}

export function CAPracticeAnalyticsPage() {
  return (
    <ModuleInBuild
      title="Practice analytics"
      subtitle="How the firm is actually running: turnaround per client, exception load per staff member, and revenue against effort."
      capabilities={[
        "Turnaround time from document received to posted",
        "Exception load and clearance rate by team member",
        "Client profitability against engagement fees",
        "Capacity view ahead of filing season",
      ]}
    />
  );
}
