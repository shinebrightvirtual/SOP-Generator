import { colors, typography, radii } from "../styles/theme.js";

export default function Header({ businessName, sopType, onChangeSopType }) {
  return (
    <div style={{
      background: colors.primary,
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle texture */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "radial-gradient(circle at 90% 50%, rgba(196,154,60,0.08) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* Brand */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          fontFamily: typography.fontFamilyDisplay,
          fontSize: "19px",
          fontWeight: 700,
          color: colors.white,
          lineHeight: 1.1,
          letterSpacing: "-0.2px",
        }}>
          <span style={{ color: colors.accent }}>Shine Bright</span>
        </div>
        <div style={{
          fontFamily: typography.fontFamily,
          fontSize: "10px",
          fontWeight: 500,
          color: "rgba(255,255,255,0.45)",
          marginTop: "2px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}>
          {businessName ? `for ${businessName}` : "SOP Generator"}
        </div>
      </div>

      {/* SOP type toggle */}
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "inline-flex",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "3px",
        gap: "2px",
      }}>
        <button
          onClick={() => onChangeSopType("basic")}
          style={{
            padding: "5px 14px",
            borderRadius: "16px",
            border: "none",
            fontSize: typography.sizes.body2,
            fontWeight: typography.weights.semibold,
            cursor: "pointer",
            fontFamily: typography.fontFamily,
            background: sopType === "basic" ? colors.white : "transparent",
            color: sopType === "basic" ? colors.primary : "rgba(255,255,255,0.65)",
            transition: "all 0.2s",
          }}
        >
          Basic
        </button>
        <button
          onClick={() => onChangeSopType("detailed")}
          style={{
            padding: "5px 14px",
            borderRadius: "16px",
            border: "none",
            fontSize: typography.sizes.body2,
            fontWeight: typography.weights.semibold,
            cursor: "pointer",
            fontFamily: typography.fontFamily,
            background: sopType === "detailed" ? colors.white : "transparent",
            color: sopType === "detailed" ? colors.primary : "rgba(255,255,255,0.65)",
            transition: "all 0.2s",
          }}
        >
          Full Detail
        </button>
      </div>
    </div>
  );
}
