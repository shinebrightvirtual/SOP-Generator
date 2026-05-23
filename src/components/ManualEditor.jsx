import { useState } from "react";
import { SECTIONS } from "../lib/sections.js";
import { S, colors, typography, radii, gradients } from "../styles/theme.js";
import { renderField } from "./fields/index.jsx";

export default function ManualEditor({ activeSection, sectionKeys, data, onFieldChange, onNext, onPrev }) {
  const section = SECTIONS[activeSection];
  const currentIdx = sectionKeys.indexOf(activeSection);
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === sectionKeys.length - 1;

  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const sectionData = data[activeSection] || {};

  const handleSuggestSteps = async () => {
    setSuggestLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/suggest-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.overview?.sopTitle || "",
          category: data.overview?.category || "",
          steps: sectionData.flowSteps || [],
        }),
      });
      const json = await res.json();
      setSuggestions(json.suggestions || []);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  };

  const acceptSuggestion = (suggestion) => {
    const current = sectionData.flowSteps || [""];
    const filtered = current.filter(s => s.trim());
    onFieldChange(activeSection, "flowSteps", [...filtered, suggestion]);
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const renderFields = () => {
    return section.fields.map(field => {
      if (field.conditional && !sectionData[field.conditional]) return null;
      return renderField(
        field,
        sectionData,
        (key, val) => onFieldChange(activeSection, key, val),
        activeSection === "detailedSteps" ? { flowSteps: data.bigPicture?.flowSteps } : {}
      );
    });
  };

  return (
    <div>
      <div style={S.card}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%", background: colors.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, color: colors.white, flexShrink: 0,
          }}>
            {section.num}
          </div>
          <div style={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.accent, textTransform: "uppercase", letterSpacing: "1.5px" }}>
            Section {section.num} of {sectionKeys.length}
          </div>
        </div>
        <h2 style={S.secTitle}>{section.title}</h2>
        <p style={S.secSub}>{section.subtitle}</p>

        {renderFields()}

        {/* Section 4: suggest missing steps */}
        {activeSection === "bigPicture" && (
          <div style={{ marginTop: "8px" }}>
            <button
              onClick={handleSuggestSteps}
              disabled={suggestLoading}
              style={{
                padding: "9px 18px", borderRadius: radii.lg, border: `1.5px solid ${colors.accent}`,
                background: "transparent", color: colors.accentDark, fontSize: typography.sizes.body2,
                fontWeight: typography.weights.semibold, cursor: suggestLoading ? "default" : "pointer",
                fontFamily: typography.fontFamily, opacity: suggestLoading ? 0.6 : 1,
              }}
            >
              {suggestLoading ? "Checking..." : "Check for missing steps"}
            </button>

            {suggestions.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ fontSize: typography.sizes.body2, color: colors.textMuted, marginBottom: "8px" }}>
                  You might also want to include:
                </div>
                {suggestions.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", padding: "10px 14px", background: "#F7F5F0", borderRadius: radii.lg, border: `1px solid ${colors.border}` }}>
                    <span style={{ flex: 1, fontSize: typography.sizes.body, color: colors.textPrimary }}>{s}</span>
                    <button
                      onClick={() => acceptSuggestion(s)}
                      style={{ padding: "5px 12px", borderRadius: radii.md, border: "none", background: colors.primary, color: colors.white, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold, cursor: "pointer", fontFamily: typography.fontFamily, whiteSpace: "nowrap" }}
                    >
                      Add this
                    </button>
                    <button
                      onClick={() => setSuggestions(prev => prev.filter(x => x !== s))}
                      style={{ padding: "5px 10px", borderRadius: radii.md, border: `1px solid ${colors.border}`, background: "transparent", color: colors.textFaint, fontSize: typography.sizes.caption, cursor: "pointer", fontFamily: typography.fontFamily }}
                    >
                      Skip
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prev / Next navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
        <button
          onClick={onPrev}
          disabled={isFirst}
          style={{
            padding: "10px 20px", borderRadius: radii.lg, border: `1.5px solid ${colors.border}`,
            background: "transparent", color: isFirst ? colors.textFaint : colors.textSecondary,
            fontSize: typography.sizes.body, fontWeight: typography.weights.medium,
            cursor: isFirst ? "default" : "pointer", fontFamily: typography.fontFamily,
          }}
        >
          Back
        </button>

        {isLast ? (
          <div style={{ fontSize: typography.sizes.caption, color: colors.success, fontWeight: typography.weights.semibold }}>
            All sections complete — ready to export!
          </div>
        ) : (
          <button
            onClick={onNext}
            style={{
              padding: "10px 24px", borderRadius: radii.lg, border: "none",
              background: gradients.primary, color: colors.white,
              fontSize: typography.sizes.body, fontWeight: typography.weights.semibold,
              cursor: "pointer", fontFamily: typography.fontFamily,
              boxShadow: "0 2px 8px rgba(45,53,38,0.2)",
            }}
          >
            Next: {SECTIONS[sectionKeys[currentIdx + 1]]?.title} →
          </button>
        )}
      </div>
    </div>
  );
}
