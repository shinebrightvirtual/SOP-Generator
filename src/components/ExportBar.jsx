import { useState, useRef } from "react";
import { S, colors, typography, radii, gradients } from "../styles/theme.js";
import { exportToPDF } from "../lib/export-pdf.js";
import { exportToDOCX } from "../lib/export-docx.js";
import { getSectionsForType, SECTIONS } from "../lib/sections.js";

// Sections that get converted to prose paragraphs by the AI
const PARAGRAPH_SECTIONS = new Set([
  "whyItMatters", "triggers", "decisions", "doneRight", "aiAutomation", "evolution",
]);

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

export default function ExportBar({ data, brand, setBrand, sopType }) {
  const [status, setStatus] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [pendingFormat, setPendingFormat] = useState(null);
  const [reviewParagraphs, setReviewParagraphs] = useState({});
  const [reviewData, setReviewData] = useState(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const logoRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBrand(b => ({ ...b, logo: ev.target.result, logoName: file.name }));
    reader.readAsDataURL(file);
  };

  const sectionKeys = getSectionsForType(sopType);
  const isPro = sopType === "detailed";

  const handleExportClick = (format) => {
    setPendingFormat(format);
    setShowConfirm(true);
  };

  // Step 1: branding confirmed → run AI polish → open review
  const handleConfirmExport = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address so we can send you a copy.");
      return;
    }
    setEmailError("");
    setShowConfirm(false);
    setStatus("polishing");
    const { data: polished, paragraphs } = await polishData(data, sectionKeys);
    setStatus(null);
    setReviewData(polished);
    setReviewParagraphs(paragraphs);
    setShowReview(true);
  };

  // Step 2: review confirmed → generate file + email it
  const handleDownload = async () => {
    setShowReview(false);
    setStatus("generating");
    try {
      let fileData;
      if (pendingFormat === "pdf") {
        fileData = await exportToPDF(reviewData, brand, isPro, reviewParagraphs);
      } else if (pendingFormat === "docx") {
        fileData = await exportToDOCX(reviewData, brand, isPro, reviewParagraphs);
      }
      // Send email copy in the background — don't block the download
      if (fileData && email.trim()) {
        fetch("/api/send-sop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            sopTitle: data.overview?.sopTitle || "Standard Operating Procedure",
            format: pendingFormat,
            fileData,
          }),
        }).catch(() => {}); // silently ignore email failures
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

  // Sections that have reviewable paragraphs
  const reviewableSections = sectionKeys.filter(k =>
    PARAGRAPH_SECTIONS.has(k) && reviewParagraphs[k]
  );

  return (
    <>
      {/* Step 1: Branding / details confirmation modal */}
      {showConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 500,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }}>
          <div style={{
            background: colors.white, borderRadius: radii.card, padding: "28px 28px 24px",
            maxWidth: "480px", width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: typography.weights.bold, color: colors.primary, fontFamily: typography.fontFamily }}>
              Almost ready — let's finish your document
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: typography.sizes.body, color: colors.textMuted, lineHeight: 1.6, fontFamily: typography.fontFamily }}>
              These details will appear on your exported SOP.
            </p>

            {/* Your details */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: typography.sizes.body2, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Your details
              </div>
              {/* Email — required */}
              <div style={{ marginBottom: "10px" }}>
                <label style={{ ...S.label, marginBottom: "4px" }}>
                  Email address <span style={{ color: colors.accent }}>*</span>
                </label>
                <input
                  style={{ ...S.input, fontSize: typography.sizes.body, borderColor: emailError ? colors.danger : undefined }}
                  placeholder="you@yourbusiness.com"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                />
                {emailError && (
                  <div style={{ fontSize: typography.sizes.caption, color: colors.danger, marginTop: "4px" }}>{emailError}</div>
                )}
                <div style={{ fontSize: typography.sizes.caption, color: colors.textFaint, marginTop: "4px" }}>
                  We'll send a copy of your finished SOP to this address.
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...S.label, marginBottom: "4px" }}>Your name</label>
                  <input
                    style={{ ...S.input, fontSize: typography.sizes.body }}
                    placeholder="e.g., Jess McKnight"
                    value={brand.createdBy || ""}
                    onChange={e => setBrand(b => ({ ...b, createdBy: e.target.value }))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...S.label, marginBottom: "4px" }}>Business name</label>
                  <input
                    style={{ ...S.input, fontSize: typography.sizes.body }}
                    placeholder="e.g., Shine Bright Virtual"
                    value={brand.businessName || ""}
                    onChange={e => setBrand(b => ({ ...b, businessName: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Branding */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: typography.sizes.body2, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Your branding
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ ...S.label, marginBottom: "4px" }}>Logo</label>
                <input type="file" ref={logoRef} accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
                <div
                  onClick={() => logoRef.current?.click()}
                  style={{ border: `1.5px dashed ${colors.borderDashed}`, borderRadius: radii.lg, padding: "12px 16px", cursor: "pointer", background: colors.inputBg, display: "flex", alignItems: "center", gap: "12px" }}
                >
                  {brand.logo ? (
                    <>
                      <img src={brand.logo} alt="Logo" style={{ maxHeight: "36px", maxWidth: "120px", objectFit: "contain" }} />
                      <span style={{ fontSize: typography.sizes.caption, color: colors.textFaint }}>{brand.logoName} — click to change</span>
                    </>
                  ) : (
                    <span style={{ fontSize: typography.sizes.body2, color: colors.textMuted }}>Upload your logo (optional)</span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...S.label, marginBottom: "4px" }}>Primary color</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input type="color" value={brand.primaryColor} onChange={e => setBrand(b => ({ ...b, primaryColor: e.target.value }))} style={{ width: "36px", height: "36px", border: "none", padding: 0, cursor: "pointer", borderRadius: "6px" }} />
                    <input style={{ ...S.input, flex: 1 }} value={brand.primaryColor} onChange={e => setBrand(b => ({ ...b, primaryColor: e.target.value }))} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...S.label, marginBottom: "4px" }}>Accent color</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input type="color" value={brand.accentColor} onChange={e => setBrand(b => ({ ...b, accentColor: e.target.value }))} style={{ width: "36px", height: "36px", border: "none", padding: 0, cursor: "pointer", borderRadius: "6px" }} />
                    <input style={{ ...S.input, flex: 1 }} value={brand.accentColor} onChange={e => setBrand(b => ({ ...b, accentColor: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            {empty.length > 0 && (
              <div style={{ background: "#FFF8F0", border: `1px solid ${colors.borderWarm}`, borderRadius: radii.lg, padding: "12px 14px", marginBottom: "16px" }}>
                <div style={{ fontSize: typography.sizes.body2, fontWeight: typography.weights.semibold, color: colors.accentDark, marginBottom: "4px" }}>
                  These sections are still empty:
                </div>
                {empty.map(k => (
                  <div key={k} style={{ fontSize: typography.sizes.caption, color: colors.textMuted }}>
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
                Go back
              </button>
              <button
                onClick={handleConfirmExport}
                style={{
                  flex: 1, padding: "11px", borderRadius: radii.lg, border: "none",
                  background: gradients.primary, color: colors.white, fontSize: typography.sizes.body,
                  fontWeight: typography.weights.semibold, cursor: "pointer", fontFamily: typography.fontFamily,
                }}
              >
                Polish my SOP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Review & edit polished paragraphs */}
      {showReview && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500,
          display: "flex", alignItems: "stretch", justifyContent: "flex-end",
        }}>
          <div style={{
            background: colors.white, width: "100%", maxWidth: "560px",
            display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
          }}>
            {/* Header */}
            <div style={{ padding: "22px 24px 16px", borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: typography.weights.bold, color: colors.primary, fontFamily: typography.fontFamily }}>
                Review your SOP
              </h3>
              <p style={{ margin: 0, fontSize: typography.sizes.body, color: colors.textMuted, lineHeight: 1.5, fontFamily: typography.fontFamily }}>
                AI has written these sections in paragraph form. Edit anything that doesn't sound right before downloading.
              </p>
            </div>

            {/* Editable sections */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {reviewableSections.length === 0 ? (
                <p style={{ color: colors.textMuted, fontSize: typography.sizes.body }}>
                  Nothing to review — your SOP is ready to download.
                </p>
              ) : (
                reviewableSections.map(key => (
                  <div key={key} style={{ marginBottom: "24px" }}>
                    <div style={{
                      fontSize: typography.sizes.body2, fontWeight: typography.weights.bold,
                      color: colors.primary, textTransform: "uppercase", letterSpacing: "0.7px",
                      marginBottom: "8px", paddingBottom: "5px",
                      borderBottom: `1.5px solid ${colors.accentColor || colors.accent}`,
                    }}>
                      {SECTIONS[key].num}. {SECTIONS[key].title}
                    </div>
                    <textarea
                      value={reviewParagraphs[key] || ""}
                      onChange={e => setReviewParagraphs(p => ({ ...p, [key]: e.target.value }))}
                      rows={5}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "10px 12px", borderRadius: radii.lg,
                        border: `1.5px solid ${colors.border}`,
                        background: colors.inputBg, fontSize: typography.sizes.body,
                        fontFamily: typography.fontFamily, color: colors.textPrimary,
                        lineHeight: 1.6, resize: "vertical", outline: "none",
                      }}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: "16px 24px", borderTop: `1px solid ${colors.border}`,
              display: "flex", gap: "10px", flexShrink: 0,
              background: colors.white,
            }}>
              <button
                onClick={() => { setShowReview(false); setShowConfirm(true); }}
                style={{
                  flex: 1, padding: "11px", borderRadius: radii.lg, border: `1.5px solid ${colors.border}`,
                  background: "transparent", color: colors.textSecondary, fontSize: typography.sizes.body,
                  fontWeight: typography.weights.medium, cursor: "pointer", fontFamily: typography.fontFamily,
                }}
              >
                Back
              </button>
              <button
                onClick={handleDownload}
                style={{
                  flex: 2, padding: "11px", borderRadius: radii.lg, border: "none",
                  background: gradients.primary, color: colors.white, fontSize: typography.sizes.body,
                  fontWeight: typography.weights.semibold, cursor: "pointer", fontFamily: typography.fontFamily,
                }}
              >
                Download {pendingFormat === "pdf" ? "PDF" : "Word doc"}
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
            <button style={btnStyle(true)} onClick={() => handleExportClick("pdf")} disabled={busy}>
              Export PDF
            </button>
            <button style={btnStyle(false)} onClick={() => handleExportClick("docx")} disabled={busy}>
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
