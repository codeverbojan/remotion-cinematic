import React from "react";
import { C, F } from "../../tokens";

export interface ListItem {
  label: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
}

export interface ListItemsProps {
  items: ListItem[];
  id?: string;
  style?: React.CSSProperties;
}

export const ListItems: React.FC<ListItemsProps> = ({
  items,
  id,
  style,
}) => (
  <div data-cursor-target={id} data-editor-id={id} data-editor-type="list-items" style={{ fontFamily: F.sans, ...style }}>
    {items.map((item, i) => (
      <div
        key={i}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 0",
          borderBottom: i < items.length - 1 ? `1px solid ${C.border}22` : undefined,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{item.label}</div>
          {item.description && (
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
              {item.description}
            </div>
          )}
        </div>
        {item.badge && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: item.badgeColor ?? C.textMuted,
              backgroundColor: `${item.badgeColor ?? C.textMuted}22`,
              borderRadius: 10,
              padding: "2px 8px",
            }}
          >
            {item.badge}
          </span>
        )}
      </div>
    ))}
  </div>
);
