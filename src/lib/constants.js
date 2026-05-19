/**
 * Shine Bright SOP Generator — Design Tokens
 *
 * Central design system for colors, typography, spacing, and component styles.
 * All components should reference these tokens rather than hardcoding values.
 */

export const colors = {
  // Brand
  primary: "#1B3A4B",
  primaryLight: "#2D5F73",
  accent: "#E8985E",
  accentDark: "#D4803E",

  // Backgrounds
  pageBg: "#F7F5F0",
  cardBg: "#FFFFFF",
  inputBg: "#FDFCFA",
  lockedBg: "#FAFAF8",
  warmBg: "#FFF9F3",

  // Borders
  border: "#EDE9E3",
  borderMuted: "#E0DBD3",
  borderDashed: "#D4CFC7",
  borderWarm: "#F0DCC8",
  borderSuccess: "#C6F0D0",

  // Text
  textPrimary: "#2D2D2D",
  textSecondary: "#5C5C5C",
  textMuted: "#918B82",
  textFaint: "#B5AFA6",
  textLabel: "#3D3D3D",
  textSubLabel: "#6B6560",
  textDark: "#4A4A4A",

  // Status
  success: "#34A853",
  successBg: "#E6F4EA",
  successText: "#1E7F3F",
  warning: "#E8985E",
  danger: "#C85050",
  dangerBg: "rgba(200,80,80,0.08)",
  info: "#4A90D9",
  pending: "#D4CFC7",

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
  fontFamily: "'DM Sans', sans-serif",
  fontUrl:
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap",
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
  progress: `linear-gradient(90deg, ${colors.accent}, ${colors.success})`,
  successBg: `linear-gradient(135deg, #F0FFF4 0%, #FFF 100%)`,
  warmBg: `linear-gradient(135deg, ${colors.warmBg} 0%, #FFF 100%)`,
};
