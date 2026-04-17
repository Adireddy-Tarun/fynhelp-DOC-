import DashboardLayout from "@/components/DashboardLayout";
import GlobalBackBar from "@/components/GlobalBackBar";
import { useState } from "react";

// BACKEND: SELECT * FROM bank_accounts WHERE business_id AND is_active
const accounts = [
  { name: "HDFC Bank", initial: "H", color: "#004C8F", type: "Current Account · ****4521", balance: "₹12.4L", synced: "12 min ago", status: "Fresh" },
];

// BACKEND: transactions WHERE is_reconciled = false
const unreconciled = [
  { date: "Apr 12", desc: "NEFT CR FABRICS", amount: "+₹2.3L", matched: "No matching invoice" },
  { date: "Apr 10", desc: "UPI CR 9876...", amount: "+₹45K", matched: "No matching invoice" },
  { date: "Apr 08", desc: "RTGS CR ENTERPRISES", amount: "+₹1.1L", matched: "No matching invoice" },
];

// BACKEND: rule-based eligibility from bank + revenue + dso + gst + msme
const financing = [
  { name: "Working Capital Loan", elig: "₹10-18L", rate: "12-16% p.a.", tenure: "6-24 months", req: "4 of 5 met", status: "Likely eligible", chip: "#F0FDF4", chipText: "#166534" },
  { name: "Invoice Discounting", elig: "Up to ₹22.1L", rate: "1-1.5% per month", tenure: "Till invoice due", req: "All met", status: "Eligible", chip: "#F0FDF4", chipText: "#166534" },
  { name: "CGTMSE Term Loan", elig: "Up to ₹2Cr", rate: "9-13% p.a.", tenure: "1-7 years", req: "MSME registration needed", status: "Partial", chip: "#FFFBEB", chipText: "#8B5A00" },
  { name: "NBFC Digital Loan", elig: "₹5-25L", rate: "16-24% p.a.", tenure: "3-12 months", req: "Pre-approved", status: "Pre-approved", chip: "#F0FDF4", chipText: "#166534" },
];

const offers = [
  { nbfc: "Lendingkart", product: "Invoice Discounting", rate: "14.5% p.a.", limit: "Up to ₹15L", tenure: "30-90 days", proc: "24-48 hours" },
  { nbfc: "Indifi", product: "WC Loan", rate: "16.0% p.a.", limit: "Up to ₹20L", tenure: "6-18 months", proc: "48 hours" },
  { nbfc: "FlexiLoans", product: "WC Loan", rate: "18.5% p.a.", limit: "Up to ₹12L", tenure: "3-12 months", proc: "24 hours" },
];

const DarkMetric = ({ label, value, valueColor = "#FFFFFF", sub, subColor }: any) => (
  <div className="rounded-lg p-5" style={{ background: "#1A1008" }}>
    <p className="text-xs font-sans" style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", fontWeight: 500 }}>{label}</p>
    <p className="mt-2" style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 36, color: valueColor, lineHeight: 1.1 }}>{value}</p>
    <p className="mt-2 text-xs font-sans" style={{ color: subColor || "rgba(255,255,255,0.60)" }}>{sub}</p>
  </div>
);

const Card = ({ children, className = "", style = {} }: any) => (
  <div className={`rounded-lg p-6 ${className}`} style={{ background: "#FFFFFF", border: "1px solid #D4C9A8", ...style }}>{children}</div>
);

