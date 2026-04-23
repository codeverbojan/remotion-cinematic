import React from "react";
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

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  variant = "underline",
  id,
  style,
}) => (
  <div
    data-cursor-target={id}
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
      if (variant === "pill") {
        return (
          <div
            key={i}
            style={{
              padding: "5px 14px",
              borderRadius: 6,
              fontWeight: tab.active ? 600 : 400,
              color: tab.active ? C.text : C.textMuted,
              backgroundColor: tab.active ? C.surface : "transparent",
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
            fontWeight: tab.active ? 600 : 400,
            color: tab.active ? C.text : C.textMuted,
            borderBottom: tab.active ? `2px solid ${C.brand}` : "2px solid transparent",
            marginBottom: -1,
          }}
        >
          {tab.label}
        </div>
      );
    })}
  </div>
);
