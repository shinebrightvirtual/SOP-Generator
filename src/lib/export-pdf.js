import jsPDF from "jspdf";
import { SECTIONS, SECTION_ORDER } from "./sections.js";

const MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 6;

function addWrappedText(doc, text, x, y, maxWidth, fontSize) {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(String(text), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * (fontSize * 0.4 + 1.5);
}

export async function exportToPDF(data, brand, isPro) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pc = isPro ? brand.primaryColor : "#1B3A4B";
  const ac = isPro ? brand.accentColor : "#E8985E";
  const biz = isPro && brand.businessName ? brand.businessName : "";
  const title = data.overview?.sopTitle || "Standard Operating Procedure";

  const hexToRGB = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const [pr, pg, pb] = hexToRGB(pc);
  const [ar, ag, ab] = hexToRGB(ac);

  let y = MARGIN;

  // Header bar
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, PAGE_WIDTH, 30, "F");

  // Business name
  if (biz) {
    doc.setTextColor(ar, ag, ab);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(biz.toUpperCase(), MARGIN, 12);
  }

  // SOP Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(title, CONTENT_WIDTH - 10);
  doc.text(titleLines, MARGIN, biz ? 20 : 17);

  y = 38;

  // Meta row
  const meta = [];
  if (data.overview?.category) meta.push(data.overview.category);
  if (data.overview?.status) meta.push(data.overview.status);
  if (data.overview?.owner) meta.push(`Owner: ${data.overview.owner}`);
  if (data.overview?.versionDate) meta.push(data.overview.versionDate);

  if (meta.length) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(meta.join("  ·  "), MARGIN, y);
    y += 8;
  }

  // Accent line
  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  const checkNewPage = (neededHeight = 20) => {
    if (y + neededHeight > 280) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const sectionsToShow = SECTION_ORDER.filter(k => SECTIONS[k].free || isPro);

  for (const key of sectionsToShow) {
    const sec = SECTIONS[key];
    const sData = data[key] || {};
    const hasContent = Object.values(sData).some(v =>
      v && (typeof v === "string" ? v.trim() : Array.isArray(v) ? v.some(i => typeof i === "string" ? i.trim() : i?.what?.trim()) : false)
    );
    if (!hasContent && key !== "overview") continue;

    checkNewPage(18);

    // Section heading
    doc.setFillColor(pr, pg, pb);
    doc.setFillColor(...hexToRGB(pc).map(c => Math.min(255, c + 180)));
    doc.rect(MARGIN, y - 3, CONTENT_WIDTH, 8, "F");

    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${sec.num}. ${sec.title}`, MARGIN + 2, y + 2);

    // Accent underline
    doc.setDrawColor(ar, ag, ab);
    doc.setLineWidth(0.8);
    doc.line(MARGIN, y + 5, MARGIN + CONTENT_WIDTH, y + 5);
    y += 12;

    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");

    for (const field of sec.fields) {
      const val = sData[field.key];
      if (!val) continue;

      if (field.type === "steplist" && Array.isArray(val)) {
        const items = val.filter(v => v.trim());
        if (!items.length) continue;
        checkNewPage(items.length * 7 + 4);
        items.forEach((v, i) => {
          doc.setTextColor(ar, ag, ab);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text(`${i + 1}.`, MARGIN + 2, y);
          doc.setTextColor(60, 60, 60);
          doc.setFont("helvetica", "normal");
          y = addWrappedText(doc, v, MARGIN + 8, y, CONTENT_WIDTH - 10, 9);
          y += 1;
        });
        y += 3;
        continue;
      }

      if (field.type === "detailedsteps" && Array.isArray(val)) {
        const steps = val.filter(s => s.what?.trim());
        if (!steps.length) continue;
        for (let i = 0; i < steps.length; i++) {
          const s = steps[i];
          checkNewPage(16);
          doc.setFillColor(pr, pg, pb);
          doc.setFillColor(...hexToRGB(pc).map(c => Math.min(255, c + 200)));
          doc.rect(MARGIN, y - 3, 6, 6, "F");
          doc.setTextColor(pr, pg, pb);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.text(String(i + 1), MARGIN + 1.8, y + 1);

          doc.setTextColor(60, 60, 60);
          doc.setFont("helvetica", "normal");
          y = addWrappedText(doc, s.what, MARGIN + 9, y, CONTENT_WIDTH - 11, 9);
          if (s.tools) {
            doc.setTextColor(120, 120, 120);
            doc.setFontSize(8);
            y = addWrappedText(doc, `Tools: ${s.tools}`, MARGIN + 9, y, CONTENT_WIDTH - 11, 8);
          }
          if (s.time) {
            doc.setTextColor(120, 120, 120);
            doc.setFontSize(8);
            y = addWrappedText(doc, `Time: ${s.time}`, MARGIN + 9, y, CONTENT_WIDTH - 11, 8);
          }
          y += 3;
        }
        y += 2;
        continue;
      }

      if (field.type === "bulletlist" && Array.isArray(val)) {
        const items = val.filter(v => v.trim());
        if (!items.length) continue;
        checkNewPage(items.length * 6 + 8);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text(field.label, MARGIN + 2, y);
        y += 5;
        items.forEach(v => {
          doc.setTextColor(ar, ag, ab);
          doc.setFont("helvetica", "normal");
          doc.text("•", MARGIN + 3, y);
          doc.setTextColor(60, 60, 60);
          y = addWrappedText(doc, v, MARGIN + 8, y, CONTENT_WIDTH - 10, 9);
          y += 1;
        });
        y += 3;
        continue;
      }

      if (typeof val === "string" && val.trim() && key !== "overview") {
        checkNewPage(12);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text(field.label, MARGIN + 2, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        y = addWrappedText(doc, val, MARGIN + 2, y, CONTENT_WIDTH - 4, 9);
        y += 4;
      }
    }

    y += 4;
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(pr, pg, pb);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, 287, PAGE_WIDTH - MARGIN, 287);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    const footerText = biz ? `© ${new Date().getFullYear()} ${biz}` : "Created with Shine Bright SOP Generator";
    doc.text(footerText, MARGIN, 291);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN, 291, { align: "right" });
  }

  const filename = `SOP_${(data.overview?.sopTitle || "document").replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}
