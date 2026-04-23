import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, EASE } from "../tokens";

export type HighlightVariant = "border" | "glow" | "background";

interface HighlightProps {
  delay?: number;
  duration?: number;
  holdFrames?: number;
  fadeOutDuration?: number;
  color?: string;
  variant?: HighlightVariant;
  borderRadius?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export interface HighlightPose {
  intensity: number;
}

export function getHighlightPose(
  frame: number,
  delay: number,
  duration: number,
  holdFrames: number,
  fadeOutDuration: number,
): HighlightPose {
  const rel = frame - delay;
  const dur = Math.max(1, duration);
  const fadeOut = Math.max(1, fadeOutDuration);

  const fadeIn = interpolate(rel, [0, dur], [0, 1], EASE.snappy);
  const holdEnd = dur + holdFrames;
  const fadeOutVal = holdFrames > 0
    ? interpolate(rel, [holdEnd, holdEnd + fadeOut], [1, 0], EASE.smooth)
    : 1;

  return { intensity: Math.min(fadeIn, fadeOutVal) };
}

function getHighlightStyle(
  variant: HighlightVariant,
  intensity: number,
  color: string,
  borderRadius: number,
): React.CSSProperties {
  switch (variant) {
    case "border":
      return {
        borderRadius,
        boxShadow: `inset 0 0 0 ${2 * intensity}px ${color}`,
      };
    case "glow":
      return {
        borderRadius,
        boxShadow: `0 0 ${Math.round(20 * intensity)}px ${Math.round(8 * intensity)}px ${color}`,
      };
    case "background":
      return {
        borderRadius,
        backgroundColor: color,
        opacity: 0.15 * intensity,
        boxShadow: intensity > 0
          ? `inset 0 0 0 1px ${color}`
          : "none",
      };
  }
}

export const Highlight: React.FC<HighlightProps> = ({
  delay = 0,
  duration = 8,
  holdFrames = 0,
  fadeOutDuration = 10,
  color = C.brand,
  variant = "border",
  borderRadius = 8,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { intensity } = getHighlightPose(frame, delay, duration, holdFrames, fadeOutDuration);
  const highlightStyle = getHighlightStyle(variant, intensity, color, borderRadius);

  return (
    <div style={{ position: "relative", ...style }}>
      {children}
      {intensity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            ...highlightStyle,
          }}
        />
      )}
    </div>
  );
};
