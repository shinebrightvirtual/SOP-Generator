import { useState, useRef } from "react";
import { colors, typography, radii, shadows, gradients } from "../lib/constants.js";
import { extractSOPFromTranscript } from "../lib/ai-extract.js";

export default function WelcomeScreen({ onStart, onTranscriptReady }) {
  const [sopType, setSopType] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState("");
  const [error, setError] = useState("");
  const txtRef = useRef(null);

  const canManual = sopType !== null && !processing;
  const canTranscript = transcript.trim().length > 20 && !processing;

  const handleTranscriptSubmit = async () => {
    if (!canTranscript) return;
    setError("");
    setProcessing(true);
    setProcessStatus("Give me a minute to make it make sense.");
    try {
      const parsed = await extractSOPFromTranscript(transcript);
      setProcessStatus("Almost there...");
      await new Promise(r => setTimeout(r, 500));
      const type = sopType || "basic";
      onStart({ sopType: type });
      onTranscriptReady(parsed);
    } catch {
      setError("Something went wrong — try that again.");
      setProcessing(false);
      setProcessStatus("");
    }
  };

  const handleTxtUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setTranscript(ev.target.result || "");
    reader.readAsText(file);
  };

  const optCard = (selected, accent) => ({
    padding: "16px 18px",
    borderRadius: radii.xl,
    border: `1.5px solid ${selected ? accent : colors.border}`,
    background: selected ? `${accent}12` : colors.white,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: typography.fontFamily,
    width: "100%",
    transition: "border-color 0.15s, background 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: colors.pageBg, display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <div style={{
        background: colors.white,
        borderBottom: `1px solid ${colors.border}`,
        padding: "14px 24px",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: typography.fontFamily,
          fontSize: "13px",
          fontWeight: 700,
          color: colors.primary,
          display: "inline-flex",
          alignItems: "center",
          gap: "9px",
        }}>
          <span style={{ color: colors.accent, fontSize: "15px", lineHeight: 1 }}>✦</span>
          <span>
            <span style={{ color: colors.accentDark }}>Shine Bright</span>
            {" "}SOP Generator
          </span>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(180deg, ${colors.white} 0%, ${colors.pageBg} 100%)`,
        padding: "56px 24px 48px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <div style={{
            fontFamily: typography.fontFamily,
            fontSize: "10px",
            fontWeight: 700,
            color: colors.accent,
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            marginBottom: "18px",
          }}>
            Standard Operating Procedures
          </div>
          <h1 style={{
            fontFamily: typography.fontFamilyDisplay,
            fontSize: "44px",
            fontWeight: 700,
            color: colors.primary,
            margin: "0 0 18px",
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
          }}>
            Let's build your SOP.
          </h1>
          <p style={{
            fontFamily: typography.fontFamily,
            fontSize: "15px",
            color: colors.textMuted,
            margin: 0,
            lineHeight: 1.8,
          }}>
            Tell us how you do it and we'll turn it into something<br />
            your team can actually follow.
          </p>
          <div style={{
            width: "36px",
            height: "2.5px",
            background: colors.accent,
            margin: "24px auto 0",
            borderRadius: "2px",
          }} />
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: "0 16px 60px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "520px", width: "100%" }}>

          {/* SOP type */}
          <div style={{
            background: colors.cardBg,
            borderRadius: radii.card,
            padding: "22px",
            marginBottom: "14px",
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.card,
          }}>
            <div style={{ fontFamily: typography.fontFamily, fontWeight: 600, fontSize: "14px", color: colors.primary, marginBottom: "5px" }}>
              How detailed do you want to go?
            </div>
            <div style={{ fontFamily: typography.fontFamily, fontSize: "12px", color: colors.textMuted, marginBottom: "14px" }}>
              You can always add more later — start with whatever feels right.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

              <button onClick={() => setSopType("basic")} style={optCard(sopType === "basic", colors.primary)}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <span style={{ fontSize: "20px", lineHeight: 1, marginTop: "1px", flexShrink: 0 }}>🗂</span>
                  <div>
                    <div style={{ fontFamily: typography.fontFamily, fontWeight: 700, fontSize: "13px", color: colors.primary, marginBottom: "3px" }}>
                      Basic — the essentials
                    </div>
                    <div style={{ fontFamily: typography.fontFamily, fontSize: "12px", color: colors.textMuted, lineHeight: 1.55 }}>
                      5 sections: overview, why it matters, when it runs, the big picture, and step-by-step.
                    </div>
                  </div>
                </div>
              </button>

              <button onClick={() => setSopType("detailed")} style={optCard(sopType === "detailed", colors.accent)}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <span style={{ fontSize: "20px", lineHeight: 1, marginTop: "1px", flexShrink: 0 }}>📋</span>
                  <div>
                    <div style={{ fontFamily: typography.fontFamily, fontWeight: 700, fontSize: "13px", color: colors.primary, marginBottom: "3px" }}>
                      Full Detail — the complete picture
                    </div>
                    <div style={{ fontFamily: typography.fontFamily, fontSize: "12px", color: colors.textMuted, lineHeight: 1.55 }}>
                      All 9 sections including decisions, quality checks, tools, automation, and handoff notes.
                    </div>
                  </div>
                </div>
              </button>

            </div>
          </div>

          {/* Transcript paste */}
          <div style={{
            background: `linear-gradient(135deg, #FAF7F2 0%, ${colors.cardBg} 100%)`,
            borderRadius: radii.card,
            padding: "22px",
            marginBottom: "14px",
            border: `1.5px solid ${colors.borderWarm}`,
            boxShadow: shadows.card,
          }}>
            <div style={{ fontFamily: typography.fontFamily, fontWeight: 600, fontSize: "14px", color: colors.primary, marginBottom: "5px" }}>
              Already have something written down?
            </div>
            <div style={{ fontFamily: typography.fontFamily, fontSize: "12px", color: colors.textMuted, marginBottom: "12px", lineHeight: 1.6 }}>
              Paste a transcript or rough notes. We'll pull out the structure and build a draft for you to look over.
            </div>

            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Paste your notes, a transcript, or a rough write-up here..."
              rows={5}
              disabled={processing}
              style={{
                width: "100%",
                padding: "10px 13px",
                borderRadius: radii.lg,
                border: `1.5px solid ${transcript.trim().length > 20 ? colors.accentDark : colors.borderMuted}`,
                fontSize: "13px",
                fontFamily: typography.fontFamily,
                color: colors.textPrimary,
                background: colors.white,
                outline: "none",
                resize: "vertical",
                lineHeight: 1.6,
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
            />

            {error && (
              <div style={{
                padding: "9px 13px",
                borderRadius: radii.md,
                background: colors.dangerBg,
                color: colors.danger,
                fontSize: "12px",
                marginTop: "10px",
                fontFamily: typography.fontFamily,
              }}>
                {error}
              </div>
            )}

            {processing ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "12px" }}>
                <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors.accent, animation: "pulse 1.2s ease-in-out infinite", flexShrink: 0 }} />
                <span style={{ fontFamily: typography.fontFamily, fontSize: "13px", color: colors.textSecondary }}>{processStatus}</span>
              </div>
            ) : (
              <div style={{ marginTop: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  onClick={handleTranscriptSubmit}
                  disabled={!canTranscript}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: radii.lg,
                    border: "none",
                    background: canTranscript ? gradients.accent : colors.border,
                    color: canTranscript ? colors.white : colors.textFaint,
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: canTranscript ? "pointer" : "default",
                    fontFamily: typography.fontFamily,
                    transition: "background 0.2s",
                  }}
                >
                  Create the SOP draft
                </button>
                <input type="file" ref={txtRef} accept=".txt" style={{ display: "none" }} onChange={handleTxtUpload} />
                <button
                  onClick={() => txtRef.current?.click()}
                  disabled={processing}
                  style={{
                    padding: "11px 16px",
                    borderRadius: radii.lg,
                    border: `1.5px solid ${colors.borderDashed}`,
                    background: "transparent",
                    color: colors.textMuted,
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: typography.fontFamily,
                    whiteSpace: "nowrap",
                  }}
                >
                  Upload .txt
                </button>
              </div>
            )}
          </div>

          {/* Manual start CTA */}
          {!processing && (
            <>
              <div style={{ textAlign: "center", margin: "14px 0 12px" }}>
                <span style={{ fontFamily: typography.fontFamily, fontSize: "11px", color: colors.textFaint }}>
                  — or fill it in yourself —
                </span>
              </div>
              <button
                onClick={() => canManual && onStart({ sopType })}
                disabled={!canManual}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: radii.xl,
                  border: "none",
                  background: canManual ? gradients.primary : colors.border,
                  color: canManual ? colors.white : colors.textFaint,
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: canManual ? "pointer" : "default",
                  fontFamily: typography.fontFamily,
                  transition: "all 0.2s",
                  boxShadow: canManual ? "0 4px 14px rgba(45,53,38,0.25)" : "none",
                  letterSpacing: "0.1px",
                }}
              >
                {canManual ? "Fill it in myself →" : "Pick a format above to keep going"}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
