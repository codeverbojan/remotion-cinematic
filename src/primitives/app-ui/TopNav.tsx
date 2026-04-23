import React from "react";
import { F } from "../../tokens";

export interface TopNavProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const TopNav: React.FC<TopNavProps> = ({
  left,
  right,
  children,
  style,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      height: "100%",
      gap: 12,
      fontFamily: F.sans,
      fontSize: 13,
      ...style,
    }}
  >
    {left && <div style={{ flexShrink: 0 }}>{left}</div>}
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>{children}</div>
    {right && <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>{right}</div>}
  </div>
);
