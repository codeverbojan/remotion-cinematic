import React from "react";
import { C, F } from "../../tokens";

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  value,
  id,
  style,
}) => (
  <div
    data-cursor-target={id}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      backgroundColor: C.bgLight,
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      padding: "6px 12px",
      fontSize: 13,
      fontFamily: F.sans,
      color: value ? C.text : C.textDim,
      minWidth: 180,
      ...style,
    }}
  >
    <span style={{ fontSize: 14, opacity: 0.5 }}>⌕</span>
    <span>{value ?? placeholder}</span>
  </div>
);
