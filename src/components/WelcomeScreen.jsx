import { useState } from "react";
import { colors, typography, radii, shadows, gradients } from "../lib/constants.js";
import { S } from "../styles/theme.js";

export default function WelcomeScreen({ onStart, initialBusinessName }) {
  const [businessName, setBusinessName] = useState(initialBusinessName || "");
  const [sopType, setSopType] = useState(null);

  const canContinue = sopType !== null;

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

  return (
    <div style={{ minHeight: "100vh", background: colors.pageBg, display: "flex", flexDirection: "column" }}>
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
            <div style={{
              width: "60px", height: "60px", borderRadius: "50%", background: colors.primary,
              margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(45,53,38,0.2)",
            }}>
              <span style={{ fontSize: "26px" }}>✦</span>
            </div>
            <h1 style={{ fontSize: "30px", fontWeight: typography.weights.bold, color: colors.primary, margin: "0 0 10px", letterSpacing: "-0.5px", fontFamily: typography.fontFamily }}>
              Let's build your SOP
            </h1>
            <p style={{ fontSize: "15px", color: colors.textMuted, margin: 0, lineHeight: 1.7 }}>
              No overwhelm, no jargon — just a simple way to document<br />
              how your business actually works.
            </p>
          </div>

          {/* Business name */}
          <div style={cardStyle}>
            <label style={{ display: "block", fontWeight: typography.weights.semibold, fontSize: typography.sizes.bodyLg, color: colors.primary, marginBottom: "10px" }}>
              First — what's your business called?
            </label>
            <input
              style={{ ...S.input, fontSize: "15px", padding: "11px 14px" }}
              placeholder="e.g., Shine Bright Virtual"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              autoFocus
            />
            <div style={{ fontSize: "12px", color: colors.textFaint, marginTop: "8px" }}>
              This will show up on your exported SOP — skip it if you're just exploring.
            </div>
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
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px", background: sopType === "basic" ? colors.primary : colors.warmBg,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "18px",
                    transition: "background 0.15s",
                  }}>
                    📋
                  </div>
                  <div>
                    <div style={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.bodyLg, color: colors.primary, marginBottom: "4px" }}>
                      Basic SOP — the essentials
                    </div>
                    <div style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.5 }}>
                      5 sections covering overview, purpose, triggers, the big picture, and step-by-step. Perfect for getting something solid done quickly.
                    </div>
                  </div>
                </div>
              </button>

              <button onClick={() => setSopType("detailed")} style={optionBtn(sopType === "detailed", colors.accent)}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px", background: sopType === "detailed" ? `${colors.accent}22` : colors.warmBg,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "18px",
                    transition: "background 0.15s",
                  }}>
                    📚
                  </div>
                  <div>
                    <div style={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.bodyLg, color: colors.primary, marginBottom: "4px" }}>
                      Full Detail — the complete framework
                    </div>
                    <div style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.5 }}>
                      All 9 sections including decisions, quality checklists, AI & automation, and how to keep the SOP evolving. Great for handing off to a team.
                    </div>
                  </div>
                </div>
              </button>

            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => canContinue && onStart({ businessName, sopType })}
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
            {canContinue ? "Let's get started →" : "Choose a style above to continue"}
          </button>

          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: colors.textFaint }}>
            Fill in as little or as much as you have — nothing is required.
          </div>

        </div>
      </div>
    </div>
  );
}
