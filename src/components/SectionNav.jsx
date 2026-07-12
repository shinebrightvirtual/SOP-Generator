import { SECTIONS } from "../lib/sections.js";
import { colors, typography } from "../styles/theme.js";

export default function SectionNav({ activeSection, sectionKeys, onSelect }) {
  const currentIdx = sectionKeys.indexOf(activeSection);
  const progress = ((currentIdx + 1) / sectionKeys.length) * 100;

  return (
    <div style={{ background: colors.white, borderBottom: `1px solid ${colors.border}` }}>
      {/* Thin progress line */}
      <div style={{ height: "2px", background: colors.border }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: colors.accent,
          transition: "width 0.4s ease",
        }} />
      </div>

      {/* Section tabs — underline style */}
      <div style={{
        display: "flex",
        overflowX: "auto",
        padding: "0 16px",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        {sectionKeys.map(key => {
          const sec = SECTIONS[key];
          const active = activeSection === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                padding: "11px 14px",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? colors.accent : "transparent"}`,
                color: active ? colors.primary : colors.textMuted,
                fontSize: "12px",
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                fontFamily: typography.fontFamily,
                whiteSpace: "nowrap",
                transition: "color 0.15s, border-color 0.15s",
                marginBottom: "-1px",
                lineHeight: 1,
              }}
            >
              {sec.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
