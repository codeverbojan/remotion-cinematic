import React from "react";
import { useUIState } from "../../engine/ui-state";
import { C, F } from "../../tokens";

export interface Tab {
  label: string;
  active?: boolean;
}

export interface TabBarProps {
  tabs: Tab[];
  variant?: "underline" | "pill";
  id?: string;
  style?: React.CSSProperties;
}

interface TabUIState {
  activeTab: string;
}

const DEFAULT_STATE: TabUIState = { activeTab: "" };

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  variant = "underline",
  id,
  style,
}) => {
  const { activeTab } = useUIState(id ?? "", DEFAULT_STATE);

  return (
    <div
      data-cursor-target={id}
      data-editor-id={id}
      data-editor-type="tab-bar"
      style={{
        display: "flex",
        gap: variant === "pill" ? 6 : 0,
        fontFamily: F.sans,
        fontSize: 13,
        borderBottom: variant === "underline" ? `1px solid ${C.border}` : undefined,
        ...style,
      }}
    >
      {tabs.map((tab, i) => {
        const active = activeTab ? tab.label === activeTab : !!tab.active;

        if (variant === "pill") {
          return (
            <div
              key={i}
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                fontWeight: active ? 600 : 400,
                color: active ? C.text : C.textMuted,
                backgroundColor: active ? C.surface : "transparent",
              }}
            >
              {tab.label}
            </div>
          );
        }

        return (
          <div
            key={i}
            style={{
              padding: "8px 16px",
              fontWeight: active ? 600 : 400,
              color: active ? C.text : C.textMuted,
              borderBottom: active ? `2px solid ${C.brand}` : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </div>
        );
      })}
    </div>
  );
};
