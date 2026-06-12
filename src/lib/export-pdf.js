import jsPDF from "jspdf";
import { SECTIONS, SECTION_ORDER } from "./sections.js";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ML = 20;           // left margin
const MR = 20;           // right margin
const PW = 210;          // page width (A4)
const PH = 297;          // page height (A4)
const CW = PW - ML - MR; // content width = 170mm
const HEADER_Y = 13;     // running header rule y
const CONTENT_START = 20; // content start y (after running header)
const FOOTER_Y = 285;    // footer y
const PAGE_BREAK = 277;  // page break threshold

// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────
function hexToRGB(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

// ─── LINE HEIGHT HELPER ───────────────────────────────────────────────────────
// jsPDF uses pt for fontSize; 1pt = 0.352778mm
function lineH(fontSize, leading = 1.5) {
  return fontSize * 0.352778 * leading;
}

// ─── WRAPPED TEXT HEIGHT ──────────────────────────────────────────────────────
function wrappedHeight(doc, text, maxWidth, fontSize, leading = 1.5) {
  if (!text) return 0;
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(String(text), maxWidth);
  return lines.length * lineH(fontSize, leading);
}

// ─── ADD TEXT (returns new y after text) ──────────────────────────────────────
function addText(doc, text, x, y, maxWidth, fontSize, fontStyle = "normal", leading = 1.5) {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", fontStyle);
  const lines = doc.splitTextToSize(String(text), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineH(fontSize, leading);
}

// ─── FORMAT DATE ──────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "";
  // Handle ISO date strings like "2024-03-15" or full date strings
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// ─── COLLECT TOOLS FROM STEPS ─────────────────────────────────────────────────
function collectTools(data) {
  const toolMap = new Map(); // toolName (lowercase) -> { display, phases: Set<string> }
  const phases = data.bigPicture?.flowSteps || [];

  const steps = data.detailedSteps?.steps || [];
  steps.forEach((step, idx) => {
    if (!step?.tools) return;
    const phaseName = phases[idx] ? String(phases[idx]).trim() : null;
    step.tools.split(",").forEach(raw => {
      const name = raw.trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!toolMap.has(key)) {
        toolMap.set(key, { display: name, phases: new Set() });
      }
      if (phaseName) toolMap.get(key).phases.add(phaseName);
    });
  });

  // Also include connectedTools from aiAutomation
  const connected = data.aiAutomation?.connectedTools || "";
  if (connected) {
    connected.split(",").forEach(raw => {
      const name = raw.trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!toolMap.has(key)) {
        toolMap.set(key, { display: name, phases: new Set() });
      }
    });
  }

  return toolMap;
}

// ─── TITLE CASE ───────────────────────────────────────────────────────────────
const MINOR = new Set(["a","an","the","and","but","or","for","nor","on","at","to","by","in","of","up","as","with"]);
function toTitleCase(str) {
  return String(str).split(" ").map((w, i) =>
    (i === 0 || !MINOR.has(w.toLowerCase()))
      ? w.charAt(0).toUpperCase() + w.slice(1)
      : w.toLowerCase()
  ).join(" ");
}

