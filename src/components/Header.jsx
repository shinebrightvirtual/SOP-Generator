import { S, colors, typography, radii } from "../styles/theme.js";

export default function Header({ businessName, sopType, onChangeSopType }) {
  return (
    <div style={S.header}>
      <div style={S.headerPattern} />
      <h1 style={S.headerTitle}>
        <span style={S.headerAccent}>Shine Bright</span> SOP Generator
      </h1>
      <p style={S.headerSub}>
        {businessName ? `Building for ${businessName}` : "Build branded, professional SOPs in minutes"}
      </p>

      {/* SOP type toggle */}
      <div style={{ display: "inline-flex", marginTop: "12px", background: "rgba(255,255,255,0.12)", borderRadius: "20px", padding: "3px", gap: "2px", position: "relative", zIndex: 1 }}>
        <button
          onClick={() => onChangeSopType("basic")}
          style={{
            padding: "5px 14px", borderRadius: "16px", border: "none", fontSize: typography.sizes.body2,
            fontWeight: typography.weights.semibold, cursor: "pointer", fontFamily: typography.fontFamily,
            background: sopType === "basic" ? colors.white : "transparent",
            color: sopType === "basic" ? colors.primary : colors.whiteAlpha70,
            transition: "all 0.2s",
          }}
        >
          Basic
        </button>
        <button
          onClick={() => onChangeSopType("detailed")}
          style={{
            padding: "5px 14px", borderRadius: "16px", border: "none", fontSize: typography.sizes.body2,
            fontWeight: typography.weights.semibold, cursor: "pointer", fontFamily: typography.fontFamily,
            background: sopType === "detailed" ? colors.white : "transparent",
            color: sopType === "detailed" ? colors.primary : colors.whiteAlpha70,
            transition: "all 0.2s",
          }}
        >
          Full Detail
        </button>
      </div>
    </div>
  );
}
