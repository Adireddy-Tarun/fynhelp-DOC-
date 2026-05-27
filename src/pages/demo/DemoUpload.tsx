import { useState } from 'react'
import { Upload, FileText, AlertCircle, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import Papa from 'papaparse'

export function DemoUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const navigate = useNavigate()

  // Access guard temporarily disabled for design review

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    const orgId = sessionStorage.getItem('demo_org_id')
    if (!orgId) {
      alert('Session expired. Please restart demo.')
      window.location.href = '/demo/login'
      return
    }

    setUploading(true)
    setProgress('Reading file...')

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            setProgress('Extracting transactions with AI...')

            const { error: extractError } = await supabase.functions.invoke(
              'extract-financial-data',
              { body: { rawData: results.data, orgId } }
            )
            if (extractError) throw extractError

            setProgress('Generating insights...')

            const { error: insightsError } = await supabase.functions.invoke(
              'generate-insights',
              { body: { orgId } }
            )
            if (insightsError) throw insightsError

            setProgress('Complete! ✓')
            setTimeout(() => navigate('/demo/dashboard'), 1000)
          } catch (err) {
            console.error('Processing error:', err)
            setProgress('Processing failed. Please try again.')
            setUploading(false)
          }
        },
        error: (error) => {
          console.error('Parse error:', error)
          setProgress('File parsing failed')
          setUploading(false)
        }
      })
    } catch (error) {
      console.error('Upload error:', error)
      setProgress('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A1209] to-[#1A1008]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#2A1209]/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-georgia font-bold text-white">FynHelp Demo</h1>
          <button
            onClick={() => {
              sessionStorage.clear()
              window.location.href = '/demo/login'
            }}
            className="text-white/70 hover:text-white text-sm"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-georgia font-bold text-white mb-4">
            Upload Your Financial Data
          </h2>
          <p className="text-xl text-white/70">
            Upload bank statement or invoice CSV to get real insights
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-12">
          {uploading ? (
            <div className="flex flex-col items-center gap-6 py-12">
              <Loader size={64} className="text-[#C41E1E] animate-spin" />
              <p className="text-white font-semibold text-xl">{progress}</p>
              <p className="text-white/60 text-sm">This may take 15-30 seconds...</p>
            </div>
          ) : (
            <>
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-white/20 rounded-xl p-16 text-center hover:border-[#C41E1E]/50 transition-colors">
                  {file ? (
                    <div className="flex flex-col items-center gap-4">
                      <FileText size={64} className="text-[#C41E1E]" />
                      <div>
                        <p className="text-white font-semibold text-lg mb-1">{file.name}</p>
                        <p className="text-white/60 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setFile(null)
                        }}
                        className="text-white/60 hover:text-white text-sm underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={64} className="text-[#C41E1E] mx-auto mb-6" />
                      <p className="text-white font-semibold text-xl mb-2">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-white/60 text-sm">Supports CSV, Excel (XLSX, XLS)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <div className="mt-8 flex items-start gap-3 bg-[#C41E1E]/10 border border-[#C41E1E]/30 rounded-lg p-4">
                <AlertCircle size={20} className="text-[#C41E1E] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-white/80">
                  <p className="font-semibold mb-1">Sample data format:</p>
                  <p>Date, Description, Amount, Type (Income/Expense)</p>
                </div>
              </div>

              {file && (
                <button
                  onClick={handleUpload}
                  className="w-full mt-8 px-8 py-4 bg-[#C41E1E] text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity"
                >
                  Process & Generate Insights →
                </button>
              )}
            </>
          )}
        </div>

        {!uploading && (
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm mb-3">Don't have data handy? Download sample CSV</p>
            <button
              onClick={() => {
                const csv = `Date,Description,Amount,Type
2026-05-01,Client Payment,85000,Income
2026-05-02,Office Rent,45000,Expense
2026-05-05,Vendor Payment,32000,Expense
2026-05-10,Client Payment,120000,Income
2026-05-12,Salaries,180000,Expense
2026-05-15,Software Subscription,15000,Expense
2026-05-18,Marketing Spend,28000,Expense
2026-05-20,Client Payment,95000,Income`

                const blob = new Blob([csv], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'sample-transactions.csv'
                a.click()
              }}
              className="text-[#C41E1E] hover:underline text-sm font-semibold"
            >
              Download Sample CSV
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DemoUpload
