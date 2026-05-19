import { SECTIONS } from "../lib/sections.js";
import { S } from "../styles/theme.js";
import { renderField } from "./fields/index.jsx";

export default function ManualEditor({ activeSection, data, isPro, onFieldChange, onUnlockPro }) {
  const section = SECTIONS[activeSection];
  const isLocked = !section.free && !isPro;

  if (isLocked) {
    return (
      <div style={S.lockedCard}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔒</div>
          <h3 style={{ ...S.secTitle, fontSize: "17px", textAlign: "center" }}>{section.num}. {section.title}</h3>
          <p style={{ fontSize: "13px", color: "#918B82", margin: "6px 0 14px", maxWidth: "340px" }}>
            {section.subtitle} — available in Pro with video import, full branding, and export.
          </p>
          <button style={{ ...S.exportBtn(true), padding: "9px 20px" }} onClick={onUnlockPro}>
            ✦ Unlock Pro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.card}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
        <div style={S.secNum()}>{`Section ${section.num}`}</div>
        <span style={{ ...S.badge, ...(section.free ? S.freeBadge : S.proBadge) }}>
          {section.free ? "Free" : "Pro"}
        </span>
      </div>
      <h2 style={S.secTitle}>{section.title}</h2>
      <p style={S.secSub}>{section.subtitle}</p>
      {section.fields.map(field =>
        renderField(field, data[activeSection] || {}, (key, val) => onFieldChange(activeSection, key, val))
      )}
    </div>
  );
}
