import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, UploadCloud } from "lucide-react";
import { Badge, Card, Drawer, EmptyState, PageHeader, Tabs, Tone, V, formatDate, formatINR } from "../ui";
import { Doc, useV2 } from "../store";

const TONE: Record<Doc["status"], Tone> = { Processing: "info", Parsed: "good", Failed: "bad" };

export default function DocumentsPage() {
  const { docs, clients, clientName, addDoc } = useV2();
  const [tab, setTab] = useState("All");
  const [open, setOpen] = useState<Doc | null>(null);
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!clientId) { toast.error("Add a client before uploading"); return; }
    Array.from(files).forEach((f) => addDoc(f.name, clientId));
    toast.success(files.length === 1 ? "Document uploaded" : `${files.length} documents uploaded`);
  };

  const list = docs.filter((d) => tab === "All" || d.status === tab);

  return (
    <>
      <PageHeader title="Documents" subtitle="Extract agent. Upload once, we classify and pull the rows." />

      <Card
        style={{ padding: 0, marginBottom: 20, borderStyle: "dashed", borderColor: drag ? V.ink : V.line, background: drag ? V.gray : V.card }}
        onClick={() => fileRef.current?.click()}
      >
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
          style={{ padding: "40px 22px", textAlign: "center", cursor: "pointer" }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 15, background: V.blue, display: "grid", placeItems: "center", margin: "0 auto 14px", color: "#1B4763" }}>
            <UploadCloud size={22} />
          </div>
          <h3 style={{ fontSize: 16 }}>Drop files here or click to upload</h3>
          <p style={{ fontSize: 13, color: V.body, marginTop: 6 }}>Bank statements, GSTR files and bills. CSV, XML and PDF.</p>
          <input ref={fileRef} type="file" multiple accept=".csv,.xml,.pdf" hidden onChange={(e) => upload(e.target.files)} />
        </div>
      </Card>

      {clients.length > 0 && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: V.muted }}>Upload for</span>
          <select className="v2-input" style={{ width: "auto", minWidth: 220 }} value={clientId} onChange={(e) => setClientId(e.target.value)} onClick={(e) => e.stopPropagation()}>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "All", label: "All", count: docs.length },
          { value: "Processing", label: "Processing", count: docs.filter((d) => d.status === "Processing").length },
          { value: "Parsed", label: "Parsed", count: docs.filter((d) => d.status === "Parsed").length },
          { value: "Failed", label: "Failed", count: docs.filter((d) => d.status === "Failed").length },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<FileText size={22} />}
          title="No documents here yet"
          description="Upload a bank statement or a set of bills and the extract agent will classify and read them for you."
          action={<button className="v2-btn v2-btn-primary" onClick={() => fileRef.current?.click()}><UploadCloud size={15} /> Upload a document</button>}
        />
      ) : (
        <Card style={{ padding: 0 }} className="v2-scroll">
          <table className="v2-table">
            <thead><tr><th>File</th><th>Client</th><th>Source</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} className="clickable" onClick={() => setOpen(d)}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td style={{ color: V.body }}>{clientName(d.clientId)}</td>
                  <td style={{ color: V.body }}>{d.source}</td>
                  <td><Badge tone={TONE[d.status]}>{d.status}</Badge></td>
                  <td className="num" style={{ color: V.body }}>{formatDate(d.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ""}>
        {open && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <Badge tone={TONE[open.status]}>{open.status}</Badge>
              <Badge>{clientName(open.clientId)}</Badge>
              <Badge>{open.source}</Badge>
            </div>
            {open.rows.length === 0 ? (
              <p style={{ fontSize: 13.5, color: V.body }}>
                {open.status === "Processing" ? "Extraction is still running. Rows appear here as soon as it finishes." : "No rows were extracted from this file."}
              </p>
            ) : (
              <table className="v2-table">
                <thead><tr><th>Date</th><th>Particulars</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
                <tbody>
                  {open.rows.map((r, i) => (
                    <tr key={i}>
                      <td className="num">{formatDate(r.date)}</td>
                      <td>{r.particulars}</td>
                      <td className="num" style={{ textAlign: "right", color: r.amount < 0 ? V.maroon : V.green }}>{formatINR(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}
