import { useState } from "react";
import { colors, typography, radii, shadows, gradients } from "../lib/constants.js";
import { S } from "../styles/theme.js";

export default function WelcomeScreen({ onStart, initialBusinessName }) {
  const [businessName, setBusinessName] = useState(initialBusinessName || "");
  const [startMethod, setStartMethod] = useState(null);

  const canContinue = startMethod !== null;

  const cardStyle = {
    background: colors.cardBg,
    borderRadius: radii.card,
    padding: "24px",
    marginBottom: "16px",
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.card,
  };

  const optionBtn = (selected, color) => ({
    padding: "16px 18px",
    borderRadius: "12px",
    border: `2px solid ${selected ? color : colors.border}`,
    background: selected ? `${color}18` : colors.inputBg,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
    fontFamily: typography.fontFamily,
    width: "100%",
  });

  return (
    <div style={{ minHeight: "100vh", background: colors.pageBg, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: gradients.header, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "radial-gradient(circle, rgba(235,230,227,0.07) 1px, transparent 1px)",
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
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%", background: colors.primary,
              margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(27,58,75,0.25)",
            }}>
              <span style={{ fontSize: "24px", color: colors.white }}>✦</span>
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: typography.weights.bold, color: colors.primary, margin: "0 0 10px", letterSpacing: "-0.5px", fontFamily: typography.fontFamily }}>
              Let's build your SOP
            </h1>
            <p style={{ fontSize: "15px", color: colors.textMuted, margin: 0, lineHeight: 1.6 }}>
              No overwhelm, no jargon — just a simple way to document<br />
              how your business actually works.
            </p>
          </div>

          {/* Business name */}
          <div style={cardStyle}>
            <label style={{ display: "block", fontWeight: typography.weights.semibold, fontSize: typography.sizes.body2, color: colors.primary, marginBottom: "8px" }}>
              First — what's your business called?
            </label>
            <input
              style={{ ...S.input, fontSize: "15px", padding: "11px 14px" }}
              placeholder="e.g., Shine Bright Virtual"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
            />
            <div style={{ fontSize: "11px", color: colors.textFaint, marginTop: "6px" }}>
              This will show up on your exported SOP — totally optional if you're just exploring.
            </div>
          </div>

          {/* Start method */}
          <div style={cardStyle}>
            <div style={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.body2, color: colors.primary, marginBottom: "14px" }}>
              How do you want to get started?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={() => setStartMethod("video")} style={optionBtn(startMethod === "video", colors.accent)}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "22px" }}>🎥</span>
                  <div>
                    <div style={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.body2, color: colors.primary, marginBottom: "2px" }}>
                      I have a video walkthrough
                      <span style={{ ...S.badge, ...S.proBadge, marginLeft: "8px" }}>Pro</span>
                    </div>
                    <div style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.4 }}>
                      Got a Loom or screen recording? Drop it in and we'll turn it into a full SOP automatically.
                    </div>
                  </div>
                </div>
              </button>

              <button onClick={() => setStartMethod("manual")} style={optionBtn(startMethod === "manual", colors.primary)}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "22px" }}>✏️</span>
                  <div>
                    <div style={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.body2, color: colors.primary, marginBottom: "2px" }}>
                      I'll fill it in myself
                    </div>
                    <div style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.4 }}>
                      We'll guide you through each section one at a time. It's easier than it looks, promise.
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => canContinue && onStart({ businessName, startMethod })}
            disabled={!canContinue}
            style={{
              width: "100%", padding: "14px", borderRadius: "12px", border: "none",
              background: canContinue ? gradients.primary : colors.border,
              color: canContinue ? colors.white : colors.textFaint,
              fontSize: "15px", fontWeight: typography.weights.bold, cursor: canContinue ? "pointer" : "default",
              fontFamily: typography.fontFamily, transition: "all 0.2s",
            }}
          >
            {canContinue ? (startMethod === "video" ? "Continue with Video Import →" : "Start Building →") : "Choose how to get started"}
          </button>
        </div>
      </div>
    </div>
  );
}
