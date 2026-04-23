import React from "react";
import { C, F } from "../../tokens";

export interface NavItem {
  label: string;
  icon?: string;
  active?: boolean;
  badge?: string;
}

export interface SidebarNavProps {
  items: NavItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  items,
  header,
  footer,
  id,
  style,
}) => (
  <div
    data-cursor-target={id}
    style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: "12px 0",
      fontFamily: F.sans,
      ...style,
    }}
  >
    {header && (
      <div style={{ padding: "8px 16px 16px", borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
        {header}
      </div>
    )}
    <div style={{ flex: 1, overflow: "hidden" }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            margin: "2px 8px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: item.active ? 600 : 400,
            color: item.active ? C.text : C.textMuted,
            backgroundColor: item.active ? `${C.brand}22` : "transparent",
            cursor: "default",
          }}
        >
          {item.icon && (
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                backgroundColor: item.active ? `${C.brand}44` : `${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
          )}
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.badge && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.text,
                backgroundColor: C.brand,
                borderRadius: 10,
                padding: "1px 7px",
                minWidth: 18,
                textAlign: "center",
              }}
            >
              {item.badge}
            </span>
          )}
        </div>
      ))}
    </div>
    {footer && (
      <div style={{ padding: "12px 16px 4px", borderTop: `1px solid ${C.border}`, marginTop: 8 }}>
        {footer}
      </div>
    )}
  </div>
);
