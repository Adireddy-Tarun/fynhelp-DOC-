import { useMemo } from "react";
import { usePaymentSettlements, useMode } from "@/demo/components/DemoDataSource";
import { IntelCard, KPI, fmtCompact } from "@/demo/components/DemoPrimitives";

export default function SettlementsSection() {
  const mode = useMode();
  const { data, isLoading } = usePaymentSettlements();
  const rows = data ?? [];

  const m = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const rzpPending = rows.filter(r => r.gateway === "razorpay" && r.status === "pending").reduce((s, r) => s + Number(r.amount), 0);
    const expectedToday = rows.filter(r => r.expected_date === today).reduce((s, r) => s + Number(r.amount), 0);
    const upiFloat = rows.filter(r => r.gateway === "upi" && r.status === "pending").reduce((s, r) => s + Number(r.amount), 0);
    return { rzpPending, expectedToday, upiFloat };
  }, [rows]);

  const liveEmpty = mode === "live" && rows.length === 0 && !isLoading;

  if (liveEmpty) {
    return (
      <IntelCard title="Payment Settlements" sub="Razorpay, UPI & gateway pipeline">
        <p className="text-sm text-[#6B6B6B] py-4 text-center">Connect Razorpay to see settlement tracking</p>
      </IntelCard>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Razorpay Pending" count={m.rzpPending} format={fmtCompact} sub="Awaiting settlement" tone="warning" />
      <KPI label="Expected Today" count={m.expectedToday} format={fmtCompact} sub="Hits bank today" />
      <KPI label="UPI Float" count={m.upiFloat} format={fmtCompact} sub="In-transit UPI" />
      <KPI label="Next 7 Days" value="₹4.82L" sub="Forecast inflow" tone="healthy" />
    </div>
  );
}
