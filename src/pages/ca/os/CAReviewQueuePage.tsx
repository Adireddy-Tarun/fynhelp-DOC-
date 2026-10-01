import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCAPortal } from "@/hooks/useCAPortal";
import { useCARole } from "@/hooks/useCARole";
import { useNavigate } from "@/lib/router-compat";
import { CA, CACard, CAButton, caInputStyle, dateIN } from "@/components/ca/portalUi";
import { ConfidenceChip, ModuleHeader, PermissionNotice, QueueTable, StateChip, StatStrip } from "@/components/ca/os/primitives";
import { postExtraction, reExtractAs, rejectExtraction, type CAExtraction, type ExtractionRow } from "@/lib/caIntake";
import {
  CATEGORY_FIELDS, DOC_CATEGORIES, POST_LABEL, categoryLabel, mapClassification, normaliseRows, validateRows, type DocCategory,
} from "@/lib/caDocCategories";
import { signalOcrCorrection } from "@/lib/caBrainSignals";

type Ex = CAExtraction & {
  source_type?: string | null;
  gmail_sender_email?: string | null;
  gmail_subject?: string | null;
  whatsapp_sender_phone?: string | null;
  whatsapp_sender_name?: string | null;
  extracted: { rows?: ExtractionRow[]; summary?: string } | null;
};
interface ClientOpt { id: string; business_id: string; client_name: string }

const DEST: Record<DocCategory, { label: string; path: (bid: string, cid: string | null) => string } | null> = {
  bank_statement: { label: "View in Reconciliation", path: (b) => `/ca/reconciliation?client=${b}` },
  sales_invoice: { label: "View client invoices", path: (_b, c) => `/ca/clients/${c}?tab=documents` },
  purchase_invoice: { label: "View in ITC recon", path: (b) => `/ca/itc-recon?client=${b}` },
  expense_receipt: null,
  tds_record: { label: "View in TDS tracker", path: (b) => `/ca/tds-tracker?client=${b}` },
  reference_document: { label: "View in Evidence vault", path: (b) => `/ca/vault?client=${b}` },
};

