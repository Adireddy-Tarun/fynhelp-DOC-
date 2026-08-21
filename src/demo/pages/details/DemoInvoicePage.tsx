import { useParams, useNavigate } from "@/lib/router-compat";
import DemoModeBanner from "@/components/demo/DemoModeBanner";
import InvoiceDetail from "@/demo/components/detail/InvoiceDetail";

export default function DemoInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <DemoModeBanner>
      <div className="min-h-screen bg-fyn-beige py-fyn-lg">
        <div className="max-w-3xl mx-auto bg-fyn-beige-card rounded-lg border border-fyn-ink-10 overflow-hidden">
          <InvoiceDetail id={id || ""} onClose={() => navigate(-1)} />
        </div>
      </div>
    </DemoModeBanner>
  );
}
