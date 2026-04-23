export const C = {
  bg: "#0F0F14",
  bgLight: "#1A1A24",
  surface: "#24243A",
  surfaceLight: "#2E2E48",
  border: "#3A3A5C",

  text: "#F5F5FF",
  textMuted: "#A0A0C0",
  textDim: "#6B6B8D",

  brand: "#6366F1",
  brandLight: "#818CF8",
  brandDim: "#4F46E5",

  accent: "#22D3EE",
  accentDim: "#0891B2",

  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",

  windowChrome: "#2A2A3E",
  windowBorder: "#3A3A5C",
  trafficRed: "#FF5F57",
  trafficYellow: "#FEBC2E",
  trafficGreen: "#28C840",
} as const;

export const F = {
  sans: "'Inter', system-ui, sans-serif",
  serif: "'Fraunces', Georgia, serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const CANVAS = { width: 1920, height: 1080 } as const;
export const FPS = 30;

export { Easing } from "remotion";
import { Easing } from "remotion";
export const EASE = {
  snappy: {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
    easing: Easing.out(Easing.exp),
  },
  smooth: {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
    easing: Easing.out(Easing.cubic),
  },
} as const;
