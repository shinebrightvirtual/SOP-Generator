import jsPDF from "jspdf";
import { SECTIONS, SECTION_ORDER } from "./sections.js";

const M = 18;           // margin
const PW = 210;         // page width
const CW = PW - M * 2; // content width
const FOOTER_Y = 289;
const PAGE_BREAK = 276;

function hexToRGB(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function lighten(rgb, amt) {
  return rgb.map(c => Math.min(255, Math.round(c + (255 - c) * amt)));
}

function wrappedHeight(doc, text, maxWidth, fontSize) {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(String(text), maxWidth).length * (fontSize * 0.352778 + 1.4);
}

function addText(doc, text, x, y, maxWidth, fontSize, fontStyle = "normal") {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", fontStyle);
  const lines = doc.splitTextToSize(String(text), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * (fontSize * 0.352778 + 1.4);
}

export async function exportToPDF(data, brand, isPro) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pc = brand.primaryColor || "#2D3526";
  const ac = brand.accentColor || "#C49A3C";
  const biz = brand.businessName || "";
  const title = data.overview?.sopTitle || "Standard Operating Procedure";

  const [pr, pg, pb] = hexToRGB(pc);
  const [ar, ag, ab] = hexToRGB(ac);
  const [lr, lg, lb] = lighten([pr, pg, pb], 0.92);   // very light primary tint
  const [mr, mg, mb] = lighten([pr, pg, pb], 0.75);   // mid tint for section headers

  // ─── COVER HEADER ─────────────────────────────────────────────────────────
  const headerH = biz ? 44 : 38;

  // Background
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, PW, headerH, "F");

  // Subtle dot pattern overlay
  doc.setFillColor(...lighten([pr, pg, pb], 0.15));
  for (let col = M; col < PW - M; col += 12) {
    for (let row = 6; row < headerH - 4; row += 10) {
      doc.circle(col, row, 0.4, "F");
    }
  }

  // Business name
  let hy = 11;
  if (biz) {
    doc.setTextColor(ar, ag, ab);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(biz.toUpperCase(), M, hy);
    hy += 8;
  }

  // SOP Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(title, CW - 10);
  doc.text(titleLines, M, hy);
  hy += titleLines.length * 7.5 + 4;

  // "Standard Operating Procedure" label
  if (hy < headerH - 2) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.setGState(new doc.GState({ opacity: 0.6 }));
    doc.text("Standard Operating Procedure", M, hy);
    doc.setGState(new doc.GState({ opacity: 1 }));
  }

  // Accent bar at bottom of header
  doc.setFillColor(ar, ag, ab);
  doc.rect(0, headerH, PW, 2.5, "F");

  let y = headerH + 10;

  // ─── METADATA BAND ────────────────────────────────────────────────────────
  const metaItems = [
    data.overview?.category && { label: "Category", val: data.overview.category },
    data.overview?.owner && { label: "Owner", val: data.overview.owner },
    data.overview?.executor && { label: "Executor", val: data.overview.executor },
    data.overview?.frequency && { label: "Frequency", val: data.overview.frequency },
    data.overview?.status && { label: "Status", val: data.overview.status },
    data.overview?.versionDate && { label: "Version", val: data.overview.versionDate },
  ].filter(Boolean);

  if (metaItems.length) {
    // Light background band
    doc.setFillColor(lr, lg, lb);
    doc.roundedRect(M, y - 3, CW, metaItems.length > 3 ? 18 : 11, 2, 2, "F");

    const colW = CW / Math.min(3, metaItems.length);
    metaItems.forEach((item, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const mx = M + col * colW + 4;
      const my = y + row * 8 + 1;

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(ar, ag, ab);
      doc.text(item.label.toUpperCase(), mx, my);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(pr, pg, pb);
      doc.text(item.val, mx, my + 4);
    });

    y += metaItems.length > 3 ? 24 : 18;
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  const addFooters = () => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(mr, mg, mb);
      doc.setLineWidth(0.3);
      doc.line(M, FOOTER_Y, PW - M, FOOTER_Y);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(160, 160, 155);
      const left = biz ? `© ${new Date().getFullYear()} ${biz}` : "Shine Bright SOP Generator";
      doc.text(left, M, FOOTER_Y + 4);
      doc.text(`${i} / ${pageCount}`, PW - M, FOOTER_Y + 4, { align: "right" });
    }
  };

  const checkPage = (needed = 20) => {
    if (y + needed > PAGE_BREAK) {
      doc.addPage();
      y = M;
    }
  };

  // ─── SECTIONS ─────────────────────────────────────────────────────────────
  const sectionsToShow = SECTION_ORDER.filter(k => SECTIONS[k].basic || isPro);

  for (const key of sectionsToShow) {
    const sec = SECTIONS[key];
    const sData = data[key] || {};
    const hasContent = Object.values(sData).some(v =>
      v && (typeof v === "string" ? v.trim() : Array.isArray(v) ? v.some(i => (typeof i === "string" ? i.trim() : i?.what?.trim())) : false)
    );
    if (!hasContent && key !== "overview") continue;

    checkPage(22);

    // Section header row
    doc.setFillColor(mr, mg, mb);
    doc.setFillColor(lr, lg, lb);
    doc.rect(M, y - 4, CW, 12, "F");

    // Number circle
    doc.setFillColor(pr, pg, pb);
    doc.circle(M + 5, y + 2, 4.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(String(sec.num), M + 5, y + 4, { align: "center" });

    // Section title
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(sec.title, M + 13, y + 4);

    // Left accent bar
    doc.setFillColor(ar, ag, ab);
    doc.rect(M, y - 4, 2, 12, "F");

    y += 12;

    // ── Overview: special 2-col grid layout ───────────────────────────────
    if (key === "overview") {
      const gridItems = [
        { label: "Category", val: sData.category },
        { label: "Owner", val: sData.owner },
        { label: "Executor", val: sData.executor },
        { label: "Frequency", val: sData.frequency },
        { label: "Status", val: sData.status },
        { label: "Version Date", val: sData.versionDate },
      ].filter(i => i.val);

      if (gridItems.length) {
        checkPage(gridItems.length * 5 + 4);
        const gcW = CW / 2 - 2;
        gridItems.forEach((item, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const gx = M + col * (gcW + 4);
          const gy = y + row * 9;

          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(ar, ag, ab);
          doc.text(item.label.toUpperCase(), gx, gy);

          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(50, 50, 50);
          doc.text(String(item.val), gx, gy + 4.5);
        });
        y += Math.ceil(gridItems.length / 2) * 9 + 4;
      }
      y += 4;
      continue;
    }

    // ── Standard fields ───────────────────────────────────────────────────
    for (const field of sec.fields) {
      const val = sData[field.key];
      if (!val) continue;

      if (field.type === "steplist" && Array.isArray(val)) {
        const items = val.filter(v => typeof v === "string" && v.trim());
        if (!items.length) continue;
        checkPage(items.length * 8 + 4);
        items.forEach((v, i) => {
          checkPage(10);
          // Number badge
          doc.setFillColor(ar, ag, ab);
          doc.circle(M + 3.5, y + 0.5, 3, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(6.5);
          doc.setFont("helvetica", "bold");
          doc.text(String(i + 1), M + 3.5, y + 2, { align: "center" });

          doc.setTextColor(50, 50, 50);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          y = addText(doc, v, M + 10, y + 1, CW - 12, 9);
          y += 2;
        });
        y += 3;
        continue;
      }

      if (field.type === "detailedsteps" && Array.isArray(val)) {
        const steps = val.filter(s => s.what?.trim());
        if (!steps.length) continue;
        for (let i = 0; i < steps.length; i++) {
          const s = steps[i];
          const needed = wrappedHeight(doc, s.what, CW - 16, 9) + (s.tools ? 5 : 0) + (s.time ? 5 : 0) + 8;
          checkPage(needed);

          // Step row background
          doc.setFillColor(lr, lg, lb);
          doc.roundedRect(M, y - 2, CW, needed, 2, 2, "F");

          // Step number circle
          doc.setFillColor(pr, pg, pb);
          doc.circle(M + 5, y + 4, 4, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.text(String(i + 1), M + 5, y + 6, { align: "center" });

          // Step content
          doc.setTextColor(40, 40, 40);
          y = addText(doc, s.what, M + 13, y + 2, CW - 16, 9);

          if (s.tools) {
            doc.setTextColor(100, 95, 85);
            doc.setFontSize(7.5);
            doc.setFont("helvetica", "italic");
            const lines = doc.splitTextToSize(`Tools: ${s.tools}`, CW - 16);
            doc.text(lines, M + 13, y + 1);
            y += lines.length * 3.5 + 1;
          }
          if (s.time) {
            doc.setTextColor(100, 95, 85);
            doc.setFontSize(7.5);
            doc.setFont("helvetica", "italic");
            doc.text(`⏱ ${s.time}`, M + 13, y + 1);
            y += 4;
          }
          y += 4;
        }
        y += 2;
        continue;
      }

      if (field.type === "bulletlist" && Array.isArray(val)) {
        const items = val.filter(v => typeof v === "string" && v.trim());
        if (!items.length) continue;
        checkPage(items.length * 7 + 10);

        // Sub-label
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(120, 115, 105);
        doc.text(field.label.toUpperCase(), M + 2, y);
        y += 5;

        items.forEach(v => {
          checkPage(8);
          doc.setFillColor(ar, ag, ab);
          doc.circle(M + 3, y - 0.5, 1.5, "F");
          doc.setTextColor(50, 50, 50);
          y = addText(doc, v, M + 8, y, CW - 10, 9);
          y += 1.5;
        });
        y += 4;
        continue;
      }

      if (typeof val === "string" && val.trim()) {
        const needed = wrappedHeight(doc, val, CW - 4, 9) + 10;
        checkPage(needed);

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(120, 115, 105);
        doc.text(field.label.toUpperCase(), M + 2, y);
        y += 5;

        doc.setTextColor(50, 50, 50);
        y = addText(doc, val, M + 2, y, CW - 4, 9);
        y += 5;
      }
    }

    y += 6;
  }

  // ─── FOOTERS ──────────────────────────────────────────────────────────────
  addFooters();

  const filename = `SOP_${(title).replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
}
