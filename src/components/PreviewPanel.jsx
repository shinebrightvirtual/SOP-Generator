import { SECTIONS } from "../lib/sections.js";
import { getSectionsForType } from "../lib/sections.js";
import { colors } from "../lib/constants.js";

export default function PreviewPanel({ data, brand, sopType }) {
  const pc = brand.primaryColor || colors.primary;
  const ac = brand.accentColor || colors.accent;
  const biz = brand.businessName || "";
  const createdBy = brand.createdBy || "";
  const sectionsToShow = getSectionsForType(sopType);

  const ov = data.overview || {};

  return (
    <div style={{ background: "#FFF", borderRadius: "8px", padding: "28px 24px", border: `1px solid ${colors.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>

      {/* Title block */}
      <div style={{ borderBottom: `3px solid ${pc}`, paddingBottom: "14px", marginBottom: "22px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <div>
          {biz && <div style={{ fontSize: "10px", fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>{biz}</div>}
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: pc, margin: "0 0 6px" }}>
            {ov.sopTitle || "Standard Operating Procedure"}
          </h1>
          {(createdBy || ov.versionDate) && (
            <div style={{ fontSize: "11px", color: colors.textMuted, fontStyle: "italic" }}>
              {createdBy && `Created by: ${createdBy}`}
              {createdBy && ov.versionDate && "   "}
              {ov.versionDate && `Version: ${ov.versionDate}`}
            </div>
          )}
        </div>
        {brand.logo && (
          <img src={brand.logo} alt="" style={{ maxHeight: "40px", maxWidth: "100px", objectFit: "contain", flexShrink: 0 }} />
        )}
      </div>

      {sectionsToShow.map(key => {
        const sec = SECTIONS[key];
        const sData = data[key] || {};

        // Overview: render as a metadata grid
        if (key === "overview") {
          const metaFields = [
            { label: "Category", val: sData.category },
            { label: "Owner", val: sData.owner },
            { label: "Executor", val: sData.executor },
            { label: "Frequency", val: sData.frequency },
            { label: "Next Review", val: sData.nextReview },
          ].filter(f => f.val && String(f.val).trim());
          if (!metaFields.length) return null;
          return (
            <div key={key} style={{ marginBottom: "20px" }}>
              <SectionHeading num={sec.num} title={sec.title} pc={pc} ac={ac} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px 16px", marginTop: "8px" }}>
                {metaFields.map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>{f.label}</div>
                    <div style={{ fontSize: "12px", color: "#4A4A4A", marginTop: "2px" }}>{f.val}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        const hasContent = Object.values(sData).some(v =>
          v && (typeof v === "string" ? v.trim() : typeof v === "boolean" ? v : Array.isArray(v) ? v.some(item => typeof item === "string" ? item.trim() : item?.what?.trim()) : false)
        );
        if (!hasContent) return null;

        return (
          <div key={key} style={{ marginBottom: "20px" }}>
            <SectionHeading num={sec.num} title={sec.title} pc={pc} ac={ac} />
            <div style={{ fontSize: "12px", color: "#4A4A4A", lineHeight: 1.7, marginTop: "8px" }}>
              {sec.fields.map(field => {
                const val = sData[field.key];

                // Skip checkbox fields and unfilled conditionals
                if (field.type === "checkbox") return null;
                if (!val || (typeof val === "string" && !val.trim())) return null;

                if (field.type === "steplist" && Array.isArray(val)) {
                  return (
                    <div key={field.key} style={{ marginBottom: "6px" }}>
                      {val.filter(v => v && v.trim()).map((v, i) => (
                        <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                          <span style={{ color: ac, fontWeight: 700, minWidth: "18px", flexShrink: 0 }}>{i + 1}.</span>
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  );
                }

                if (field.type === "detailedsteps" && Array.isArray(val)) {
                  return (
                    <div key={field.key}>
                      {val.filter(s => s?.what?.trim()).map((s, i) => (
                        <div key={i} style={{ marginBottom: "10px", paddingLeft: "10px", borderLeft: `2px solid ${ac}` }}>
                          <div style={{ fontWeight: 600, color: pc, fontSize: "11px", marginBottom: "2px" }}>Step {i + 1}</div>
                          <div>{s.what}</div>
                          {s.tools && <div style={{ fontSize: "11px", color: colors.textMuted, marginTop: "2px" }}>Tools: {s.tools}</div>}
                          {s.time && <div style={{ fontSize: "11px", color: colors.textMuted }}>Est. time: {s.time}</div>}
                        </div>
                      ))}
                    </div>
                  );
                }

                if (field.type === "bulletlist" && Array.isArray(val)) {
                  return (
                    <div key={field.key} style={{ marginBottom: "6px" }}>
                      {val.filter(v => v && v.trim()).map((v, i) => (
                        <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "3px" }}>
                          <span style={{ color: ac, flexShrink: 0 }}>•</span>
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  );
                }

                // text / textarea / select / date — show as plain paragraph, no label
                return (
                  <p key={field.key} style={{ margin: "0 0 8px" }}>{val}</p>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{ borderTop: `2px solid ${pc}`, paddingTop: "10px", marginTop: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "10px", color: colors.textFaint }}>
          {biz ? `© ${new Date().getFullYear()} ${biz}` : "Created with Shine Bright SOP Generator"}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ num, title, pc, ac }) {
  return (
    <h2 style={{
      fontSize: "13px", fontWeight: 700, color: pc, margin: "0 0 2px",
      borderBottom: `1.5px solid ${ac}`, paddingBottom: "5px",
      textTransform: "uppercase", letterSpacing: "0.5px",
    }}>
      {num}. {title}
    </h2>
  );
}
