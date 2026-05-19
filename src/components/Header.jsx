import { S } from "../styles/theme.js";

export default function Header() {
  return (
    <div style={S.header}>
      <div style={S.headerPattern} />
      <h1 style={S.headerTitle}>
        <span style={S.headerAccent}>Shine Bright</span> SOP Generator
      </h1>
      <p style={S.headerSub}>Build branded, professional SOPs in minutes</p>
    </div>
  );
}
