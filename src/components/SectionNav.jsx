import { SECTIONS, SECTION_ORDER } from "../lib/sections.js";
import { S } from "../styles/theme.js";

export default function SectionNav({ activeSection, isPro, onSelect }) {
  return (
    <div style={S.navBar}>
      {SECTION_ORDER.map(key => {
        const sec = SECTIONS[key];
        const locked = !sec.free && !isPro;
        return (
          <button
            key={key}
            style={S.navItem(activeSection === key, locked)}
            onClick={() => !locked && onSelect(key)}
          >
            {locked && <span style={{ fontSize: "10px" }}>🔒</span>}
            {sec.num}. {sec.title}
          </button>
        );
      })}
    </div>
  );
}
