import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Mail, Phone, Building2, Calendar, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, PageHeader } from "./AdminDashboardPage";
import { logAdminAction } from "@/lib/adminAudit";
import { toast } from "sonner";

type Profile = {
  user_id: string; full_name: string | null; mobile: string | null;
  business_id: string | null; created_at: string; role: string | null;
  display_name: string | null; avatar_url: string | null;
};
type Business = {
  id: string; business_name: string; plan: string | null; state: string | null;
  industry: string | null; gstin: string | null; subscription_status: string | null;
};

const TABS = ["Subscription", "Usage", "Activity", "Tickets"] as const;
type Tab = typeof TABS[number];

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Subscription");
  const [activity, setActivity] = useState<any[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: p } = await supabase
        .from("profiles").select("*").eq("user_id", id).maybeSingle();
      setProfile(p as Profile);
      if (p?.business_id) {
        const { data: b } = await supabase
          .from("businesses").select("*").eq("id", p.business_id).maybeSingle();
        setBusiness(b as Business);
      }
      const { data: logs } = await supabase
        .from("admin_audit_logs")
        .select("id, action, target_type, target_id, created_at, details")
        .eq("target_id", id)
        .order("created_at", { ascending: false }).limit(20);
      setActivity(logs ?? []);
      setLoading(false);
    })();
  }, [id]);

  const initials = useMemo(
    () => (profile?.full_name ?? "?").slice(0, 2).toUpperCase(),
    [profile]
  );

  const onViewAs = async () => {
    if (!profile) return;
    await logAdminAction({
      action: "view_as_user",
      target_type: "user", target_id: profile.user_id,
      details: { mode: "read_only" },
    });
    alert("Read-only ‘View as’ mode is logged. Full impersonation ships in Part 2.");
  };

  if (loading) {
    return <div style={{ padding: 24, fontFamily: "Roboto, sans-serif" }}>Loading user…</div>;
  }
  if (!profile) {
    return (
      <div>
        <PageHeader title="User not found" />
        <Card>
          <Link to="/admin/users" className="flex items-center gap-2"
            style={{ color: "#8B6914", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Users
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/users" className="inline-flex items-center gap-2 mb-4"
        style={{ color: "#8B6914", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14 }}>
        <ArrowLeft size={16} /> Back to Users
      </Link>
      <PageHeader
        title={profile.full_name || profile.display_name || "(no name)"}
        subtitle={profile.user_id}
      />

      <div className="grid gap-6 lg:grid-cols-[320px,1fr,300px]">
        {/* Profile column */}
        <Card>
          <div className="flex flex-col items-center text-center">
            <span className="grid place-items-center rounded-full text-white"
              style={{
                width: 96, height: 96,
                background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
                fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: 32,
              }}>
              {initials}
            </span>
            <h3 className="mt-4" style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 18, color: "hsl(var(--fyn-ink))" }}>
              {profile.full_name || "(no name)"}
            </h3>
            {profile.role && (
              <span className="mt-1" style={{
                padding: "4px 10px", borderRadius: 6,
                background: "rgba(139,105,20,0.1)", color: "#8B6914",
                fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 12,
              }}>{profile.role}</span>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <Field icon={<Mail size={14} />} label="User ID" value={profile.user_id.slice(0, 12) + "…"} />
            <Field icon={<Phone size={14} />} label="Mobile" value={profile.mobile ?? "—"} />
            <Field icon={<Building2 size={14} />} label="Business" value={business?.business_name ?? "—"} />
            <Field icon={<Shield size={14} />} label="Plan" value={business?.plan ?? "—"} />
            <Field icon={<Calendar size={14} />} label="Joined" value={new Date(profile.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />
          </div>

          <button
            onClick={onViewAs}
            className="mt-6 w-full flex items-center justify-center gap-2"
            style={{
              height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
              color: "#fff", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14,
              border: "none", cursor: "pointer",
            }}
          >
            <ExternalLink size={16} /> View as User
          </button>
        </Card>

        {/* Tabs column */}
        <Card style={{ padding: 0 }}>
          <div className="flex border-b" style={{ borderColor: "rgba(26,16,8,0.08)" }}>
            {TABS.map((t) => (
              <button key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "16px 22px", background: "transparent", border: "none",
                  borderBottom: tab === t ? "2px solid #C41E1E" : "2px solid transparent",
                  color: tab === t ? "hsl(var(--fyn-ink))" : "hsl(var(--fyn-ink) / 0.55)",
                  fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
                }}
              >{t}</button>
            ))}
          </div>
          <div style={{ padding: 24, minHeight: 360 }}>
            {tab === "Subscription" && <SubscriptionTab business={business} />}
            {tab === "Usage" && <PlaceholderTab text="Usage analytics arrive in Part 2 alongside the metering pipeline." />}
            {tab === "Activity" && <ActivityTab logs={activity} />}
            {tab === "Tickets" && <PlaceholderTab text="Support tickets ship with the support module in Part 2." />}
          </div>
        </Card>

        {/* Notes column */}
        <Card>
          <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 16, color: "hsl(var(--fyn-ink))" }}>
            Admin Notes
          </h3>
          <p className="mt-1" style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.55)" }}>
            Internal-only. Persistent storage in Part 2.
          </p>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Write a note about this user…"
            rows={10}
            style={{
              width: "100%", marginTop: 12, padding: 12, borderRadius: 12,
              border: "1px solid rgba(26,16,8,0.15)", background: "#fff",
              fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink))",
              resize: "vertical", outline: "none",
            }}
          />
          <button
            onClick={() => logAdminAction({ action: "user_note_saved", target_type: "user", target_id: profile.user_id, details: { length: notes.length } })}
            disabled={!notes.trim()}
            style={{
              marginTop: 12, height: 40, padding: "0 16px", borderRadius: 10,
              background: notes.trim() ? "linear-gradient(135deg,#C41E1E,#8B6914)" : "rgba(26,16,8,0.06)",
              color: notes.trim() ? "#fff" : "rgba(26,16,8,0.4)",
              border: "none", cursor: notes.trim() ? "pointer" : "not-allowed",
              fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13,
            }}
          >Save Note</button>
        </Card>
      </div>
    </div>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3"
      style={{ paddingBottom: 10, borderBottom: "1px solid rgba(26,16,8,0.06)" }}>
      <span className="flex items-center gap-2" style={{ color: "hsl(var(--fyn-ink) / 0.55)", fontFamily: "Roboto, sans-serif", fontSize: 13 }}>
        {icon} {label}
      </span>
      <span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, color: "hsl(var(--fyn-ink))", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function SubscriptionTab({ business }: { business: Business | null }) {
  if (!business) return <PlaceholderTab text="No business linked to this user yet." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <KV label="Plan" value={business.plan ?? "—"} />
      <KV label="Status" value={business.subscription_status ?? "—"} />
      <KV label="Industry" value={business.industry ?? "—"} />
      <KV label="State" value={business.state ?? "—"} />
      <KV label="GSTIN" value={business.gstin ?? "—"} />
      <KV label="Business ID" value={business.id.slice(0, 8) + "…"} />
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "rgba(244,237,218,0.4)", borderRadius: 12, padding: 16 }}>
      <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.55)" }}>{label}</div>
      <div className="mt-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 16, color: "hsl(var(--fyn-ink))" }}>{value}</div>
    </div>
  );
}

function ActivityTab({ logs }: { logs: any[] }) {
  if (logs.length === 0) return <PlaceholderTab text="No activity recorded for this user yet." />;
  return (
    <ul className="space-y-3">
      {logs.map((l) => (
        <li key={l.id} className="flex items-start gap-3"
          style={{ paddingBottom: 10, borderBottom: "1px solid rgba(26,16,8,0.06)" }}>
          <span className="grid place-items-center rounded-full text-white shrink-0"
            style={{ width: 28, height: 28, background: "linear-gradient(135deg,#C41E1E,#8B6914)", fontSize: 11 }}>
            {l.action?.[0]?.toUpperCase() ?? "•"}
          </span>
          <div className="min-w-0 flex-1">
            <div style={{ fontFamily: "Roboto, sans-serif", fontWeight: 500, fontSize: 14, color: "hsl(var(--fyn-ink))" }}>
              {(l.action ?? "").replace(/_/g, " ")}
            </div>
            <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.55)" }}>
              {new Date(l.created_at).toLocaleString("en-IN")}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PlaceholderTab({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center text-center py-12"
      style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink) / 0.55)" }}>
      {text}
    </div>
  );
}
