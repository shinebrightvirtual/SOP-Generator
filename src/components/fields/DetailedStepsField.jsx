import { useEffect } from "react";
import { S } from "../../styles/theme.js";

let _id = 0;
const uid = () => `uid-${++_id}`;

export default function DetailedStepsField({ field, value, onChange, context = {} }) {
  const flowSteps = context.flowSteps?.filter(s => s && s.trim()) || [];
  const steps = value || [{ id: uid(), what: "", tools: "", time: "" }];

  // If Section 4 has phases and Section 5 is still empty, pre-populate step count to match
  useEffect(() => {
    if (flowSteps.length > 1 && steps.length === 1 && !steps[0].what) {
      onChange(field.key, flowSteps.map(() => ({ id: uid(), what: "", tools: "", time: "" })));
    }
  }, [flowSteps.length]);

  const update = (i, k, v) => { const n = [...steps]; n[i] = { ...n[i], [k]: v }; onChange(field.key, n); };
  const add = () => onChange(field.key, [...steps, { id: uid(), what: "", tools: "", time: "" }]);
  const remove = (i) => { const n = steps.filter((_, idx) => idx !== i); onChange(field.key, n.length ? n : [{ id: uid(), what: "", tools: "", time: "" }]); };

  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      {steps.map((step, i) => (
        <div key={step.id} style={{ background: "#FAFAF8", borderRadius: "12px", padding: "14px", marginBottom: "10px", border: "1px solid #EDE9E3" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={S.stepNum}>{i + 1}</div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#5C5C5C" }}>
                {flowSteps[i] ? flowSteps[i] : `Step ${i + 1}`}
              </span>
            </div>
            {steps.length > 1 && <button style={S.removeBtn} onClick={() => remove(i)}>Remove</button>}
          </div>
          <div style={{ marginBottom: "6px" }}>
            <label style={{ ...S.label, fontSize: "11px" }}>What happens</label>
            <textarea
              style={{ ...S.textarea, minHeight: "54px" }}
              placeholder="Describe what happens in this step..."
              value={step.what}
              onChange={e => update(i, "what", e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...S.label, fontSize: "11px" }}>Tools / systems</label>
              <input style={S.input} placeholder="e.g., Asana, Google Docs..." value={step.tools} onChange={e => update(i, "tools", e.target.value)} />
            </div>
            <div style={{ flex: 0.4 }}>
              <label style={{ ...S.label, fontSize: "11px" }}>Time est.</label>
              <input style={S.input} placeholder="e.g., 15 min" value={step.time} onChange={e => update(i, "time", e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>+ Add step</button>
    </div>
  );
}
