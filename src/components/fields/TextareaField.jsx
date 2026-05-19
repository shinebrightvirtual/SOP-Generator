import { S } from "../../styles/theme.js";

export default function TextareaField({ field, value, onChange }) {
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      <textarea
        style={S.textarea}
        placeholder={field.placeholder}
        value={value || ""}
        onChange={e => onChange(field.key, e.target.value)}
      />
    </div>
  );
}
