import { S } from "../styles/theme.js";

export default function Header({ businessName }) {
  return (
    <div style={S.header}>
      <div style={S.headerPattern} />
      <h1 style={S.headerTitle}>
        <span style={S.headerAccent}>Shine Bright</span> SOP Generator
      </h1>
      <p style={S.headerSub}>
        {businessName ? `Building for ${businessName}` : "Build branded, professional SOPs in minutes"}
      </p>
    </div>
  );
}
