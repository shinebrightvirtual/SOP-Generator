import { useState } from "react";
import { S } from "../styles/theme.js";
import { exportToPDF } from "../lib/export-pdf.js";
import { exportToDOCX } from "../lib/export-docx.js";
import { SECTIONS, SECTION_ORDER } from "../lib/sections.js";

function exportToText(data, brand, isPro) {
  const lines = [];
  const biz = isPro && brand.businessName ? brand.businessName : "";
  if (biz) lines.push(biz);
  lines.push("═".repeat(40));
  lines.push(data.overview?.sopTitle || "Standard Operating Procedure");
  lines.push("═".repeat(40));
  lines.push("");

  SECTION_ORDER.forEach(key => {
    const sec = SECTIONS[key];
    if (!sec.free && !isPro) return;
    const sData = data[key] || {};
    lines.push(`${sec.num}. ${sec.title}`);
    lines.push("─".repeat(30));
    sec.fields.forEach(field => {
      const val = sData[field.key];
      if (!val) return;
      if (typeof val === "string" && val.trim()) {
        lines.push(`${field.label}: ${val}`);
      } else if (Array.isArray(val)) {
        lines.push(`${field.label}:`);
        val.forEach((item, i) => {
          if (typeof item === "string" && item.trim()) lines.push(`  ${i + 1}. ${item}`);
          else if (item?.what?.trim()) {
            lines.push(`  Step ${i + 1}: ${item.what}`);
            if (item.tools) lines.push(`    Tools: ${item.tools}`);
            if (item.time) lines.push(`    Time: ${item.time}`);
          }
        });
      }
    });
    lines.push("");
  });

  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SOP_${(data.overview?.sopTitle || "document").replace(/\s+/g, "_")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportBar({ data, brand, isPro }) {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      if (format === "txt") {
        exportToText(data, brand, isPro);
      } else if (format === "pdf") {
        await exportToPDF(data, brand, isPro);
      } else if (format === "docx") {
        await exportToDOCX(data, brand, isPro);
      }
    } catch (err) {
      console.error(`Export error (${format}):`, err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setTimeout(() => setExporting(null), 800);
    }
  };

  return (
    <div style={S.exportBar}>
      <button style={S.exportBtn(false)} onClick={() => handleExport("txt")} disabled={!!exporting}>
        {exporting === "txt" ? "Exporting..." : "📄 Export Text"}
      </button>
      {isPro && (
        <>
          <button style={S.exportBtn(true)} onClick={() => handleExport("pdf")} disabled={!!exporting}>
            {exporting === "pdf" ? "Generating..." : "📋 Export PDF"}
          </button>
          <button style={S.exportBtn(true)} onClick={() => handleExport("docx")} disabled={!!exporting}>
            {exporting === "docx" ? "Generating..." : "📝 Export DOCX"}
          </button>
        </>
      )}
    </div>
  );
}
