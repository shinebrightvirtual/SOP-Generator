import { SECTIONS, SECTION_ORDER } from "../lib/sections.js";

export default function PreviewPanel({ data, brand, isPro }) {
  const pc = isPro ? brand.primaryColor : "#1B3A4B";
  const ac = isPro ? brand.accentColor : "#E8985E";
  const biz = isPro && brand.businessName ? brand.businessName : "";
  const sectionsToShow = SECTION_ORDER.filter(k => SECTIONS[k].free || isPro);

  return (
    <div style={{ background: "#FFF", borderRadius: "16px", padding: "28px 24px", border: "1px solid #EDE9E3", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
      <div style={{ borderBottom: `3px solid ${pc}`, paddingBottom: "14px", marginBottom: "22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          {biz && <div style={{ fontSize: "10px", fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: "1.5px" }}>{biz}</div>}
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: pc, margin: "4px 0 0" }}>
            {data.overview?.sopTitle || "Standard Operating Procedure"}
          </h1>
          <div style={{ fontSize: "11px", color: "#918B82", marginTop: "3px" }}>
            {data.overview?.category && <span>{data.overview.category}</span>}
            {data.overview?.status && <span> · {data.overview.status}</span>}
            {data.overview?.versionDate && <span> · {data.overview.versionDate}</span>}
          </div>
        </div>
        {isPro && brand.logo && (
          <img src={brand.logo} alt="" style={{ maxHeight: "40px", maxWidth: "100px", objectFit: "contain" }} />
        )}
      </div>

      {sectionsToShow.map(key => {
        const sec = SECTIONS[key];
        const sData = data[key] || {};
        const hasContent = Object.values(sData).some(v =>
          v && (typeof v === "string" ? v.trim() : Array.isArray(v) ? v.some(item => typeof item === "string" ? item.trim() : item?.what?.trim()) : false)
        );
        if (!hasContent && key !== "overview") return null;

        return (
          <div key={key} style={{ marginBottom: "18px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: pc, margin: "0 0 3px", borderBottom: `1.5px solid ${ac}`, paddingBottom: "5px", display: "inline-block" }}>
              {sec.num}. {sec.title}
            </h2>
            <div style={{ fontSize: "12px", color: "#4A4A4A", lineHeight: 1.6, marginTop: "6px" }}>
              {sec.fields.map(field => {
                const val = sData[field.key];
                if (!val || (typeof val === "string" && !val.trim())) return null;

                if (field.type === "steplist" && Array.isArray(val)) {
                  return (
                    <div key={field.key} style={{ marginBottom: "6px" }}>
                      {val.filter(v => v.trim()).map((v, i) => (
                        <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "3px" }}>
                          <span style={{ color: ac, fontWeight: 700, minWidth: "18px" }}>{i + 1}.</span>
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  );
                }

                if (field.type === "detailedsteps" && Array.isArray(val)) {
                  return (
                    <div key={field.key}>
                      {val.filter(s => s.what?.trim()).map((s, i) => (
                        <div key={i} style={{ marginBottom: "8px", paddingLeft: "10px", borderLeft: `2px solid ${ac}` }}>
                          <div style={{ fontWeight: 600, color: pc, fontSize: "12px" }}>Step {i + 1}</div>
                          <div>{s.what}</div>
                          {s.tools && <div style={{ fontSize: "11px", color: "#7A7468" }}>Tools: {s.tools}</div>}
                          {s.time && <div style={{ fontSize: "11px", color: "#7A7468" }}>Time: {s.time}</div>}
                        </div>
                      ))}
                    </div>
                  );
                }

                if (field.type === "bulletlist" && Array.isArray(val)) {
                  return (
                    <div key={field.key} style={{ marginBottom: "6px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "#6B6560", marginBottom: "3px" }}>{field.label}</div>
                      {val.filter(v => v.trim()).map((v, i) => (
                        <div key={i} style={{ display: "flex", gap: "5px", marginBottom: "2px" }}>
                          <span style={{ color: ac }}>•</span>
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  );
                }

                if (key === "overview") return null;
                return (
                  <div key={field.key} style={{ marginBottom: "6px" }}>
                    <span style={{ fontWeight: 600, color: "#5C5C5C" }}>{field.label}: </span>
                    <span>{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{ borderTop: `2px solid ${pc}`, paddingTop: "10px", marginTop: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "10px", color: "#B5AFA6" }}>
          {biz ? `© ${new Date().getFullYear()} ${biz}` : "Created with Shine Bright SOP Generator"}
        </div>
      </div>
    </div>
  );
}
