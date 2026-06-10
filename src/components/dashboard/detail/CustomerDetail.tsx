import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useCustomerDetail } from "@/hooks/dashboard/useDashboardData";
import { formatINR } from "@/lib/indian-format";
import { FynButton, FynLoading, FynTable, FynTH, FynTR, FynTD } from "@/components/dashboard/ui";
import { DrawerHeader, DrawerSection, DrawerMetricRow, StatusBadgeFor } from "./parts";
import { useDrawer } from "../DetailDrawer";

export default function CustomerDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isLoading } = useCustomerDetail(id);
  const { open } = useDrawer();
  const navigate = useNavigate();

  if (isLoading || !data?.customer) return <div className="p-fyn-lg"><FynLoading rows={4} /></div>;
  const c = data.customer;
  const invoices = data.invoices;
  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.paid_amount || 0), 0);
  const outstanding = invoices.reduce((s, i) => s + Number(i.outstanding_amount || 0), 0);
  const hasOverdue = invoices.some((i) => i.status === "overdue");

  return (
    <div className="relative">
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-fyn-md top-fyn-md text-fyn-ink-60 hover:text-fyn-ink z-10"
      >
        <X size={20} />
      </button>

      <DrawerHeader
        title={c.customer_name}
        subtitle={[c.customer_category, c.city, c.state].filter(Boolean).join(" • ")}
        meta={[
          { label: "Contact", value: c.contact_person || "—" },
          { label: "Email", value: c.email || "—" },
          { label: "Phone", value: c.phone || "—" },
          { label: "GSTIN", value: c.gstin || "—" },
        ]}
      />

      <DrawerSection>
        <DrawerMetricRow
          items={[
            { label: "Total Revenue", value: formatINR(totalRevenue) },
            { label: "Outstanding", value: formatINR(outstanding) },
            { label: "Terms", value: `${c.payment_terms_days || 30}d` },
          ]}
        />
      </DrawerSection>

      <DrawerSection title="Invoice History">
        {invoices.length === 0 ? (
          <p className="text-fyn-small text-fyn-ink-45">No invoices yet.</p>
        ) : (
          <FynTable>
            <thead>
              <tr className="border-b border-fyn-ink-10">
                <FynTH>Invoice #</FynTH>
                <FynTH>Date</FynTH>
                <FynTH align="right">Amount</FynTH>
                <FynTH>Status</FynTH>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <FynTR
                  key={i.id}
                  className="cursor-pointer"
                  onClick={() => open("invoice", i.id)}
                >
                  <FynTD mono>{i.invoice_number}</FynTD>
                  <FynTD>{new Date(i.invoice_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</FynTD>
                  <FynTD align="right" mono>{formatINR(Number(i.total_amount))}</FynTD>
                  <FynTD><StatusBadgeFor kind="invoice" value={i.status} /></FynTD>
                </FynTR>
              ))}
            </tbody>
          </FynTable>
        )}
      </DrawerSection>

      <div className="p-fyn-lg flex gap-fyn-sm flex-wrap">
        {hasOverdue && (
          <FynButton variant="primary" onClick={() => alert("Reminder sent (demo)")}>
            Send Reminder
          </FynButton>
        )}
        <FynButton
          variant="secondary"
          onClick={() => navigate(`/dashboard/invoices?customer=${encodeURIComponent(c.customer_name)}`)}
        >
          View All Invoices →
        </FynButton>
      </div>
    </div>
  );
}
