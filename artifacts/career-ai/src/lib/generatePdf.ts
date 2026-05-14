import jsPDF from "jspdf";

interface PdfData {
  docType: string;
  tone: string;
  name: string;
  jobTitle: string;
  company: string;
  output: string;
  atsScore?: { score: number; matched: string[]; missing: string[] } | null;
}

const DOC_LABEL: Record<string, string> = {
  cover: "Cover Letter",
  resume: "Resume Summary",
  linkedin: "LinkedIn About",
};

const TONE_LABEL: Record<string, string> = {
  faang: "FAANG-Ready",
  startup: "Startup Vibe",
  senior: "Senior / Staff",
  pivot: "Career Pivot",
};

export function generatePdf(data: PdfData): void {
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;

  const amber = [212, 140, 60] as [number, number, number];
  const dark = [26, 26, 26] as [number, number, number];
  const mid = [85, 85, 85] as [number, number, number];
  const light = [170, 170, 170] as [number, number, number];
  const cream = [250, 249, 247] as [number, number, number];

  // ── Header bar ──────────────────────────────────────────────────────────────
  pdf.setFillColor(...amber);
  pdf.rect(0, 0, pageW, 12, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text("techcareer.ai", margin, 8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  const docLabel = DOC_LABEL[data.docType] ?? data.docType;
  pdf.text(`${docLabel}  ·  ${data.company}  ·  ${TONE_LABEL[data.tone] ?? data.tone}`, pageW - margin, 8, { align: "right" });

  // ── Meta section ────────────────────────────────────────────────────────────
  let y = 22;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(...dark);
  pdf.text(docLabel, margin, y);
  y += 7;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(...mid);
  pdf.text(`${data.name}  ·  ${data.jobTitle} at ${data.company}`, margin, y);
  y += 5;

  pdf.setDrawColor(...amber);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Body text ────────────────────────────────────────────────────────────────
  pdf.setFont("times", "normal");
  pdf.setFontSize(10.5);
  pdf.setTextColor(...dark);

  const lines = pdf.splitTextToSize(data.output, contentW);
  const lineH = 5.5;

  for (const line of lines) {
    if (y + lineH > pageH - 28) {
      pdf.addPage();
      pdf.setFillColor(...amber);
      pdf.rect(0, 0, pageW, 4, "F");
      y = 14;
    }
    pdf.text(line, margin, y);
    y += lineH;
  }

  // ── ATS Score section (if available) ────────────────────────────────────────
  if (data.atsScore) {
    y += 6;
    if (y + 32 > pageH - 28) {
      pdf.addPage();
      pdf.setFillColor(...amber);
      pdf.rect(0, 0, pageW, 4, "F");
      y = 14;
    }

    pdf.setFillColor(...cream);
    pdf.roundedRect(margin, y, contentW, 28, 3, 3, "F");
    pdf.setDrawColor(237, 233, 226);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(margin, y, contentW, 28, 3, 3, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...light);
    pdf.text("ATS KEYWORD MATCH", margin + 6, y + 7);

    const scoreColor: [number, number, number] =
      data.atsScore.score >= 75 ? [61, 150, 105] :
      data.atsScore.score >= 50 ? [196, 115, 42] :
      [229, 115, 115];

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(...scoreColor);
    pdf.text(`${data.atsScore.score}`, margin + 6, y + 18);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...scoreColor);
    pdf.text("/ 100", margin + 6 + pdf.getTextWidth(`${data.atsScore.score}`) + 1, y + 18);

    const matchedStr = data.atsScore.matched.slice(0, 8).join(", ");
    const missingStr = data.atsScore.missing.slice(0, 5).join(", ");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...mid);

    if (matchedStr) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Found: ", margin + 38, y + 11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(45, 122, 82);
      pdf.text(pdf.splitTextToSize(matchedStr, contentW - 55)[0], margin + 38 + pdf.getTextWidth("Found: "), y + 11);
    }
    if (missingStr) {
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...mid);
      pdf.text("Missing: ", margin + 38, y + 19);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(196, 115, 42);
      pdf.text(pdf.splitTextToSize(missingStr, contentW - 55)[0], margin + 38 + pdf.getTextWidth("Missing: "), y + 19);
    }

    y += 34;
  }

  // ── Footer on every page ────────────────────────────────────────────────────
  const totalPages = (pdf as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFillColor(250, 249, 247);
    pdf.rect(0, pageH - 12, pageW, 12, "F");
    pdf.setDrawColor(237, 233, 226);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageH - 12, pageW - margin, pageH - 12);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...light);
    pdf.text("Generated by techcareer.ai", margin, pageH - 5);
    pdf.text(
      `${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}  ·  Page ${p} of ${totalPages}`,
      pageW - margin, pageH - 5, { align: "right" }
    );
  }

  const filename = `${(data.name || "document").toLowerCase().replace(/\s+/g, "-")}-${docLabel.toLowerCase().replace(/\s+/g, "-")}-techcareer.pdf`;
  pdf.save(filename);
}
