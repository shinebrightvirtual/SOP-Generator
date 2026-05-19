import { S } from "../../styles/theme.js";

export default function BulletListField({ field, value, onChange }) {
  const items = value || [""];

  const update = (i, v) => { const n = [...items]; n[i] = v; onChange(field.key, n); };
  const add = () => onChange(field.key, [...items, ""]);
  const remove = (i) => { const n = items.filter((_, idx) => idx !== i); onChange(field.key, n.length ? n : [""]); };

  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "center" }}>
          <span style={{ color: "#E8985E", fontWeight: 700, fontSize: "16px", flexShrink: 0 }}>•</span>
          <input
            style={{ ...S.input, flex: 1 }}
            placeholder={field.placeholder}
            value={item}
            onChange={e => update(i, e.target.value)}
          />
          {items.length > 1 && <button style={S.removeBtn} onClick={() => remove(i)}>✕</button>}
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>+ Add item</button>
    </div>
  );
}