export default function CAReviewQueuePage() {
  const { firmId } = useCAPortal();
  const { can, isLoading: roleLoading } = useCARole();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientOpt[]>([]);
  const [items, setItems] = useState<Ex[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExtractionRow[]>([]);
  const [selClient, setSelClient] = useState("");
  const [selCat, setSelCat] = useState<DocCategory>("reference_document");
  const [assignBusy, setAssignBusy] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [supplierGstin, setSupplierGstin] = useState("");
  const [gstinStatus, setGstinStatus] = useState<"pending" | "verified" | "follow_up" | "not_applicable">("pending");
  const [gstinNote, setGstinNote] = useState("");
  const [gstinBusy, setGstinBusy] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!firmId) return;
    const { data } = await supabase
      .from("ca_document_extractions")
      .select("*")
      .eq("ca_firm_id", firmId)
      .in("review_state", ["needs_review", "auto_accepted", "failed", "pending_verification"])
      .order("created_at", { ascending: true });
    setItems((data ?? []) as unknown as Ex[]);
  }, [firmId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!firmId) return;
    void supabase
      .from("ca_clients")
      .select("id, business_id, client_name")
      .eq("ca_firm_id", firmId)
      .eq("client_status", "active")
      .order("client_name")
      .then(({ data }) => setClients(((data ?? []) as ClientOpt[]).filter((c) => !!c.business_id)));
  }, [firmId]);

  const active = useMemo(() => items.find((i) => i.id === activeId) ?? null, [items, activeId]);

  useEffect(() => {
    if (!active) { setDraft([]); return; }
    const cat = mapClassification(active.classification);
    setSelCat(cat);
    setSelClient(active.business_id ?? "");
    const rows = active.corrected?.rows ?? active.extracted?.rows ?? [];
    setDraft(normaliseRows(cat, rows as Record<string, unknown>[]));
    const firstRow = (rows[0] ?? {}) as Record<string, unknown>;
    setSupplierGstin(String(active.supplier_gstin ?? firstRow.vendor_gstin ?? firstRow.customer_gstin ?? firstRow.supplier_gstin ?? "").toUpperCase());
    setGstinStatus(active.gstin_verification_status ?? "pending");
    setGstinNote(active.gstin_verification_note ?? "");
  }, [active]);

  // Re-shape the table whenever the category changes.
  const onCategoryChange = (c: DocCategory) => {
    setSelCat(c);
    setDraft((d) => normaliseRows(c, d as Record<string, unknown>[]));
  };

  const nameFor = (id: string | null) => clients.find((c) => c.business_id === id)?.client_name ?? (id ? "Unknown client" : "Unassigned");
  const savedCat = active ? mapClassification(active.classification) : "reference_document";
  const errors = useMemo(() => (selCat === "reference_document" ? [] : validateRows(selCat, draft)), [selCat, draft]);
  const fields = CATEGORY_FIELDS[selCat];

  const viewFile = async (ex: Ex) => {
    if (!ex.storage_path) return toast.error("No file path stored for this document. It may have been uploaded before storage paths were tracked.");
    const { data, error } = await supabase.storage.from("ca-client-documents").createSignedUrl(ex.storage_path, 300);
    if (error || !data?.signedUrl) return toast.error("Could not generate file link. Check storage permissions.");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const downloadFile = async (ex: Ex) => {
    if (!ex.storage_path) return toast.error("No file stored for this document");
    const { data, error } = await supabase.storage.from("ca-client-documents").createSignedUrl(ex.storage_path, 60);
    if (error || !data?.signedUrl) return toast.error("Could not generate download link");
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = ex.original_filename ?? "document";
    a.click();
  };

  const saveAssignment = async () => {
    if (!active || !firmId) return;
    if (!selClient) return toast.error("Select a client first");
    setAssignBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id ?? null;
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from("ca_document_extractions")
      .update({ business_id: selClient, classification: selCat, error_message: null, updated_at: nowIso } as never)
      .eq("id", active.id);
    if (error) { setAssignBusy(false); return toast.error(error.message); }

    if (active.gmail_sender_email) {
      const email = active.gmail_sender_email.toLowerCase();
      const { error: mErr } = await supabase.from("ca_email_sender_mappings").upsert({
        ca_firm_id: firmId, business_id: selClient, sender_email: email, sender_domain: email.split("@")[1] ?? null,
        match_method: "manual", confidence: 0.95, confirmed_by_user_id: uid, confirmed_at: nowIso,
      } as never, { onConflict: "ca_firm_id,sender_email" });
      if (mErr) toast.error(`Sender could not be remembered: ${mErr.message}`);
    }
    if (active.whatsapp_sender_phone) {
      let phone = active.whatsapp_sender_phone.replace(/\D/g, "");
      if (phone.length > 10 && phone.startsWith("91")) phone = phone.slice(2);
      const { error: wErr } = await supabase.from("ca_whatsapp_sender_mappings").upsert({
        ca_firm_id: firmId, business_id: selClient, sender_phone: phone, sender_name: active.whatsapp_sender_name ?? null,
        match_method: "manual", confidence: 0.95, confirmed_by_user_id: uid, confirmed_at: nowIso,
      } as never, { onConflict: "ca_firm_id,sender_phone" });
      if (wErr) toast.error(`Sender could not be remembered: ${wErr.message}`);
    }
    void supabase.from("ca_brain_events").insert({
      ca_firm_id: firmId, business_id: selClient, event_type: "document_assigned",
      payload: { from_client: active.business_id, to_client: selClient, from_category: active.classification, to_category: selCat, source_type: active.source_type ?? "upload" },
    } as never).then(() => undefined);
    console.log(`[fyn:review] assigned ${active.id} to ${selClient} as ${selCat}`);
    setAssignBusy(false);
    toast.success(`Assigned to ${nameFor(selClient)} as ${categoryLabel(selCat)}`);
    void load();
  };

  const reExtract = async () => {
    if (!active) return;
    setExtracting(true);
    const res = await reExtractAs(active, selCat);
    setExtracting(false);
    if (!res.ok) return toast.error(res.error ?? "Extraction failed");
    toast.success(selCat === "reference_document" ? "Summary refreshed" : `${res.rows?.length ?? 0} rows extracted as ${categoryLabel(selCat)}`);
    void load();
  };

  const saveGstinReview = async () => {
    if (!active) return;
    const gstin = supplierGstin.trim().toUpperCase();
    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)) {
      return toast.error("This GSTIN does not match the expected 15-character format. Check the bill before saving.");
    }
    if (gstinStatus === "verified" && !gstin) return toast.error("Enter the supplier GSTIN before marking it verified.");
    setGstinBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("ca_document_extractions")
      .update({
        supplier_gstin: gstin || null,
        gstin_verification_status: gstinStatus,
        gstin_verification_note: gstinNote.trim() || null,
        gstin_verified_at: gstinStatus === "verified" ? new Date().toISOString() : null,
        gstin_verified_by: gstinStatus === "verified" ? auth.user?.id ?? null : null,
      })
      .eq("ca_firm_id", active.ca_firm_id)
      .eq("id", active.id);
    setGstinBusy(false);
    if (error) return toast.error(`GSTIN review could not be saved: ${error.message}`);
    toast.success("Supplier GSTIN review saved to this bill");
    void load();
  };

  const saveEdits = async () => {
    if (!active) return;
    const original = normaliseRows(selCat, (active.extracted?.rows ?? []) as Record<string, unknown>[]);
    const changed = JSON.stringify(original) !== JSON.stringify(draft);
    const { error } = await supabase
      .from("ca_document_extractions")
      .update({ corrected: { rows: draft } as never, was_corrected: changed, updated_at: new Date().toISOString() } as never)
      .eq("id", active.id);
    if (error) return toast.error(error.message);
    toast.success("Edits saved");
    void load();
  };

  const assignmentDirty = !!active && (selClient !== (active.business_id ?? "") || selCat !== savedCat);

  const post = async () => {
    if (!active) return;
    if (assignmentDirty) return toast.error("Save the assignment before posting");
    setBusy(true);
    const original = normaliseRows(selCat, (active.extracted?.rows ?? []) as Record<string, unknown>[]);
    const changed = JSON.stringify(original) !== JSON.stringify(draft);
    if (changed) {
      await supabase.from("ca_document_extractions").update({ was_corrected: true } as never).eq("id", active.id);
    }
    const res = await postExtraction(active, selCat === "reference_document" ? [] : draft, selCat, active.business_id);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? "Posting failed. Nothing was saved.");
      if (res.alreadyPosted) void load();
      return;
    }
    const bid = active.business_id;
    const clientRowId = clients.find((c) => c.business_id === bid)?.id ?? null;
    const dest = DEST[selCat];
    const msg = selCat === "reference_document" ? "Filed to the evidence vault" : `${res.posted} rows posted — ${categoryLabel(selCat)}`;
    toast.success(msg, dest && bid && (selCat !== "sales_invoice" || clientRowId)
      ? { action: { label: dest.label, onClick: () => navigate(dest.path(bid, clientRowId)) }, duration: 10000 }
      : undefined);
    if (selCat !== "reference_document") {
      void signalOcrCorrection(active.ca_firm_id, bid, selCat, active.confidence ?? null, draft.length);
    }
    setActiveId(null);
    void load();
  };

  const reject = async () => {
    if (!active) return;
    const reason = window.prompt("Why is this document being rejected?");
    if (!reason) return;
    const err = await rejectExtraction(active, reason);
    if (err) return toast.error(err);
    toast.success("Rejected and logged");
    setActiveId(null);
    void load();
  };

  if (roleLoading) return null;
  if (!can("process")) {
    return (
      <div>
        <ModuleHeader title="Review queue" subtitle="Low-confidence extractions waiting for a human." />
        <PermissionNotice permission="process" />
      </div>
    );
  }

  const isRef = selCat === "reference_document";
  const locked = !!active && (active.review_state === "posted" || active.review_state === "archived" || !!active.posted_at);
  const postDisabled = busy || !active?.business_id || locked || assignmentDirty || (!isRef && (draft.length === 0 || errors.length > 0));
  const labelStyle = { fontFamily: CA.sans, fontSize: 11.5, fontWeight: 600, color: CA.muted } as const;
  const th = { textAlign: "left", fontFamily: CA.sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: CA.faint, padding: "8px 6px", whiteSpace: "nowrap" } as const;

  return (
    <div>
      <ModuleHeader
        title="Review queue"
        subtitle="Assign each document to a client and category, check the extracted values, then post them to the right register. Every posted row keeps a link back to its source document."
      />

      <StatStrip
        items={[
          { label: "In queue", value: String(items.length) },
          { label: "Unassigned", value: String(items.filter((i) => !i.business_id).length) },
          { label: "Failed extraction", value: String(items.filter((i) => i.review_state === "failed").length) },
          { label: "GSTIN follow-up", value: String(items.filter((i) => i.gstin_verification_status === "follow_up").length) },
        ]}
      />

      <CACard style={{ padding: 20, marginBottom: 20 }}>
        {items.length === 0 ? (
          <div style={{ padding: "28px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: CA.sans, fontSize: 14, fontWeight: 700, color: CA.teal, marginBottom: 6 }}>Review queue is clear</div>
            <p style={{ fontFamily: CA.sans, fontSize: 13, color: CA.muted, lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
              Every document has been posted, filed, or rejected. New documents from uploads, Gmail and WhatsApp appear here.
            </p>
          </div>
        ) : (
          <QueueTable
            columns={["Received", "Client", "Document", "Category", "Rows", "Confidence", "State", ""]}
            empty="Queue is clear"
            emptyHint="Every extraction has been reviewed."
            rows={items.map((i) => [
              dateIN(i.created_at),
              nameFor(i.business_id),
              i.original_filename ?? "—",
              categoryLabel(mapClassification(i.classification)),
              String((i.corrected?.rows ?? i.extracted?.rows ?? []).length),
              <ConfidenceChip key="c" value={i.confidence} />,
              <StateChip key="s" value={i.review_state} />,
              <CAButton key="o" variant="ghost" onClick={() => setActiveId(i.id === activeId ? null : i.id)}>
                {i.id === activeId ? "Close" : "Review"}
              </CAButton>,
            ])}
          />
        )}
      </CACard>

      {active && (
        <CACard style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: CA.serif, fontSize: 17, fontWeight: 700, color: CA.ink }}>{active.original_filename}</div>
              <div style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.muted, marginTop: 3 }}>
                {nameFor(active.business_id)} · {categoryLabel(savedCat)}
              </div>
            </div>
            <ConfidenceChip value={active.confidence} />
          </div>

          <div style={{ border: `1px solid ${CA.line}`, borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <div style={{ fontFamily: CA.sans, fontSize: 13, fontWeight: 700, color: CA.ink, marginBottom: 10 }}>Assignment</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              <label style={labelStyle}>
                Client
                <select value={selClient} onChange={(e) => setSelClient(e.target.value)} style={{ ...caInputStyle, height: 36, marginTop: 4 }}>
                  <option value="">Select client…</option>
                  {clients.map((c) => <option key={c.business_id} value={c.business_id}>{c.client_name}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                Category
                <select value={selCat} onChange={(e) => onCategoryChange(e.target.value as DocCategory)} style={{ ...caInputStyle, height: 36, marginTop: 4 }}>
                  {DOC_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <CAButton onClick={() => void saveAssignment()} disabled={assignBusy || !selClient || locked}>
                {assignBusy ? "Saving…" : "Save assignment"}
              </CAButton>
              <CAButton variant="ghost" onClick={() => void reExtract()} disabled={extracting || locked || !active.storage_path}>
                {extracting ? "Extracting…" : "Re-extract as this category"}
              </CAButton>
            </div>
            {assignmentDirty && (
              <div style={{ fontFamily: CA.sans, fontSize: 11.5, color: CA.gold, marginTop: 8 }}>Unsaved assignment — save it before posting.</div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
            <CAButton variant="ghost" onClick={() => void viewFile(active)} style={{ fontSize: 12 }}>View original file</CAButton>
            <CAButton variant="ghost" onClick={() => void downloadFile(active)} style={{ fontSize: 12 }}>Download</CAButton>
            {active.gmail_sender_email && (
              <span style={{ fontFamily: CA.sans, fontSize: 12, color: CA.muted }}>
                From: {active.gmail_sender_email}{active.gmail_subject ? ` · ${active.gmail_subject}` : ""}
              </span>
            )}
            {active.whatsapp_sender_phone && (
              <span style={{ fontFamily: CA.sans, fontSize: 12, color: CA.muted }}>
                WhatsApp: {active.whatsapp_sender_name ? `${active.whatsapp_sender_name} · ` : ""}{active.whatsapp_sender_phone}
              </span>
            )}
          </div>

          {active.error_message && !active.business_id && (
            <div style={{ fontFamily: CA.sans, fontSize: 13, color: CA.red, marginBottom: 12 }}>{active.error_message}</div>
          )}

          {(selCat === "sales_invoice" || selCat === "purchase_invoice") && (
            <div style={{ borderTop: `1px solid ${CA.line}`, borderBottom: `1px solid ${CA.line}`, padding: "16px 0", margin: "8px 0 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <div style={{ fontFamily: CA.sans, fontSize: 13, fontWeight: 700, color: CA.ink }}>Supplier GSTIN review</div>
                <StateChip value={gstinStatus} />
              </div>
              <div style={{ fontFamily: CA.sans, fontSize: 11.5, color: CA.muted, marginBottom: 10 }}>
                Check the GSTIN against the original bill. “Checked by CA” records your review; it is not a live government validation.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, alignItems: "end" }}>
                <label style={labelStyle}>
                  Supplier GSTIN
                  <input value={supplierGstin} onChange={(e) => setSupplierGstin(e.target.value.toUpperCase())} maxLength={15} placeholder="15-character GSTIN" style={{ ...caInputStyle, height: 36, marginTop: 4, fontFamily: CA.mono }} />
                </label>
                <label style={labelStyle}>
                  Review status
                  <select value={gstinStatus} onChange={(e) => setGstinStatus(e.target.value as typeof gstinStatus)} style={{ ...caInputStyle, height: 36, marginTop: 4 }}>
                    <option value="pending">Pending check</option>
                    <option value="verified">Checked by CA</option>
                    <option value="follow_up">Follow-up needed</option>
                    <option value="not_applicable">Not applicable</option>
                  </select>
                </label>
                <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
                  Check note
                  <textarea value={gstinNote} onChange={(e) => setGstinNote(e.target.value)} rows={2} maxLength={1000} style={{ ...caInputStyle, height: "auto", minHeight: 58, padding: "8px 10px", marginTop: 4, resize: "vertical" }} />
                </label>
                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                  <CAButton variant="ghost" disabled={gstinBusy} onClick={() => void saveGstinReview()}>{gstinBusy ? "Saving…" : "Save GSTIN review"}</CAButton>
                </div>
              </div>
            </div>
          )}

          {isRef ? (
            <div style={{ fontFamily: CA.sans, fontSize: 13, color: CA.ink, lineHeight: 1.6, background: CA.page, borderRadius: 8, padding: 14 }}>
              {active.extracted?.summary ?? "Reference document — no ledger rows. It will be kept in the evidence vault for this client."}
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {fields.map((f) => <th key={f} style={th}>{f.replace(/_/g, " ")}</th>)}
                      <th style={th} />
                    </tr>
                  </thead>
                  <tbody>
                    {draft.map((r, i) => (
                      <tr key={i}>
                        {fields.map((f) => (
                          <td key={f} style={{ padding: "4px 4px" }}>
                            {f === "type" ? (
                              <select value={String(r[f] ?? "")} disabled={locked} onChange={(e) => { const n = [...draft]; n[i] = { ...n[i], [f]: e.target.value }; setDraft(n); }} style={{ ...caInputStyle, height: 34, fontSize: 13, minWidth: 90 }}>
                                <option value="">—</option><option value="debit">debit</option><option value="credit">credit</option>
                              </select>
                            ) : (
                              <input
                                style={{ ...caInputStyle, height: 34, fontSize: 13, minWidth: f.includes("name") || f === "description" ? 160 : 100 }}
                                value={String(r[f] ?? "")}
                                disabled={locked}
                                onChange={(e) => { const n = [...draft]; n[i] = { ...n[i], [f]: e.target.value }; setDraft(n); }}
                              />
                            )}
                          </td>
                        ))}
                        <td style={{ padding: "4px 4px" }}>
                          <CAButton variant="ghost" disabled={locked} onClick={() => setDraft(draft.filter((_, j) => j !== i))} style={{ fontSize: 12 }}>Delete row</CAButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {draft.length === 0 && (
                <div style={{ fontFamily: CA.sans, fontSize: 13, color: CA.muted, marginTop: 8 }}>
                  No rows yet. Re-extract as this category, add rows by hand, or reject the document.
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <CAButton variant="ghost" disabled={locked} onClick={() => setDraft([...draft, Object.fromEntries(fields.map((f) => [f, ""]))])}>Add row</CAButton>
                <CAButton variant="ghost" disabled={locked} onClick={() => void saveEdits()}>Save edits</CAButton>
              </div>
              {errors.length > 0 && (
                <ul style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.red, margin: "12px 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                  {errors.slice(0, 12).map((e) => <li key={e}>{e}</li>)}
                  {errors.length > 12 && <li>…and {errors.length - 12} more</li>}
                </ul>
              )}
            </>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
            <CAButton onClick={() => void post()} disabled={postDisabled}>{busy ? "Posting…" : POST_LABEL[selCat]}</CAButton>
            <CAButton variant="danger" onClick={() => void reject()} disabled={locked}>Reject</CAButton>
            {!active.business_id && <span style={{ fontFamily: CA.sans, fontSize: 12, color: CA.gold }}>Assign a client to enable posting.</span>}
          </div>
        </CACard>
      )}
    </div>
  );
}
