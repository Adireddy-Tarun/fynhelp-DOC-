import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCAPortal } from "@/hooks/useCAPortal";
import { useCARole } from "@/hooks/useCARole";
import { useCAClientOptions } from "@/hooks/useCAClientOptions";
import { CA, CACard, CAButton, caInputStyle, dateIN } from "@/components/ca/portalUi";
import { ConfidenceChip, ModuleHeader, PermissionNotice, QueueTable, StateChip, StatStrip } from "@/components/ca/os/primitives";
import {
  DOC_CLASS_LABELS,
  postExtraction,
  rejectExtraction,
  type CADocClass,
  type CAExtraction,
  type ExtractionRow,
} from "@/lib/caIntake";
import { signalOcrCorrection } from "@/lib/caBrainSignals";

const FIELDS: Record<string, string[]> = {
  bank: ["date", "description", "amount", "direction"],
  invoice: ["customer", "invoice_number", "amount", "date"],
  expense: ["vendor", "category", "amount", "date"],
};

export default function CAReviewQueuePage() {
  const { firmId } = useCAPortal();
  const { can, isLoading: roleLoading } = useCARole();
  const { clients } = useCAClientOptions();
  const [items, setItems] = useState<CAExtraction[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExtractionRow[]>([]);
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
      .in("review_state", ["needs_review", "auto_accepted", "failed"])
      .order("created_at", { ascending: true });
    setItems((data ?? []) as unknown as CAExtraction[]);
  }, [firmId]);

  useEffect(() => {
    void load();
  }, [load]);

  const active = useMemo(() => items.find((i) => i.id === activeId) ?? null, [items, activeId]);

  useEffect(() => {
    if (!active) {
      setDraft([]);
      return;
    }
    const rows = active.corrected?.rows ?? active.extracted?.rows ?? [];
    setDraft(rows.map((r) => ({ ...r })));
    const firstRow = rows[0] ?? {};
    setSupplierGstin(String(active.supplier_gstin ?? firstRow.supplier_gstin ?? firstRow.vendor_gstin ?? firstRow.gstin ?? "").toUpperCase());
    setGstinStatus(active.gstin_verification_status ?? "pending");
    setGstinNote(active.gstin_verification_note ?? "");
  }, [active]);

  const nameFor = (id: string) => clients.find((c) => c.business_id === id)?.client_name ?? "Unknown client";

  const viewFile = async (extraction: CAExtraction) => {
    const path = (extraction as any).storage_path ?? (extraction as any).file_path ?? (extraction as any).storage_key ?? null;
    if (!path) {
      toast.error("No file path stored for this document. It may have been uploaded before storage paths were tracked.");
      return;
    }
    const { data, error } = await supabase.storage
      .from("ca-client-documents")
      .createSignedUrl(path, 300);
    if (error || !data?.signedUrl) {
      toast.error("Could not generate file link. Check storage permissions.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const downloadFile = async (extraction: CAExtraction) => {
    const path = (extraction as any).storage_path ?? (extraction as any).file_path ?? null;
    if (!path) { toast.error("No file stored for this document"); return; }
    const { data, error } = await supabase.storage.from("ca-client-documents").createSignedUrl(path, 60);
    if (error || !data?.signedUrl) { toast.error("Could not generate download link"); return; }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = extraction.original_filename ?? "document";
    a.click();
  };

  const saveGstinReview = async () => {
    if (!active) return;
    const gstin = supplierGstin.trim().toUpperCase();
    const validFormat = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin);
    if (gstin && !validFormat) {
      toast.error("This GSTIN does not match the expected 15-character format. Check the bill before saving.");
      return;
    }
    if (gstinStatus === "verified" && !gstin) {
      toast.error("Enter the supplier GSTIN before marking it verified.");
      return;
    }
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

  const post = async () => {
    if (!active) return;
    setBusy(true);
    const res = await postExtraction(active, draft);
    setBusy(false);
    if (!res.ok) return toast.error(res.error ?? "Could not post");
    toast.success(`${res.posted} rows posted to the ledger`);
    void signalOcrCorrection(
      active.ca_firm_id,
      active.business_id,
      active.classification,
      active.confidence ?? null,
      draft.length,
    );
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

  const fields = active ? FIELDS[active.classification] ?? [] : [];

  return (
    <div>
      <ModuleHeader
        title="Review queue"
        subtitle="Review extracted bill details, record a supplier GSTIN check, then post approved rows. Every posted row keeps a link back to its source document."
      />

      <CACard style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ fontFamily: CA.sans, fontSize: 12, fontWeight: 700, color: CA.ink, marginBottom: 10 }}>Bill processing trail</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 8 }}>
          {[
            ["1 · Classified", "Filename and document type"],
            ["2 · Read", "OCR or file parser extracts fields"],
            ["3 · Confidence", "Completeness score routes review"],
            ["4 · CA review", "Check values and supplier GSTIN"],
            ["5 · Ledger", "Post, then follow reconciliation"],
          ].map(([title, detail], index) => (
            <div key={title} style={{ borderLeft: `2px solid ${index < 3 ? CA.teal : CA.line}`, padding: "4px 9px" }}>
              <div style={{ fontFamily: CA.sans, fontSize: 11.5, color: CA.ink, fontWeight: 700 }}>{title}</div>
              <div style={{ fontFamily: CA.sans, fontSize: 11, color: CA.muted, lineHeight: 1.45, marginTop: 3 }}>{detail}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: CA.sans, fontSize: 11.5, color: CA.muted, marginTop: 10 }}>
          A high confidence score means the extraction is ready; ledger posting still requires the CA action below. GSTIN review here records your check and does not query the GST authority or file a return.
        </div>
      </CACard>

      <StatStrip
        items={[
          { label: "In queue", value: String(items.length) },
          { label: "Needs review", value: String(items.filter((i) => i.review_state === "needs_review").length) },
          { label: "Failed extraction", value: String(items.filter((i) => i.review_state === "failed").length) },
        ]}
      />

      <CACard style={{ padding: 20, marginBottom: 20 }}>
        {items.length === 0 ? (
          <div style={{ padding: "28px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: CA.sans, fontSize: 14, fontWeight: 700, color: "#1F5A46", marginBottom: 6 }}>
              Review queue is clear
            </div>
            <p style={{ fontFamily: CA.sans, fontSize: 13, color: CA.muted, lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
              All extracted documents are either posted to the ledger or awaiting upload. High confidence extractions post automatically, only items that need a human check appear here.
            </p>
          </div>
        ) : (
          <QueueTable
            columns={["Received", "Client", "Document", "Class", "Rows", "Confidence", "State", ""]}
            empty="Queue is clear"
            emptyHint="Every extraction has been reviewed or auto-accepted."
            rows={items.map((i) => [
              dateIN(i.created_at),
              nameFor(i.business_id),
              i.original_filename ?? "—",
              DOC_CLASS_LABELS[i.classification as CADocClass] ?? i.classification,
              String((i.extracted?.rows ?? []).length),
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
                {nameFor(active.business_id)} · {DOC_CLASS_LABELS[active.classification as CADocClass] ?? active.classification}
              </div>
            </div>
            <ConfidenceChip value={active.confidence} />
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <CAButton
              variant="ghost"
              onClick={() => viewFile(active)}
              style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              View original file
            </CAButton>
            <CAButton
              variant="ghost"
              onClick={() => downloadFile(active)}
              style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </CAButton>
            {(active as any).gmail_sender_email && (
              <span style={{ fontFamily: CA.sans, fontSize: 12, color: CA.muted }}>
                From: {(active as any).gmail_sender_email}
                {(active as any).gmail_subject ? ` · ${(active as any).gmail_subject}` : ""}
              </span>
            )}
          </div>

          {active.error_message && (
            <div style={{ fontFamily: CA.sans, fontSize: 13, color: CA.red, marginBottom: 12 }}>{active.error_message}</div>
          )}

          <div style={{ borderTop: `1px solid ${CA.line}`, borderBottom: `1px solid ${CA.line}`, padding: "16px 0", margin: "8px 0 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <div style={{ fontFamily: CA.sans, fontSize: 13, fontWeight: 700, color: CA.ink }}>Supplier GSTIN review</div>
              <StateChip value={gstinStatus} />
            </div>
            <div style={{ fontFamily: CA.sans, fontSize: 11.5, color: CA.muted, marginBottom: 10 }}>
              Check the GSTIN against the original bill and your approved source. “Verified” records a CA review; it is not a live government validation.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, alignItems: "end" }}>
              <label style={{ fontFamily: CA.sans, fontSize: 11.5, fontWeight: 600, color: CA.muted }}>
                Supplier GSTIN
                <input value={supplierGstin} onChange={(event) => setSupplierGstin(event.target.value.toUpperCase())} maxLength={15} placeholder="15-character GSTIN" style={{ ...caInputStyle, height: 36, marginTop: 4, fontFamily: CA.mono, textTransform: "uppercase" }} />
              </label>
              <label style={{ fontFamily: CA.sans, fontSize: 11.5, fontWeight: 600, color: CA.muted }}>
                Review status
                <select value={gstinStatus} onChange={(event) => setGstinStatus(event.target.value as typeof gstinStatus)} style={{ ...caInputStyle, height: 36, marginTop: 4 }}>
                  <option value="pending">Pending check</option>
                  <option value="verified">Checked by CA</option>
                  <option value="follow_up">Follow-up needed</option>
                  <option value="not_applicable">Not applicable</option>
                </select>
              </label>
              <label style={{ gridColumn: "1 / -1", fontFamily: CA.sans, fontSize: 11.5, fontWeight: 600, color: CA.muted }}>
                Check note
                <textarea value={gstinNote} onChange={(event) => setGstinNote(event.target.value)} rows={2} maxLength={1000} placeholder="Record the evidence checked or the follow-up required" style={{ ...caInputStyle, height: "auto", minHeight: 58, padding: "8px 10px", marginTop: 4, resize: "vertical" }} />
              </label>
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                <CAButton variant="ghost" disabled={gstinBusy} onClick={() => void saveGstinReview()}>{gstinBusy ? "Saving…" : "Save GSTIN review"}</CAButton>
              </div>
            </div>
          </div>

          {fields.length === 0 || draft.length === 0 ? (
            <div style={{ fontFamily: CA.sans, fontSize: 13, color: CA.muted }}>
              No extractable rows. Reclassify the document in the inbox or reject it with a reason.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {fields.map((f) => (
                      <th
                        key={f}
                        style={{
                          textAlign: "left",
                          fontFamily: CA.sans,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: CA.faint,
                          padding: "8px 6px",
                        }}
                      >
                        {f.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {draft.map((r, i) => (
                    <tr key={i}>
                      {fields.map((f) => (
                        <td key={f} style={{ padding: "4px 6px" }}>
                          <input
                            style={{ ...caInputStyle, height: 34, fontSize: 13 }}
                            value={String(r[f] ?? "")}
                            onChange={(e) => {
                              const next = [...draft];
                              next[i] = { ...next[i], [f]: e.target.value };
                              setDraft(next);
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!active.business_id && (
            <div style={{
              background: "rgba(139,105,20,0.07)",
              border: "1px solid rgba(139,105,20,0.2)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 10,
            }}>
              <div style={{ fontFamily: CA.sans, fontSize: 12.5, fontWeight: 600, color: "#8B6914", marginBottom: 8 }}>
                Assign to a client before reviewing
              </div>
              <select
                onChange={async (e) => {
                  if (!e.target.value) return;
                  const { error } = await supabase
                    .from("ca_document_extractions")
                    .update({ business_id: e.target.value } as never)
                    .eq("id", active.id);
                  if (error) { toast.error(error.message); return; }
                  toast.success("Client assigned");
                  void load();
                }}
                style={{
                  fontFamily: CA.sans,
                  fontSize: 13,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(23,18,8,0.2)",
                  background: "#FFFDF9",
                  color: "#171208",
                  width: "100%",
                  cursor: "pointer",
                }}
              >
                <option value="">Select client to assign…</option>
                {clients.map((c) => (
                  <option key={c.business_id} value={c.business_id}>{c.client_name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <CAButton onClick={post} disabled={busy || draft.length === 0 || !active.business_id}>
              Confirm & post to ledger
            </CAButton>
            <CAButton variant="danger" onClick={reject}>
              Reject
            </CAButton>
          </div>
        </CACard>
      )}
    </div>
  );
}
