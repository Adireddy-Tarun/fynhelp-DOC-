import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";

type Employee = {
  id: string;
  business_id: string;
  name: string;
  department: string | null;
  designation: string | null;
  monthly_salary: number | null;
  status: string | null;
  email: string | null;
  joining_date: string | null;
  created_at: string;
};

const HRPage = () => {
  const navigate = useNavigate();
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.business_id) setBusinessId(data.business_id);
    };
    fetchBusiness();
  }, []);

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees", businessId],
    queryFn: async (): Promise<Employee[]> => {
      // employees table not yet provisioned — return empty until backend is ready
      return [];
    },
    enabled: !!businessId,
  });

  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter((e) => e.status === "active").length || 0;
  const totalSalary = employees?.reduce((sum, e) => sum + Number(e.monthly_salary || 0), 0) || 0;
  const avgSalary = activeEmployees > 0 ? totalSalary / activeEmployees : 0;

  const isEmpty = !isLoading && (!employees || employees.length === 0);

  return (
    <DashboardLayout>
      {/* TOP METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-[13px] fyn-label">TOTAL EMPLOYEES</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">{totalEmployees}</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-[13px] fyn-label">ACTIVE</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">{activeEmployees}</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-[13px] fyn-label">MONTHLY PAYROLL</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">{formatINR(totalSalary)}</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5">
          <p className="text-white/40 text-[13px] fyn-label">AVG SALARY</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">{formatINR(Math.round(avgSalary))}</p>
        </div>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {isEmpty && (
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-12 text-center">
          <h3 className="text-fyn-ink text-xl font-serif mb-2">No Employee Data</h3>
          <p className="text-fyn-ink/60 text-sm mb-6">
            Add employees manually or import from your HRMS
          </p>
          <button
            onClick={() => navigate("/dashboard/settings/integrations")}
            className="bg-fyn-ink text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-fyn-ink/90 transition-colors"
          >
            Connect HRMS →
          </button>
        </div>
      )}

      {/* TABLE */}
      {!isLoading && employees && employees.length > 0 && (
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
          <h3 className="text-fyn-ink font-serif text-lg mb-4">Employees</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
                  <th className="text-left py-2">Employee Name</th>
                  <th className="text-left py-2">Department</th>
                  <th className="text-left py-2">Designation</th>
                  <th className="text-right py-2">Monthly Salary</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e, i) => (
                  <tr key={e.id} className={`border-b border-fyn-ink-10 last:border-0 ${i % 2 === 0 ? "bg-[#FAF7F0]" : "bg-white"}`}>
                    <td className="py-3 text-fyn-ink font-medium">{e.name}</td>
                    <td className="py-3 text-fyn-ink/70">{e.department || "—"}</td>
                    <td className="py-3 text-fyn-ink/70">{e.designation || "—"}</td>
                    <td className="py-3 text-right fyn-metric">{formatINR(Number(e.monthly_salary || 0))}</td>
                    <td className="py-3 text-center">
                      <span className={`text-[11px] px-2 py-0.5 rounded ${
                        e.status === "active" ? "bg-[#1A6B3C]/10 text-[#1A6B3C]" :
                        e.status === "inactive" ? "bg-gray-100 text-gray-500" :
                        "bg-[#C41E1E]/10 text-[#C41E1E]"
                      }`}>
                        {e.status || "unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HRPage;
