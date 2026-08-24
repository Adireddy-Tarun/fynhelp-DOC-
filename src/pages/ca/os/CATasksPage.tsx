import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCAPortal } from "@/hooks/useCAPortal";
import { useCARole } from "@/hooks/useCARole";
import { useCAClientOptions } from "@/hooks/useCAClientOptions";
import { CA, CACard, CAButton, CABadge, caInputStyle, dateIN } from "@/components/ca/portalUi";
import { ModuleHeader, PermissionNotice, QueueTable, StateChip, StatStrip } from "@/components/ca/os/primitives";
import { logCAAudit } from "@/lib/caAudit";

interface TaskRow {
  id: string;
  business_id: string | null;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  due_date: string | null;
  sla_hours: number | null;
  assigned_to: string | null;
  created_at: string;
  completed_at: string | null;
}

const CATEGORIES = ["bookkeeping", "gst", "tds", "audit", "advisory", "chaser"];
const PRIORITIES = ["low", "normal", "high", "urgent"];
const PRIORITY_TONE: Record<string, "red" | "amber" | "grey"> = { urgent: "red", high: "amber", normal: "grey", low: "grey" };

export default function CATasksPage() {
  const { firmId } = useCAPortal();
  const { can, role, isLoading: roleLoading } = useCARole();
  const { clients } = useCAClientOptions();
  const [rows, setRows] = useState<TaskRow[]>([]);
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    business_id: "",
    title: "",
    category: "bookkeeping",
    priority: "normal",
    due_date: "",
    sla_hours: "48",
  });

  const load = useCallback(async () => {
    if (!firmId) return;
    const { data } = await supabase
      .from("ca_tasks")
      .select("id, business_id, title, description, category, priority, status, due_date, sla_hours, assigned_to, created_at, completed_at")
      .eq("ca_firm_id", firmId)
      .order("created_at", { ascending: false })
      .limit(300);
    setRows((data ?? []) as TaskRow[]);
  }, [firmId]);

  useEffect(() => {
    void load();
  }, [load]);

  const nameFor = (id: string | null) =>
    id ? clients.find((c) => c.business_id === id)?.client_name ?? "Unknown client" : "Firm-wide";

  const create = async () => {
    if (!firmId || !form.title.trim()) return toast.error("Give the task a title");
    setBusy(true);
    const { data: userRes } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("ca_tasks")
      .insert({
        ca_firm_id: firmId,
        business_id: form.business_id || null,
        title: form.title.trim(),
        category: form.category,
        priority: form.priority,
        due_date: form.due_date || null,
        sla_hours: form.sla_hours ? Number(form.sla_hours) : null,
        created_by: userRes?.user?.id ?? null,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    await logCAAudit({
      firmId,
      businessId: form.business_id || null,
      entityType: "task",
      entityId: data.id,
      action: "task_created",
      actorRole: role,
      detail: { title: form.title, category: form.category, priority: form.priority },
    });
    toast.success("Task created");
    setOpen(false);
    setForm({ business_id: "", title: "", category: "bookkeeping", priority: "normal", due_date: "", sla_hours: "48" });
    void load();
  };

  const setStatus = async (t: TaskRow, status: string) => {
    const { error } = await supabase
      .from("ca_tasks")
      .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
      .eq("id", t.id);
    if (error) return toast.error(error.message);
    await logCAAudit({
      firmId: firmId!,
      businessId: t.business_id,
      entityType: "task",
      entityId: t.id,
      action: `task_${status}`,
      actorRole: role,
    });
    void load();
  };

  const claim = async (t: TaskRow) => {
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("ca_tasks")
      .update({ assigned_to: userRes?.user?.id ?? null, status: "in_progress" })
      .eq("id", t.id);
    if (error) return toast.error(error.message);
    void load();
  };

  if (roleLoading) return null;
  if (!can("process")) {
    return (
      <div>
        <ModuleHeader title="Tasks" subtitle="Work allocated across the team." />
        <PermissionNotice permission="process" />
      </div>
    );
  }

  const openTasks = rows.filter((t) => t.status !== "done");
  const overdue = openTasks.filter((t) => t.due_date && new Date(t.due_date) < new Date());
  const breached = openTasks.filter(
    (t) => t.sla_hours && Date.now() - new Date(t.created_at).getTime() > t.sla_hours * 3_600_000,
  );

  const visible = rows.filter((t) =>
    statusFilter === "open" ? t.status !== "done" : statusFilter ? t.status === statusFilter : true,
  );

  return (
    <div>
      <ModuleHeader
        title="Tasks & chasers"
        subtitle="Everything the firm owes a client or itself, with a due date and an SLA clock running against it."
        right={<CAButton onClick={() => setOpen((o) => !o)}>{open ? "Cancel" : "New task"}</CAButton>}
      />

      <StatStrip
        items={[
          { label: "Open", value: String(openTasks.length) },
          { label: "Overdue", value: String(overdue.length), tone: overdue.length ? "red" : "green" },
          { label: "SLA breached", value: String(breached.length), tone: breached.length ? "amber" : "green" },
          { label: "Completed", value: String(rows.length - openTasks.length) },
        ]}
      />

      {open && (
        <CACard style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
            <input style={caInputStyle} placeholder="What needs doing?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select style={caInputStyle} value={form.business_id} onChange={(e) => setForm({ ...form, business_id: e.target.value })}>
              <option value="">Firm-wide</option>
              {clients.map((c) => (
                <option key={c.business_id} value={c.business_id}>
                  {c.client_name}
                </option>
              ))}
            </select>
            <select style={caInputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select style={caInputStyle} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input style={caInputStyle} type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            <input style={caInputStyle} type="number" placeholder="SLA hours" value={form.sla_hours} onChange={(e) => setForm({ ...form, sla_hours: e.target.value })} />
          </div>
          <div style={{ marginTop: 14 }}>
            <CAButton onClick={create} disabled={busy}>
              Create task
            </CAButton>
          </div>
        </CACard>
      )}

      <CACard style={{ padding: 20 }}>
        <select
          style={{ ...caInputStyle, maxWidth: 180, marginBottom: 14 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
          <option value="">All</option>
        </select>

        <QueueTable
          columns={["Task", "Client", "Category", "Priority", "Due", "SLA", "Status", ""]}
          empty="No tasks"
          emptyHint="Create a task, or raise a document request to generate a chaser."
          rows={visible.map((t) => {
            const ageHrs = (Date.now() - new Date(t.created_at).getTime()) / 3_600_000;
            const slaState = !t.sla_hours || t.status === "done" ? "—" : ageHrs > t.sla_hours ? "Breached" : `${Math.max(0, Math.round(t.sla_hours - ageHrs))}h left`;
            return [
              <span key="t" style={{ fontWeight: 600 }}>
                {t.title}
              </span>,
              nameFor(t.business_id),
              t.category,
              <CABadge key="p" tone={PRIORITY_TONE[t.priority] ?? "grey"}>
                {t.priority}
              </CABadge>,
              dateIN(t.due_date),
              <span key="s" style={{ fontFamily: CA.mono, fontSize: 12, color: slaState === "Breached" ? CA.red : CA.muted }}>
                {slaState}
              </span>,
              <StateChip key="st" value={t.status} />,
              t.status !== "done" ? (
                <div key="a" style={{ display: "flex", gap: 6 }}>
                  {!t.assigned_to && (
                    <CAButton variant="ghost" onClick={() => claim(t)}>
                      Claim
                    </CAButton>
                  )}
                  <CAButton onClick={() => setStatus(t, "done")}>Done</CAButton>
                </div>
              ) : null,
            ];
          })}
        />
      </CACard>
    </div>
  );
}
