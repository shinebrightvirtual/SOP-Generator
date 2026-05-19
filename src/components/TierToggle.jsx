import { S } from "../styles/theme.js";

export default function TierToggle({ isPro, onToggle }) {
  return (
    <div style={S.tierToggle}>
      <span style={S.tierLabel(!isPro)} onClick={() => isPro && onToggle()}>Free</span>
      <div style={S.toggleTrack(isPro)} onClick={onToggle}>
        <div style={S.toggleThumb(isPro)} />
      </div>
      <span style={S.tierLabel(isPro)} onClick={() => !isPro && onToggle()}>Pro ✦</span>
      <span style={{ fontSize: "11px", color: "#918B82", marginLeft: "auto" }}>
        {isPro ? "All 9 sections + video import + branding" : "Sections 1–5 free"}
      </span>
    </div>
  );
}
