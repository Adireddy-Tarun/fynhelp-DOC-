import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, PauseCircle, RotateCcw, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Firm = {
  id: string;
  firm_name: string | null;
  ca_name: string | null;
  icai_membership_number: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  verification_status: string | null;
  verification_submitted_at: string | null;
  verification_reviewed_at: string | null;
  verification_rejected_reason: string | null;
  created_at: string | null;
};

type TabKey = "pending" | "approved" | "rejected";
const TABS: { key: TabKey; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const TEAL = "#0F6E56";
const INK = "#1A1A1A";
const BORDER = "rgba(26,26,26,0.10)";

const BADGE: Record<string, { bg: string; fg: string; label: string }> = {
  pending: { bg: "#FDF3DC", fg: "#8A6100", label: "Pending" },
  approved: { bg: "#E3F5EC", fg: "#0F6E56", label: "Approved" },
  rejected: { bg: "#FCE8E8", fg: "#A93838", label: "Rejected" },
};

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function CAApprovalsPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("pending");
  const [reasonFor, setReasonFor] = useState<{ id: string; action: "reject" | "suspend" } | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (announce = true) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("ca-admin-review", { body: { op: "list" } });
    setLoading(false);
    if (error || !data?.success) {
      toast.error(data?.error ?? error?.message ?? "Could not load CA firms");
      setFirms([]);
      return;
    }
    const rows: Firm[] = data.firms ?? [];
    setFirms(rows);
    if (announce) {
      const count = (s: TabKey) => rows.filter((f) => (f.verification_status ?? "pending") === s).length;
      // Verification: confirms DB reads are working.
      console.log("[CA Approvals] pending:", count("pending"), "approved:", count("approved"), "rejected:", count("rejected"));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const grouped = useMemo(() => {
    const g: Record<TabKey, Firm[]> = { pending: [], approved: [], rejected: [] };
    for (const f of firms) {
      const s = (f.verification_status ?? "pending") as TabKey;
      if (g[s]) g[s].push(f);
    }
    return g;
  }, [firms]);

  const run = async (firm: Firm, action: "approve" | "reject" | "suspend" | "reactivate") => {
    if ((action === "reject" || action === "suspend") && !reason.trim()) {
      setReasonError("A reason is required.");
      return;
    }
    setBusyId(firm.id);
    const { data, error } = await supabase.functions.invoke("ca-admin-review", {
      body: { op: "review", firm_id: firm.id, action, reason: reason.trim() || undefined },
    });
    setBusyId(null);
    if (error || !data?.success) {
      toast.error(data?.error ?? error?.message ?? "Action failed");
      return;
    }
    setReasonFor(null);
    setReason("");
    setReasonError("");
    const name = firm.firm_name ?? "Firm";
    const verb =
      action === "approve" ? "approved"
      : action === "reject" ? "rejected"
      : action === "suspend" ? "suspended"
      : "reactivated";
    toast.success(
      data.email_sent
        ? `${name} ${verb}. Notification email sent to ${firm.email}`
        : `${name} ${verb}. Email not sent${data.email_error ? `: ${data.email_error}` : ""}`,
    );
    await load(false);
  };

  const btn = (bg: string): React.CSSProperties => ({
    background: bg, color: "#fff", border: "none", borderRadius: 9,
    padding: "9px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "Inter, sans-serif",
  });

  const list = grouped[tab];

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: INK }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: INK, margin: 0 }}>
            CA Approvals
          </h1>
          <p style={{ fontSize: 13.5, color: "rgba(26,26,26,0.6)", marginTop: 6 }}>
            Review and action CA firm verification requests.
          </p>
        </div>
        <button
          onClick={() => load()}
          style={{ ...btn("#FFFFFF"), color: INK, border: `1px solid ${BORDER}` }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-6 flex-wrap">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setReasonFor(null); setReason(""); setReasonError(""); }}
              style={{
                background: active ? TEAL : "#FFFFFF",
                color: active ? "#FFFFFF" : "rgba(26,26,26,0.7)",
                border: `1px solid ${active ? TEAL : BORDER}`,
                borderRadius: 999, padding: "8px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
              }}
            >
              {t.label} ({grouped[t.key].length})
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="mt-6 grid gap-4">
        {loading && (
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 28, fontSize: 14 }}>
            Loading CA firms…
          </div>
        )}

        {!loading && list.length === 0 && (
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 28, fontSize: 14, color: "rgba(26,26,26,0.6)" }}>
            No {tab} CA firms.
          </div>
        )}

        {!loading && list.map((f) => {
          const badge = BADGE[(f.verification_status ?? "pending")] ?? BADGE.pending;
          const showReason = reasonFor?.id === f.id;
          const busy = busyId === f.id;
          return (
            <div key={f.id} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: TEAL }}>{f.firm_name ?? "Unnamed firm"}</div>
                  <div style={{ fontSize: 13.5, color: "rgba(26,26,26,0.72)", marginTop: 6, lineHeight: 1.7 }}>
                    <div>{f.ca_name ?? "—"} · ICAI {f.icai_membership_number ?? "—"}</div>
                    <div>{f.email ?? "—"} · {f.phone ?? "—"}</div>
                    <div>{[f.city, f.state].filter(Boolean).join(", ") || "—"}</div>
                    <div style={{ color: "rgba(26,26,26,0.5)", fontSize: 12.5, marginTop: 4 }}>
                      Submitted {fmtDate(f.verification_submitted_at ?? f.created_at)}
                      {f.verification_reviewed_at ? ` · Reviewed ${fmtDate(f.verification_reviewed_at)}` : ""}
                    </div>
                    {f.verification_rejected_reason && (
                      <div style={{ color: "#A93838", fontSize: 12.5, marginTop: 4 }}>
                        Reason: {f.verification_rejected_reason}
                      </div>
                    )}
                  </div>
                </div>
                <span style={{
                  background: badge.bg, color: badge.fg, fontSize: 11.5, fontWeight: 700,
                  padding: "5px 12px", borderRadius: 999, textTransform: "uppercase", letterSpacing: 0.6,
                }}>
                  {badge.label}
                </span>
              </div>

              {showReason && (
                <div className="mt-4">
                  <input
                    autoFocus
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); if (e.target.value.trim()) setReasonError(""); }}
                    placeholder={reasonFor?.action === "reject" ? "Reason for rejection (required)" : "Reason for suspension (required)"}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 9,
                      border: `1px solid ${reasonError ? "#A93838" : BORDER}`,
                      fontSize: 13.5, fontFamily: "Inter, sans-serif", color: INK, background: "#FCFBF9",
                    }}
                  />
                  {reasonError && <div style={{ color: "#A93838", fontSize: 12, marginTop: 6 }}>{reasonError}</div>}
                </div>
              )}

              <div className="flex items-center gap-3 mt-4 flex-wrap">
                {busy && <Loader2 size={16} className="animate-spin" color={TEAL} />}
                {tab === "pending" && (
                  <>
                    {(!showReason || reasonFor?.action !== "reject") && (
                      <button disabled={busy} style={btn(TEAL)} onClick={() => run(f, "approve")}>
                        <CheckCircle2 size={15} /> Approve
                      </button>
                    )}
                    {showReason && reasonFor?.action === "reject" ? (
                      <>
                        <button disabled={busy} style={btn("#A93838")} onClick={() => run(f, "reject")}>
                          <XCircle size={15} /> Confirm reject
                        </button>
                        <button
                          disabled={busy}
                          style={{ ...btn("#FFFFFF"), color: INK, border: `1px solid ${BORDER}` }}
                          onClick={() => { setReasonFor(null); setReason(""); setReasonError(""); }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button disabled={busy} style={btn("#A93838")} onClick={() => { setReasonFor({ id: f.id, action: "reject" }); setReason(""); setReasonError(""); }}>
                        <XCircle size={15} /> Reject
                      </button>
                    )}
                  </>
                )}

                {tab === "approved" && (
                  showReason ? (
                    <>
                      <button disabled={busy} style={btn("#B8860B")} onClick={() => run(f, "suspend")}>
                        <PauseCircle size={15} /> Confirm suspend
                      </button>
                      <button
                        disabled={busy}
                        style={{ ...btn("#FFFFFF"), color: INK, border: `1px solid ${BORDER}` }}
                        onClick={() => { setReasonFor(null); setReason(""); setReasonError(""); }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button disabled={busy} style={btn("#B8860B")} onClick={() => { setReasonFor({ id: f.id, action: "suspend" }); setReason(""); setReasonError(""); }}>
                      <PauseCircle size={15} /> Suspend
                    </button>
                  )
                )}

                {tab === "rejected" && (
                  <button disabled={busy} style={btn(TEAL)} onClick={() => run(f, "reactivate")}>
                    <RotateCcw size={15} /> Reactivate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
