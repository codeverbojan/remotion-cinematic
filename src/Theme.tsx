import React from "react";
import { AbsoluteFill } from "remotion";
import type { BrandConfig } from "./schema";
import { BASE_COLORS } from "./tokens";

export function themeStyle(brand: BrandConfig): React.CSSProperties {
  const c = brand.colors;
  const colors = { ...BASE_COLORS, bg: c.background, bgLight: c.backgroundLight, surface: c.surface, surfaceLight: c.surface, border: `color-mix(in srgb, ${c.textMuted} 24%, transparent)`, text: c.text, textMuted: c.textMuted, textDim: c.textMuted, brand: c.primary, brandLight: c.primary, brandDim: c.primary, accent: c.accent, accentDim: c.accent, success: c.success, warning: c.warning, error: c.error, windowChrome: c.surface, windowBorder: `color-mix(in srgb, ${c.textMuted} 30%, transparent)` };
  return { ...Object.fromEntries(Object.entries(colors).map(([key, value]) => [`--cinematic-${key}`, value])), "--cinematic-sans": JSON.stringify(brand.fontSans), "--cinematic-serif": JSON.stringify(brand.fontSerif), "--cinematic-mono": JSON.stringify(brand.fontMono), color: c.text } as React.CSSProperties;
}
export const Theme: React.FC<{ brand: BrandConfig; children: React.ReactNode }> = ({brand, children}) => <AbsoluteFill style={themeStyle(brand)}>{children}</AbsoluteFill>;
