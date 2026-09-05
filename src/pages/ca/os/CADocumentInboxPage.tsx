import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCAPortal } from "@/hooks/useCAPortal";
import { useCARole } from "@/hooks/useCARole";
import { useCAClientOptions } from "@/hooks/useCAClientOptions";
import { CA, CACard, CAButton, caInputStyle, dateIN } from "@/components/ca/portalUi";
import { ConfidenceChip, ModuleHeader, PermissionNotice, QueueTable, StateChip, StatStrip } from "@/components/ca/os/primitives";
import { DOC_CLASS_LABELS, guessClassification, intakeDocument, type CADocClass } from "@/lib/caIntake";

interface Row {
  id: string;
  business_id: string;
  original_filename: string | null;
  classification: string;
  confidence: number;
  review_state: string;
  created_at: string;
  error_message: string | null;
}

const CLASSES: CADocClass[] = ["bank", "invoice", "expense", "challan", "other"];

export default function CADocumentInboxPage() {
  const { firmId } = useCAPortal();
  const { can, isLoading: roleLoading } = useCARole();
  const { clients } = useCAClientOptions();
  const [rows, setRows] = useState<Row[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [period, setPeriod] = useState("");
  const [classification, setClassification] = useState<CADocClass | "auto">("auto");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!firmId) return;
    const { data } = await supabase
      .from("ca_document_extractions")
      .select("id, business_id, original_filename, classification, confidence, review_state, created_at, error_message")
      .eq("ca_firm_id", firmId)
      .order("created_at", { ascending: false })
      .limit(100);
    setRows((data ?? []) as Row[]);
  }, [firmId]);

  useEffect(() => {
    void load();
  }, [load]);

  const nameFor = (id: string) => clients.find((c) => c.business_id === id)?.client_name ?? "Unknown client";

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !firmId) return;
    if (!businessId) {
      toast.error("Pick the client this document belongs to");
      return;
    }
    setBusy(true);
    for (const file of Array.from(files)) {
      const cls = classification === "auto" ? guessClassification(file.name) : classification;
      const res = await intakeDocument({
        file,
        firmId,
        businessId,
        clientReferenceCode: businessId.slice(0, 8).toUpperCase(),
        period: period || null,
        classification: cls,
      });
      if (!res.ok) {
        toast.error(`${file.name}: ${res.error}`);
      } else if (res.reviewState === "auto_accepted") {
        toast.success(`${file.name}: ${res.rowCount} rows extracted, high confidence`);
      } else if (res.reviewState === "failed") {
        toast.warning(`${file.name}: needs manual classification`);
      } else {
        toast.info(`${file.name}: sent to review queue`);
      }
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    void load();
  };

  if (roleLoading) return null;
  if (!can("upload")) {
    return (
      <div>
        <ModuleHeader title="Intake inbox" subtitle="Documents collected from clients." />
        <PermissionNotice permission="upload" />
      </div>
    );
  }

  const needsReview = rows.filter((r) => r.review_state === "needs_review").length;
  const posted = rows.filter((r) => r.review_state === "posted").length;

  return (
    <div>
      <ModuleHeader
        title="Intake inbox"
        subtitle="Drop a photo or PDF. It is stored against the client, read by AI, classified, scored for confidence, and routed to review or straight through."
      />

      <StatStrip
        items={[
          { label: "Documents", value: String(rows.length) },
          { label: "Awaiting review", value: String(needsReview) },
          { label: "Posted", value: String(posted) },
        ]}
      />

      <CACard style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
          <select style={caInputStyle} value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
            <option value="">Select client…</option>
            {clients.map((c) => (
              <option key={c.business_id} value={c.business_id}>
                {c.client_name}
              </option>
            ))}
          </select>
          <select style={caInputStyle} value={classification} onChange={(e) => setClassification(e.target.value as CADocClass | "auto")}>
            <option value="auto">Classify automatically</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {DOC_CLASS_LABELS[c]}
              </option>
            ))}
          </select>
          <input style={caInputStyle} placeholder="Period e.g. 2026-07" value={period} onChange={(e) => setPeriod(e.target.value)} />
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={busy}
            style={{ fontFamily: CA.sans, fontSize: 13 }}
          />
          {busy && <span style={{ fontFamily: CA.sans, fontSize: 13, color: CA.teal }}>Reading documents…</span>}
        </div>
        <div style={{ fontFamily: CA.sans, fontSize: 12, color: CA.muted, marginTop: 10 }}>
          Bank statements, sales invoices and expense bills are extracted automatically. Challans and other files are stored and flagged
          for manual classification.
        </div>
      </CACard>

      <CACard style={{ padding: 20 }}>
        {rows.length === 0 ? (
          <div style={{
            padding: "32px 24px", textAlign: "center",
            border: "2px dashed rgba(169,56,56,0.20)", borderRadius: 14,
            background: "rgba(169,56,56,0.02)",
          }}>
            <div style={{ fontFamily: CA.serif, fontSize: 18, fontWeight: 700, color: CA.ink, marginBottom: 8 }}>
              Upload your first document
            </div>
            <p style={{ fontFamily: CA.sans, fontSize: 13.5, color: CA.muted, lineHeight: 1.65, maxWidth: 440, margin: "0 auto 20px" }}>
              Upload a bank statement in CSV or PDF, an invoice, or an expense bill for this client. The system reads it automatically. High confidence extractions post to the ledger immediately. Low confidence items come to the Review queue for a quick check.
            </p>
            <div style={{ fontFamily: CA.sans, fontSize: 12, color: CA.faint }}>
              Supported formats: HDFC, ICICI, SBI, Axis and Kotak bank CSVs, Tally XML, generic CSV, PDF invoices and bills
            </div>
          </div>
        ) : (
          <QueueTable
            columns={["Received", "Client", "Document", "Class", "Confidence", "State"]}
            empty="No documents yet"
            emptyHint="Upload a file above, or raise a request so the client can send it themselves."
            rows={rows.map((r) => [
              dateIN(r.created_at),
              nameFor(r.business_id),
              <div key="f">
                <div style={{ fontWeight: 600 }}>{r.original_filename ?? "—"}</div>
                {r.error_message && <div style={{ fontSize: 11.5, color: CA.red }}>{r.error_message}</div>}
              </div>,
              DOC_CLASS_LABELS[r.classification as CADocClass] ?? r.classification,
              <ConfidenceChip key="c" value={r.confidence} />,
              <StateChip key="s" value={r.review_state} />,
            ])}
          />
        )}
      </CACard>


      <div style={{ marginTop: 14 }}>
        <CAButton variant="ghost" onClick={() => void load()}>
          Refresh
        </CAButton>
      </div>
    </div>
  );
}
