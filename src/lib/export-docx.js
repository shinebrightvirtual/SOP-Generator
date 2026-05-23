import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  ImageRun,
} from "docx";
import { saveAs } from "file-saver";
import { SECTIONS, SECTION_ORDER } from "./sections.js";

function hex(h) { return h.replace("#", ""); }

function rule(color) {
  return { bottom: { color, space: 1, style: BorderStyle.SINGLE, size: 6 } };
}

function sp(before = 0, after = 0) {
  return { before, after };
}

export async function exportToDOCX(data, brand, isPro, paragraphs = {}) {
  const pc = brand.primaryColor || "#1B3A4B";
  const ac = brand.accentColor  || "#E8985E";
  const biz = brand.businessName || "";
  const createdBy = brand.createdBy || biz || "";
  const title = data.overview?.sopTitle || "Standard Operating Procedure";
  const versionDate = data.overview?.versionDate
    ? new Date(data.overview.versionDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const pHex = hex(pc);
  const aHex = hex(ac);

  // ── Running header ─────────────────────────────────────────────────────────
  const pageHeader = new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: "STANDARD OPERATING PROCEDURE", size: 14, color: "999999" }),
          new TextRun({ text: "   —   ", size: 14, color: "CCCCCC" }),
          new TextRun({ text: title, size: 14, color: "999999" }),
        ],
        border: rule("CCCCCC"),
        spacing: sp(0, 60),
      }),
    ],
  });

  // ── Running footer ─────────────────────────────────────────────────────────
  const pageFooter = new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ children: [PageNumber.CURRENT], size: 14, color: "999999" }),
          new TextRun({ text: " / ", size: 14, color: "999999" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: "999999" }),
        ],
        alignment: AlignmentType.RIGHT,
        border: { top: { color: "CCCCCC", space: 1, style: BorderStyle.SINGLE, size: 4 } },
        spacing: sp(60, 0),
      }),
    ],
  });

  const children = [];

  // ── Logo (if provided) ─────────────────────────────────────────────────────
  if (brand.logo) {
    try {
      const base64 = brand.logo.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      // Derive pixel dimensions from a temporary Image element
      const dims = await new Promise((res) => {
        const img = new Image();
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => res(null);
        img.src = brand.logo;
      });
      if (dims) {
        const maxH = 60, maxW = 160; // pixels (72dpi-ish for doc)
        const ratio = dims.w / dims.h;
        let lh = maxH, lw = lh * ratio;
        if (lw > maxW) { lw = maxW; lh = lw / ratio; }
        children.push(
          new Paragraph({
            children: [new ImageRun({ data: bytes, transformation: { width: Math.round(lw), height: Math.round(lh) } })],
            alignment: AlignmentType.CENTER,
            spacing: sp(0, 160),
          })
        );
      }
    } catch {}
  }

  // ── Title block ────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 48, color: "333333" })],
      alignment: AlignmentType.CENTER,
      spacing: sp(480, 160),
    })
  );

  const metaParts = [];
  if (createdBy) metaParts.push(`Created by: ${createdBy}`);
  metaParts.push(`Created on: ${versionDate}`);

  children.push(
    new Paragraph({
      children: [new TextRun({ text: metaParts.join("     "), italics: true, size: 18, color: "999999" })],
      alignment: AlignmentType.CENTER,
      spacing: sp(0, 240),
      border: rule("D2D2D2"),
    })
  );

  // Spacer after title block
  children.push(new Paragraph({ children: [], spacing: sp(0, 240) }));

  // ── Section helper ─────────────────────────────────────────────────────────
  function sectionHeading(text) {
    return new Paragraph({
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: pHex })],
      border: rule(aHex),
      spacing: sp(400, 160),
    });
  }

  function bodyParagraph(text) {
    return new Paragraph({
      children: [new TextRun({ text: String(text), size: 20, color: "333333" })],
      spacing: sp(0, 200),
    });
  }

  function bulletItem(text) {
    return new Paragraph({
      children: [
        new TextRun({ text: "•  ", bold: true, color: aHex, size: 20 }),
        new TextRun({ text: String(text), size: 20, color: "333333" }),
      ],
      spacing: sp(0, 120),
      indent: { left: 360 },
    });
  }

  function metaLine(label, value) {
    return new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true, size: 20, color: "666666" }),
        new TextRun({ text: String(value), size: 20, color: "333333" }),
      ],
      spacing: sp(0, 100),
    });
  }

  // ── Sections to render ─────────────────────────────────────────────────────
  const sectionsToShow = SECTION_ORDER.filter(k => SECTIONS[k].basic || isPro);

  // Inject tools section after triggers if tools exist
  const toolMap = buildToolMap(data);
  const renderOrder = [];
  for (const key of sectionsToShow) {
    renderOrder.push(key);
    if (key === "triggers" && toolMap.size > 0) renderOrder.push("__tools__");
  }

  for (const key of renderOrder) {

    // ── Synthetic tools section ──────────────────────────────────────────────
    if (key === "__tools__") {
      children.push(sectionHeading("Tools"));
      toolMap.forEach(({ display }) => {
        children.push(bulletItem(display));
      });
      continue;
    }

    const sec = SECTIONS[key];
    const sData = data[key] || {};
    const hasContent = Object.values(sData).some(v =>
      v && (typeof v === "string" ? v.trim() : typeof v === "boolean" ? false : Array.isArray(v) ? v.some(i => typeof i === "string" ? i.trim() : i?.what?.trim()) : false)
    );
    if (!hasContent && key !== "overview") continue;

    children.push(sectionHeading(sec.title));

    // ── Overview: metadata ───────────────────────────────────────────────────
    if (key === "overview") {
      if (sData.category)  children.push(metaLine("Category", sData.category));
      if (sData.owner)     children.push(metaLine("Owner", sData.owner));
      if (sData.executor)  children.push(metaLine("Executor", sData.executor));
      if (sData.frequency) children.push(metaLine("Frequency", sData.frequency));
      continue;
    }

    // ── Process (detailedSteps + bigPicture phases) ──────────────────────────
    if (key === "detailedSteps") {
      const steps = sData.steps || [];
      const phases = data.bigPicture?.flowSteps || [];
      steps.forEach((step, i) => {
        if (!step?.what?.trim()) return;
        if (phases[i]) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `PART ${i + 1} — ${String(phases[i]).trim()}`, bold: true, size: 22, color: "333333" })],
              spacing: sp(280, 100),
            })
          );
        }
        children.push(bodyParagraph(step.what));
        const metaParts = [
          step.tools ? `Tools: ${step.tools}` : "",
          step.time  ? `Time: ${step.time}`   : "",
        ].filter(Boolean).join(" · ");
        if (metaParts) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: metaParts, italics: true, size: 18, color: "999999" })],
              spacing: sp(0, 200),
            })
          );
        }
      });
      continue;
    }

    // ── BigPicture standalone (no detailed steps) ────────────────────────────
    if (key === "bigPicture") {
      const hasDetailedSteps = (data.detailedSteps?.steps || []).some(s => s?.what?.trim());
      if (hasDetailedSteps) continue;
      const flowSteps = (sData.flowSteps || []).filter(v => typeof v === "string" && v.trim());
      flowSteps.forEach((step, i) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${i + 1}.  `, bold: true, color: aHex, size: 20 }),
              new TextRun({ text: step, size: 20, color: "333333" }),
            ],
            spacing: sp(0, 100),
            indent: { left: 360 },
          })
        );
      });
      continue;
    }

    // ── Standard sections: use AI paragraph or fall back to fields ───────────
    if (paragraphs[key]) {
      children.push(bodyParagraph(paragraphs[key]));
      // Still render any bullet lists
      for (const field of sec.fields) {
        if (field.type !== "bulletlist") continue;
        const val = sData[field.key];
        const items = Array.isArray(val) ? val.filter(v => typeof v === "string" && v.trim()) : [];
        items.forEach(item => children.push(bulletItem(item)));
      }
    } else {
      for (const field of sec.fields) {
        const val = sData[field.key];
        if (!val) continue;
        if (field.type === "bulletlist") {
          const items = Array.isArray(val) ? val.filter(v => typeof v === "string" && v.trim()) : [];
          items.forEach(item => children.push(bulletItem(item)));
          continue;
        }
        if (typeof val === "string" && val.trim()) {
          children.push(bodyParagraph(val));
        }
      }
    }
  }

  // ── Build document ─────────────────────────────────────────────────────────
  const doc = new Document({
    sections: [{
      headers: { default: pageHeader },
      footers: { default: pageFooter },
      properties: {
        page: { margin: { top: 1200, right: 1440, bottom: 1200, left: 1440 } },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const safeName = title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_");
  saveAs(blob, `SOP_${safeName}.docx`);
  const base64 = await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
  return base64; // base64 for email
}

function buildToolMap(data) {
  const toolMap = new Map();
  const phases = data.bigPicture?.flowSteps || [];
  (data.detailedSteps?.steps || []).forEach((step, idx) => {
    if (!step?.tools) return;
    const phaseName = phases[idx] ? String(phases[idx]).trim() : null;
    step.tools.split(",").forEach(raw => {
      const name = raw.trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!toolMap.has(key)) toolMap.set(key, { display: name, phases: new Set() });
      if (phaseName) toolMap.get(key).phases.add(phaseName);
    });
  });
  const connected = data.aiAutomation?.connectedTools || "";
  if (connected) {
    connected.split(",").forEach(raw => {
      const name = raw.trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!toolMap.has(key)) toolMap.set(key, { display: name, phases: new Set() });
    });
  }
  return toolMap;
}
