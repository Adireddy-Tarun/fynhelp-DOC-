import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/analytics";

type BankId = "hdfc" | "icici" | "sbi" | "axis" | "kotak" | "generic" | "tally";

interface BankMapping {
  id: BankId;
  name: string;
  note: string;
  date: string[];
  debit: string[];
  credit: string[];
  amount?: string[];
  description: string[];
  balance: string[];
  direction?: string[];
}

const BANKS: BankMapping[] = [
  { id: "hdfc",    name: "HDFC Bank",              note: "Export as CSV from NetBanking",     date: ["Date"],             debit: ["Withdrawal Amt."], credit: ["Deposit Amt."], description: ["Narration"],           balance: ["Closing Balance"] },
  { id: "icici",   name: "ICICI Bank",             note: "Statement download → CSV",          date: ["Transaction Date"], debit: ["Debit"],           credit: ["Credit"],       description: ["Transaction Remarks"], balance: ["Balance"] },
  { id: "sbi",     name: "State Bank of India",    note: "Retail Internet Banking export",    date: ["Txn Date"],         debit: ["Debit"],           credit: ["Credit"],       description: ["Description"],         balance: ["Balance"] },
  { id: "axis",    name: "Axis Bank",              note: "Account statement CSV",             date: ["Tran Date"],        debit: ["Dr Amount"],       credit: ["Cr Amount"],    description: ["Particulars"],         balance: ["Balance"] },
  { id: "kotak",   name: "Kotak Mahindra Bank",    note: "eStatement CSV export",             date: ["Transaction Date"], debit: ["Debit"],           credit: ["Credit"],       description: ["Description"],         balance: ["Closing Balance"] },
  { id: "generic", name: "Generic CSV",            note: "date, amount, type/direction, description", date: ["date","Date","DATE"], debit: [], credit: [], amount: ["amount","Amount"], direction: ["type","direction","Type","Direction"], description: ["description","narration","remarks","Description","Narration","Remarks"], balance: ["balance","Balance","closing_balance"] },
];

const MAX_SIZE = 10 * 1024 * 1024;

function parseCSV(text: string): string[][] {
  return text.trim().split(/\r?\n/).map((row) =>
    row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""))
  );
}

function pick(headers: string[], candidates: string[]): number {
  for (const c of candidates) {
    const idx = headers.findIndex((h) => h.toLowerCase() === c.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

function toISODate(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim();
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) y = (Number(y) > 50 ? "19" : "20") + y;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d));
    if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
  }
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
  return null;
}

function toNumber(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[,₹$\s]/g, "").replace(/[()]/g, "");
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

interface ParsedTxn {
  business_id: string;
  date: string;
  transaction_date: string;
  amount: number;
  direction: "in" | "out";
  description: string;
  balance_after: number | null;
}

function mapRows(rows: string[][], bank: BankMapping, businessId: string): { txns: ParsedTxn[]; error?: string } {
  if (rows.length < 2) return { txns: [], error: "CSV has no data rows" };
  const headers = rows[0];
  const dateIdx = pick(headers, bank.date);
  const descIdx = pick(headers, bank.description);
  const balIdx = pick(headers, bank.balance);
  const debitIdx = bank.debit.length ? pick(headers, bank.debit) : -1;
  const creditIdx = bank.credit.length ? pick(headers, bank.credit) : -1;
  const amountIdx = bank.amount ? pick(headers, bank.amount) : -1;
  const dirIdx = bank.direction ? pick(headers, bank.direction) : -1;

  if (dateIdx === -1) return { txns: [], error: `Could not find a date column for ${bank.name}. Try Generic CSV.` };
  if (debitIdx === -1 && creditIdx === -1 && amountIdx === -1) {
    return { txns: [], error: `Could not find amount columns for ${bank.name}. Try Generic CSV.` };
  }

  const out: ParsedTxn[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every((c) => !c)) continue;
    const iso = toISODate(r[dateIdx] || "");
    if (!iso) continue;

    let amt = 0;
    let dir: "in" | "out" = "out";
    if (debitIdx !== -1 || creditIdx !== -1) {
      const d = debitIdx !== -1 ? toNumber(r[debitIdx] || "") : 0;
      const c = creditIdx !== -1 ? toNumber(r[creditIdx] || "") : 0;
      if (c > 0) { amt = c; dir = "in"; }
      else if (d > 0) { amt = d; dir = "out"; }
      else continue;
    } else if (amountIdx !== -1) {
      const n = toNumber(r[amountIdx] || "");
      if (n === 0) continue;
      amt = Math.abs(n);
      if (dirIdx !== -1) {
        const dv = (r[dirIdx] || "").toLowerCase();
        dir = /in|credit|cr|deposit/.test(dv) ? "in" : "out";
      } else {
        dir = n >= 0 ? "in" : "out";
      }
    } else continue;

    const bal = balIdx !== -1 ? toNumber(r[balIdx] || "") : NaN;
    out.push({
      business_id: businessId,
      date: iso,
      transaction_date: iso,
      amount: amt,
      direction: dir,
      description: (descIdx !== -1 ? r[descIdx] : "").slice(0, 500),
      balance_after: isFinite(bal) && bal !== 0 ? bal : null,
    });
  }
  if (!out.length) return { txns: [], error: "No valid transaction rows found in this file" };
  return { txns: out };
}

