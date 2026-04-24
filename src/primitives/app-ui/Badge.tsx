import React from "react";
import { C, F } from "../../tokens";

export interface BadgeProps {
  label: string;
  color?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = C.brand,
  id,
  style,
}) => (
  <span
    data-cursor-target={id}
    data-editor-id={id}
    data-editor-type="badge"
    style={{
      display: "inline-block",
      fontSize: 11,
      fontWeight: 600,
      fontFamily: F.sans,
      color,
      backgroundColor: `${color}22`,
      borderRadius: 10,
      padding: "2px 8px",
      ...style,
    }}
  >
    {label}
  </span>
);
