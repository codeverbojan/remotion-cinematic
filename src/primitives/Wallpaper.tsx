import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../tokens";

type WallpaperVariant = "dark" | "light" | "gradient";

interface WallpaperProps {
  variant?: WallpaperVariant;
  style?: React.CSSProperties;
}

const BACKGROUNDS: Record<WallpaperVariant, React.CSSProperties> = {
  dark: {
    background: C.bg,
  },
  light: {
    background: `linear-gradient(145deg, ${C.bgLight} 0%, ${C.surface} 100%)`,
  },
  gradient: {
    background: `radial-gradient(ellipse at 30% 20%, color-mix(in srgb, ${C.brandDim} 20%, transparent) 0%, transparent 50%),
                 radial-gradient(ellipse at 70% 80%, color-mix(in srgb, ${C.accentDim} 13%, transparent) 0%, transparent 50%),
                 ${C.bg}`,
  },
};

export const Wallpaper: React.FC<WallpaperProps> = ({
  variant = "dark",
  style,
}) => {
  return (
    <AbsoluteFill
      style={{
        ...BACKGROUNDS[variant],
        ...style,
      }}
    />
  );
};
