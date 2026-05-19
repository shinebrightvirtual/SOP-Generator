import { S } from "../../styles/theme.js";

export default function StepListField({ field, value, onChange }) {
  const items = value || [""];
  const max = field.maxSteps || 7;

  const update = (i, v) => { const n = [...items]; n[i] = v; onChange(field.key, n); };
  const add = () => { if (items.length < max) onChange(field.key, [...items, ""]); };
  const remove = (i) => { const n = items.filter((_, idx) => idx !== i); onChange(field.key, n.length ? n : [""]); };

  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "8px" }}>
          <div style={S.stepNum}>{i + 1}</div>
          <input
            style={{ ...S.input, flex: 1 }}
            placeholder={field.placeholder}
            value={item}
            onChange={e => update(i, e.target.value)}
          />
          {items.length > 1 && <button style={S.removeBtn} onClick={() => remove(i)}>✕</button>}
        </div>
      ))}
      {items.length < max && <button style={S.addBtn} onClick={add}>+ Add phase</button>}
    </div>
  );
}
