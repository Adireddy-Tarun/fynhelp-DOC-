import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Briefcase, Check, X, Clock } from "lucide-react";

interface AccessRequest {
  id: string;
  ca_firm_id: string;
  target_gstin: string;
  access_level: string;
  message: string | null;
  status: string;
  created_at: string;
  responded_at: string | null;
}

interface FirmInfo {
  id: string;
  firm_name: string;
  membership_number: string | null;
  city: string | null;
  state: string | null;
  is_verified: boolean;
}

interface ActiveAccess {
  id: string;
  ca_firm_id: string;
  access_level: string;
  granted_at: string | null;
}

const accessLabel: Record<string, string> = {
  read_only: "Read-only",
  full_read: "Full read",
  report_download: "Report download",
  data_entry: "Data entry",
};

export default function CAAccessPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [active, setActive] = useState<ActiveAccess[]>([]);
  const [firms, setFirms] = useState<Record<string, FirmInfo>>({});
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: reqs }, { data: acc }] = await Promise.all([
      supabase.from("ca_access_requests").select("id, ca_firm_id, target_gstin, access_level, message, status, created_at, responded_at").order("created_at", { ascending: false }),
      supabase.from("ca_client_access").select("id, ca_firm_id, access_level, granted_at, is_active").eq("is_active", true),
    ]);
    const r = (reqs ?? []) as AccessRequest[];
    const a = (acc ?? []) as ActiveAccess[];
    setRequests(r);
    setActive(a);

    const firmIds = Array.from(new Set([...r.map((x) => x.ca_firm_id), ...a.map((x) => x.ca_firm_id)]));
    if (firmIds.length) {
      const { data: f } = await supabase
        .from("ca_firms")
        .select("id, firm_name, membership_number, city, state, is_verified")
        .in("id", firmIds);
      const map: Record<string, FirmInfo> = {};
      (f ?? []).forEach((x: any) => { map[x.id] = x; });
      setFirms(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const respond = async (id: string, status: "approved" | "rejected") => {
    setActingId(id);
    const { error } = await supabase
      .from("ca_access_requests")
      .update({ status })
      .eq("id", id);
    setActingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "approved" ? "Access granted" : "Request rejected");
    load();
  };

  const revoke = async (id: string) => {
    setActingId(id);
    const { error } = await supabase
      .from("ca_client_access")
      .update({ is_active: false })
      .eq("id", id);
    setActingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Access revoked");
    load();
  };

  const pending = requests.filter((r) => r.status === "pending");
  const history = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold" style={{ color: "#1A1008", fontFamily: "Inter" }}>CA Access</h2>
        <p className="text-sm mt-1" style={{ color: "rgba(26,16,8,0.60)" }}>
          Manage which Chartered Accountants can view and act on your business data.
        </p>
      </header>

      {/* Pending requests */}
      <section>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#8B6914" }}>Pending requests {pending.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#C41E1E] text-white text-[10px]">{pending.length}</span>}</h3>

        {loading && <p className="text-sm" style={{ color: "rgba(26,16,8,0.50)" }}>Loading…</p>}
        {!loading && pending.length === 0 && (
          <div className="bg-card border rounded-lg p-6 text-center" style={{ borderColor: "#E0D9C8" }}>
            <Clock size={28} className="mx-auto mb-2" style={{ color: "rgba(26,16,8,0.30)" }} />
            <p className="text-sm" style={{ color: "rgba(26,16,8,0.60)" }}>No pending requests.</p>
          </div>
        )}
        <div className="space-y-3">
          {pending.map((r) => {
            const firm = firms[r.ca_firm_id];
            return (
              <div key={r.id} className="bg-card border rounded-lg p-5" style={{ borderColor: "#E0D9C8" }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#FAF7F0", color: "#8B6914" }}>
                    <Briefcase size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-[15px]" style={{ color: "#1A1008" }}>
                        {firm?.firm_name ?? "Chartered Accountant firm"}
                      </h4>
                      {firm?.is_verified && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "#DCFCE7", color: "#166534" }}>VERIFIED</span>
                      )}
                    </div>
                    <p className="text-[12px] mt-0.5" style={{ color: "rgba(26,16,8,0.55)" }}>
                      {firm?.membership_number ? `M.No. ${firm.membership_number} · ` : ""}{firm?.city ?? ""}{firm?.city && firm?.state ? ", " : ""}{firm?.state ?? ""}
                    </p>
                    <p className="text-[13px] mt-3" style={{ color: "rgba(26,16,8,0.75)" }}>
                      Requesting <span className="font-semibold">{accessLabel[r.access_level] ?? r.access_level}</span> access
                    </p>
                    {r.message && (
                      <blockquote className="text-[13px] mt-2 pl-3 border-l-2 italic" style={{ borderColor: "#D4C9A8", color: "rgba(26,16,8,0.65)" }}>
                        "{r.message}"
                      </blockquote>
                    )}
                    <p className="text-[11px] mt-2" style={{ color: "rgba(26,16,8,0.40)" }}>
                      Requested {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    disabled={actingId === r.id}
                    onClick={() => respond(r.id, "approved")}
                    className="h-9 px-4 rounded text-sm font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
                    style={{ background: "#16A34A" }}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    disabled={actingId === r.id}
                    onClick={() => respond(r.id, "rejected")}
                    className="h-9 px-4 rounded text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
                    style={{ background: "#FFFFFF", border: "1px solid #E0D9C8", color: "#1A1008" }}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active access */}
      <section>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#8B6914" }}>Active access</h3>
        {!loading && active.length === 0 && (
          <p className="text-sm" style={{ color: "rgba(26,16,8,0.55)" }}>No CAs currently have access to your business.</p>
        )}
        <div className="space-y-2">
          {active.map((a) => {
            const firm = firms[a.ca_firm_id];
            return (
              <div key={a.id} className="bg-card border rounded-lg p-4 flex items-center justify-between" style={{ borderColor: "#E0D9C8" }}>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "#1A1008" }}>{firm?.firm_name ?? "CA firm"}</div>
                  <div className="text-[12px]" style={{ color: "rgba(26,16,8,0.60)" }}>
                    {accessLabel[a.access_level] ?? a.access_level} · since {a.granted_at ? new Date(a.granted_at).toLocaleDateString() : "-"}
                  </div>
                </div>
                <button
                  disabled={actingId === a.id}
                  onClick={() => revoke(a.id)}
                  className="h-8 px-3 rounded text-xs font-medium disabled:opacity-50"
                  style={{ background: "#FFFFFF", border: "1px solid #E0D9C8", color: "#C41E1E" }}
                >
                  Revoke access
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* History */}
      {history.length > 0 && (
        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#8B6914" }}>Past requests</h3>
          <div className="space-y-1.5">
            {history.map((r) => {
              const firm = firms[r.ca_firm_id];
              return (
                <div key={r.id} className="text-[13px] flex items-center gap-2 py-1.5 px-1" style={{ color: "rgba(26,16,8,0.65)" }}>
                  <span className="font-medium">{firm?.firm_name ?? "CA firm"}</span>
                  <span>·</span>
                  <span className={r.status === "approved" ? "text-[#166534]" : "text-[#991B1B]"}>{r.status}</span>
                  <span className="ml-auto text-[11px]" style={{ color: "rgba(26,16,8,0.40)" }}>
                    {r.responded_at ? new Date(r.responded_at).toLocaleDateString() : new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
