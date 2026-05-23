export const colors = {
  // Brand
  primary: "#2D3526",
  primaryLight: "#3D4A30",
  accent: "#C49A3C",
  accentDark: "#A8832E",
  rust: "#8B4F38",
  sage: "#9BA98A",
  warmGray: "#797870",
  burgundy: "#4A2535",

  // Backgrounds
  pageBg: "#EAE8E2",
  cardBg: "#FFFFFF",
  inputBg: "#F5F3EF",
  lockedBg: "#F8F6F2",
  warmBg: "#F2EFE8",

  // Borders
  border: "#DDD9D1",
  borderMuted: "#D5D0C8",
  borderDashed: "#C8C3BA",
  borderWarm: "#D9CEB8",
  borderSuccess: "#C3DDB8",

  // Text
  textPrimary: "#2D3526",
  textSecondary: "#4A4A40",
  textMuted: "#7A7870",
  textFaint: "#A8A49C",
  textLabel: "#3A3A30",
  textSubLabel: "#6B6860",
  textDark: "#2D3526",

  // Status
  success: "#4A7C3F",
  successBg: "#E8F0E4",
  successText: "#2D5C24",
  warning: "#C49A3C",
  danger: "#8B3A2A",
  dangerBg: "rgba(139,58,42,0.08)",
  info: "#4A6D8C",
  pending: "#C8C3BA",

  // Overlay
  white: "#FFFFFF",
  whiteAlpha70: "rgba(255,255,255,0.7)",
  whiteAlpha65: "rgba(255,255,255,0.65)",
  whiteAlpha05: "rgba(255,255,255,0.05)",
  blackAlpha04: "rgba(0,0,0,0.04)",
  blackAlpha02: "rgba(0,0,0,0.02)",
  blackAlpha03: "rgba(0,0,0,0.03)",
  blackAlpha15: "rgba(0,0,0,0.15)",
};

export const typography = {
  fontFamily: "'Lato', sans-serif",
  fontUrl:
    "https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap",
  sizes: {
    xs: "9px",
    sm: "10px",
    caption: "11px",
    body2: "12px",
    body: "13px",
    bodyLg: "14px",
    h4: "15px",
    h3: "17px",
    h2: "20px",
    h1: "22px",
    display: "26px",
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const spacing = {
  xs: "2px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  xxl: "20px",
  xxxl: "24px",
  section: "28px",
};

export const radii = {
  sm: "6px",
  md: "8px",
  lg: "10px",
  xl: "12px",
  card: "16px",
};

export const shadows = {
  card: `0 1px 3px ${colors.blackAlpha04}, 0 4px 12px ${colors.blackAlpha02}`,
  subtle: `0 2px 8px ${colors.blackAlpha03}`,
  exportBar: `0 -2px 12px ${colors.blackAlpha04}`,
  thumb: `0 1px 3px ${colors.blackAlpha15}`,
};

export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
  accent: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDark})`,
  header: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
  progress: `linear-gradient(90deg, ${colors.accent}, ${colors.sage})`,
  successBg: `linear-gradient(135deg, #EEF4EA 0%, #FFF 100%)`,
  warmBg: `linear-gradient(135deg, ${colors.warmBg} 0%, #FFF 100%)`,
};
