/**
 * Modules from the CA product architecture that are navigable now and
 * describe exactly what they will do, so nothing in the blueprint is
 * silently missing from the product.
 */
import { ModuleInBuild } from "@/components/ca/os/primitives";

export function CAReconciliationPage() {
  return (
    <ModuleInBuild
      title="Reconciliation engine"
      subtitle="Match bank lines to invoices and bills in three passes — exact, fuzzy, then rule-based — and send whatever is left to the exception queue."
      capabilities={[
        "Exact match on amount, date window and reference",
        "Fuzzy match on narration, party name and part payments",
        "Firm-level and client-level matching rules",
        "Reason codes on every unmatched line",
        "One-click accept, split and part-settle",
      ]}
      dependsOn="Posted bank, sales and purchase data from the intake pipeline"
    />
  );
}

export function CAExceptionsPage() {
  return (
    <ModuleInBuild
      title="Exception queue"
      subtitle="Everything the system could not resolve on its own, ranked by money at risk and days open."
      capabilities={[
        "Unified queue across reconciliation, ITC and TDS",
        "Owner, SLA and ageing on each exception",
        "Reason codes and resolution notes",
        "Bulk resolve for repeating patterns",
      ]}
      dependsOn="Reconciliation engine"
    />
  );
}

export function CAClosePage() {
  return (
    <ModuleInBuild
      title="Month-end close"
      subtitle="A readiness score per client, a checklist that knows what is still open, and a sign-off trail you can defend in an audit."
      capabilities={[
        "Close checklist generated per engagement",
        "Readiness score from open exceptions and missing documents",
        "Preparer and reviewer sign-off with timestamps",
        "Period lock once signed off",
      ]}
      dependsOn="Exception queue and working papers"
    />
  );
}

export function CAWorkingPapersPage() {
  return (
    <ModuleInBuild
      title="Working papers"
      subtitle="Schedules and reconciliations assembled from live data, each tied back to the source documents behind the numbers."
      capabilities={[
        "Auto-built ledger and balance schedules",
        "Evidence links from every figure to its document",
        "Reviewer comments and clearance",
        "Export as a single indexed pack",
      ]}
      dependsOn="Month-end close"
    />
  );
}

export function CATasksPage() {
  return (
    <ModuleInBuild
      title="Tasks & chasers"
      subtitle="Work allocated across the team with due dates and SLAs, plus automatic follow-ups to clients who have not sent what was asked."
      capabilities={[
        "Task board by client, owner and engagement",
        "SLA timers and escalation to the manager",
        "Automatic email and WhatsApp chasers on open document requests",
        "Client-visible status so they stop asking",
      ]}
      dependsOn="Document requests"
    />
  );
}

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
