import { useState } from "react";
import { S, colors, typography, radii, gradients } from "../styles/theme.js";
import { exportToPDF } from "../lib/export-pdf.js";
import { exportToDOCX } from "../lib/export-docx.js";
import { getSectionsForType, SECTIONS } from "../lib/sections.js";

async function polishData(data, sectionKeys) {
  try {
    const res = await fetch("/api/polish-sop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, sectionKeys }),
    });
    if (!res.ok) return { data, paragraphs: {} };
    const json = await res.json();
    return { data: json.data || data, paragraphs: json.paragraphs || {} };
  } catch {
    return { data, paragraphs: {} };
  }
}

function filledSections(data, sectionKeys) {
  return sectionKeys.filter(key => {
    const sData = data[key] || {};
    return Object.values(sData).some(v =>
      v && (typeof v === "string" ? v.trim() : typeof v === "boolean" ? v : Array.isArray(v) ? v.some(i => typeof i === "string" ? i.trim() : i?.what?.trim()) : false)
    );
  });
}

export default function ExportBar({ data, brand, sopType }) {
  const [status, setStatus] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingFormat, setPendingFormat] = useState(null);

  const sectionKeys = getSectionsForType(sopType);
  const isPro = sopType === "detailed";

  const handleExportClick = (format) => {
    setPendingFormat(format);
    setShowConfirm(true);
  };

  const handleConfirmExport = async () => {
    setShowConfirm(false);
    setStatus("polishing");
    const { data: polished, paragraphs } = await polishData(data, sectionKeys);
    setStatus("generating");
    try {
      if (pendingFormat === "pdf") {
        await exportToPDF(polished, brand, isPro, paragraphs);
      } else if (pendingFormat === "docx") {
        await exportToDOCX(polished, brand, isPro, paragraphs);
      }
    } catch (err) {
      console.error(`Export error (${pendingFormat}):`, err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setTimeout(() => setStatus(null), 600);
    }
  };

  const busy = status !== null;

  const statusLabel = status === "polishing"
    ? "Polishing your language..."
    : status === "generating"
    ? "Building your document..."
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

  const filled = filledSections(data, sectionKeys);
  const empty = sectionKeys.filter(k => !filled.includes(k));

  return (
    <>
      {/* Confirmation modal */}
      {showConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 500,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }}>
          <div style={{
            background: colors.white, borderRadius: radii.card, padding: "28px 28px 24px",
            maxWidth: "420px", width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: typography.weights.bold, color: colors.primary, fontFamily: typography.fontFamily }}>
              Ready to export?
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: typography.sizes.body, color: colors.textMuted, lineHeight: 1.6, fontFamily: typography.fontFamily }}>
              Take a quick look and make sure everything reads the way you want it.
            </p>

            {empty.length > 0 && (
              <div style={{ background: "#FFF8F0", border: `1px solid ${colors.borderWarm}`, borderRadius: radii.lg, padding: "12px 14px", marginBottom: "16px" }}>
                <div style={{ fontSize: typography.sizes.body2, fontWeight: typography.weights.semibold, color: colors.accentDark, marginBottom: "6px" }}>
                  These sections are still empty:
                </div>
                {empty.map(k => (
                  <div key={k} style={{ fontSize: typography.sizes.body2, color: colors.textMuted }}>
                    {SECTIONS[k].num}. {SECTIONS[k].title}
                  </div>
                ))}
              </div>
            )}

            {filled.length > 0 && (
              <div style={{ background: "#F3FAF4", border: "1px solid #C6F0D0", borderRadius: radii.lg, padding: "12px 14px", marginBottom: "20px" }}>
                <div style={{ fontSize: typography.sizes.body2, fontWeight: typography.weights.semibold, color: "#2A7A3B", marginBottom: "6px" }}>
                  Sections with content:
                </div>
                {filled.map(k => (
                  <div key={k} style={{ fontSize: typography.sizes.body2, color: colors.textMuted }}>
                    {SECTIONS[k].num}. {SECTIONS[k].title}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: "11px", borderRadius: radii.lg, border: `1.5px solid ${colors.border}`,
                  background: "transparent", color: colors.textSecondary, fontSize: typography.sizes.body,
                  fontWeight: typography.weights.medium, cursor: "pointer", fontFamily: typography.fontFamily,
                }}
              >
                Go back and review
              </button>
              <button
                onClick={handleConfirmExport}
                style={{
                  flex: 1, padding: "11px", borderRadius: radii.lg, border: "none",
                  background: gradients.primary, color: colors.white, fontSize: typography.sizes.body,
                  fontWeight: typography.weights.semibold, cursor: "pointer", fontFamily: typography.fontFamily,
                }}
              >
                Looks good, export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export bar */}
      <div style={S.exportBar}>
        {statusLabel ? (
          <div style={{ fontSize: typography.sizes.body, color: colors.textSecondary, fontWeight: typography.weights.medium, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: colors.accent, animation: "pulse 1.2s ease-in-out infinite" }} />
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
            {statusLabel}
          </div>
        ) : (
          <>
            <button style={btnStyle(false)} onClick={() => handleExportClick("pdf")} disabled={busy}>
              Export PDF
            </button>
            <button style={btnStyle(true)} onClick={() => handleExportClick("docx")} disabled={busy}>
              Word / Google Docs
            </button>
            <div style={{ fontSize: typography.sizes.caption, color: colors.textFaint, display: "flex", alignItems: "center" }}>
              AI polishes your language before exporting
            </div>
          </>
        )}
      </div>
    </>
  );
}
