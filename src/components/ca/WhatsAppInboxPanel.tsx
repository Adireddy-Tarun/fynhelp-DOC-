import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@/lib/router-compat";
import { CA, CACard, CAButton, CABadge, caInputStyle, caTh, caTd, dateIN } from "@/components/ca/portalUi";
import type { CAClientOption } from "@/hooks/useCAClientOptions";

interface WaRow {
  id: string;
  original_filename: string | null;
  whatsapp_sender_phone: string | null;
  whatsapp_sender_name: string | null;
  whatsapp_caption: string | null;
  whatsapp_match_method: string | null;
  whatsapp_match_confidence: number | null;
  review_state: string;
  business_id: string | null;
  storage_path: string | null;
  created_at: string;
  error_message: string | null;
}

const METHOD_LABEL: Record<string, string> = {
  phone_exact: "Phone match",
  learned_mapping: "Learned sender",
  name_fuzzy: "Name guess",
  manual: "Manual",
  none: "Unmatched",
};

export function WhatsAppInboxPanel({ firmId, clients }: { firmId: string | null; clients: CAClientOption[] }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<WaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!firmId) return;
    setLoading(true);
    const { data } = await supabase
      .from("ca_document_extractions")
      .select("id, original_filename, whatsapp_sender_phone, whatsapp_sender_name, whatsapp_caption, whatsapp_match_method, whatsapp_match_confidence, review_state, business_id, storage_path, created_at, error_message")
      .eq("ca_firm_id", firmId)
      .eq("source_type", "whatsapp")
      .order("created_at", { ascending: false })
      .limit(100);
    setItems((data ?? []) as WaRow[]);
    setLoading(false);
  }, [firmId]);

  useEffect(() => { void load(); }, [load]);

  const nameFor = (id: string | null) => clients.find((c) => c.business_id === id)?.client_name ?? "Unassigned";

  const openFile = async (item: WaRow, download: boolean) => {
    if (!item.storage_path) return toast.error("The original file is not available");
    const { data, error } = await supabase.storage
      .from("ca-client-documents")
      .createSignedUrl(item.storage_path, download ? 60 : 300, download ? { download: item.original_filename ?? true } : undefined);
    if (error || !data?.signedUrl) return toast.error("Could not open the file");
    if (download) window.location.href = data.signedUrl;
    else window.open(data.signedUrl, "_blank", "noopener");
  };

  const decide = async (item: WaRow, action: "confirm" | "reject") => {
    if (!firmId) return;
    const businessId = picks[item.id] ?? item.business_id ?? "";
    if (action === "confirm" && !businessId) return toast.error("Select a client first");
    setBusy(item.id);
    try {
      if (action === "reject") {
        const { error } = await supabase.from("ca_document_extractions")
          .update({ review_state: "rejected", error_message: "Rejected by CA during WhatsApp verification." })
          .eq("ca_firm_id", firmId).eq("id", item.id);
        if (error) throw error;
        toast.success("Document rejected");
      } else {
        const { error } = await supabase.from("ca_document_extractions")
          .update({ business_id: businessId, review_state: "needs_review", error_message: null })
          .eq("ca_firm_id", firmId).eq("id", item.id);
        if (error) throw error;
        const phone = (item.whatsapp_sender_phone ?? "").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
        if (phone) {
          const { data: u } = await supabase.auth.getUser();
          const { error: mErr } = await supabase.from("ca_whatsapp_sender_mappings").upsert({
            ca_firm_id: firmId,
            business_id: businessId,
            sender_phone: phone,
            sender_name: item.whatsapp_sender_name,
            match_method: "manual",
            confidence: 0.95,
            confirmed_by_user_id: u.user?.id ?? null,
            confirmed_at: new Date().toISOString(),
          }, { onConflict: "ca_firm_id,sender_phone" });
          if (mErr) throw mErr;
        }
        toast.success("Assigned. Future documents from this number route here automatically.");
      }
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the document");
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <CACard style={{ padding: 20 }}><div style={{ fontFamily: CA.sans, fontSize: 13, color: CA.faint }}>Loading WhatsApp documents…</div></CACard>;

  if (items.length === 0) {
    return (
      <CACard style={{ padding: 20 }}>
        <div style={{ padding: "32px 24px", textAlign: "center", border: `2px dashed ${CA.line}`, borderRadius: 14 }}>
          <div style={{ fontFamily: CA.serif, fontSize: 17, fontWeight: 700, color: CA.ink, marginBottom: 8 }}>No WhatsApp documents yet</div>
          <p style={{ fontFamily: CA.sans, fontSize: 13, color: CA.muted, maxWidth: 420, margin: "0 auto" }}>
            No WhatsApp documents yet. Connect your WhatsApp Business number on the Integrations page.
          </p>
          <CAButton onClick={() => navigate("/ca/integrations")} style={{ marginTop: 16 }}>Go to Integrations</CAButton>
        </div>
      </CACard>
    );
  }

  const needsDecision = items.filter((i) => i.review_state === "pending_verification" || (!i.business_id && i.review_state !== "rejected"));
  const rest = items.filter((i) => !needsDecision.includes(i));

  const assignControls = (item: WaRow) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <select value={picks[item.id] ?? item.business_id ?? ""} onChange={(e) => setPicks((p) => ({ ...p, [item.id]: e.target.value }))} style={{ ...caInputStyle, flex: 1, minWidth: 200 }}>
        <option value="">Select the correct client</option>
        {clients.map((c) => <option key={c.business_id} value={c.business_id}>{c.client_name}</option>)}
      </select>
      <CAButton disabled={busy === item.id} onClick={() => void decide(item, "confirm")}>{busy === item.id ? "Saving…" : "Confirm"}</CAButton>
      <CAButton variant="danger" disabled={busy === item.id} onClick={() => void decide(item, "reject")}>Reject</CAButton>
    </div>
  );

  return (
    <CACard style={{ padding: 20 }}>
      {needsDecision.length > 0 && (
        <div style={{ background: "rgba(139,105,20,0.06)", border: "1px solid rgba(139,105,20,0.22)", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontFamily: CA.sans, fontSize: 13, fontWeight: 700, color: CA.gold, marginBottom: 12 }}>
            {needsDecision.length} WhatsApp document{needsDecision.length > 1 ? "s" : ""} need a client before posting
          </div>
          {needsDecision.map((item) => (
            <div key={item.id} style={{ background: CA.card, border: `1px solid ${CA.line}`, borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
                <div><div style={{ fontSize: 11, color: CA.faint, fontFamily: CA.sans }}>From</div><div style={{ fontFamily: CA.mono, fontSize: 12.5 }}>{item.whatsapp_sender_name} · {item.whatsapp_sender_phone}</div></div>
                <div><div style={{ fontSize: 11, color: CA.faint, fontFamily: CA.sans }}>File</div><div style={{ fontFamily: CA.sans, fontSize: 12.5, fontWeight: 600 }}>{item.original_filename}</div></div>
                <div><div style={{ fontSize: 11, color: CA.faint, fontFamily: CA.sans }}>Message</div><div style={{ fontFamily: CA.sans, fontSize: 12.5 }}>{item.whatsapp_caption ?? "No caption"}</div></div>
                <div><div style={{ fontSize: 11, color: CA.faint, fontFamily: CA.sans }}>System suggested</div><div style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.gold }}>{item.business_id ? nameFor(item.business_id) : "No suggestion"} · {Math.round(Number(item.whatsapp_match_confidence ?? 0) * 100)} percent</div></div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <CAButton variant="ghost" onClick={() => void openFile(item, false)} style={{ fontSize: 12, padding: "4px 10px" }}>View</CAButton>
                <CAButton variant="ghost" onClick={() => void openFile(item, true)} style={{ fontSize: 12, padding: "4px 10px" }}>Download</CAButton>
              </div>
              {assignControls(item)}
            </div>
          ))}
        </div>
      )}
      {rest.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={caTh}>Received</th><th style={caTh}>Sender</th><th style={caTh}>File</th><th style={caTh}>Caption</th>
              <th style={caTh}>Match</th><th style={caTh}>Confidence</th><th style={caTh}>State</th><th style={caTh}>Client</th><th style={caTh}>Actions</th>
            </tr></thead>
            <tbody>
              {rest.map((item) => (
                <tr key={item.id}>
                  <td style={caTd}>{dateIN(item.created_at)}</td>
                  <td style={caTd}><div style={{ fontWeight: 600 }}>{item.whatsapp_sender_name ?? "—"}</div><div style={{ fontFamily: CA.mono, fontSize: 11.5, color: CA.faint }}>{item.whatsapp_sender_phone}</div></td>
                  <td style={caTd}>{item.original_filename ?? "—"}</td>
                  <td style={{ ...caTd, color: CA.muted }}>{item.whatsapp_caption ?? "—"}</td>
                  <td style={caTd}><CABadge tone="teal">{METHOD_LABEL[item.whatsapp_match_method ?? "none"] ?? item.whatsapp_match_method}</CABadge></td>
                  <td style={{ ...caTd, fontFamily: CA.mono }}>{Math.round(Number(item.whatsapp_match_confidence ?? 0) * 100)}%</td>
                  <td style={caTd}><CABadge tone={item.review_state === "posted" ? "green" : item.review_state === "rejected" ? "red" : item.review_state === "needs_review" ? "amber" : "grey"}>{item.review_state.replace(/_/g, " ")}</CABadge></td>
                  <td style={caTd}>{nameFor(item.business_id)}</td>
                  <td style={caTd}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <CAButton variant="ghost" onClick={() => void openFile(item, false)} style={{ fontSize: 12, padding: "4px 10px" }}>View</CAButton>
                      <CAButton variant="ghost" onClick={() => void openFile(item, true)} style={{ fontSize: 12, padding: "4px 10px" }}>Download</CAButton>
                      {item.review_state === "needs_review" && item.business_id && (
                        <CAButton onClick={() => navigate("/ca/intake/review")} style={{ fontSize: 12, padding: "4px 10px" }}>Review</CAButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CACard>
  );
}
