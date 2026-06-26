import { useParams, useNavigate } from "react-router-dom";
import DemoModeBanner from "@/components/demo/DemoModeBanner";
import InsuranceDetail from "@/demo/components/detail/InsuranceDetail";

export default function DemoInsurancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <DemoModeBanner>
      <div className="min-h-screen bg-fyn-beige py-fyn-lg">
        <div className="max-w-3xl mx-auto bg-fyn-beige-card rounded-lg border border-fyn-ink-10 overflow-hidden">
          <InsuranceDetail id={id || ""} onClose={() => navigate(-1)} />
        </div>
      </div>
    </DemoModeBanner>
  );
}
