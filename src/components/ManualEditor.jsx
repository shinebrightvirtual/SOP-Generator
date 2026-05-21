import { SECTIONS } from "../lib/sections.js";
import { S, colors, typography, radii, gradients } from "../styles/theme.js";
import { renderField } from "./fields/index.jsx";

const encouragement = [
  "You're doing great — keep going!",
  "Nice work. One section at a time.",
  "This is the most important part — take your time.",
  "Almost there!",
  "You're building something really solid here.",
];

export default function ManualEditor({ activeSection, sectionKeys, data, onFieldChange, onNext, onPrev }) {
  const section = SECTIONS[activeSection];
  const currentIdx = sectionKeys.indexOf(activeSection);
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === sectionKeys.length - 1;

  return (
    <div>
      <div style={S.card}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%", background: colors.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, color: colors.white, flexShrink: 0,
          }}>
            {section.num}
          </div>
          <div style={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.accent, textTransform: "uppercase", letterSpacing: "1.5px" }}>
            Section {section.num} of {sectionKeys.length}
          </div>
        </div>
        <h2 style={S.secTitle}>{section.title}</h2>
        <p style={S.secSub}>{section.subtitle}</p>

        {/* Fields */}
        {section.fields.map(field =>
          renderField(field, data[activeSection] || {}, (key, val) => onFieldChange(activeSection, key, val))
        )}

        {/* Skip hint */}
        <div style={{ marginTop: "8px", fontSize: typography.sizes.caption, color: colors.textFaint, textAlign: "center" }}>
          Not sure? Leave it blank — you can always come back and fill it in later.
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
        <button
          onClick={onPrev}
          disabled={isFirst}
          style={{
            padding: "10px 20px", borderRadius: radii.lg, border: `1.5px solid ${colors.border}`,
            background: "transparent", color: isFirst ? colors.textFaint : colors.textSecondary,
            fontSize: typography.sizes.body, fontWeight: typography.weights.medium,
            cursor: isFirst ? "default" : "pointer", fontFamily: typography.fontFamily,
          }}
        >
          ← Back
        </button>

        {isLast ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ fontSize: typography.sizes.caption, color: colors.success, fontWeight: typography.weights.semibold }}>
              ✓ All sections complete — ready to export!
            </div>
          </div>
        ) : (
          <button
            onClick={onNext}
            style={{
              padding: "10px 24px", borderRadius: radii.lg, border: "none",
              background: gradients.primary, color: colors.white,
              fontSize: typography.sizes.body, fontWeight: typography.weights.semibold,
              cursor: "pointer", fontFamily: typography.fontFamily,
              boxShadow: "0 2px 8px rgba(45,53,38,0.2)",
            }}
          >
            Next: {SECTIONS[sectionKeys[currentIdx + 1]]?.title} →
          </button>
        )}
      </div>
    </div>
  );
}
