import { jsPDF } from "jspdf";

// FynHelp brand tokens (RGB equivalents of HSL hex in mem://design/brand)
const BRAND = {
  ink: [26, 16, 8] as [number, number, number],          // #1A1008
  red: [196, 30, 30] as [number, number, number],        // #C41E1E
  beige: [244, 237, 218] as [number, number, number],    // #F4EDDA
  beigeDark: [237, 228, 203] as [number, number, number],// #EDE4CB
  gold: [139, 105, 20] as [number, number, number],      // #8B6914
  muted: [110, 95, 75] as [number, number, number],
  rule: [220, 210, 190] as [number, number, number],
};

const formatDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

interface ReportLike {
  id?: string;
  brief_date?: string | null;
  created_at?: string | null;
  content?: string | null;
  delivered?: boolean | null;
  brief_type?: string | null;
}

export function downloadReportPdf(report: ReportLike) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 56;
  const usable = pageWidth - margin * 2;

  const headerHeight = 72;
  const footerHeight = 40;
  const contentTop = headerHeight + 32;
  const contentBottom = pageHeight - footerHeight - 16;

  const briefDateLabel = formatDate(report.brief_date);
  const generatedLabel = formatDate(report.created_at);
  const statusLabel = report.delivered ? "Delivered" : "Ready";

  // ---------- Reusable chrome ----------
  const drawHeader = () => {
    // Beige header band
    doc.setFillColor(...BRAND.beigeDark);
    doc.rect(0, 0, pageWidth, headerHeight, "F");

    // Red accent bar at left
    doc.setFillColor(...BRAND.red);
    doc.rect(0, 0, 6, headerHeight, "F");

    // Wordmark "FynHelp" — Georgia serif (jsPDF maps "times" to Times/Georgia-like serif)
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...BRAND.ink);
    doc.text("FynHelp", margin, 36);

    // Tagline
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.gold);
    doc.text("CFO Report", margin, 52);

    // Right-aligned meta
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    const rightX = pageWidth - margin;
    doc.text(`Brief: ${briefDateLabel}`, rightX, 28, { align: "right" });
    doc.text(`Generated: ${generatedLabel}`, rightX, 42, { align: "right" });
    doc.text(`Status: ${statusLabel}`, rightX, 56, { align: "right" });

    // Hairline rule under header
    doc.setDrawColor(...BRAND.rule);
    doc.setLineWidth(0.5);
    doc.line(margin, headerHeight + 8, pageWidth - margin, headerHeight + 8);
  };

  const drawFooter = (pageNum: number, pageCount: number) => {
    doc.setDrawColor(...BRAND.rule);
    doc.setLineWidth(0.5);
    doc.line(
      margin,
      pageHeight - footerHeight,
      pageWidth - margin,
      pageHeight - footerHeight
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text("FynHelp · Confidential", margin, pageHeight - footerHeight + 18);
    doc.text(
      `Page ${pageNum} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - footerHeight + 18,
      { align: "right" }
    );
  };

  // ---------- Body layout ----------
  drawHeader();

  // Title block
  let y = contentTop;
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.ink);
  doc.text("CFO Report", margin, y);
  y += 10;

  // Red underline accent
  doc.setDrawColor(...BRAND.red);
  doc.setLineWidth(2);
  doc.line(margin, y, margin + 48, y);
  y += 22;

  if (report.brief_type) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.gold);
    doc.text(report.brief_type.toUpperCase(), margin, y);
    y += 18;
  }

  // Body — paragraph-aware pagination
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.ink);

  const bodyText =
    typeof report.content === "string" && report.content.trim().length > 0
      ? report.content.trim()
      : "(No content available for this report.)";

  const lineHeight = 16;
  const paragraphGap = 8;

  const ensureSpace = (needed: number) => {
    if (y + needed > contentBottom) {
      doc.addPage();
      drawHeader();
      y = contentTop;
    }
  };

  // Split into paragraphs (preserve blank lines as spacing)
  const paragraphs = bodyText.split(/\n\s*\n/);

  for (const rawPara of paragraphs) {
    const para = rawPara.replace(/\n/g, " ").trim();
    if (!para) continue;

    // Detect a heading-ish line: short, ends without period, or markdown #
    const isHeading =
      /^#{1,3}\s+/.test(para) ||
      (para.length <= 80 && !/[.!?]$/.test(para) && para === para.replace(/\s+/g, " "));

    if (isHeading && para.length <= 120) {
      const headingText = para.replace(/^#{1,3}\s+/, "");
      ensureSpace(lineHeight + 6);
      doc.setFont("times", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...BRAND.ink);
      doc.text(headingText, margin, y);
      y += lineHeight + 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...BRAND.ink);
      continue;
    }

    const lines = doc.splitTextToSize(para, usable) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }
    y += paragraphGap;
  }

  // ---------- Footers across all pages ----------
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(i, pageCount);
  }

  const filename = `fynhelp-cfo-report-${
    report.brief_date || report.id || "report"
  }.pdf`.replace(/[^a-z0-9.\-_]/gi, "_");
  doc.save(filename);
}
