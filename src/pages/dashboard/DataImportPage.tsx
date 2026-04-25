import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileText, X, Building, Receipt, Wallet } from "lucide-react";

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

const UploadZone = ({ type, businessId, onSuccess }: UploadZoneProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const meta = TYPE_META[type];

  const acceptFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a CSV file");
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
    // dd/mm/yyyy fallback
    const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (m) {
      const [, dd, mm, yy] = m;
      const yyyy = yy.length === 2 ? `20${yy}` : yy;
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    return today();
  };

  const uploadFile = async () => {
    if (!file || !businessId) return;
    setUploading(true);
    setProgress(10);

    const interval = setInterval(() => setProgress(p => Math.min(p + 8, 85)), 200);

    try {
      const text = await file.text();
      const { rows } = parseCSV(text);
      if (rows.length === 0) throw new Error("CSV has no data rows");

      if (type === "bank") {
        const records = rows.map(r => {
          const debit = num(pick(r, ["Debit", "Withdrawal", "Out"]));
          const credit = num(pick(r, ["Credit", "Deposit", "In"]));
          const amount = debit > 0 ? debit : credit > 0 ? credit : Math.abs(num(pick(r, ["Amount"])));
          const direction = debit > 0 ? "debit" : credit > 0 ? "credit" : (num(pick(r, ["Amount"])) < 0 ? "debit" : "credit");
          return {
            business_id: businessId,
            date: toDate(pick(r, ["Date", "Transaction Date"])),
            description: pick(r, ["Description", "Narration", "Particulars"]) || "—",
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

      clearInterval(interval);
      setProgress(100);
      toast.success(`Imported ${rows.length} record${rows.length === 1 ? "" : "s"} from ${file.name}`);
      onSuccess();

      setTimeout(() => {
        setFile(null);
        setUploading(false);
        setProgress(0);
        if (inputRef.current) inputRef.current.value = "";
      }, 1200);
    } catch (err: any) {
      clearInterval(interval);
      console.error("Upload error:", err);
      toast.error(err?.message || "Upload failed");
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card className="p-6 flex flex-col h-full">
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
              {isDragging ? "Drop your CSV here" : "Drag & drop a CSV, or"}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id={`csv-${type}`}
            />
            <label htmlFor={`csv-${type}`}>
              <Button asChild variant="outline" className="cursor-pointer">
                <span><Upload className="w-4 h-4 mr-2" /> Select CSV File</span>
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
            <p className="text-sm text-fyn-ink/70">Processing CSV… {progress}%</p>
          </div>
        )}
      </div>
    </Card>
  );
};

const UploadHistory = ({ businessId }: { businessId: string | null }) => {
  // Aggregate recent inserts across the three tables as a stand-in history
  const { data: history = [] } = useQuery({
    queryKey: ["import-history", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const [tx, rec, pay] = await Promise.all([
        supabase.from("transactions").select("created_at").eq("business_id", businessId).order("created_at", { ascending: false }).limit(1),
        supabase.from("receivables").select("created_at").eq("business_id", businessId).order("created_at", { ascending: false }).limit(1),
        supabase.from("payables").select("created_at").eq("business_id", businessId).order("created_at", { ascending: false }).limit(1),
      ]);
      const [txCount, recCount, payCount] = await Promise.all([
        supabase.from("transactions").select("*", { count: "exact", head: true }).eq("business_id", businessId),
        supabase.from("receivables").select("*", { count: "exact", head: true }).eq("business_id", businessId),
        supabase.from("payables").select("*", { count: "exact", head: true }).eq("business_id", businessId),
      ]);
      return [
        { type: "Bank Transactions", count: txCount.count || 0, last: tx.data?.[0]?.created_at },
        { type: "Invoices (Receivables)", count: recCount.count || 0, last: rec.data?.[0]?.created_at },
        { type: "Expenses (Payables)", count: payCount.count || 0, last: pay.data?.[0]?.created_at },
      ];
    },
    enabled: !!businessId,
  });

  return (
    <Card className="p-6">
      <h3 className="font-serif text-lg text-fyn-ink mb-4">Data Summary</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-fyn-ink/10 text-left text-xs uppercase text-fyn-ink/50">
              <th className="py-2 font-medium">Dataset</th>
              <th className="py-2 font-medium text-right">Total Records</th>
              <th className="py-2 font-medium text-right">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.type} className="border-b border-fyn-ink/5">
                <td className="py-3 text-fyn-ink font-medium">{h.type}</td>
                <td className="py-3 text-right tabular-nums">{h.count}</td>
                <td className="py-3 text-right text-fyn-ink/60">
                  {h.last ? new Date(h.last).toLocaleString("en-IN") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-fyn-ink/40 mt-3">
        Detailed per-file upload history requires a `csv_uploads` table — let me know if you want one added.
      </p>
    </Card>
  );
};

const DataImportPage = () => {
  const { businessId } = useAuth();
  const qc = useQueryClient();
  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["import-history", businessId] });
    qc.invalidateQueries({ queryKey: ["transactions-180", businessId] });
    qc.invalidateQueries({ queryKey: ["receivables-top", businessId] });
    qc.invalidateQueries({ queryKey: ["payables", businessId] });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-fyn-ink mb-2">Import Your Data</h1>
        <p className="text-fyn-ink/60">
          Upload bank statements, invoices, and expenses in CSV format. We'll automatically categorize and sync to your dashboard.
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
