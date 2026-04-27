import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";

const downloadReportPdf = (report: any) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usable = pageWidth - margin * 2;

  const briefDateLabel = report.brief_date
    ? new Date(report.brief_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
  const generatedLabel = new Date(report.created_at).toLocaleDateString(
    "en-IN",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CFO Report", margin, margin);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`Brief date: ${briefDateLabel}`, margin, margin + 22);
  doc.text(`Generated: ${generatedLabel}`, margin, margin + 36);
  doc.text(
    `Status: ${report.delivered ? "Delivered" : "Ready"}`,
    margin,
    margin + 50
  );

  // Divider
  doc.setDrawColor(220);
  doc.line(margin, margin + 62, pageWidth - margin, margin + 62);

  // Body
  doc.setTextColor(20);
  doc.setFontSize(11);
  const body =
    typeof report.content === "string" && report.content.trim().length > 0
      ? report.content
      : "(No content available for this report.)";
  const lines = doc.splitTextToSize(body, usable) as string[];

  let y = margin + 84;
  const lineHeight = 15;
  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  const filename = `cfo-report-${
    report.brief_date || report.id
  }.pdf`.replace(/[^a-z0-9.\-_]/gi, "_");
  doc.save(filename);
};

const CFOReportsPage = () => {
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

  const { data: reports, isLoading } = useQuery({
    queryKey: ["cfo-reports", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("nidhi_briefs")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!businessId,
  });

  if (isLoading || !businessId) {
    return (
      <DashboardLayout>
        <div className="text-fyn-ink/60 text-sm">Loading reports…</div>
      </DashboardLayout>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <DashboardLayout>
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-10 text-center">
          <h2 className="text-fyn-ink text-2xl font-sans font-semibold mb-2">
            No Reports Generated Yet
          </h2>
          <p className="text-fyn-ink/60 text-sm mb-6">
            Nidhi will automatically generate CFO reports based on your data
          </p>
          <button
            onClick={() => navigate("/dashboard/nidhi-chat")}
            className="bg-fyn-red text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition"
          >
            Generate Report
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-fyn-ink text-lg font-sans">CFO Reports</h3>
          <button
            onClick={() => navigate("/dashboard/nidhi-chat")}
            className="bg-fyn-red text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition"
          >
            New Report
          </button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brief Date</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report: any) => {
              const preview =
                typeof report.content === "string"
                  ? report.content.slice(0, 120) +
                    (report.content.length > 120 ? "…" : "")
                  : "—";
              return (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    {report.brief_date
                      ? new Date(report.brief_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-fyn-ink/70 text-sm max-w-md">
                    {preview}
                  </TableCell>
                  <TableCell>
                    {new Date(report.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={report.delivered ? "default" : "secondary"}
                    >
                      {report.delivered ? "Delivered" : "Ready"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default CFOReportsPage;
