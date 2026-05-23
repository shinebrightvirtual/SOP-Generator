import { colors, typography } from "../../lib/constants.js";

export default function CheckboxField({ field, value, onChange }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={!!value}
          onChange={e => onChange(field.key, e.target.checked)}
          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: colors.primary }}
        />
        <span style={{ fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.textLabel }}>
          {field.label}
        </span>
      </label>
    </div>
  );
}
