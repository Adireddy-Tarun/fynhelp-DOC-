import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCAPortal } from "@/hooks/useCAPortal";
import { toast } from "sonner";
import {
  CA, CACard, CAHeading, CAButton, CAField, caInputStyle, CABadge, statusTone,
  caTh, caTd, CAEmpty,
} from "@/components/ca/portalUi";

interface Member {
  id: string;
  invited_email: string | null;
  role: string | null;
  status: string | null;
}

export default function CASettingsPage() {
  const { firmId, refresh } = useCAPortal();
  const [firm, setFirm] = useState({
    firm_name: "", icai_membership_number: "", phone: "", email: "", city: "", state: "", ca_name: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [invite, setInvite] = useState({ email: "", role: "member" });
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    if (!firmId) return;
    setLoading(true);
    const [{ data: f, error: fe }, { data: m }] = await Promise.all([
      supabase
        .from("ca_firms")
        .select("firm_name, icai_membership_number, phone, email, city, state, ca_name")
        .eq("id", firmId)
        .maybeSingle(),
      supabase
        .from("ca_firm_members")
        .select("id, invited_email, role, status")
        .eq("ca_firm_id", firmId)
        .order("created_at", { ascending: true }),
    ]);
    if (fe) toast.error(fe.message);
    if (f) {
      setFirm({
        firm_name: f.firm_name ?? "",
        icai_membership_number: f.icai_membership_number ?? "",
        phone: f.phone ?? "",
        email: f.email ?? "",
        city: f.city ?? "",
        state: f.state ?? "",
        ca_name: f.ca_name ?? "",
      });
    }
    setMembers((m as Member[]) ?? []);
    setLoading(false);
  }, [firmId]);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof firm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFirm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmId) return;
    setSaving(true);
    const { error } = await supabase
      .from("ca_firms")
      .update({ ...firm, membership_number: firm.icai_membership_number })
      .eq("id", firmId);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Firm details saved");
    refresh();
  };

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmId) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email)) return toast.error("Enter a valid email address");
    setInviting(true);
    const { error } = await supabase.from("ca_firm_members").insert({
      ca_firm_id: firmId,
      invited_email: invite.email.trim().toLowerCase(),
      role: invite.role,
      status: "invited",
    });
    if (error) { setInviting(false); return toast.error(error.message); }

    const { error: mailErr } = await supabase.functions.invoke("ca-send-email", {
      body: { kind: "team_invite", ca_firm_id: firmId, to: invite.email.trim().toLowerCase(), role: invite.role },
    });
    setInviting(false);
    if (mailErr) toast.warning(`Member added, but the invite email failed: ${mailErr.message}`);
    else toast.success(`Invitation sent to ${invite.email.trim()}`);
    setInvite({ email: "", role: "member" });
    load();
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <CAHeading>Settings</CAHeading>

      <CACard style={{ padding: 24, marginTop: 18 }}>
        <div style={{ fontFamily: CA.serif, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Firm details</div>
        {loading ? (
          <CAEmpty title="Loading…" />
        ) : (
          <form onSubmit={save} style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <CAField label="Firm name"><input style={caInputStyle} value={firm.firm_name} onChange={set("firm_name")} /></CAField>
              <CAField label="CA name"><input style={caInputStyle} value={firm.ca_name} onChange={set("ca_name")} /></CAField>
              <CAField label="ICAI membership number"><input style={caInputStyle} value={firm.icai_membership_number} onChange={set("icai_membership_number")} /></CAField>
              <CAField label="Phone"><input style={caInputStyle} value={firm.phone} onChange={set("phone")} /></CAField>
              <CAField label="Email"><input style={caInputStyle} value={firm.email} onChange={set("email")} /></CAField>
              <CAField label="City"><input style={caInputStyle} value={firm.city} onChange={set("city")} /></CAField>
              <CAField label="State"><input style={caInputStyle} value={firm.state} onChange={set("state")} /></CAField>
            </div>
            <div><CAButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</CAButton></div>
          </form>
        )}
      </CACard>

      <CACard style={{ marginTop: 22, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `0.5px solid ${CA.line}`, fontFamily: CA.serif, fontSize: 16, fontWeight: 700 }}>
          Team members
        </div>
        {members.length === 0 ? (
          <CAEmpty title="No team members yet" />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={caTh}>Email</th>
                <th style={caTh}>Role</th>
                <th style={caTh}>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td style={caTd}>{m.invited_email ?? "—"}</td>
                  <td style={caTd}>{m.role ?? "—"}</td>
                  <td style={caTd}><CABadge tone={statusTone(m.status)}>{m.status ?? "—"}</CABadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form onSubmit={inviteMember} style={{ padding: 20, display: "flex", gap: 12, alignItems: "end", borderTop: `0.5px solid ${CA.line}` }}>
          <div style={{ flex: 1 }}>
            <CAField label="Invite team member">
              <input
                style={caInputStyle}
                value={invite.email}
                onChange={(e) => setInvite((i) => ({ ...i, email: e.target.value }))}
                placeholder="colleague@cafirm.com"
              />
            </CAField>
          </div>
          <div style={{ width: 160 }}>
            <CAField label="Role">
              <select
                style={caInputStyle as any}
                value={invite.role}
                onChange={(e) => setInvite((i) => ({ ...i, role: e.target.value }))}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </CAField>
          </div>
          <CAButton type="submit" disabled={inviting} style={{ height: 42 }}>
            {inviting ? "Sending…" : "Send invite"}
          </CAButton>
        </form>
      </CACard>
    </div>
  );
}
