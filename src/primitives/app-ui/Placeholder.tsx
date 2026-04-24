import React from "react";
import { C, F } from "../../tokens";

export interface PlaceholderProps {
  label?: string;
  height?: number;
  aspectRatio?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const Placeholder: React.FC<PlaceholderProps> = ({
  label = "Product screenshot placeholder",
  height,
  aspectRatio,
  id,
  style,
}) => (
  <div
    data-cursor-target={id}
    data-editor-id={id}
    data-editor-type="placeholder"
    style={{
      height: height ?? (aspectRatio ? undefined : 200),
      aspectRatio,
      borderRadius: 8,
      backgroundColor: C.bgLight,
      border: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: C.textDim,
      fontSize: 14,
      fontFamily: F.mono,
      ...style,
    }}
  >
    {label}
  </div>
);
