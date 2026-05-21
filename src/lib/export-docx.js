import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
  TableRow,
  TableCell,
  Table,
  WidthType,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} from "docx";
import { saveAs } from "file-saver";
import { SECTIONS, SECTION_ORDER } from "./sections.js";

function hexToDocxColor(hex) {
  return hex.replace("#", "");
}

function buildSectionParagraphs(sec, sData, primaryColor, accentColor) {
  const paras = [];
  const pc = hexToDocxColor(primaryColor);
  const ac = hexToDocxColor(accentColor);

  // Section heading
  paras.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${sec.num}. ${sec.title}`,
          bold: true,
          color: pc,
          size: 24,
        }),
      ],
      border: {
        bottom: { color: ac, space: 1, style: BorderStyle.SINGLE, size: 8 },
      },
      spacing: { before: 280, after: 120 },
    })
  );

  for (const field of sec.fields) {
    const val = sData[field.key];
    if (!val) continue;

    if (field.type === "steplist" && Array.isArray(val)) {
      const items = val.filter(v => v.trim());
      if (!items.length) continue;
      items.forEach((v, i) => {
        paras.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${i + 1}.  `, bold: true, color: ac, size: 20 }),
              new TextRun({ text: v, size: 20 }),
            ],
            spacing: { before: 60, after: 60 },
            indent: { left: 360 },
          })
        );
      });
      continue;
    }

    if (field.type === "detailedsteps" && Array.isArray(val)) {
      val.filter(s => s.what?.trim()).forEach((s, i) => {
        paras.push(
          new Paragraph({
            children: [new TextRun({ text: `Step ${i + 1}`, bold: true, color: pc, size: 20 })],
            spacing: { before: 120, after: 40 },
            indent: { left: 360 },
          })
        );
        paras.push(
          new Paragraph({
            children: [new TextRun({ text: s.what, size: 20 })],
            spacing: { after: 40 },
            indent: { left: 720 },
          })
        );
        if (s.tools) {
          paras.push(
            new Paragraph({
              children: [
                new TextRun({ text: "Tools: ", bold: true, size: 18, color: "888888" }),
                new TextRun({ text: s.tools, size: 18, color: "888888" }),
              ],
              indent: { left: 720 },
              spacing: { after: 20 },
            })
          );
        }
        if (s.time) {
          paras.push(
            new Paragraph({
              children: [
                new TextRun({ text: "Time: ", bold: true, size: 18, color: "888888" }),
                new TextRun({ text: s.time, size: 18, color: "888888" }),
              ],
              indent: { left: 720 },
              spacing: { after: 40 },
            })
          );
        }
      });
      continue;
    }

    if (field.type === "bulletlist" && Array.isArray(val)) {
      const items = val.filter(v => v.trim());
      if (!items.length) continue;
      paras.push(
        new Paragraph({
          children: [new TextRun({ text: field.label, bold: true, size: 18, color: "888888" })],
          spacing: { before: 100, after: 40 },
        })
      );
      items.forEach(v => {
        paras.push(
          new Paragraph({
            children: [
              new TextRun({ text: "•  ", bold: true, color: ac, size: 20 }),
              new TextRun({ text: v, size: 20 }),
            ],
            spacing: { after: 60 },
            indent: { left: 360 },
          })
        );
      });
      continue;
    }

    if (typeof val === "string" && val.trim() && sec.id !== "overview") {
      paras.push(
        new Paragraph({
          children: [new TextRun({ text: field.label, bold: true, size: 18, color: "888888" })],
          spacing: { before: 100, after: 40 },
        })
      );
      paras.push(
        new Paragraph({
          children: [new TextRun({ text: val, size: 20 })],
          spacing: { after: 80 },
        })
      );
    }
  }

  return paras;
}

export async function exportToDOCX(data, brand, isPro) {
  const primaryColor = brand.primaryColor || "#2D3526";
  const accentColor = brand.accentColor || "#C49A3C";
  const biz = brand.businessName || "";
  const title = data.overview?.sopTitle || "Standard Operating Procedure";
  const pc = hexToDocxColor(primaryColor);
  const ac = hexToDocxColor(accentColor);

  const children = [];

  // Title block
  if (biz) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: biz.toUpperCase(), size: 16, bold: true, color: ac })],
        spacing: { after: 60 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, color: pc, size: 36 })],
      spacing: { after: 120 },
    })
  );

  // Meta
  const meta = [];
  if (data.overview?.category) meta.push(data.overview.category);
  if (data.overview?.status) meta.push(data.overview.status);
  if (data.overview?.owner) meta.push(`Owner: ${data.overview.owner}`);
  if (data.overview?.versionDate) meta.push(data.overview.versionDate);

  if (meta.length) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: meta.join("  ·  "), size: 18, color: "888888" })],
        border: {
          bottom: { color: ac, space: 1, style: BorderStyle.SINGLE, size: 6 },
        },
        spacing: { after: 240 },
      })
    );
  }

  // Sections
  const sectionsToShow = SECTION_ORDER.filter(k => SECTIONS[k].basic || isPro);
  for (const key of sectionsToShow) {
    const sec = SECTIONS[key];
    const sData = data[key] || {};
    const hasContent = Object.values(sData).some(v =>
      v && (typeof v === "string" ? v.trim() : Array.isArray(v) ? v.some(i => typeof i === "string" ? i.trim() : i?.what?.trim()) : false)
    );
    if (!hasContent && key !== "overview") continue;

    const sectionParas = buildSectionParagraphs(sec, sData, primaryColor, accentColor);
    children.push(...sectionParas);
  }

  // Footer line
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: biz ? `© ${new Date().getFullYear()} ${biz}` : "Created with Shine Bright SOP Generator",
          size: 16,
          color: "AAAAAA",
        }),
      ],
      border: {
        top: { color: pc, space: 1, style: BorderStyle.SINGLE, size: 4 },
      },
      spacing: { before: 480 },
      alignment: AlignmentType.CENTER,
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `SOP_${(data.overview?.sopTitle || "document").replace(/\s+/g, "_")}.docx`;
  saveAs(blob, filename);
}
