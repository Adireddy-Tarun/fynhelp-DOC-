import { useParams, useNavigate } from "@/lib/router-compat";
import DemoModeBanner from "@/components/demo/DemoModeBanner";
import EmployeeDetail from "@/demo/components/detail/EmployeeDetail";

export default function DemoEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <DemoModeBanner>
      <div className="min-h-screen bg-fyn-beige py-fyn-lg">
        <div className="max-w-3xl mx-auto bg-fyn-beige-card rounded-lg border border-fyn-ink-10 overflow-hidden">
          <EmployeeDetail id={id || ""} onClose={() => navigate(-1)} />
        </div>
      </div>
    </DemoModeBanner>
  );
}
