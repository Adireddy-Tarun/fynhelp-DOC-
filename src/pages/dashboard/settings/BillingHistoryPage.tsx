import { Star } from "lucide-react";

const BillingHistoryPage = () => (
  <div className="max-w-3xl">
    <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: "#1A1008" }}>Billing History</h2>

    {/* Early access notice */}
    <div className="flex items-start gap-3 rounded-lg p-5 mb-6" style={{ background: "rgba(139,105,20,0.08)", border: "1px solid rgba(139,105,20,0.30)" }}>
      <Star size={24} style={{ color: "#8B6914", flexShrink: 0 }} />
      <div>
        <p className="font-semibold text-[14px]" style={{ color: "#1A1008" }}>No invoices yet — Early Access is free</p>
        <p className="text-[14px] mt-1" style={{ color: "rgba(26,16,8,0.80)" }}>
          Your billing history will appear here when paid plans launch.
        </p>
      </div>
    </div>

    {/* Preview table */}
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <p className="text-[16px] font-semibold px-6 py-3 rounded-lg" style={{ background: "#FFFFFF", color: "rgba(26,16,8,0.60)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          Your invoices will appear here
        </p>
      </div>
      <div style={{ opacity: 0.35 }}>
        <table className="w-full">
          <thead>
            <tr className="text-left" style={{ background: "#FAF7F0" }}>
              <th className="px-4 py-3 text-[12px] font-semibold" style={{ color: "rgba(26,16,8,0.50)" }}>Date</th>
              <th className="px-4 py-3 text-[12px] font-semibold" style={{ color: "rgba(26,16,8,0.50)" }}>Plan</th>
              <th className="px-4 py-3 text-[12px] font-semibold" style={{ color: "rgba(26,16,8,0.50)" }}>Amount</th>
              <th className="px-4 py-3 text-[12px] font-semibold" style={{ color: "rgba(26,16,8,0.50)" }}>Status</th>
              <th className="px-4 py-3 text-[12px] font-semibold" style={{ color: "rgba(26,16,8,0.50)" }}>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: "May 1, 2026", plan: "Growth Plan", amount: "₹4,999", status: "Paid" },
              { date: "Jun 1, 2026", plan: "Growth Plan", amount: "₹4,999", status: "Paid" },
              { date: "Jul 1, 2026", plan: "Growth Plan", amount: "₹4,999", status: "Pending" },
            ].map((row, i) => (
              <tr key={i} className="border-t" style={{ borderColor: "#E0D9C8" }}>
                <td className="px-4 py-3 text-[13px]" style={{ color: "#1A1008" }}>{row.date}</td>
                <td className="px-4 py-3 text-[13px]" style={{ color: "#1A1008" }}>{row.plan}</td>
                <td className="px-4 py-3 text-[13px] font-medium" style={{ color: "#1A1008" }}>{row.amount}</td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: row.status === "Paid" ? "#DCFCE7" : "#FEF3E2", color: row.status === "Paid" ? "#16A34A" : "#8B5A00" }}>
                    {row.status === "Paid" ? "Paid ✓" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[13px]" style={{ color: "#C41E1E" }}>Download PDF</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <p className="text-center text-[14px] mt-6" style={{ color: "rgba(26,16,8,0.60)" }}>
      We'll email your first invoice when billing begins.
    </p>
  </div>
);

export default BillingHistoryPage;
