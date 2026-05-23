import { SECTIONS, SECTION_ORDER } from "../lib/sections.js";
import { S } from "../styles/theme.js";
import { renderField } from "./fields/index.jsx";

export default function AIReviewFlow({ aiData, onConfirmAll, onFieldChange, sectionStatuses, onConfirmSection, onEditSection }) {
  const confirmed = Object.values(sectionStatuses).filter(s => s === "confirmed").length;
  const total = SECTION_ORDER.length;
  const allConfirmed = confirmed === total;

  return (
    <div>
      <div style={{ ...S.card, background: "linear-gradient(135deg, #F0FFF4 0%, #FFF 100%)", border: "1.5px solid #C6F0D0", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#1B3A4B" }}>Review AI Suggestions</div>
            <div style={{ fontSize: "12px", color: "#918B82", marginTop: "2px" }}>{confirmed} of {total} sections confirmed</div>
          </div>
          {allConfirmed && (
            <button style={{ ...S.videoBtn("primary"), padding: "10px 22px" }} onClick={onConfirmAll}>
              Finish & Edit
            </button>
          )}
        </div>
        <div style={{ ...S.progressBar, marginTop: "12px", marginBottom: "0" }}>
          <div style={S.progressFill((confirmed / total) * 100)} />
        </div>
      </div>

      {SECTION_ORDER.map(key => {
        const sec = SECTIONS[key];
        const sData = aiData[key] || {};
        const status = sectionStatuses[key] || "suggested";
        const isEditing = status === "editing";
        const isConfirmed = status === "confirmed";

        return (
          <div
            key={key}
            style={{
              ...S.aiReviewCard,
              borderColor: isConfirmed ? "#C6F0D0" : isEditing ? "#F0DCC8" : "#EDE9E3",
              background: isConfirmed ? "#FBFEFB" : "#FFF",
            }}
          >
            <div style={S.aiReviewHeader}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flex: 1 }}>
                <div style={S.aiStatusDot(status)} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#1B3A4B" }}>{sec.num}. {sec.title}</div>
                  <div style={{ fontSize: "11px", color: "#918B82" }}>
                    {isConfirmed ? "✓ Confirmed" : isEditing ? "Editing..." : "AI suggestion — review & confirm"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {!isConfirmed && !isEditing && (
                  <>
                    <button style={S.editBtn} onClick={() => onEditSection(key)}>Edit</button>
                    <button style={S.confirmBtn} onClick={() => onConfirmSection(key)}>Confirm</button>
                  </>
                )}
                {isEditing && (
                  <button style={S.confirmBtn} onClick={() => onConfirmSection(key)}>Save & Confirm</button>
                )}
                {isConfirmed && (
                  <button style={S.editBtn} onClick={() => onEditSection(key)}>Revise</button>
                )}
              </div>
            </div>

            {!isEditing ? (
              <div>
                {sec.fields.map(field => {
                  const val = sData[field.key];
                  if (!val || (typeof val === "string" && !val.trim())) return null;
                  return (
                    <div key={field.key} style={S.aiFieldPreview}>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "#918B82", marginBottom: "3px" }}>{field.label}</div>
                      {typeof val === "string" && <div>{val}</div>}
                      {Array.isArray(val) && field.type === "steplist" && val.map((v, i) => (
                        <div key={i} style={{ marginBottom: "2px" }}>
                          <span style={{ color: "#E8985E", fontWeight: 700 }}>{i + 1}.</span> {v}
                        </div>
                      ))}
                      {Array.isArray(val) && field.type === "detailedsteps" && val.map((s, i) => (
                        <div key={i} style={{ marginBottom: "4px" }}>
                          <span style={{ fontWeight: 600, color: "#1B3A4B" }}>Step {i + 1}:</span> {s.what}
                          {s.tools && <span style={{ fontSize: "11px", color: "#7A7468" }}> — {s.tools}</span>}
                        </div>
                      ))}
                      {Array.isArray(val) && field.type === "bulletlist" && val.map((v, i) => (
                        <div key={i}>• {v}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                {sec.fields.map(field => renderField(field, sData, (k, v) => onFieldChange(key, k, v)))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
