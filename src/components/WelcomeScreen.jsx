import { useState, useRef } from "react";
import { colors, typography, radii, shadows, gradients } from "../lib/constants.js";
import { S } from "../styles/theme.js";
import { extractSOPFromTranscript } from "../lib/ai-extract.js";
import { EXAMPLE_DATA, EXAMPLE_BRAND } from "../lib/example-data.js";
import PreviewPanel from "./PreviewPanel.jsx";

export default function WelcomeScreen({ onStart, onTranscriptReady }) {
  const [sopType, setSopType] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [exampleType, setExampleType] = useState(null);
  const fileRef = useRef(null);

  const canContinue = sopType !== null && !processing;

  const cardStyle = {
    background: colors.cardBg,
    borderRadius: radii.card,
    padding: "24px",
    marginBottom: "16px",
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.card,
  };

  const optionBtn = (selected, accentColor) => ({
    padding: "18px 20px",
    borderRadius: "12px",
    border: `2px solid ${selected ? accentColor : colors.border}`,
    background: selected ? `${accentColor}14` : colors.inputBg,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
    fontFamily: typography.fontFamily,
    width: "100%",
  });

  const handleTranscriptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    setProcessing(true);
    setProcessStatus("Reading your transcript...");
    try {
      const transcript = await file.text();
      if (!transcript.trim()) throw new Error("The file appears to be empty.");
      setProcessStatus("Building your SOP draft...");
      const parsed = await extractSOPFromTranscript(transcript);
      setProcessStatus("Done! Loading your draft...");
      await new Promise(r => setTimeout(r, 400));
      const type = sopType || "basic";
      onStart({ sopType: type });
      onTranscriptReady(parsed);
    } catch (err) {
      setUploadError(err.message || "Could not process the transcript. Please try again.");
      setProcessing(false);
      setProcessStatus("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.pageBg, display: "flex", flexDirection: "column" }}>
      {/* Example preview modal */}
      {exampleType && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 600,
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          padding: "40px 16px", overflowY: "auto",
        }}
          onClick={() => setExampleType(null)}
        >
          <div style={{ maxWidth: "680px", width: "100%", position: "relative" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ fontSize: typography.sizes.bodyLg, fontWeight: typography.weights.semibold, color: colors.white }}>
                Example: {exampleType === "basic" ? "Basic SOP (5 sections)" : "Full Detail SOP (all 9 sections)"}
              </div>
              <button
                onClick={() => setExampleType(null)}
                style={{ background: "rgba(255,255,255,0.15)", border: "none", color: colors.white, borderRadius: radii.lg, padding: "6px 14px", cursor: "pointer", fontFamily: typography.fontFamily, fontSize: typography.sizes.body }}
              >
                Close
              </button>
            </div>
            <PreviewPanel data={EXAMPLE_DATA} brand={EXAMPLE_BRAND} sopType={exampleType} />
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: gradients.header, padding: "18px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "radial-gradient(circle, rgba(196,154,60,0.1) 1px, transparent 1px)",
          backgroundSize: "18px 18px", pointerEvents: "none",
        }} />
        <div style={{ fontSize: "20px", fontWeight: typography.weights.bold, color: colors.white, position: "relative", zIndex: 1, fontFamily: typography.fontFamily }}>
          <span style={{ color: colors.accent }}>Shine Bright</span> SOP Generator
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ maxWidth: "560px", width: "100%" }}>

          {/* Greeting */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h1 style={{ fontSize: "30px", fontWeight: typography.weights.bold, color: colors.primary, margin: "0 0 10px", letterSpacing: "-0.5px", fontFamily: typography.fontFamily }}>
              Let's build your SOP
            </h1>
            <p style={{ fontSize: "15px", color: colors.textMuted, margin: 0, lineHeight: 1.7 }}>
              Just answer a few questions about how you do it —<br />
              we'll turn it into a proper SOP.
            </p>
          </div>

          {/* SOP type */}
          <div style={cardStyle}>
            <div style={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.bodyLg, color: colors.primary, marginBottom: "6px" }}>
              How detailed do you want to go?
            </div>
            <div style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "16px" }}>
              You can always add more later — start with whatever feels right.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              <button onClick={() => setSopType("basic")} style={optionBtn(sopType === "basic", colors.primary)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.bodyLg, color: colors.primary, marginBottom: "4px" }}>
                      Basic — the essentials
                    </div>
                    <div style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.5 }}>
                      5 sections: overview, why it matters, when it runs, the big picture, and step-by-step.
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setExampleType("basic"); }}
                    style={{ marginLeft: "12px", marginTop: "2px", background: "none", border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: "4px 10px", fontSize: typography.sizes.caption, color: colors.textMuted, cursor: "pointer", whiteSpace: "nowrap", fontFamily: typography.fontFamily }}
                  >
                    See example
                  </button>
                </div>
              </button>

              <button onClick={() => setSopType("detailed")} style={optionBtn(sopType === "detailed", colors.accent)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.bodyLg, color: colors.primary, marginBottom: "4px" }}>
                      Full Detail — the complete picture
                    </div>
                    <div style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.5 }}>
                      All 9 sections including decisions, quality checks, tools and automation, and how to keep it updated over time.
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setExampleType("detailed"); }}
                    style={{ marginLeft: "12px", marginTop: "2px", background: "none", border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: "4px 10px", fontSize: typography.sizes.caption, color: colors.textMuted, cursor: "pointer", whiteSpace: "nowrap", fontFamily: typography.fontFamily }}
                  >
                    See example
                  </button>
                </div>
              </button>
            </div>
          </div>

          {/* Transcript upload */}
          <div style={{ ...cardStyle, background: gradients.warmBg, border: `1.5px solid ${colors.borderWarm}` }}>
            <div style={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.bodyLg, color: colors.primary, marginBottom: "6px" }}>
              Already have a transcript or notes?
            </div>
            <div style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "14px", lineHeight: 1.6 }}>
              Upload a plain text file of a transcript, meeting notes, or a brain dump — AI will turn it into a draft SOP for you to review.
            </div>

            {uploadError && (
              <div style={{ padding: "10px 14px", borderRadius: "10px", background: colors.dangerBg, color: colors.danger, fontSize: "12px", marginBottom: "12px" }}>
                {uploadError}
              </div>
            )}

            {processing ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 0" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: colors.accent, animation: "pulse 1.2s ease-in-out infinite", flexShrink: 0 }} />
                <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
                <span style={{ fontSize: "13px", color: colors.textSecondary, fontWeight: typography.weights.medium }}>{processStatus}</span>
              </div>
            ) : (
              <>
                <input type="file" ref={fileRef} accept=".txt,.md,.doc,.docx,text/plain" style={{ display: "none" }} onChange={handleTranscriptUpload} />
                <button
                  style={{ ...S.uploadVideoBtn, width: "100%", justifyContent: "center" }}
                  onClick={() => fileRef.current?.click()}
                >
                  Upload a text file
                </button>
                <div style={{ fontSize: "11px", color: colors.textFaint, marginTop: "8px", textAlign: "center" }}>
                  .txt or .md — paste your transcript, notes, or a rough write-up
                </div>
              </>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={() => canContinue && onStart({ sopType })}
            disabled={!canContinue}
            style={{
              width: "100%", padding: "15px", borderRadius: "12px", border: "none",
              background: canContinue ? gradients.primary : colors.border,
              color: canContinue ? colors.white : colors.textFaint,
              fontSize: "15px", fontWeight: typography.weights.bold, cursor: canContinue ? "pointer" : "default",
              fontFamily: typography.fontFamily, transition: "all 0.2s",
              boxShadow: canContinue ? "0 4px 14px rgba(45,53,38,0.25)" : "none",
            }}
          >
            {canContinue ? "Let's get started" : "Choose a style above to continue"}
          </button>

        </div>
      </div>
    </div>
  );
}
