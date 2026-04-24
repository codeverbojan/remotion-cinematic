import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useUIState } from "../../engine/ui-state";
import { C, F } from "../../tokens";

export interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  id?: string;
  style?: React.CSSProperties;
}

interface ButtonUIState {
  pressed: boolean;
  pressedAt: number;
}

const DEFAULT_STATE: ButtonUIState = { pressed: false, pressedAt: -1 };
const PRESS_DURATION = 4;

const VARIANTS = {
  primary: { bg: C.brand, color: "#FFFFFF", border: "none" },
  secondary: { bg: "transparent", color: C.text, border: `1px solid ${C.border}` },
  ghost: { bg: "transparent", color: C.textMuted, border: "none" },
} as const;

const SIZES = {
  sm: { fontSize: 12, padding: "4px 12px" },
  md: { fontSize: 13, padding: "7px 16px" },
} as const;

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  size = "md",
  id,
  style,
}) => {
  const frame = useCurrentFrame();
  const { pressedAt } = useUIState(id ?? "", DEFAULT_STATE);

  const v = VARIANTS[variant];
  const s = SIZES[size];

  let scale = 1;
  let brightnessShift = 0;
  if (pressedAt >= 0) {
    const elapsed = frame - pressedAt;
    if (elapsed >= 0 && elapsed <= PRESS_DURATION) {
      const pressProgress = interpolate(elapsed, [0, PRESS_DURATION], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      scale = 1 - 0.04 * pressProgress;
      brightnessShift = -0.08 * pressProgress;
    }
  }

  return (
    <div
      data-cursor-target={id}
      data-editor-id={id}
      data-editor-type="button"
      style={{
        display: "inline-block",
        backgroundColor: v.bg,
        color: v.color,
        border: v.border,
        borderRadius: 6,
        fontSize: s.fontSize,
        fontWeight: 600,
        fontFamily: F.sans,
        padding: s.padding,
        cursor: "default",
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        filter: brightnessShift !== 0 ? `brightness(${1 + brightnessShift})` : undefined,
        transformOrigin: "center center",
        ...style,
      }}
    >
      {label}
    </div>
  );
};
