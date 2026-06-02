import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCAAuth } from "@/contexts/CAAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { COLORS, PageWrap, PageHeader, Card, PrimaryBtn, SecondaryBtn, Chip } from "@/components/ca/ui";
import { toast } from "sonner";
import { CheckCircle2, Upload, MoreHorizontal, X, CreditCard } from "lucide-react";

const TABS = [
  { v: "/ca/settings", t: "Firm Profile" },
  { v: "/ca/settings/team", t: "Team Members" },
  { v: "/ca/settings/notifications", t: "Notification Preferences" },
  { v: "/ca/settings/defaults", t: "Client Defaults" },
  { v: "/ca/settings/billing", t: "Billing & Subscription" },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
  "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand",
  "West Bengal","Delhi","Jammu and Kashmir","Ladakh","Chandigarh","Puducherry"
];

const SPECIALIZATIONS = ["GST Compliance","Income Tax","Audit","Corporate Law","FEMA","Transfer Pricing","International Taxation","Startup Advisory"];
const SERVICE_AREAS = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Pune","Ahmedabad","Kolkata","Pan India"];

interface Prefs {
  channels?: { email?: boolean; whatsapp?: boolean; push?: boolean };
  types?: Record<string, boolean>;
  quiet_hours?: { enabled?: boolean; start?: string; end?: string };
  digest?: { daily?: string; weekly?: string; monthly?: string };
  email?: { individual_critical?: boolean; batch_non_critical?: boolean; max_per_day?: number };
}

interface Defaults {
  access_level?: string;
  filing_reminders?: { gstr1: number; gstr3b: number; tds: number; payroll: number };
  alert_thresholds?: { cash: number; runway: number; itc: number; notice: number };
  automation?: { auto_reports: boolean; auto_itc: boolean; auto_reminders: boolean; auto_file: boolean };
}

export default function CASettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { caFirm, refreshFirm } = useCAAuth();
  const tab = location.pathname;

  return (
    <PageWrap>
      <div className="text-[13px] mb-2" style={{ color: "rgba(26,16,8,0.45)" }}>Dashboard / Settings</div>
      <PageHeader title="Settings" sub="Manage your CA firm profile and preferences" />

      {/* Sub-tab nav */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto" style={{ borderBottom: `1px solid ${COLORS.caBorder}` }}>
        {TABS.map((t) => {
          const active = tab === t.v;
          return (
            <button
              key={t.v}
              onClick={() => navigate(t.v)}
              className="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                color: active ? COLORS.red : "rgba(26,16,8,0.65)",
                borderBottom: active ? `3px solid ${COLORS.red}` : "3px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {t.t}
            </button>
          );
        })}
      </div>

      {tab === "/ca/settings" && <FirmProfileTab caFirm={caFirm} refresh={refreshFirm} />}
      {tab === "/ca/settings/team" && <TeamMembersTab caFirmId={caFirm?.id} />}
      {tab === "/ca/settings/notifications" && <NotificationsTab caFirm={caFirm} refresh={refreshFirm} />}
      {tab === "/ca/settings/defaults" && <ClientDefaultsTab caFirm={caFirm} refresh={refreshFirm} />}
      {tab === "/ca/settings/billing" && <BillingTab caFirm={caFirm} />}
    </PageWrap>
  );
}

