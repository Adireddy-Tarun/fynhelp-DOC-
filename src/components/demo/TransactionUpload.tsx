import { useCallback, useMemo, useState } from 'react'
import Papa from 'papaparse'
import { Upload, CheckCircle, XCircle, AlertTriangle, FileText, X, Trash2 } from 'lucide-react'
import { GalaxyButton } from '@/components/ui/GalaxyButton'
import { colors } from '@/lib/design-system'
import { supabase } from '@/integrations/supabase/client'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const CHUNK_SIZE = 100

const SCHEMA_FIELDS = [
  { key: 'date', label: 'Date', required: true },
  { key: 'description', label: 'Description', required: true },
  { key: 'amount', label: 'Amount', required: true },
  { key: 'type', label: 'Type (in/out)', required: true },
  { key: 'category', label: 'Category', required: false },
  { key: 'vendor', label: 'Vendor', required: false },
  { key: 'customer', label: 'Customer', required: false },
  { key: 'invoice_number', label: 'Invoice #', required: false },
  { key: 'gst_amount', label: 'GST Amount', required: false },
  { key: 'payment_method', label: 'Payment Method', required: false },
] as const

type SchemaKey = (typeof SCHEMA_FIELDS)[number]['key']

const TYPE_VALUES = new Set([
  'inflow', 'outflow', 'subscription', 'expense', 'salary', 'purchase', 'sale',
])

// Fuzzy matchers: schema field -> regex against lowercased CSV column
const AUTO_MATCH: Record<SchemaKey, RegExp> = {
  date: /(date|txn.?date|posted|transaction.?date)/i,
  description: /(desc|narration|particulars|details|memo)/i,
  amount: /(amount|amt|value|debit|credit|inr|rupee|total)/i,
  type: /(type|dr.?cr|debit.?credit|direction|flow)/i,
  category: /(category|cat|head)/i,
  vendor: /(vendor|supplier|payee|merchant)/i,
  customer: /(customer|client|buyer)/i,
  invoice_number: /(invoice|bill|inv.?no|ref.?no)/i,
  gst_amount: /(gst|tax|igst|cgst|sgst|vat)/i,
  payment_method: /(method|mode|channel|payment)/i,
}

type Row = Record<string, string>

interface Props {
  organizationId: string
  onUploadComplete: () => void
  onClose?: () => void
}