export default function ImportPage() {
  const navigate = useNavigate();
  const { businessId } = useAuth();

  const [bankId, setBankId] = useState<BankId | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<null | {
    rows: number;
    cash_position: number;
    burn_rate_current: number;
    runway_months: number;
  }>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bank = useMemo(() => BANKS.find((b) => b.id === bankId) ?? null, [bankId]);

  async function handleFile(f: File | null) {
    setError(null);
    setResult(null);
    if (!f) { setFile(null); setRawRows([]); return; }
    if (!f.name.toLowerCase().endsWith(".csv")) { setError("Only .csv files are supported"); return; }
    if (f.size > MAX_SIZE) { setError("File exceeds 10MB limit"); return; }
    const text = await f.text();
    const rows = parseCSV(text);
    setFile(f);
    setRawRows(rows.slice(0, 6));
  }

  async function runImport() {
    if (!bank || !file || !businessId) return;
    setBusy(true); setError(null); setResult(null); setProgress(null);
    track("csv_import_started", { bank: bank.id });

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const { txns, error: mapErr } = mapRows(rows, bank, businessId);
      if (mapErr || !txns.length) {
        const msg = mapErr || "No rows parsed";
        setError(msg);
        track("csv_import_failed", { error: msg, bank: bank.id });
        setBusy(false);
        return;
      }

      const BATCH = 100;
      setProgress({ done: 0, total: txns.length });
      for (let i = 0; i < txns.length; i += BATCH) {
        const chunk = txns.slice(i, i + BATCH);
        const { error: insErr } = await supabase.from("transactions").insert(chunk);
        if (insErr) {
          const msg = `Database insert failed: ${insErr.message}`;
          setError(msg);
          track("csv_import_failed", { error: msg, bank: bank.id, inserted: i });
          setBusy(false);
          return;
        }
        setProgress({ done: Math.min(i + BATCH, txns.length), total: txns.length });
      }

      const { data: compData, error: compErr } = await supabase.functions.invoke("compute-liquidity", {
        body: { business_id: businessId },
      });
      if (compErr) {
        setError(`Imported ${txns.length} rows but liquidity computation failed: ${compErr.message}`);
        track("csv_import_failed", { error: compErr.message, phase: "compute", bank: bank.id });
        setBusy(false);
        return;
      }

      setResult({
        rows: txns.length,
        cash_position: compData?.cash_position ?? 0,
        burn_rate_current: compData?.burn_rate_current ?? 0,
        runway_months: compData?.runway_months ?? 0,
      });
      track("csv_import_completed", { records: txns.length, bank: bank.id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setError(msg);
      track("csv_import_failed", { error: msg, bank: bank?.id });
    } finally {
      setBusy(false);
    }
  }

  const disabled = !bank || !file || busy || !businessId;

  return (
    <div className="min-h-screen bg-fyn-beige px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl text-fyn-ink mb-2" style={{ fontFamily: "Georgia, serif" }}>Import bank statement</h1>
          <p className="text-fyn-ink/60" style={{ fontFamily: "Inter, sans-serif" }}>
            Upload a CSV to populate your liquidity dashboard with real numbers.
          </p>
        </div>

        {!businessId && (
          <div className="mb-6 bg-white border-l-4 border-fyn-red rounded-md p-4 flex gap-3" style={{ border: "1px solid rgba(26,16,8,0.08)", borderLeftColor: "#C41E1E", borderLeftWidth: 4 }}>
            <AlertTriangle className="w-5 h-5 text-fyn-red shrink-0" />
            <div className="text-sm text-fyn-ink">Complete business onboarding before importing data.</div>
          </div>
        )}

        {/* Section 1 — bank selector */}
        <section className="mb-8">
          <div className="text-[11px] tracking-widest mb-3" style={{ color: "#8B6914", fontFamily: "'JetBrains Mono', monospace" }}>STEP 1 · SELECT BANK</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BANKS.map((b) => {
              const selected = bankId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBankId(b.id)}
                  className="bg-white text-left p-5 transition-colors"
                  style={{
                    borderRadius: 12,
                    border: selected ? "2px solid #C41E1E" : "1px solid rgba(26,16,8,0.08)",
                  }}
                >
                  <div className="text-fyn-ink font-semibold text-base mb-1" style={{ fontFamily: "Georgia, serif" }}>{b.name}</div>
                  <div className="text-xs text-fyn-ink/55 mb-4" style={{ fontFamily: "Inter, sans-serif" }}>{b.note}</div>
                  <div
                    className="inline-block text-xs px-3 py-1 rounded"
                    style={{
                      background: selected ? "#C41E1E" : "rgba(26,16,8,0.05)",
                      color: selected ? "#FFFFFF" : "#1A1008",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {selected ? "Selected" : "Select"}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2 — upload */}
        <section className="mb-8">
          <div className="text-[11px] tracking-widest mb-3" style={{ color: "#8B6914", fontFamily: "'JetBrains Mono', monospace" }}>STEP 2 · UPLOAD CSV</div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragOver(false);
              const f = e.dataTransfer.files?.[0] ?? null;
              handleFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className="bg-white cursor-pointer flex flex-col items-center justify-center text-center px-6 py-12 transition-colors"
            style={{
              borderRadius: 12,
              border: `2px dashed ${dragOver ? "#C41E1E" : "rgba(26,16,8,0.15)"}`,
            }}
          >
            <Upload className="w-8 h-8 mb-3" style={{ color: "#8B6914" }} />
            <div className="text-fyn-ink font-medium mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
              Drop your bank statement CSV here or click to browse
            </div>
            <div className="text-xs text-fyn-ink/50" style={{ fontFamily: "Inter, sans-serif" }}>.csv only · up to 10MB</div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {file && (
            <div className="mt-4 bg-white p-4 flex items-center gap-3" style={{ borderRadius: 12, border: "1px solid rgba(26,16,8,0.08)" }}>
              <FileText className="w-5 h-5 text-fyn-ink/60" />
              <div className="flex-1">
                <div className="text-sm text-fyn-ink font-medium" style={{ fontFamily: "Inter, sans-serif" }}>{file.name}</div>
                <div className="text-xs text-fyn-ink/50" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setRawRows([]); setResult(null); setError(null); }}
                className="text-xs text-fyn-ink/50 hover:text-fyn-red"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Remove
              </button>
            </div>
          )}

          {rawRows.length > 0 && (
            <div className="mt-4 bg-white overflow-hidden" style={{ borderRadius: 12, border: "1px solid rgba(26,16,8,0.08)" }}>
              <div className="px-4 py-2 text-[11px] tracking-widest" style={{ color: "#8B6914", fontFamily: "'JetBrains Mono', monospace", borderBottom: "1px solid rgba(26,16,8,0.06)" }}>PREVIEW · FIRST {rawRows.length - 1} ROWS</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <thead>
                    <tr>
                      {rawRows[0].map((h, i) => (
                        <th key={i} className="text-left px-3 py-2 text-fyn-ink/70 font-semibold" style={{ borderBottom: "1px solid rgba(26,16,8,0.06)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawRows.slice(1).map((r, ri) => (
                      <tr key={ri}>
                        {r.map((c, ci) => (
                          <td key={ci} className="px-3 py-2 text-fyn-ink/80" style={{ borderBottom: "1px solid rgba(26,16,8,0.04)" }}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Section 3 — import + result */}
        <section className="mb-8">
          <div className="text-[11px] tracking-widest mb-3" style={{ color: "#8B6914", fontFamily: "'JetBrains Mono', monospace" }}>STEP 3 · IMPORT</div>

          {error && (
            <div className="mb-4 bg-white p-4 flex gap-3" style={{ borderRadius: 12, border: "1px solid rgba(196,30,30,0.3)", borderLeft: "4px solid #C41E1E" }}>
              <AlertTriangle className="w-5 h-5 text-fyn-red shrink-0" />
              <div className="text-sm text-fyn-ink" style={{ fontFamily: "Inter, sans-serif" }}>{error}</div>
            </div>
          )}

          <button
            onClick={runImport}
            disabled={disabled}
            className="w-full py-4 text-white font-semibold flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: "#C41E1E",
              borderRadius: 12,
              opacity: disabled ? 0.4 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {busy ? <><Loader2 className="w-5 h-5 animate-spin" /> Importing…</> : "Import transactions"}
          </button>

          {progress && (
            <div className="mt-3 text-xs text-fyn-ink/60 text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {progress.done} / {progress.total} rows inserted
            </div>
          )}

          {result && (
            <div className="mt-6 bg-white p-6" style={{ borderRadius: 12, border: "1px solid rgba(16,185,129,0.3)", borderLeft: "4px solid #10B981" }}>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-6 h-6" style={{ color: "#10B981" }} />
                <h2 className="text-xl text-fyn-ink" style={{ fontFamily: "Georgia, serif" }}>Import complete</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Stat label="Rows imported" value={result.rows.toLocaleString("en-IN")} />
                <Stat label="Cash position" value={`₹${result.cash_position.toLocaleString("en-IN")}`} />
                <Stat label="Monthly burn" value={`₹${result.burn_rate_current.toLocaleString("en-IN")}`} />
                <Stat label="Runway (months)" value={String(result.runway_months)} />
              </div>
              <button
                onClick={() => navigate("/dashboard/liquidity")}
                className="px-5 py-2.5 text-white text-sm font-semibold"
                style={{ background: "#C41E1E", borderRadius: 10, fontFamily: "Inter, sans-serif" }}
              >
                View Liquidity Dashboard
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-widest mb-1" style={{ color: "#8B6914", fontFamily: "'JetBrains Mono', monospace" }}>{label.toUpperCase()}</div>
      <div className="text-fyn-ink text-lg font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}
