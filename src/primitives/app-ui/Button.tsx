import React from "react";
import { C, F } from "../../tokens";

export interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  id?: string;
  style?: React.CSSProperties;
}

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
  const v = VARIANTS[variant];
  const s = SIZES[size];

  return (
    <div
      data-cursor-target={id}
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
        ...style,
      }}
    >
      {label}
    </div>
  );
};