export function TransactionUpload({ organizationId, onUploadComplete, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<Row[]>([])
  const [allRows, setAllRows] = useState<Row[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<SchemaKey, string>>({} as Record<SchemaKey, string>)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ inserted: number; skipped: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [clearing, setClearing] = useState(false)

  const reset = () => {
    setFile(null)
    setPreview([])
    setAllRows([])
    setColumns([])
    setMapping({} as Record<SchemaKey, string>)
    setProgress(0)
    setError(null)
    setSuccess(null)
  }

  const autoMap = (cols: string[]): Record<SchemaKey, string> => {
    const next = {} as Record<SchemaKey, string>
    for (const field of SCHEMA_FIELDS) {
      const match = cols.find((c) => AUTO_MATCH[field.key].test(c))
      if (match) next[field.key] = match
    }
    return next
  }

  const handleFile = useCallback((f: File) => {
    setError(null)
    setSuccess(null)
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Only .csv files are supported.')
      return
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('File exceeds 10MB limit.')
      return
    }
    setFile(f)
    setParsing(true)
    Papa.parse<Row>(f, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setParsing(false)
        if (result.errors.length > 0) {
          setError(`CSV parse error: ${result.errors[0].message}`)
          return
        }
        const rows = (result.data ?? []).filter((r) => r && Object.keys(r).length > 0)
        if (rows.length === 0) {
          setError('CSV appears to be empty.')
          return
        }
        const cols = result.meta.fields ?? Object.keys(rows[0])
        setColumns(cols)
        setAllRows(rows)
        setPreview(rows.slice(0, 10))
        setMapping(autoMap(cols))
      },
      error: (err) => {
        setParsing(false)
        setError(`Failed to parse CSV: ${err.message}`)
      },
    })
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const missingRequired = useMemo(
    () => SCHEMA_FIELDS.filter((f) => f.required && !mapping[f.key]).map((f) => f.label),
    [mapping],
  )

  const parseAmount = (v: string): number | null => {
    if (v == null) return null
    const cleaned = String(v).replace(/[₹,\s]/g, '').replace(/[()]/g, '-')
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }

  const parseDate = (v: string): string | null => {
    if (!v) return null
    const s = String(v).trim()
    // Try ISO / native first
    const d = new Date(s)
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
    // Try DD/MM/YYYY or DD-MM-YYYY
    const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
    if (m) {
      const [_, dd, mm, yy] = m
      const year = yy.length === 2 ? `20${yy}` : yy
      const iso = `${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
      const d2 = new Date(iso)
      if (!isNaN(d2.getTime())) return iso
    }
    return null
  }

  const normalizeType = (raw: string, amount: number): string => {
    const t = String(raw ?? '').toLowerCase().trim()
    if (TYPE_VALUES.has(t)) return t
    if (/^(cr|credit|in|inflow|received|income)$/.test(t)) return 'inflow'
    if (/^(dr|debit|out|outflow|paid|expense)$/.test(t)) return 'outflow'
    return amount >= 0 ? 'inflow' : 'outflow'
  }

  const transformRows = (): { ok: any[]; errors: string[] } => {
    const ok: any[] = []
    const errors: string[] = []
    allRows.forEach((row, idx) => {
      const dateRaw = row[mapping.date]
      const desc = row[mapping.description]?.trim()
      const amtRaw = row[mapping.amount]
      const typeRaw = mapping.type ? row[mapping.type] : ''

      const date = parseDate(dateRaw)
      const amount = parseAmount(amtRaw)
      if (!date) { errors.push(`Row ${idx + 2}: invalid date "${dateRaw}"`); return }
      if (!desc) { errors.push(`Row ${idx + 2}: missing description`); return }
      if (amount == null) { errors.push(`Row ${idx + 2}: invalid amount "${amtRaw}"`); return }

      ok.push({
        organization_id: organizationId,
        date,
        description: desc.slice(0, 500),
        amount: Math.abs(amount),
        type: normalizeType(typeRaw, amount),
        category: mapping.category ? row[mapping.category]?.trim() || null : null,
        vendor: mapping.vendor ? row[mapping.vendor]?.trim() || null : null,
        customer: mapping.customer ? row[mapping.customer]?.trim() || null : null,
        invoice_number: mapping.invoice_number ? row[mapping.invoice_number]?.trim() || null : null,
        gst_amount: mapping.gst_amount ? parseAmount(row[mapping.gst_amount]) ?? 0 : 0,
        payment_method: mapping.payment_method ? row[mapping.payment_method]?.trim() || null : null,
      })
    })
    return { ok, errors }
  }

  const handleUpload = async () => {
    setError(null)
    setSuccess(null)
    if (missingRequired.length > 0) {
      setError(`Map required fields: ${missingRequired.join(', ')}`)
      return
    }
    const { ok, errors } = transformRows()
    if (ok.length === 0) {
      setError(`No valid rows. First error: ${errors[0] ?? 'unknown'}`)
      return
    }

    setUploading(true)
    setProgress(0)
    let inserted = 0
    try {
      for (let i = 0; i < ok.length; i += CHUNK_SIZE) {
        const chunk = ok.slice(i, i + CHUNK_SIZE)
        const { error: insErr, count } = await supabase
          .from('demo_transactions')
          .insert(chunk, { count: 'exact' })
        if (insErr) throw insErr
        inserted += count ?? chunk.length
        setProgress(Math.round(((i + chunk.length) / ok.length) * 100))
      }

      // Trigger insights regeneration (best-effort)
      try {
        await supabase.functions.invoke('generate-insights', {
          body: { organization_id: organizationId },
        })
      } catch {
        /* non-fatal */
      }

      setSuccess({ inserted, skipped: errors.length })
      onUploadComplete()
    } catch (e: any) {
      setError(`Upload failed: ${e.message ?? String(e)}`)
    } finally {
      setUploading(false)
    }
  }

  const handleClearData = async () => {
    if (!confirm('Delete all uploaded transactions for this demo? This cannot be undone.')) return
    setClearing(true)
    setError(null)
    try {
      const { error: delErr } = await supabase
        .from('demo_transactions')
        .delete()
        .eq('organization_id', organizationId)
      if (delErr) throw delErr
      reset()
      onUploadComplete()
    } catch (e: any) {
      setError(`Clear failed: ${e.message ?? String(e)}`)
    } finally {
      setClearing(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div
      className="w-full max-w-4xl mx-auto rounded-2xl p-8 relative"
      style={{
        background: colors.bg.card,
        border: `1px solid ${colors.primary[700]}40`,
        fontFamily: "'Sora', system-ui, sans-serif",
        color: colors.text.primary,
      }}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5"
          style={{ color: colors.text.secondary }}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      )}

      <h2
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: "'Sora', system-ui, sans-serif", color: colors.text.primary }}
      >
        Upload Transactions
      </h2>
      <p className="text-sm mb-6" style={{ color: colors.text.secondary }}>
        Drop a CSV to regenerate dashboards from your real data. Max 10MB.
      </p>

      {/* Drop zone */}
      {!file && (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className="block cursor-pointer rounded-xl p-12 text-center transition-colors"
          style={{
            border: `2px dashed ${dragOver ? colors.accent[500] : colors.primary[700]}`,
            background: dragOver ? `${colors.accent[500]}10` : `${colors.bg.tertiary}80`,
          }}
        >
          <Upload size={40} className="mx-auto mb-4" style={{ color: colors.accent[500] }} />
          <div className="text-lg font-semibold mb-1" style={{ color: colors.text.primary }}>
            Drop CSV here or click to browse
          </div>
          <div className="text-xs" style={{ color: colors.text.tertiary }}>
            .csv only · max 10MB
          </div>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
        </label>
      )}

      {/* File info */}
      {file && (
        <div
          className="flex items-center justify-between p-4 rounded-xl mb-6"
          style={{ background: colors.bg.tertiary, border: `1px solid ${colors.primary[700]}40` }}
        >
          <div className="flex items-center gap-3">
            <FileText size={20} style={{ color: colors.accent[500] }} />
            <div>
              <div className="font-semibold" style={{ color: colors.text.primary }}>{file.name}</div>
              <div className="text-xs" style={{ color: colors.text.tertiary }}>
                {(file.size / 1024).toFixed(1)} KB · {allRows.length} rows
              </div>
            </div>
          </div>
          <button
            onClick={reset}
            disabled={uploading}
            className="text-sm px-3 py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50"
            style={{ color: colors.text.secondary }}
          >
            Change file
          </button>
        </div>
      )}

      {parsing && (
        <div className="text-sm py-2" style={{ color: colors.text.secondary }}>
          Parsing CSV…
        </div>
      )}

      {/* Column mapping */}
      {file && !parsing && columns.length > 0 && !success && (
        <>
          <h3
            className="text-base font-semibold mb-3"
            style={{ fontFamily: "'Sora', system-ui, sans-serif", color: colors.text.primary }}
          >
            Map your columns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {SCHEMA_FIELDS.map((field) => (
              <div key={field.key}>
                <label
                  className="block text-xs mb-1"
                  style={{ color: colors.text.secondary }}
                >
                  {field.label}
                  {field.required && <span style={{ color: colors.danger.light }}> *</span>}
                </label>
                <select
                  value={mapping[field.key] ?? ''}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [field.key]: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{
                    background: colors.bg.secondary,
                    border: `1px solid ${colors.primary[700]}60`,
                    color: colors.text.primary,
                  }}
                >
                  <option value="">— Not mapped —</option>
                  {columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Preview table */}
          <h3
            className="text-base font-semibold mb-3"
            style={{ fontFamily: "'Sora', system-ui, sans-serif", color: colors.text.primary }}
          >
            Preview (first 10 rows)
          </h3>
          <div
            className="overflow-auto rounded-xl mb-6 max-h-64"
            style={{ border: `1px solid ${colors.primary[700]}40`, background: colors.bg.secondary }}
          >
            <table className="w-full text-xs">
              <thead style={{ background: colors.bg.tertiary, position: 'sticky', top: 0 }}>
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c}
                      className="text-left px-3 py-2 font-semibold whitespace-nowrap"
                      style={{ color: colors.text.secondary }}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${colors.primary[700]}30` }}>
                    {columns.map((c) => (
                      <td
                        key={c}
                        className="px-3 py-2 whitespace-nowrap"
                        style={{ color: colors.text.primary, fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {row[c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Progress */}
      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2" style={{ color: colors.text.secondary }}>
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: colors.bg.tertiary }}>
            <div
              className="h-full transition-all"
              style={{ width: `${progress}%`, background: colors.accent[500] }}
            />
          </div>
        </div>
      )}

      {/* Feedback */}
      {error && (
        <div
          className="flex items-start gap-2 p-3 rounded-lg mb-4 text-sm"
          style={{ background: `${colors.danger.main}20`, color: colors.danger.light, border: `1px solid ${colors.danger.main}40` }}
        >
          <XCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          className="flex items-start gap-2 p-3 rounded-lg mb-4 text-sm"
          style={{ background: `${colors.success.main}20`, color: colors.success.light, border: `1px solid ${colors.success.main}40` }}
        >
          <CheckCircle size={16} className="mt-0.5 shrink-0" />
          <span>
            Inserted <strong>{success.inserted}</strong> transactions.
            {success.skipped > 0 && (
              <> Skipped <strong>{success.skipped}</strong> invalid rows.</>
            )}
          </span>
        </div>
      )}

      {file && !parsing && missingRequired.length > 0 && !uploading && !success && (
        <div
          className="flex items-start gap-2 p-3 rounded-lg mb-4 text-sm"
          style={{ background: `${colors.warning.main}20`, color: colors.warning.light, border: `1px solid ${colors.warning.main}40` }}
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>Map required fields: {missingRequired.join(', ')}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handleClearData}
          disabled={clearing || uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          style={{
            background: 'transparent',
            color: colors.danger.light,
            border: `1px solid ${colors.danger.main}60`,
          }}
        >
          <Trash2 size={14} />
          {clearing ? 'Clearing…' : 'Clear uploaded data'}
        </button>

        <div className="flex items-center gap-3">
          {success ? (
            <GalaxyButton variant="primary" onClick={() => { reset(); onClose?.() }}>
              Done
            </GalaxyButton>
          ) : (
            <GalaxyButton
              variant="secondary"
              onClick={handleUpload}
              disabled={!file || parsing || uploading || missingRequired.length > 0}
            >
              {uploading ? 'Uploading…' : 'Upload & Regenerate'}
            </GalaxyButton>
          )}
        </div>
      </div>
    </div>
  )
}