export default function BankingPage() {
  const [filter, setFilter] = useState<"all" | "unreconciled" | "missing">("unreconciled");

  return (
    <DashboardLayout>
      <GlobalBackBar />
      <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6 font-sans">
        <div>
          <h1 style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 28, color: "#1A1008" }}>Banking & Fintech Intelligence</h1>
          <p className="mt-1.5" style={{ fontFamily: "Inter", fontSize: 15, color: "rgba(26,16,8,0.60)" }}>
            All your accounts. Every transaction. One intelligent view — powered by RBI's Account Aggregator.
          </p>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DarkMetric label="TOTAL BALANCE" value="₹12.4L" sub="Across 1 connected account · Synced 12 min ago" subColor="#4ADE80" />
          <DarkMetric label="ACCOUNTS CONNECTED" value="1 of 5" sub="HDFC CA connected · Add more for better insights →" subColor="#FCD34D" />
          <DarkMetric label="LOAN ELIGIBILITY" value="₹18L" valueColor="#4ADE80" sub="Working capital estimate based on financials" />
          <DarkMetric label="UNRECONCILED" value="3" valueColor="#FCD34D" sub="Not matched to invoices · Review →" subColor="#FCD34D" />
        </div>

        {/* Connected accounts */}
        <Card>
          <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008", marginBottom: 16 }}>Your bank accounts</h2>
          <div className="space-y-2">
            {accounts.map((a) => (
              <div key={a.name} className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid #F0EBD8" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: a.color }}>{a.initial}</div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: "#1A1008" }}>{a.name}</p>
                  <p className="text-xs" style={{ color: "rgba(26,16,8,0.50)" }}>{a.type}</p>
                </div>
                <div className="text-right">
                  <p style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 15, color: "#1A1008" }}>{a.balance}</p>
                  <p className="text-[11px]" style={{ color: "rgba(26,16,8,0.45)" }}>Last synced {a.synced}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "#F0FDF4", color: "#166534" }}>{a.status}</span>
                <button className="text-xs font-medium" style={{ color: "#C41E1E" }}>View transactions →</button>
              </div>
            ))}
            <a href="/dashboard/settings/integrations" className="flex items-center justify-center py-3 rounded text-sm cursor-pointer" style={{ border: "1.5px dashed #D4C9A8", color: "rgba(26,16,8,0.45)" }}>
              + Connect another bank account
            </a>
          </div>
        </Card>

        {/* Reconciliation */}
        <Card>
          <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008" }}>Bank Reconciliation</h2>
          <p className="text-xs mt-1 mb-4" style={{ color: "rgba(26,16,8,0.55)" }}>Transactions in bank vs transactions in Tally</p>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setFilter("all")} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: filter === "all" ? "#1A1008" : "#F0FDF4", color: filter === "all" ? "#FFF" : "#166534", border: "1px solid #A7F3D0" }}>Matched: 238</button>
            <button onClick={() => setFilter("unreconciled")} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: filter === "unreconciled" ? "#1A1008" : "#FFFBEB", color: filter === "unreconciled" ? "#FFF" : "#8B5A00", border: "1px solid #FCD34D" }}>Unreconciled: 3</button>
            <button onClick={() => setFilter("missing")} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: filter === "missing" ? "#1A1008" : "#FEF2F2", color: filter === "missing" ? "#FFF" : "#991B1B", border: "1px solid #FCA5A5" }}>Missing in bank: 1</button>
          </div>
          {filter === "unreconciled" && (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ fontFamily: "Inter", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #D4C9A8" }}>
                    {["Date", "Bank Description", "Amount", "Matched to?", "Action"].map((h) => (
                      <th key={h} className="text-left py-2.5 font-medium" style={{ color: "rgba(26,16,8,0.55)", fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unreconciled.map((t) => (
                    <tr key={t.desc} style={{ borderBottom: "1px solid #F0EBD8" }}>
                      <td className="py-2.5" style={{ color: "rgba(26,16,8,0.70)" }}>{t.date}</td>
                      <td className="py-2.5" style={{ color: "#1A1008" }}>{t.desc}</td>
                      <td className="py-2.5" style={{ color: "#166534", fontWeight: 600 }}>{t.amount}</td>
                      <td className="py-2.5" style={{ color: "rgba(26,16,8,0.55)" }}>{t.matched}</td>
                      <td className="py-2.5"><button className="text-xs font-medium" style={{ color: "#C41E1E" }}>Match manually →</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Loan eligibility */}
        <Card>
          <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008" }}>What financing do you qualify for?</h2>
          <p className="text-xs mt-1 mb-4" style={{ color: "rgba(26,16,8,0.55)" }}>Based on your bank data, financials, and GST history</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financing.map((f) => (
              <div key={f.name} className="rounded-lg p-4" style={{ border: "1px solid #E0D9C8" }}>
                <div className="flex items-start justify-between mb-2">
                  <p style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: "#1A1008" }}>{f.name}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: f.chip, color: f.chipText }}>{f.status}</span>
                </div>
                <p className="text-xs mb-1" style={{ color: "rgba(26,16,8,0.70)" }}><strong>Eligibility:</strong> {f.elig}</p>
                <p className="text-xs mb-1" style={{ color: "rgba(26,16,8,0.70)" }}><strong>Rate:</strong> {f.rate}</p>
                <p className="text-xs mb-1" style={{ color: "rgba(26,16,8,0.70)" }}><strong>Tenure:</strong> {f.tenure}</p>
                <p className="text-xs mb-3" style={{ color: "rgba(26,16,8,0.55)" }}>{f.req}</p>
                <button className="text-xs font-medium" style={{ color: "#C41E1E" }}>{f.name === "CGTMSE Term Loan" ? "Add MSME number →" : "Apply →"}</button>
              </div>
            ))}
          </div>
        </Card>

        {/* Marketplace */}
        <div className="rounded-lg p-6" style={{ background: "#1A1008" }}>
          <h2 style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 22, color: "#FFFFFF" }}>Live financing offers</h2>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>8 NBFC partners. Real rates. One-click apply.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {offers.map((o) => (
              <div key={o.nbfc} className="rounded-lg p-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
                <p style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: "#FFF" }}>{o.nbfc}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>{o.product}</p>
                <p className="mt-3" style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 20, color: "#FFF" }}>{o.rate}</p>
                <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.65)" }}>Limit: {o.limit}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>Tenure: {o.tenure}</p>
                <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>Processing: {o.proc}</p>
                <button className="w-full py-2 rounded text-xs font-semibold text-white" style={{ background: "#C41E1E" }}>Apply now →</button>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>Pre-approved offers based on your FynHelp data. Applying shares your financial summary with the lender.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