// ─── SPLIT INTO SHORT PARAGRAPHS (2 sentences each) ─────────────────────────
function splitParagraphs(text) {
  const sentences = String(text).match(/[^.!?]+[.!?]+["']?\s*/g) || [text];
  const chunks = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences.slice(i, i + 2).join("").trim();
    if (chunk) chunks.push(chunk);
  }
  return chunks.length ? chunks : [text];
}

// ─── IMAGE DIMENSIONS ─────────────────────────────────────────────────────────
function getImageDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export async function exportToPDF(data, brand, isPro, paragraphs = {}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Brand values
  const pc  = brand.primaryColor || "#1B3A4B";
  const ac  = brand.accentColor  || "#E8985E";
  const biz = brand.businessName || "";
  const createdBy = brand.createdBy || biz || "";
  const title = data.overview?.sopTitle || "Standard Operating Procedure";
  const versionDate = data.overview?.versionDate
    ? formatDate(data.overview.versionDate)
    : formatDate(new Date().toISOString().slice(0, 10));

  const [pr, pg, pb] = hexToRGB(pc);
  const [ar, ag, ab] = hexToRGB(ac);

  // ─── PAGE HELPERS ───────────────────────────────────────────────────────────

  let currentPage = 1;

  // Draw running header on the current page
  function drawRunningHeader() {
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.25);
    // Rule at y=13
    doc.line(ML, HEADER_Y, PW - MR, HEADER_Y);
    // Left label
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text("STANDARD OPERATING PROCEDURE", ML, HEADER_Y - 2);
    // Right: SOP title (truncate if too long)
    const maxTitleW = CW * 0.45;
    const titleStr = doc.splitTextToSize(title, maxTitleW)[0]; // first line only
    doc.text(titleStr, PW - MR, HEADER_Y - 2, { align: "right" });
  }

  // Draw footer on the current page (page number placeholder — filled in addFooters)
  function drawFooter(pageNum, pageCount) {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.25);
    doc.line(ML, FOOTER_Y - 2, PW - MR, FOOTER_Y - 2);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text(`${pageNum}${pageCount ? " / " + pageCount : ""}`, PW - MR, FOOTER_Y + 3, { align: "right" });
  }

  // Add footers to all pages (called at end, when we know page count)
  function addFooters() {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      drawFooter(i, pageCount);
    }
  }

  let y = CONTENT_START;

  // Check if we need a page break; if so, add page and reset y
  function checkPage(needed = 15) {
    if (y + needed > PAGE_BREAK) {
      doc.addPage();
      currentPage++;
      drawRunningHeader();
      y = CONTENT_START;
    }
  }

  // ─── PAGE 1: draw running header ────────────────────────────────────────────
  drawRunningHeader();

  // ─── LOGO (top-left before title, if provided) ──────────────────────────────
  if (brand.logo) {
    try {
      const dims = await getImageDimensions(brand.logo);
      if (dims && dims.w && dims.h) {
        const maxH = 18, maxW = 50;
        const ratio = dims.w / dims.h;
        let lh = maxH, lw = lh * ratio;
        if (lw > maxW) { lw = maxW; lh = lw / ratio; }
        doc.addImage(brand.logo, "AUTO", ML + (CW - lw) / 2, y, lw, lh);
        y += lh + 6;
      }
    } catch {}
  }

  // ─── TITLE BLOCK (centered) ─────────────────────────────────────────────────
  // SOP title — bold ~20pt, centered
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 51, 51);
  const titleLines = doc.splitTextToSize(title, CW);
  const titleLineH = lineH(20, 1.3);
  titleLines.forEach((line, i) => {
    doc.text(line, ML + CW / 2, y + i * titleLineH, { align: "center" });
  });
  y += titleLines.length * titleLineH + 3;

  // Metadata line — italic grey 9pt
  const metaParts = [];
  if (createdBy) metaParts.push(`Created by: ${createdBy}`);
  metaParts.push(`Created on: ${versionDate}`);
  const metaLine = metaParts.join("     ");
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(153, 153, 153);
  doc.text(metaLine, ML + CW / 2, y, { align: "center" });
  y += lineH(9, 1.4) + 6;

  // Thin horizontal rule separator
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);
  y += 10;

  // ─── SECTION HEADING HELPER ─────────────────────────────────────────────────
  function drawSectionHeading(text) {
    checkPage(16);
    // Title: ALL CAPS BOLD ~10.5pt, brand primary color
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(pr, pg, pb);
    doc.text(text.toUpperCase(), ML, y);
    y += lineH(10.5, 1.2) + 1;
    // Thin rule below (accent color)
    doc.setDrawColor(ar, ag, ab);
    doc.setLineWidth(0.5);
    doc.line(ML, y, PW - MR, y);
    y += 4; // 4mm gap before content
  }

  // ─── PARAGRAPH HELPER (splits into ~2-sentence chunks for readability) ───────
  function drawParagraph(text, color = [51, 51, 51]) {
    if (!text || !String(text).trim()) return;
    const chunks = splitParagraphs(text);
    doc.setTextColor(...color);
    chunks.forEach((chunk, i) => {
      const needed = wrappedHeight(doc, chunk, CW, 9) + 2;
      checkPage(needed);
      y = addText(doc, chunk, ML, y, CW, 9, "normal", 1.5);
      if (i < chunks.length - 1) y += 3; // gap between mini-paragraphs
    });
  }

  // ─── BULLET LIST HELPER ─────────────────────────────────────────────────────
  function drawBulletList(items) {
    const clean = (items || []).filter(v => typeof v === "string" && v.trim());
    if (!clean.length) return;
    clean.forEach(item => {
      const needed = wrappedHeight(doc, item, CW - 6, 9) + 2;
      checkPage(needed);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 51, 51);
      // Bullet character
      doc.text("•", ML, y);
      const newY = addText(doc, item, ML + 5, y, CW - 6, 9, "normal", 1.5);
      y = newY;
      y += 1.5;
    });
  }

  // ─── SECTIONS TO RENDER ─────────────────────────────────────────────────────
  const sectionsToShow = SECTION_ORDER.filter(k => SECTIONS[k].basic || isPro);

  // We'll inject a synthetic TOOLS section between "triggers" and "bigPicture"
  // but only if there are tools. Build the ordered list with "tools" injected.
  const toolMap = collectTools(data);
  const hasTools = toolMap.size > 0;

  // Decide section order for rendering (insert synthetic "tools" after "triggers")
  const renderOrder = [];
  for (const key of sectionsToShow) {
    renderOrder.push(key);
    if (key === "triggers" && hasTools) {
      renderOrder.push("__tools__");
    }
  }

  for (const key of renderOrder) {

    // ── SYNTHETIC TOOLS SECTION ───────────────────────────────────────────────
    if (key === "__tools__") {
      checkPage(20);
      y += 10; // section gap
      drawSectionHeading("Tools");

      toolMap.forEach(({ display }) => {
        checkPage(8);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(ar, ag, ab);
        doc.text("•", ML, y);
        doc.setTextColor(51, 51, 51);
        y = addText(doc, toTitleCase(display), ML + 5, y, CW - 5, 9, "normal", 1.5);
        y += 1.5;
      });
      continue;
    }

    // ── STANDARD SECTIONS ─────────────────────────────────────────────────────
    const sec = SECTIONS[key];
    const sData = data[key] || {};

    // Check if section has any content
    const hasContent = Object.values(sData).some(v => {
      if (!v) return false;
      if (typeof v === "string") return v.trim().length > 0;
      if (Array.isArray(v)) return v.some(i =>
        typeof i === "string" ? i.trim() : (i?.what?.trim() || false)
      );
      return false;
    });
    if (!hasContent && key !== "overview") continue;

    // bigPicture is merged into detailedSteps as PART headers — skip entirely if detailed steps exist
    if (key === "bigPicture" && (data.detailedSteps?.steps || []).some(s => s?.what?.trim())) continue;

    // Section gap
    y += 10;
    checkPage(20);

    drawSectionHeading(sec.title);

    // ── OVERVIEW: clean metadata layout ───────────────────────────────────────
    if (key === "overview") {
      const metaFields = [
        { label: "Category",  val: sData.category },
        { label: "Owner",     val: sData.owner },
        { label: "Executor",  val: sData.executor },
        { label: "Frequency", val: sData.frequency },
        { label: "Status",    val: sData.status },
      ].filter(f => f.val);

      metaFields.forEach(f => {
        checkPage(8);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text(`${f.label}: `, ML, y);
        const labelW = doc.getTextWidth(`${f.label}: `);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 51, 51);
        doc.text(String(f.val), ML + labelW, y);
        y += lineH(9, 1.5) + 1;
      });
      continue;
    }

    // ── PROCESS SECTION (detailedSteps + bigPicture) ─────────────────────────
    if (key === "detailedSteps") {
      const steps = sData.steps || [];
      const phases = data.bigPicture?.flowSteps || [];

      if (steps.length > 0) {
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          if (!step?.what?.trim()) continue;

          // PART header — prefer phase from the step itself, fall back to bigPicture flowSteps
          const phaseLabel = step.phase?.trim() || (phases[i] ? String(phases[i]).trim() : null);
          if (phaseLabel) {
            const partLabel = `PART ${i + 1} — ${phaseLabel}`;
            const partLines = doc.splitTextToSize(partLabel, CW);
            checkPage(partLines.length * lineH(10, 1.4) + 4);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(51, 51, 51);
            doc.text(partLines, ML, y);
            y += partLines.length * lineH(10, 1.4) + 2;
          } else {
            // Plain step number
            checkPage(10);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(100, 100, 100);
            doc.text(`Step ${i + 1}`, ML, y);
            y += lineH(9, 1.4) + 1;
          }

          // Step description as paragraph
          const needed = wrappedHeight(doc, step.what, CW, 9) + 2;
          checkPage(needed);
          doc.setTextColor(51, 51, 51);
          y = addText(doc, step.what, ML, y, CW, 9, "normal", 1.5);

          // Tools + Time italic grey line
          const toolStr = step.tools ? `Tools: ${step.tools.split(",").map(t => toTitleCase(t.trim())).join(", ")}` : "";
          const timeStr = step.time  ? `Time: ${step.time}`   : "";
          const metaStr = [toolStr, timeStr].filter(Boolean).join(" · ");
          if (metaStr) {
            y += 2;
            checkPage(8);
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(153, 153, 153);
            const mLines = doc.splitTextToSize(metaStr, CW);
            doc.text(mLines, ML, y);
            y += mLines.length * lineH(8.5, 1.4);
          }

          y += 5; // paragraph gap
        }
      }
      continue;
    }

    // ── BIG PICTURE: standalone numbered list (only reaches here when no detailed steps) ──
    if (key === "bigPicture") {
      const flowSteps = sData.flowSteps || [];
      const clean = flowSteps.filter(v => typeof v === "string" && v.trim());
      if (!clean.length) continue;

      clean.forEach((step, i) => {
        const needed = wrappedHeight(doc, step, CW - 6, 9) + 2;
        checkPage(needed);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text(`${i + 1}.`, ML, y);
        const numW = doc.getTextWidth(`${i + 1}.`);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 51, 51);
        y = addText(doc, step, ML + numW + 2, y, CW - numW - 2, 9, "normal", 1.5);
        y += 3;
      });
      continue;
    }

    // ── STANDARD FIELDS (all remaining sections) ──────────────────────────────
    // Use AI-generated paragraph if available, otherwise fall back to individual fields
    if (paragraphs[key]) {
      drawParagraph(paragraphs[key]);
      // Still render bullet lists (checklists) below the paragraph
      for (const field of sec.fields) {
        if (field.type !== "bulletlist") continue;
        const val = sData[field.key];
        const items = Array.isArray(val) ? val.filter(v => typeof v === "string" && v.trim()) : [];
        if (!items.length) continue;
        y += 4;
        drawBulletList(items);
      }
    } else {
      let firstField = true;
      for (const field of sec.fields) {
        const val = sData[field.key];
        if (!val) continue;

        if (field.type === "bulletlist") {
          const items = Array.isArray(val) ? val.filter(v => typeof v === "string" && v.trim()) : [];
          if (!items.length) continue;
          if (!firstField) y += 4;
          drawBulletList(items);
          firstField = false;
          continue;
        }

        if (typeof val === "string" && val.trim()) {
          if (!firstField) y += 4;
          drawParagraph(val);
          firstField = false;
          continue;
        }
      }
    }
  }

  // ─── FOOTERS (all pages) ────────────────────────────────────────────────────
  addFooters();

  // ─── SAVE ────────────────────────────────────────────────────────────────────
  const safeName = title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_");
  doc.save(`SOP_${safeName}.pdf`);
  return doc.output("datauristring").split(",")[1]; // base64 for email
}
