import React from "react";
import { C, F } from "../../tokens";

export interface PanelProps {
  title?: string;
  subtitle?: string;
  accent?: string;
  padding?: number;
  id?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  accent = C.brandLight,
  padding = 16,
  id,
  children,
  style,
}) => (
  <div
    data-cursor-target={id}
    style={{
      backgroundColor: C.bgLight,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding,
      overflow: "hidden",
      ...style,
    }}
  >
    {title && (
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: accent,
          fontFamily: F.sans,
          marginBottom: subtitle ? 4 : 12,
        }}
      >
        {title}
      </div>
    )}
    {subtitle && (
      <div
        style={{
          fontSize: 13,
          color: C.textMuted,
          fontFamily: F.sans,
          lineHeight: 1.5,
          marginBottom: 12,
        }}
      >
        {subtitle}
      </div>
    )}
    {children}
  </div>
);