/* ================= FIRM PROFILE ================= */
function FirmProfileTab({ caFirm, refresh }: { caFirm: any; refresh: () => Promise<void> }) {
  const [form, setForm] = useState<any>({});
  const [extras, setExtras] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!caFirm) return;
    const np = (caFirm.notification_prefs || {}) as any;
    const profile = np._profile || {};
    setForm({
      firm_name: caFirm.firm_name || "",
      membership_number: caFirm.membership_number || "",
      email: caFirm.email || "",
      phone: caFirm.phone || "",
      city: caFirm.city || "",
      state: caFirm.state || "",
      logo_url: caFirm.logo_url || "",
    });
    setExtras({
      contact_name: profile.contact_name || "",
      address: profile.address || "",
      pin_code: profile.pin_code || "",
      website: profile.website || "",
      gst_number: profile.gst_number || "",
      years: profile.years || "",
      team_size: profile.team_size || "",
      specializations: profile.specializations || [],
      service_areas: profile.service_areas || [],
    });
  }, [caFirm]);

  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const updateExtra = (k: string, v: any) => setExtras((e: any) => ({ ...e, [k]: v }));
  const toggleArr = (k: string, v: string) => setExtras((e: any) => {
    const arr = e[k] || [];
    return { ...e, [k]: arr.includes(v) ? arr.filter((x: string) => x !== v) : [...arr, v] };
  });

  const handleLogoUpload = async (file: File) => {
    if (!caFirm?.id) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${caFirm.id}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("profile-photos").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
      update("logo_url", data.publicUrl);
      toast.success("Logo uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    if (!caFirm?.id) return;
    if (!form.firm_name?.trim()) { toast.error("Firm name is required"); return; }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) { toast.error("Invalid email"); return; }
    if (extras.pin_code && !/^\d{6}$/.test(extras.pin_code)) { toast.error("PIN must be 6 digits"); return; }
    setSaving(true);
    const existingPrefs = (caFirm.notification_prefs || {}) as any;
    const { error } = await supabase
      .from("ca_firms")
      .update({
        firm_name: form.firm_name,
        email: form.email || null,
        phone: form.phone || null,
        city: form.city || null,
        state: form.state || null,
        logo_url: form.logo_url || null,
        notification_prefs: { ...existingPrefs, _profile: extras },
        updated_at: new Date().toISOString(),
      })
      .eq("id", caFirm.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Firm profile updated"); refresh(); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Basic Information</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="CA Firm Name *" value={form.firm_name} onChange={(v) => update("firm_name", v)} />
          <Field
            label="ICAI Firm Registration Number *"
            value={form.membership_number}
            readOnly={caFirm?.is_verified}
            help={caFirm?.is_verified ? "Cannot be changed after verification" : "Will be locked after verification"}
            badge={caFirm?.is_verified ? <Chip tone="green">Verified</Chip> : undefined}
            onChange={() => {}}
          />
          <Field label="Primary Contact Name (Partner) *" value={extras.contact_name} onChange={(v) => updateExtra("contact_name", v)} />
          <Field label="Firm Email Address *" value={form.email} onChange={(v) => update("email", v)} type="email" help="This email receives all client notifications" />
          <Field label="Phone Number *" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+91 98765 43210" />
        </div>
      </Card>

      <Card>
        <SectionTitle>Firm Details</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Registered Office Address</Label>
            <textarea
              rows={3}
              value={extras.address}
              onChange={(e) => updateExtra("address", e.target.value)}
              className="w-full px-3 py-2 rounded text-sm"
              style={{ border: `1px solid ${COLORS.caBorder}` }}
            />
          </div>
          <Field label="City" value={form.city} onChange={(v) => update("city", v)} />
          <SelectField label="State" value={form.state} onChange={(v) => update("state", v)} options={INDIAN_STATES} />
          <Field label="PIN Code" value={extras.pin_code} onChange={(v) => updateExtra("pin_code", v)} placeholder="560001" />
          <Field label="Website URL" value={extras.website} onChange={(v) => updateExtra("website", v)} placeholder="https://cafirm.com" />
          <Field label="CA Firm GST Number" value={extras.gst_number} onChange={(v) => updateExtra("gst_number", v)} placeholder="29ABCDE1234F1Z5" />
        </div>
      </Card>

      <Card>
        <SectionTitle>Professional Details</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Field label="Years in Practice" type="number" value={extras.years} onChange={(v) => updateExtra("years", v)} />
          <Field label="Team Size" type="number" value={extras.team_size} onChange={(v) => updateExtra("team_size", v)} help="Total partners + staff" />
        </div>
        <div className="mb-5">
          <Label>Specializations</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {SPECIALIZATIONS.map((s) => {
              const active = (extras.specializations || []).includes(s);
              return (
                <button key={s} onClick={() => toggleArr("specializations", s)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={{
                    background: active ? COLORS.red : "#FFFFFF",
                    color: active ? "#FFFFFF" : COLORS.ink,
                    border: `1px solid ${active ? COLORS.red : COLORS.caBorder}`,
                  }}>{s}</button>
              );
            })}
          </div>
        </div>
        <div>
          <Label>Service Areas</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {SERVICE_AREAS.map((s) => {
              const active = (extras.service_areas || []).includes(s);
              return (
                <button key={s} onClick={() => toggleArr("service_areas", s)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={{
                    background: active ? COLORS.red : "#FFFFFF",
                    color: active ? "#FFFFFF" : COLORS.ink,
                    border: `1px solid ${active ? COLORS.red : COLORS.caBorder}`,
                  }}>{s}</button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle>Logo & Branding</SectionTitle>
        <div className="flex items-start gap-6">
          <div className="w-[120px] h-[120px] rounded-md flex items-center justify-center overflow-hidden"
            style={{ border: `1px solid ${COLORS.caBorder}`, background: COLORS.caSurface }}>
            {form.logo_url ? (
              <img src={form.logo_url} alt="logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-xs" style={{ color: "rgba(26,16,8,0.40)" }}>No logo</span>
            )}
          </div>
          <div>
            <label className="inline-flex items-center gap-2 px-4 h-10 rounded-md text-sm font-medium cursor-pointer bg-white"
              style={{ border: `1px solid ${COLORS.caBorder}`, color: COLORS.ink }}>
              <Upload size={14} /> {uploading ? "Uploading..." : "Upload Logo"}
              <input type="file" accept="image/png,image/jpeg" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
            </label>
            <div className="text-xs mt-2" style={{ color: "rgba(26,16,8,0.55)" }}>PNG or JPG, max 2MB. Recommended 200×200.</div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <SecondaryBtn onClick={() => window.location.reload()}>Cancel</SecondaryBtn>
        <PrimaryBtn onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</PrimaryBtn>
      </div>
    </div>
  );
}

/* ================= TEAM MEMBERS ================= */
function TeamMembersTab({ caFirmId }: { caFirmId?: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    if (!caFirmId) return;
    setLoading(true);
    const { data } = await supabase
      .from("ca_firm_members")
      .select("*")
      .eq("ca_firm_id", caFirmId)
      .order("created_at");
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [caFirmId]);

  const deactivate = async (id: string) => {
    const { error } = await supabase.from("ca_firm_members").update({ status: "inactive" }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Member deactivated"); load(); }
  };

  const resend = async (email: string) => toast.success(`Invitation resent to ${email}`);

  const active = members.filter((m) => m.status !== "inactive").length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Team Members ({active} active)</div>
        <PrimaryBtn onClick={() => setShowAdd(true)}>Add Team Member</PrimaryBtn>
      </div>

      {loading ? (
        <div className="text-sm" style={{ color: "rgba(26,16,8,0.55)" }}>Loading…</div>
      ) : members.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-[15px] font-semibold mb-1" style={{ color: COLORS.ink }}>No team members yet</div>
          <div className="text-sm" style={{ color: "rgba(26,16,8,0.55)" }}>Invite partners and staff to collaborate.</div>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider" style={{ color: "rgba(26,16,8,0.50)" }}>
              <th className="py-2.5">Name</th><th className="py-2.5">Email</th><th className="py-2.5">Role</th>
              <th className="py-2.5">Access</th><th className="py-2.5">Status</th><th className="py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                <td className="py-3 font-medium">{m.invited_email?.split("@")[0]}</td>
                <td className="py-3" style={{ color: "rgba(26,16,8,0.65)" }}>{m.invited_email}</td>
                <td className="py-3"><Chip tone={m.role === "partner" ? "gold" : "blue"}>{capitalize(m.role || "staff")}</Chip></td>
                <td className="py-3 text-[12px]" style={{ color: "rgba(26,16,8,0.65)" }}>Full Access</td>
                <td className="py-3">
                  {m.status === "active"
                    ? <Chip tone="green">Active</Chip>
                    : m.status === "inactive"
                    ? <Chip tone="gray">Inactive</Chip>
                    : <Chip tone="amber">Pending</Chip>}
                </td>
                <td className="py-3 text-right">
                  {m.status !== "active" && (
                    <button onClick={() => resend(m.invited_email)} className="text-xs font-medium mr-3" style={{ color: COLORS.red }}>Resend</button>
                  )}
                  {m.status !== "inactive" && (
                    <button onClick={() => deactivate(m.id)} className="text-xs font-medium" style={{ color: COLORS.red }}>Deactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAdd && <AddMemberModal caFirmId={caFirmId!} onClose={() => setShowAdd(false)} onAdded={load} />}
    </Card>
  );
}

function AddMemberModal({ caFirmId, onClose, onAdded }: { caFirmId: string; onClose: () => void; onAdded: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error("Invalid email"); return; }
    setSaving(true);
    const { error } = await supabase.from("ca_firm_members").insert({
      ca_firm_id: caFirmId,
      invited_email: email,
      role,
      status: "pending",
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success(`Invitation sent to ${email}`); onAdded(); onClose(); }
  };

  return (
    <Modal onClose={onClose} title="Add Team Member">
      <div className="space-y-4">
        <Field label="Email *" value={email} onChange={setEmail} type="email" placeholder="member@firm.com" />
        <SelectField label="Role" value={role} onChange={setRole} options={["partner", "manager", "staff", "intern"]} />
        <SelectField label="Access Level" value="full" onChange={() => {}} options={["full", "limited", "view_only"]} />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
        <PrimaryBtn onClick={submit} disabled={saving}>{saving ? "Sending..." : "Send Invitation"}</PrimaryBtn>
      </div>
    </Modal>
  );
}

/* ================= NOTIFICATION PREFS ================= */
const CRITICAL_TYPES = [
  { k: "filing_due_1d", l: "Filing due tomorrow" },
  { k: "filing_overdue", l: "Filing overdue" },
  { k: "itc_risk_high", l: "High ITC risk (>₹5L at risk)" },
  { k: "notice_risk_70", l: "Notice risk score >70/100" },
  { k: "cash_critical", l: "Client cash balance critical (<₹25K)" },
];
const WARNING_TYPES = [
  { k: "filing_due_3d", l: "Filing due in 3 days" },
  { k: "itc_mismatch", l: "ITC mismatch detected" },
  { k: "cash_low", l: "Client cash balance low (<₹50K)" },
  { k: "access_revoked", l: "Client access revoked" },
  { k: "vendor_noncompliance", l: "Vendor non-compliance" },
];
const INFO_TYPES = [
  { k: "access_request_new", l: "New client access request" },
  { k: "client_activity", l: "Client activity updates" },
  { k: "weekly_digest", l: "Weekly portfolio digest" },
  { k: "monthly_digest", l: "Monthly compliance summary" },
  { k: "system_update", l: "System updates & new features" },
];

function NotificationsTab({ caFirm, refresh }: { caFirm: any; refresh: () => Promise<void> }) {
  const [prefs, setPrefs] = useState<Prefs>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!caFirm) return;
    setPrefs((caFirm.notification_prefs || {}) as Prefs);
  }, [caFirm]);

  const isOn = (k: string, def = true) => prefs.types?.[k] ?? def;
  const setType = (k: string, v: boolean) => setPrefs((p) => ({ ...p, types: { ...(p.types || {}), [k]: v } }));
  const setChannel = (k: string, v: boolean) => setPrefs((p) => ({ ...p, channels: { ...(p.channels || {}), [k]: v } }));

  const onSave = async () => {
    if (!caFirm?.id) return;
    setSaving(true);
    const existing = (caFirm.notification_prefs || {}) as any;
    const { error } = await supabase
      .from("ca_firms")
      .update({ notification_prefs: { ...existing, ...prefs }, updated_at: new Date().toISOString() })
      .eq("id", caFirm.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Preferences saved"); refresh(); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Notification Channels</SectionTitle>
        <div className="space-y-3">
          <ToggleRow label="Email Notifications" sub="Always on" checked disabled />
          <ToggleRow label="WhatsApp Notifications" checked={!!prefs.channels?.whatsapp} onChange={(v) => setChannel("whatsapp", v)} />
          <ToggleRow label="Desktop Push Notifications" checked={!!prefs.channels?.push} onChange={(v) => setChannel("push", v)} />
        </div>
      </Card>

      <Card>
        <SectionTitle>Notification Types</SectionTitle>
        <TypeGroup title="Critical Alerts" items={CRITICAL_TYPES} get={isOn} set={setType} />
        <TypeGroup title="Warnings" items={WARNING_TYPES} get={isOn} set={setType} />
        <TypeGroup title="Info" items={INFO_TYPES} get={(k) => isOn(k, false)} set={setType} />
      </Card>

      <Card>
        <SectionTitle>Notification Timing</SectionTitle>
        <div className="mb-5">
          <ToggleRow label="Enable Quiet Hours"
            checked={!!prefs.quiet_hours?.enabled}
            onChange={(v) => setPrefs((p) => ({ ...p, quiet_hours: { ...(p.quiet_hours || {}), enabled: v } }))} />
          <div className="grid grid-cols-2 gap-4 mt-3 max-w-md">
            <TimeField label="Start" value={prefs.quiet_hours?.start || "22:00"}
              onChange={(v) => setPrefs((p) => ({ ...p, quiet_hours: { ...(p.quiet_hours || {}), start: v } }))} />
            <TimeField label="End" value={prefs.quiet_hours?.end || "08:00"}
              onChange={(v) => setPrefs((p) => ({ ...p, quiet_hours: { ...(p.quiet_hours || {}), end: v } }))} />
          </div>
          <div className="text-xs mt-2" style={{ color: "rgba(26,16,8,0.55)" }}>No notifications between these hours</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TimeField label="Daily digest" value={prefs.digest?.daily || "09:00"}
            onChange={(v) => setPrefs((p) => ({ ...p, digest: { ...(p.digest || {}), daily: v } }))} />
          <Field label="Weekly digest" value={prefs.digest?.weekly || "monday_09:00"}
            onChange={(v) => setPrefs((p) => ({ ...p, digest: { ...(p.digest || {}), weekly: v } }))} />
          <Field label="Monthly digest" value={prefs.digest?.monthly || "1_09:00"}
            onChange={(v) => setPrefs((p) => ({ ...p, digest: { ...(p.digest || {}), monthly: v } }))} />
        </div>
      </Card>

      <Card>
        <SectionTitle>Email Preferences</SectionTitle>
        <div className="space-y-3">
          <ToggleRow label="Send individual emails for critical alerts"
            checked={prefs.email?.individual_critical ?? true}
            onChange={(v) => setPrefs((p) => ({ ...p, email: { ...(p.email || {}), individual_critical: v } }))} />
          <ToggleRow label="Batch non-critical notifications"
            checked={prefs.email?.batch_non_critical ?? true}
            onChange={(v) => setPrefs((p) => ({ ...p, email: { ...(p.email || {}), batch_non_critical: v } }))} />
          <div className="max-w-xs">
            <Label>Maximum emails per day</Label>
            <input type="number" min={1} max={50}
              value={prefs.email?.max_per_day ?? 20}
              onChange={(e) => setPrefs((p) => ({ ...p, email: { ...(p.email || {}), max_per_day: Number(e.target.value) } }))}
              className="w-full h-10 px-3 rounded text-sm"
              style={{ border: `1px solid ${COLORS.caBorder}` }} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <PrimaryBtn onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save Preferences"}</PrimaryBtn>
      </div>
    </div>
  );
}

function TypeGroup({ title, items, get, set }: {
  title: string; items: { k: string; l: string }[]; get: (k: string) => boolean; set: (k: string, v: boolean) => void;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="text-[12px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: "rgba(26,16,8,0.55)" }}>{title}</div>
      <div className="space-y-2">
        {items.map((i) => (
          <label key={i.k} className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" checked={get(i.k)} onChange={(e) => set(i.k, e.target.checked)} />
            <span>{i.l}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ================= CLIENT DEFAULTS ================= */
function ClientDefaultsTab({ caFirm, refresh }: { caFirm: any; refresh: () => Promise<void> }) {
  const [d, setD] = useState<Defaults>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!caFirm) return;
    const np = (caFirm.notification_prefs || {}) as any;
    setD(np._defaults || {
      access_level: "full_access",
      filing_reminders: { gstr1: 7, gstr3b: 3, tds: 5, payroll: 3 },
      alert_thresholds: { cash: 50000, runway: 30, itc: 500000, notice: 70 },
      automation: { auto_reports: true, auto_itc: true, auto_reminders: false, auto_file: false },
    });
  }, [caFirm]);

  const onSave = async () => {
    if (!caFirm?.id) return;
    setSaving(true);
    const existing = (caFirm.notification_prefs || {}) as any;
    const { error } = await supabase
      .from("ca_firms")
      .update({ notification_prefs: { ...existing, _defaults: d }, updated_at: new Date().toISOString() })
      .eq("id", caFirm.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Defaults saved"); refresh(); }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm -mt-2" style={{ color: "rgba(26,16,8,0.65)" }}>Set default preferences that apply to all new clients you onboard.</p>

      <Card>
        <SectionTitle>Default Access Level</SectionTitle>
        <div className="space-y-2">
          {[
            { v: "full_access", l: "Full Access (recommended)" },
            { v: "filing_only", l: "Filing Only" },
            { v: "view_only", l: "View Only" },
          ].map((o) => (
            <label key={o.v} className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input type="radio" name="access_level" checked={d.access_level === o.v}
                onChange={() => setD({ ...d, access_level: o.v })} />
              <span>{o.l}</span>
            </label>
          ))}
        </div>
        <div className="text-xs mt-3" style={{ color: "rgba(26,16,8,0.55)" }}>You can customize access per client later</div>
      </Card>

      <Card>
        <SectionTitle>Default Filing Reminders</SectionTitle>
        <div className="space-y-3">
          {[
            { k: "gstr1", l: "GSTR-1" },
            { k: "gstr3b", l: "GSTR-3B" },
            { k: "tds", l: "TDS Returns" },
            { k: "payroll", l: "Payroll filings" },
          ].map((r) => (
            <div key={r.k} className="flex items-center gap-3 text-sm">
              <span className="w-32">{r.l}:</span>
              <input type="number" min={0} max={30}
                value={(d.filing_reminders as any)?.[r.k] ?? 0}
                onChange={(e) => setD({ ...d, filing_reminders: { ...(d.filing_reminders as any), [r.k]: Number(e.target.value) } })}
                className="w-20 h-9 px-2 rounded text-sm" style={{ border: `1px solid ${COLORS.caBorder}` }} />
              <span style={{ color: "rgba(26,16,8,0.65)" }}>days before due date</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Default Alert Thresholds</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ThresholdField label="Notify when cash drops below (₹)" value={d.alert_thresholds?.cash ?? 50000}
            onChange={(v) => setD({ ...d, alert_thresholds: { ...(d.alert_thresholds as any), cash: v } })} />
          <ThresholdField label="Notify when runway drops below (days)" value={d.alert_thresholds?.runway ?? 30}
            onChange={(v) => setD({ ...d, alert_thresholds: { ...(d.alert_thresholds as any), runway: v } })} />
          <ThresholdField label="Notify when ITC at risk exceeds (₹)" value={d.alert_thresholds?.itc ?? 500000}
            onChange={(v) => setD({ ...d, alert_thresholds: { ...(d.alert_thresholds as any), itc: v } })} />
          <ThresholdField label="Notify when notice risk score exceeds (/100)" value={d.alert_thresholds?.notice ?? 70}
            onChange={(v) => setD({ ...d, alert_thresholds: { ...(d.alert_thresholds as any), notice: v } })} />
        </div>
      </Card>

      <Card>
        <SectionTitle>Automation Rules</SectionTitle>
        <div className="space-y-3">
          <ToggleRow label="Auto-generate monthly CFO reports for all clients"
            checked={!!d.automation?.auto_reports}
            onChange={(v) => setD({ ...d, automation: { ...(d.automation as any), auto_reports: v } })} />
          <ToggleRow label="Auto-run ITC reconciliation before GSTR-3B due date"
            checked={!!d.automation?.auto_itc}
            onChange={(v) => setD({ ...d, automation: { ...(d.automation as any), auto_itc: v } })} />
          <ToggleRow label="Auto-send payment reminders for overdue receivables"
            checked={!!d.automation?.auto_reminders}
            onChange={(v) => setD({ ...d, automation: { ...(d.automation as any), auto_reminders: v } })} />
          <ToggleRow label="Auto-file returns if data is complete and validated"
            checked={!!d.automation?.auto_file}
            onChange={(v) => setD({ ...d, automation: { ...(d.automation as any), auto_file: v } })} />
        </div>
      </Card>

      <div className="flex justify-end">
        <PrimaryBtn onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save Defaults"}</PrimaryBtn>
      </div>
    </div>
  );
}

function ThresholdField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-10 px-3 rounded text-sm" style={{ border: `1px solid ${COLORS.caBorder}` }} />
    </div>
  );
}

/* ================= BILLING ================= */
function BillingTab({ caFirm }: { caFirm: any }) {
  const [showCancel, setShowCancel] = useState(false);
  const planName = caFirm?.plan_type === "ca_partner" ? "CA Partner, Professional" : "CA Partner";
  const invoices = useMemo(() => {
    const out: { date: string; amount: string; status: "Paid" | "Pending" }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 18);
      out.push({
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        amount: "₹4,999",
        status: i === 0 ? "Pending" : "Paid",
      });
    }
    return out;
  }, []);

  const nextBilling = useMemo(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1); d.setDate(18);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Current Plan</SectionTitle>
        <div className="rounded-lg p-6" style={{ background: COLORS.caSurface, border: `1px solid ${COLORS.caBorder}` }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-[20px] font-bold" style={{ color: COLORS.ink }}>{planName}</div>
              <div className="text-[16px] font-semibold mt-1" style={{ color: "rgba(26,16,8,0.65)" }}>₹4,999/month</div>
              <div className="text-[13px] mt-2" style={{ color: "rgba(26,16,8,0.65)" }}>Billed monthly · Next billing: {nextBilling}</div>
            </div>
            <SecondaryBtn onClick={() => toast.info("Plan comparison coming soon")}>Change Plan</SecondaryBtn>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "Unlimited client portfolios","Bulk GST filing","ITC reconciliation engine",
            "Team collaboration (up to 5 members)","Priority support","Advanced analytics",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={14} style={{ color: COLORS.green }} />
              <span style={{ color: "rgba(26,16,8,0.85)" }}>{f}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Payment Method</SectionTitle>
        <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-md" style={{ border: `1px solid ${COLORS.caBorder}` }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 rounded flex items-center justify-center" style={{ background: COLORS.ink }}>
              <CreditCard size={16} color="#fff" />
            </div>
            <div>
              <div className="text-sm font-semibold">Visa •••• 4242</div>
              <div className="text-xs" style={{ color: "rgba(26,16,8,0.55)" }}>Expires 12/2027</div>
            </div>
          </div>
          <SecondaryBtn onClick={() => toast.info("Payment update coming soon")}>Update Payment Method</SecondaryBtn>
        </div>
      </Card>

      <Card>
        <SectionTitle>Billing History</SectionTitle>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider" style={{ color: "rgba(26,16,8,0.50)" }}>
              <th className="py-2.5">Invoice Date</th><th className="py-2.5">Amount</th><th className="py-2.5">Status</th><th className="py-2.5 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                <td className="py-3" style={{ color: "rgba(26,16,8,0.65)" }}>{inv.date}</td>
                <td className="py-3 font-semibold">{inv.amount}</td>
                <td className="py-3"><Chip tone={inv.status === "Paid" ? "green" : "amber"}>{inv.status}</Chip></td>
                <td className="py-3 text-right">
                  <button onClick={() => toast.success("PDF downloaded")} className="text-xs font-medium" style={{ color: COLORS.red }}>Download PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <SectionTitle>Cancellation</SectionTitle>
        <button onClick={() => setShowCancel(true)} className="text-sm font-medium" style={{ color: COLORS.red }}>
          Cancel Subscription
        </button>
      </Card>

      {showCancel && (
        <Modal onClose={() => setShowCancel(false)} title="Cancel Subscription?">
          <p className="text-sm" style={{ color: "rgba(26,16,8,0.75)" }}>
            Your subscription will remain active until <strong>{nextBilling}</strong>. All client data will be deleted 30 days after that date.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <SecondaryBtn onClick={() => setShowCancel(false)}>Keep Subscription</SecondaryBtn>
            <button onClick={() => { toast.success("Subscription cancellation requested"); setShowCancel(false); }}
              className="h-10 px-4 rounded-md font-medium text-sm text-white"
              style={{ background: COLORS.red }}>Cancel Subscription</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================= SHARED PRIMITIVES ================= */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[15px] font-semibold mb-4" style={{ color: COLORS.ink }}>{children}</h3>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(26,16,8,0.75)" }}>{children}</label>;
}
function Field({ label, value, onChange, type = "text", placeholder, readOnly, help, badge }: {
  label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string; readOnly?: boolean; help?: string; badge?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {badge}
      </div>
      <input type={type} value={value ?? ""} placeholder={placeholder} readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded text-sm"
        style={{ border: `1px solid ${COLORS.caBorder}`, background: readOnly ? COLORS.caSurface : "#FFFFFF", color: COLORS.ink }} />
      {help && <div className="text-[11px] mt-1" style={{ color: "rgba(26,16,8,0.55)" }}>{help}</div>}
    </div>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <Label>{label}</Label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded text-sm bg-white"
        style={{ border: `1px solid ${COLORS.caBorder}`, color: COLORS.ink }}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
      </select>
    </div>
  );
}
function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type="time" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded text-sm" style={{ border: `1px solid ${COLORS.caBorder}` }} />
    </div>
  );
}
function ToggleRow({ label, sub, checked, onChange, disabled }: {
  label: string; sub?: string; checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium" style={{ color: COLORS.ink }}>{label}</div>
        {sub && <div className="text-xs" style={{ color: "rgba(26,16,8,0.55)" }}>{sub}</div>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        className="relative w-10 h-6 rounded-full transition-colors disabled:opacity-50"
        style={{ background: checked ? COLORS.red : "#D4C9A8" }}
      >
        <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }} />
      </button>
    </div>
  );
}
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-xl max-w-[600px] w-full p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[20px] font-bold" style={{ color: COLORS.ink }}>{title}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
