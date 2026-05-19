import { colors, typography, spacing, radii, shadows, gradients } from "../lib/constants.js";

export { colors, typography, spacing, radii, shadows, gradients };

export const S = {
  app: {
    minHeight: "100vh",
    background: colors.pageBg,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  header: {
    background: gradients.header,
    padding: "36px 24px 28px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  headerPattern: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: "radial-gradient(circle at 20% 50%, rgba(232,152,94,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 40%)",
    pointerEvents: "none",
  },
  headerTitle: { fontSize: typography.sizes.display, fontWeight: typography.weights.bold, color: colors.white, margin: 0, letterSpacing: "-0.5px", position: "relative", zIndex: 1 },
  headerAccent: { color: colors.accent },
  headerSub: { fontSize: typography.sizes.body, color: colors.whiteAlpha65, marginTop: "6px", position: "relative", zIndex: 1, fontWeight: typography.weights.regular },
  navBar: {
    display: "flex", gap: "2px", padding: "10px 16px", background: colors.white,
    borderBottom: `1px solid #E8E4DD`, overflowX: "auto", position: "sticky", top: 0, zIndex: 100,
  },
  navItem: (active, locked) => ({
    padding: "7px 12px", borderRadius: radii.md, fontSize: typography.sizes.sm, fontWeight: active ? typography.weights.semibold : typography.weights.medium,
    background: active ? colors.primary : "transparent",
    color: active ? colors.white : locked ? colors.textFaint : colors.textSecondary,
    cursor: locked ? "default" : "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
    border: "none", opacity: locked ? 0.6 : 1, display: "flex", alignItems: "center", gap: "3px",
  }),
  main: { maxWidth: "720px", margin: "0 auto", padding: "20px 16px 120px" },
  card: {
    background: colors.cardBg, borderRadius: radii.card, padding: "24px 22px", marginBottom: "16px",
    boxShadow: shadows.card, border: `1px solid ${colors.border}`,
  },
  lockedCard: {
    background: colors.lockedBg, borderRadius: radii.card, padding: "28px 24px", marginBottom: "16px",
    border: `1px dashed ${colors.borderDashed}`,
  },
  secNum: (c) => ({ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: c || colors.accent, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "3px" }),
  secTitle: { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.primary, margin: "0 0 2px", letterSpacing: "-0.3px" },
  secSub: { fontSize: typography.sizes.body2, color: colors.textMuted, margin: "0 0 20px", fontStyle: "italic" },
  fieldGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: typography.sizes.body2, fontWeight: typography.weights.semibold, color: colors.textLabel, marginBottom: "5px" },
  input: {
    width: "100%", padding: "9px 12px", borderRadius: radii.lg, border: `1.5px solid ${colors.borderMuted}`,
    fontSize: typography.sizes.body, fontFamily: typography.fontFamily, color: colors.textPrimary, background: colors.inputBg,
    outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "9px 12px", borderRadius: radii.lg, border: `1.5px solid ${colors.borderMuted}`,
    fontSize: typography.sizes.body, fontFamily: typography.fontFamily, color: colors.textPrimary, background: colors.inputBg,
    outline: "none", minHeight: "72px", resize: "vertical", transition: "border-color 0.2s", boxSizing: "border-box",
  },
  select: {
    width: "100%", padding: "9px 12px", borderRadius: radii.lg, border: `1.5px solid ${colors.borderMuted}`,
    fontSize: typography.sizes.body, fontFamily: typography.fontFamily, color: colors.textPrimary, background: colors.inputBg,
    outline: "none", boxSizing: "border-box", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23918B82' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  },
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: radii.md,
    border: `1.5px dashed ${colors.borderDashed}`, background: "transparent", color: "#7A7468", fontSize: typography.sizes.body2,
    fontWeight: typography.weights.medium, cursor: "pointer", fontFamily: typography.fontFamily,
  },
  removeBtn: {
    padding: "3px 7px", borderRadius: radii.sm, border: "none", background: colors.dangerBg,
    color: colors.danger, fontSize: typography.sizes.caption, cursor: "pointer", fontFamily: typography.fontFamily,
  },
  stepNum: {
    minWidth: "26px", height: "26px", borderRadius: "50%", background: colors.primary, color: colors.white,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: typography.sizes.caption, fontWeight: typography.weights.bold,
    marginTop: "7px", flexShrink: 0,
  },
  tabRow: { display: "flex", gap: "4px", marginBottom: "20px" },
  tab: (active) => ({
    padding: "9px 18px", borderRadius: "10px 10px 0 0", border: "none", fontSize: typography.sizes.body2, fontWeight: active ? typography.weights.semibold : typography.weights.medium,
    background: active ? colors.primary : "#E8E4DD", color: active ? colors.white : "#6B6560",
    cursor: "pointer", fontFamily: typography.fontFamily,
  }),
  exportBar: {
    position: "fixed", bottom: 0, left: 0, right: 0, background: colors.white,
    borderTop: `1px solid #E8E4DD`, padding: "12px 20px",
    display: "flex", justifyContent: "center", gap: "10px", zIndex: 200,
    boxShadow: shadows.exportBar,
  },
  exportBtn: (primary) => ({
    padding: "10px 24px", borderRadius: radii.lg,
    border: primary ? "none" : `1.5px solid ${colors.primary}`,
    background: primary ? gradients.primary : "transparent",
    color: primary ? colors.white : colors.primary, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold,
    cursor: "pointer", fontFamily: typography.fontFamily, display: "flex", alignItems: "center", gap: "6px",
  }),
  badge: { display: "inline-block", padding: "2px 7px", borderRadius: radii.sm, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, textTransform: "uppercase", letterSpacing: "0.5px" },
  freeBadge: { background: colors.successBg, color: colors.successText },
  proBadge: { background: gradients.accent, color: colors.white },
  tierToggle: {
    display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px",
    background: colors.warmBg, borderRadius: radii.xl, border: `1px solid ${colors.borderWarm}`, marginBottom: "16px",
  },
  tierLabel: (a) => ({ fontSize: typography.sizes.body2, fontWeight: a ? typography.weights.bold : typography.weights.medium, color: a ? colors.primary : colors.textMuted, cursor: "pointer" }),
  toggleTrack: (on) => ({
    width: "40px", height: "22px", borderRadius: "11px", background: on ? colors.accent : colors.borderDashed,
    position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
  }),
  toggleThumb: (on) => ({
    width: "16px", height: "16px", borderRadius: "50%", background: colors.white,
    position: "absolute", top: "3px", left: on ? "21px" : "3px",
    transition: "left 0.2s", boxShadow: shadows.thumb,
  }),
  colorPicker: { display: "flex", alignItems: "center", gap: "8px" },
  colorSwatch: (c) => ({
    width: "32px", height: "32px", borderRadius: radii.md, border: `2px solid ${colors.borderMuted}`,
    cursor: "pointer", background: c, flexShrink: 0,
  }),
  logoPreview: { maxHeight: "50px", maxWidth: "180px", objectFit: "contain" },
  uploadArea: {
    border: `2px dashed ${colors.borderDashed}`, borderRadius: radii.xl, padding: "16px",
    textAlign: "center", cursor: "pointer", background: colors.inputBg,
  },
  videoCard: {
    background: gradients.warmBg,
    borderRadius: radii.card, padding: "24px 22px", marginBottom: "16px",
    border: `1.5px solid ${colors.borderWarm}`, position: "relative", overflow: "hidden",
  },
  videoCardPattern: {
    position: "absolute", top: 0, right: 0, width: "200px", height: "200px",
    background: "radial-gradient(circle, rgba(232,152,94,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  videoInputRow: { display: "flex", gap: "10px", alignItems: "stretch" },
  videoInput: {
    flex: 1, padding: "11px 14px", borderRadius: radii.lg, border: `1.5px solid ${colors.borderMuted}`,
    fontSize: typography.sizes.body, fontFamily: typography.fontFamily, color: colors.textPrimary, background: colors.white,
    outline: "none", boxSizing: "border-box",
  },
  videoBtn: (variant) => ({
    padding: "10px 18px", borderRadius: radii.lg, border: "none",
    background: variant === "primary" ? gradients.accent : "#EDE9E3",
    color: variant === "primary" ? colors.white : colors.textSecondary,
    fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, cursor: "pointer", fontFamily: typography.fontFamily,
    whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px",
  }),
  uploadVideoBtn: {
    padding: "10px 18px", borderRadius: radii.lg, border: `1.5px dashed ${colors.borderDashed}`,
    background: "transparent", color: "#7A7468", fontSize: typography.sizes.body, fontWeight: typography.weights.medium,
    cursor: "pointer", fontFamily: typography.fontFamily, whiteSpace: "nowrap",
    display: "flex", alignItems: "center", gap: "6px",
  },
  orDivider: { fontSize: typography.sizes.caption, color: colors.textFaint, fontWeight: typography.weights.semibold, display: "flex", alignItems: "center" },
  aiReviewCard: {
    background: colors.cardBg, borderRadius: radii.card, padding: "22px 20px", marginBottom: "14px",
    border: `1.5px solid ${colors.border}`, position: "relative",
  },
  aiReviewHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px",
  },
  aiStatusDot: (status) => ({
    width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, marginTop: "6px",
    background: status === "confirmed" ? colors.success : status === "editing" ? colors.accent : status === "pending" ? colors.pending : colors.info,
  }),
  aiFieldPreview: {
    background: colors.lockedBg, borderRadius: radii.lg, padding: "12px 14px", marginBottom: "8px",
    border: `1px solid ${colors.border}`, fontSize: typography.sizes.body, lineHeight: 1.6, color: colors.textLabel,
  },
  confirmBtn: {
    padding: "8px 18px", borderRadius: radii.md, border: "none",
    background: colors.success, color: colors.white, fontSize: typography.sizes.body2, fontWeight: typography.weights.semibold,
    cursor: "pointer", fontFamily: typography.fontFamily,
  },
  editBtn: {
    padding: "8px 18px", borderRadius: radii.md, border: `1.5px solid ${colors.accent}`,
    background: "transparent", color: colors.accent, fontSize: typography.sizes.body2, fontWeight: typography.weights.semibold,
    cursor: "pointer", fontFamily: typography.fontFamily,
  },
  progressBar: {
    height: "4px", borderRadius: "2px", background: colors.border, overflow: "hidden", marginBottom: "16px",
  },
  progressFill: (pct) => ({
    height: "100%", width: `${pct}%`, background: gradients.progress,
    borderRadius: "2px", transition: "width 0.5s ease",
  }),
  processingPulse: {
    display: "inline-block", width: "10px", height: "10px", borderRadius: "50%",
    background: colors.accent, animation: "pulse 1.2s ease-in-out infinite",
  },
};
