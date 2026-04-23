import React from "react";
import { C, F } from "../../tokens";

export interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 28,
  color = C.brand,
  id,
  style,
}) => (
  <div
    data-cursor-target={id}
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#FFFFFF",
      fontSize: size * 0.42,
      fontWeight: 700,
      fontFamily: F.sans,
      flexShrink: 0,
      ...style,
    }}
  >
    {name.charAt(0).toUpperCase()}
  </div>
);
