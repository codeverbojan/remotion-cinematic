import React from "react";
import { useUIState } from "../../engine/ui-state";
import { C, F } from "../../tokens";

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  id?: string;
  style?: React.CSSProperties;
}

interface SearchUIState {
  value: string;
}

const DEFAULT_STATE: SearchUIState = { value: "" };

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  value: valueProp,
  id,
  style,
}) => {
  const uiState = useUIState(id ?? "", DEFAULT_STATE);
  const displayValue = uiState.value || valueProp;

  return (
    <div
      data-cursor-target={id}
      data-editor-id={id}
      data-editor-type="search-bar"
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
        color: displayValue ? C.text : C.textDim,
        minWidth: 180,
        ...style,
      }}
    >
      <span style={{ fontSize: 14, opacity: 0.5 }}>⌕</span>
      <span>{displayValue ?? placeholder}</span>
    </div>
  );
};
