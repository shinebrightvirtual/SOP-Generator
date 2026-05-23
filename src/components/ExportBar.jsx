import { useState } from "react";
import { S, colors, typography, radii, gradients } from "../styles/theme.js";
import { exportToPDF } from "../lib/export-pdf.js";
import { exportToDOCX } from "../lib/export-docx.js";
import { getSectionsForType } from "../lib/sections.js";

async function polishData(data, sectionKeys) {
  try {
    const res = await fetch("/api/polish-sop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, sectionKeys }),
    });
    if (!res.ok) return data;
    const json = await res.json();
    return json.data || data;
  } catch {
    return data;
  }
}

export default function ExportBar({ data, brand, sopType }) {
  const [status, setStatus] = useState(null); // null | "polishing" | "generating"

  const sectionKeys = getSectionsForType(sopType);
  const isPro = sopType === "detailed";

  const handleExport = async (format) => {
    setStatus("polishing");
    const polished = await polishData(data, sectionKeys);

    setStatus("generating");
    try {
      if (format === "pdf") {
        await exportToPDF(polished, brand, isPro);
      } else if (format === "docx") {
        await exportToDOCX(polished, brand, isPro);
      }
    } catch (err) {
      console.error(`Export error (${format}):`, err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setTimeout(() => setStatus(null), 600);
    }
  };

  const busy = status !== null;

  const statusLabel = status === "polishing"
    ? "Polishing your language…"
    : status === "generating"
    ? "Building your document…"
    : null;

  const btnStyle = (primary) => ({
    padding: "10px 22px", borderRadius: radii.lg,
    border: primary ? "none" : `1.5px solid ${colors.primary}`,
    background: primary ? gradients.primary : "transparent",
    color: primary ? colors.white : colors.primary,
    fontSize: typography.sizes.body, fontWeight: typography.weights.semibold,
    cursor: busy ? "default" : "pointer", fontFamily: typography.fontFamily,
    display: "flex", alignItems: "center", gap: "6px",
    opacity: busy ? 0.6 : 1, transition: "opacity 0.2s",
  });

  return (
    <div style={S.exportBar}>
      {statusLabel ? (
        <div style={{ fontSize: typography.sizes.body, color: colors.textSecondary, fontWeight: typography.weights.medium, display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: colors.accent, animation: "pulse 1.2s ease-in-out infinite" }} />
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
          {statusLabel}
        </div>
      ) : (
        <>
          <button style={btnStyle(false)} onClick={() => handleExport("pdf")} disabled={busy}>
            Export PDF
          </button>
          <button style={btnStyle(true)} onClick={() => handleExport("docx")} disabled={busy}>
            Word / Google Docs
          </button>
          <div style={{ fontSize: typography.sizes.caption, color: colors.textFaint, display: "flex", alignItems: "center" }}>
            AI polishes your language before exporting
          </div>
        </>
      )}
    </div>
  );
}
