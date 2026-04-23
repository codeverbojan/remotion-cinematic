import React from "react";
import { C } from "../../tokens";

export interface AppShellProps {
  sidebar?: React.ReactNode;
  sidebarWidth?: number;
  sidebarPosition?: "left" | "right";
  topBar?: React.ReactNode;
  topBarHeight?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const AppShell: React.FC<AppShellProps> = ({
  sidebar,
  sidebarWidth = 220,
  sidebarPosition = "left",
  topBar,
  topBarHeight = 48,
  children,
  style,
}) => {
  const sidebarEl = sidebar ? (
    <div
      style={{
        width: sidebarWidth,
        flexShrink: 0,
        backgroundColor: C.bgLight,
        borderRight: sidebarPosition === "left" ? `1px solid ${C.border}` : undefined,
        borderLeft: sidebarPosition === "right" ? `1px solid ${C.border}` : undefined,
        overflow: "hidden",
      }}
    >
      {sidebar}
    </div>
  ) : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: sidebarPosition === "right" ? "row-reverse" : "row",
        width: "100%",
        height: "100%",
        backgroundColor: C.bg,
        overflow: "hidden",
        ...style,
      }}
    >
      {sidebarEl}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {topBar && (
          <div
            style={{
              height: topBarHeight,
              flexShrink: 0,
              backgroundColor: C.surface,
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
            }}
          >
            {topBar}
          </div>
        )}
        <div style={{ flex: 1, overflow: "hidden" }}>{children}</div>
      </div>
    </div>
  );
};
