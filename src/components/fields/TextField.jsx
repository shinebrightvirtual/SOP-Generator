import { S } from "../../styles/theme.js";

export default function TextField({ field, value, onChange }) {
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      <input
        type={field.type === "date" ? "date" : "text"}
        style={S.input}
        placeholder={field.placeholder}
        value={value || ""}
        onChange={e => onChange(field.key, e.target.value)}
      />
    </div>
  );
}
