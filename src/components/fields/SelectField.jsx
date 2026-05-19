import { S } from "../../styles/theme.js";

export default function SelectField({ field, value, onChange }) {
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      <select
        style={S.select}
        value={value || ""}
        onChange={e => onChange(field.key, e.target.value)}
      >
        <option value="">Select...</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
