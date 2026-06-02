import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Upload, FileText, X, Building, Receipt, Wallet, AlertTriangle, RotateCw } from "lucide-react";

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

type ImportType = "bank" | "invoice" | "expense";

// --- minimal CSV parser handling quoted fields ---
function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.replace(/\r/g, "").trim().split("\n").filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };
  const splitLine = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (c === "," && !inQ) {
        out.push(cur); cur = "";
      } else cur += c;
    }
    out.push(cur);
    return out.map(s => s.trim());
  };
  const headers = splitLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const vals = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
  return { headers, rows };
}

const num = (s: string) => {
  const n = parseFloat((s || "").replace(/[,₹\s]/g, ""));
  return isNaN(n) ? 0 : n;
};

const pick = (row: Record<string, string>, keys: string[]) => {
  for (const k of keys) {
    const found = Object.keys(row).find(h => h.toLowerCase() === k.toLowerCase());
    if (found && row[found]) return row[found];
  }
  return "";
};

const TYPE_META: Record<ImportType, { title: string; description: string; icon: JSX.Element; sample: string }> = {
  bank: {
    title: "Bank Statements",
    description: "CSV/XLSX with columns: Date, Description, Debit, Credit (or Amount)",
    icon: <Building className="w-6 h-6" />,
    sample: "Date, Description, Debit, Credit",
  },
  invoice: {
    title: "Invoices (Receivables)",
    description: "CSV/XLSX with: Customer, Invoice Number, Date, Due Date, Amount",
    icon: <Receipt className="w-6 h-6" />,
    sample: "Customer, Invoice Number, Date, Due Date, Amount",
  },
  expense: {
    title: "Expenses (Payables)",
    description: "CSV/XLSX with: Vendor, Invoice Number, Date, Due Date, Amount",
    icon: <Wallet className="w-6 h-6" />,
    sample: "Vendor, Invoice Number, Date, Due Date, Amount",
  },
};

async function parseFile(file: File): Promise<Record<string, string>[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    const text = await file.text();
    return parseCSV(text).rows;
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) return [];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "", raw: false });
    return rows.map(r => {
      const out: Record<string, string> = {};
      for (const k of Object.keys(r)) out[k.trim()] = String(r[k] ?? "").trim();
      return out;
    });
  }
  throw new Error("Unsupported file type. Upload CSV or XLSX.");
}

interface UploadZoneProps {
  type: ImportType;
  businessId: string | null;
  onSuccess: () => void;
}

// Shared registry so the upload-history "Retry" button can reopen the right picker
const zoneOpeners: Partial<Record<ImportType, () => void>> = {};
const triggerRetry = (type: ImportType) => {
  document
    .querySelector<HTMLElement>(`[data-upload-zone="${type}"]`)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => zoneOpeners[type]?.(), 250);
};

interface DupMatch {
  reason: "hash" | "date_overlap";
  rows: Array<{
    file_name: string;
    created_at: string;
    row_count: number;
    min_date: string | null;
    max_date: string | null;
  }>;
}

interface PendingUpload {
  rows: Record<string, string>[];
  hash: string;
  minDate: string | null;
  maxDate: string | null;
}

