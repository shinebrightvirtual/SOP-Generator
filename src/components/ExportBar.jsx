import { useState } from "react";
import { S, colors, typography, radii, gradients } from "../styles/theme.js";
import { exportToPDF } from "../lib/export-pdf.js";
import { exportToDOCX } from "../lib/export-docx.js";

export default function ExportBar({ data, brand, sopType }) {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const isPro = sopType === "detailed";
      if (format === "pdf") {
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

  const btnStyle = (primary) => ({
    padding: "10px 22px", borderRadius: radii.lg,
    border: primary ? "none" : `1.5px solid ${colors.primary}`,
    background: primary ? gradients.primary : "transparent",
    color: primary ? colors.white : colors.primary,
    fontSize: typography.sizes.body, fontWeight: typography.weights.semibold,
    cursor: exporting ? "default" : "pointer", fontFamily: typography.fontFamily,
    display: "flex", alignItems: "center", gap: "6px",
    opacity: exporting ? 0.7 : 1, transition: "opacity 0.2s",
  });

  return (
    <div style={S.exportBar}>
      <button style={btnStyle(false)} onClick={() => handleExport("pdf")} disabled={!!exporting}>
        {exporting === "pdf" ? "Generating…" : "📋 Export PDF"}
      </button>
      <button style={btnStyle(true)} onClick={() => handleExport("docx")} disabled={!!exporting}>
        {exporting === "docx" ? "Generating…" : "📝 Word / Google Docs"}
      </button>
      <div style={{ fontSize: typography.sizes.caption, color: colors.textFaint, display: "flex", alignItems: "center" }}>
        Word file opens in Google Docs too
      </div>
    </div>
  );
}
