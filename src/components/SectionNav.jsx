import { SECTIONS } from "../lib/sections.js";
import { S, colors, typography, radii } from "../styles/theme.js";

export default function SectionNav({ activeSection, sectionKeys, onSelect }) {
  const currentIdx = sectionKeys.indexOf(activeSection);
  const progress = ((currentIdx + 1) / sectionKeys.length) * 100;

  return (
    <div>
      {/* Progress bar */}
      <div style={{ background: colors.white, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ height: "3px", background: colors.border }}>
          <div style={{
            height: "100%", width: `${progress}%`, background: colors.accent,
            transition: "width 0.4s ease", borderRadius: "0 2px 2px 0",
          }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 16px 4px" }}>
          <span style={{ fontSize: typography.sizes.caption, color: colors.textFaint }}>
            Section {currentIdx + 1} of {sectionKeys.length}
          </span>
          <span style={{ fontSize: typography.sizes.caption, color: colors.accent, fontWeight: typography.weights.semibold }}>
            {Math.round(progress)}% complete
          </span>
        </div>
      </div>

      {/* Section tabs */}
      <div style={S.navBar}>
        {sectionKeys.map(key => {
          const sec = SECTIONS[key];
          const active = activeSection === key;
          return (
            <button
              key={key}
              style={S.navItem(active)}
              onClick={() => onSelect(key)}
            >
              {sec.num}. {sec.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