const UploadZone = ({ type, businessId, onSuccess }: UploadZoneProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dupMatch, setDupMatch] = useState<DupMatch | null>(null);
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    zoneOpeners[type] = () => inputRef.current?.click();
    return () => { delete zoneOpeners[type]; };
  }, [type]);
  const meta = TYPE_META[type];

  const acceptFile = (f: File | undefined | null) => {
    if (!f) return;
    const n = f.name.toLowerCase();
    if (!n.endsWith(".csv") && !n.endsWith(".xlsx") && !n.endsWith(".xls")) {
      toast.error("Please upload a CSV or XLSX file");
      return;
    }
    setFile(f);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!uploading) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploading) return;
    const f = e.dataTransfer.files?.[0];
    acceptFile(f);
  };

  const today = () => new Date().toISOString().slice(0, 10);
  const toDate = (s: string) => {
    if (!s) return today();
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (m) {
      const [, dd, mm, yy] = m;
      const yyyy = yy.length === 2 ? `20${yy}` : yy;
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    return today();
  };

  const computeRange = (rows: Record<string, string>[]): { minDate: string | null; maxDate: string | null } => {
    const keys =
      type === "bank" ? ["Date", "Transaction Date"] :
      type === "invoice" ? ["Date", "Invoice Date"] :
      ["Due Date", "Date"];
    let min: string | null = null;
    let max: string | null = null;
    for (const r of rows) {
      const raw = pick(r, keys);
      if (!raw) continue;
      const d = toDate(raw);
      if (!min || d < min) min = d;
      if (!max || d > max) max = d;
    }
    return { minDate: min, maxDate: max };
  };

  const performInsert = async (p: PendingUpload) => {
    if (!file || !businessId) return;
    setUploading(true);
    setProgress(10);
    const interval = setInterval(() => setProgress(prev => Math.min(prev + 8, 85)), 200);
    const rows = p.rows;

    try {
      if (type === "bank") {
        const records = rows.map(r => {
          const debit = num(pick(r, ["Debit", "Withdrawal", "Out"]));
          const credit = num(pick(r, ["Credit", "Deposit", "In"]));
          const amount = debit > 0 ? debit : credit > 0 ? credit : Math.abs(num(pick(r, ["Amount"])));
          const direction = debit > 0 ? "debit" : credit > 0 ? "credit" : (num(pick(r, ["Amount"])) < 0 ? "debit" : "credit");
          return {
            business_id: businessId,
            date: toDate(pick(r, ["Date", "Transaction Date"])),
            description: pick(r, ["Description", "Narration", "Particulars"]) || "-",
            counterparty: pick(r, ["Counterparty", "Payee", "Vendor", "Customer"]) || null,
            amount,
            direction,
            category: pick(r, ["Category"]) || null,
          };
        });
        const { error } = await supabase.from("transactions").insert(records);
        if (error) throw error;
      } else if (type === "invoice") {
        const records = rows.map(r => {
          const amount = num(pick(r, ["Amount", "Total", "Invoice Amount"]));
          return {
            business_id: businessId,
            customer_name: pick(r, ["Customer", "Customer Name", "Client"]) || "Unknown",
            invoice_number: pick(r, ["Invoice Number", "Invoice", "Invoice No"]) || `INV-${Date.now()}`,
            invoice_date: toDate(pick(r, ["Date", "Invoice Date"])),
            due_date: toDate(pick(r, ["Due Date", "Due"])),
            amount,
            outstanding: amount,
            status: "outstanding",
          };
        });
        const { error } = await supabase.from("receivables").insert(records);
        if (error) throw error;
      } else {
        const records = rows.map(r => {
          const amount = num(pick(r, ["Amount", "Total", "Bill Amount"]));
          return {
            business_id: businessId,
            vendor_name: pick(r, ["Vendor", "Vendor Name", "Supplier"]) || "Unknown",
            invoice_number: pick(r, ["Invoice Number", "Bill Number", "Invoice"]) || null,
            due_date: toDate(pick(r, ["Due Date", "Date"])),
            amount,
            outstanding: amount,
            status: "pending",
          };
        });
        const { error } = await supabase.from("payables").insert(records);
        if (error) throw error;
      }

      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("csv_uploads").insert({
        business_id: businessId,
        uploaded_by: user?.id ?? null,
        upload_type: type,
        file_name: file.name,
        file_size: file.size,
        row_count: rows.length,
        status: "success",
        file_hash: p.hash,
        min_date: p.minDate,
        max_date: p.maxDate,
      });

      clearInterval(interval);
      setProgress(100);
      toast.success(`Imported ${rows.length} record${rows.length === 1 ? "" : "s"} from ${file.name}`);
      onSuccess();
      setTimeout(() => {
        setFile(null);
        setPending(null);
        setUploading(false);
        setProgress(0);
        if (inputRef.current) inputRef.current.value = "";
      }, 1200);
    } catch (err: any) {
      clearInterval(interval);
      console.error("Upload error:", err);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("csv_uploads").insert({
          business_id: businessId,
          uploaded_by: user?.id ?? null,
          upload_type: type,
          file_name: file.name,
          file_size: file.size,
          row_count: rows.length,
          status: "failed",
          error_message: String(err?.message || err).slice(0, 500),
          file_hash: p.hash,
          min_date: p.minDate,
          max_date: p.maxDate,
        });
      } catch {}
      toast.error(err?.message || "Upload failed");
      onSuccess();
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadFile = async () => {
    if (!file || !businessId) return;
    setUploading(true);
    setProgress(5);

    try {
      const buf = await file.arrayBuffer();
      const hash = await sha256Hex(buf);

      // Re-parse from buffer so we don't read the file twice
      let rows: Record<string, string>[];
      const lname = file.name.toLowerCase();
      if (lname.endsWith(".csv")) {
        rows = parseCSV(new TextDecoder().decode(buf)).rows;
      } else {
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = ws ? XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "", raw: false }) : [];
        rows = raw.map(r => {
          const out: Record<string, string> = {};
          for (const k of Object.keys(r)) out[k.trim()] = String(r[k] ?? "").trim();
          return out;
        });
      }
      if (rows.length === 0) throw new Error("File has no data rows");

      const { minDate, maxDate } = computeRange(rows);
      const pendingUpload: PendingUpload = { rows, hash, minDate, maxDate };

      // Duplicate check 1: exact file hash for this business
      const { data: hashHits } = await supabase
        .from("csv_uploads")
        .select("file_name, created_at, row_count, min_date, max_date")
        .eq("business_id", businessId)
        .eq("file_hash", hash)
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(5);

      if (hashHits && hashHits.length > 0) {
        setPending(pendingUpload);
        setDupMatch({ reason: "hash", rows: hashHits });
        setUploading(false);
        setProgress(0);
        return;
      }

      // Duplicate check 2: overlapping date range for the same upload type
      if (minDate && maxDate) {
        const { data: rangeHits } = await supabase
          .from("csv_uploads")
          .select("file_name, created_at, row_count, min_date, max_date")
          .eq("business_id", businessId)
          .eq("upload_type", type)
          .eq("status", "success")
          .not("min_date", "is", null)
          .not("max_date", "is", null)
          .lte("min_date", maxDate)
          .gte("max_date", minDate)
          .order("created_at", { ascending: false })
          .limit(5);

        if (rangeHits && rangeHits.length > 0) {
          setPending(pendingUpload);
          setDupMatch({ reason: "date_overlap", rows: rangeHits });
          setUploading(false);
          setProgress(0);
          return;
        }
      }

      await performInsert(pendingUpload);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err?.message || "Upload failed");
      setUploading(false);
      setProgress(0);
    }
  };

  const confirmDuplicate = async () => {
    const p = pending;
    setDupMatch(null);
    setPending(null);
    if (p) await performInsert(p);
  };

  const replaceDuplicate = async () => {
    const p = pending;
    const m = dupMatch;
    setDupMatch(null);
    setPending(null);
    if (!p || !m || !businessId || !file) return;

    // Compute combined date range across conflicting prior uploads (fall back to current file's range)
    let minD: string | null = p.minDate;
    let maxD: string | null = p.maxDate;
    for (const r of m.rows) {
      if (r.min_date && (!minD || r.min_date < minD)) minD = r.min_date;
      if (r.max_date && (!maxD || r.max_date > maxD)) maxD = r.max_date;
    }

    setUploading(true);
    setProgress(5);
    try {
      const tableMap = {
        bank: { table: "transactions", dateCol: "date" },
        invoice: { table: "receivables", dateCol: "invoice_date" },
        expense: { table: "payables", dateCol: "due_date" },
      } as const;
      const { table, dateCol } = tableMap[type];

      if (minD && maxD) {
        const { error: delErr } = await supabase
          .from(table)
          .delete()
          .eq("business_id", businessId)
          .gte(dateCol, minD)
          .lte(dateCol, maxD);
        if (delErr) throw delErr;
      }

      // Mark prior csv_uploads rows as replaced (no DELETE permission, so we can't remove them)
      toast.success(`Cleared previous ${meta.title.toLowerCase()} for ${minD ?? "?"} → ${maxD ?? "?"}`);
      await performInsert(p);
    } catch (err: any) {
      console.error("Replace error:", err);
      toast.error(err?.message || "Replace failed");
      setUploading(false);
      setProgress(0);
    }
  };

  const cancelDuplicate = () => {
    setDupMatch(null);
    setPending(null);
    toast.info("Upload cancelled, no duplicate data inserted");
  };

  return (
    <Card data-upload-zone={type} className="p-6 flex flex-col h-full scroll-mt-24">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 flex flex-col items-center justify-center text-center min-h-[260px] rounded-lg transition-colors border-2 border-dashed ${
          isDragging
            ? "border-fyn-red bg-fyn-red/5"
            : "border-transparent"
        }`}
      >
        {!file && !uploading && (
          <>
            <div className="w-12 h-12 rounded-full bg-fyn-beige flex items-center justify-center mb-3 text-fyn-ink">
              {meta.icon}
            </div>
            <h3 className="font-serif text-lg text-fyn-ink mb-1">{meta.title}</h3>
            <p className="text-sm text-fyn-ink/60 mb-1">{meta.description}</p>
            <p className="text-xs text-fyn-ink/50 mb-4">
              {isDragging ? "Drop your file here" : "Drag & drop a CSV or XLSX, or"}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id={`csv-${type}`}
            />
            <label htmlFor={`csv-${type}`}>
              <Button asChild variant="outline" className="cursor-pointer">
                <span><Upload className="w-4 h-4 mr-2" /> Select File</span>
              </Button>
            </label>
            <p className="text-xs text-fyn-ink/40 mt-3">Expected: {meta.sample}</p>
          </>
        )}

        {file && !uploading && (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between bg-fyn-beige/50 rounded-lg p-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-fyn-ink flex-shrink-0" />
                <span className="text-sm text-fyn-ink truncate">{file.name}</span>
              </div>
              <button onClick={() => setFile(null)} className="text-fyn-ink/50 hover:text-fyn-red flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={uploadFile}
              className="w-full bg-fyn-red hover:bg-fyn-red/90 text-white"
              disabled={!businessId}
            >
              Upload & Process
            </Button>
            {!businessId && (
              <p className="text-xs text-fyn-red">No business linked. Complete onboarding first.</p>
            )}
          </div>
        )}

        {uploading && (
          <div className="w-full space-y-3">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-fyn-ink/70">Processing file… {progress}%</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!dupMatch} onOpenChange={(o) => { if (!o) cancelDuplicate(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-fyn-red" />
              Possible duplicate {meta.title.toLowerCase()}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  {dupMatch?.reason === "hash"
                    ? "An identical file has already been imported for this business."
                    : pending?.minDate && pending?.maxDate
                      ? `This file covers ${pending.minDate} → ${pending.maxDate}, which overlaps with previous uploads of the same type.`
                      : "Date range overlaps with a previous upload."}
                </p>
                <div className="rounded-md border border-fyn-ink/10 divide-y divide-fyn-ink/10">
                  {dupMatch?.rows.map((h, i) => (
                    <div key={i} className="px-3 py-2 flex items-center justify-between gap-3 text-xs">
                      <span className="truncate" title={h.file_name}>{h.file_name}</span>
                      <span className="text-fyn-ink/60 whitespace-nowrap">
                        {h.row_count} rows · {new Date(h.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-fyn-ink/60">
                  Importing again will create duplicate records. Continue anyway?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel onClick={cancelDuplicate}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              onClick={replaceDuplicate}
              className="border-fyn-ink/20"
            >
              Replace previous data
            </Button>
            <AlertDialogAction
              onClick={confirmDuplicate}
              className="bg-fyn-red hover:bg-fyn-red/90 text-white"
            >
              Import anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

const TYPE_LABEL: Record<ImportType, string> = {
  bank: "Bank Statement",
  invoice: "Invoice",
  expense: "Expense",
};

const formatBytes = (b: number) => {
  if (!b) return "-";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
};

interface UploadRow {
  id: string;
  upload_type: ImportType;
  file_name: string;
  file_size: number;
  row_count: number;
  status: string;
  error_message: string | null;
  created_at: string;
}

const UploadHistory = ({ businessId }: { businessId: string | null }) => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["csv-uploads", businessId],
    queryFn: async () => {
      if (!businessId) return [] as UploadRow[];
      const { data, error } = await supabase
        .from("csv_uploads")
        .select("id, upload_type, file_name, file_size, row_count, status, error_message, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as UploadRow[];
    },
    enabled: !!businessId,
  });

  return (
    <Card className="p-6">
      <h3 className="font-serif text-lg text-fyn-ink mb-4">Upload History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-fyn-ink/10 text-left text-xs uppercase text-fyn-ink/50">
              <th className="py-2 font-medium">File</th>
              <th className="py-2 font-medium">Type</th>
              <th className="py-2 font-medium text-right">Size</th>
              <th className="py-2 font-medium text-right">Rows</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium text-right">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-fyn-ink/50">
                  {isLoading ? "Loading…" : "No uploads yet. Drop a file above to get started."}
                </td>
              </tr>
            )}
            {history.map(h => (
              <tr key={h.id} className="border-b border-fyn-ink/5">
                <td className="py-3 text-fyn-ink font-medium truncate max-w-[260px]" title={h.file_name}>
                  <span className="inline-flex items-center gap-2">
                    <FileText className="w-4 h-4 text-fyn-ink/50" />
                    {h.file_name}
                  </span>
                </td>
                <td className="py-3 text-fyn-ink/70">{TYPE_LABEL[h.upload_type] ?? h.upload_type}</td>
                <td className="py-3 text-right tabular-nums text-fyn-ink/70">{formatBytes(h.file_size)}</td>
                <td className="py-3 text-right tabular-nums">{h.row_count}</td>
                <td className="py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                      h.status === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-fyn-red/10 text-fyn-red"
                    }`}
                    title={h.error_message || undefined}
                  >
                    {h.status}
                  </span>
                </td>
                <td className="py-3 text-right text-fyn-ink/60 whitespace-nowrap">
                  <div className="inline-flex items-center gap-3 justify-end">
                    <span>{new Date(h.created_at).toLocaleString("en-IN")}</span>
                    {h.status === "failed" && (
                      <button
                        type="button"
                        onClick={() => {
                          toast.info(`Re-select "${h.file_name}" to retry`);
                          triggerRetry(h.upload_type);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-fyn-red hover:underline"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        Retry
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const DataImportPage = () => {
  const { businessId } = useAuth();
  const qc = useQueryClient();
  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["csv-uploads", businessId] });
    qc.invalidateQueries({ queryKey: ["transactions-180", businessId] });
    qc.invalidateQueries({ queryKey: ["receivables-top", businessId] });
    qc.invalidateQueries({ queryKey: ["payables", businessId] });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-fyn-ink mb-2">Import Your Data</h1>
        <p className="text-fyn-ink/60">
          Upload bank statements, invoices, and expenses as CSV or XLSX. We'll automatically categorize and sync to your dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <UploadZone type="bank" businessId={businessId} onSuccess={refreshAll} />
        <UploadZone type="invoice" businessId={businessId} onSuccess={refreshAll} />
        <UploadZone type="expense" businessId={businessId} onSuccess={refreshAll} />
      </div>

      <UploadHistory businessId={businessId} />
    </DashboardLayout>
  );
};

export default DataImportPage;
