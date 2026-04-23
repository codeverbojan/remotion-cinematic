import React from "react";
import { C, F } from "../../tokens";

export interface NotificationToastProps {
  title: string;
  body: string;
  accent?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  title,
  body,
  accent = C.text,
  id,
  style,
}) => (
  <div
    data-cursor-target={id}
    style={{
      width: 360,
      padding: "14px 18px",
      borderRadius: 10,
      backgroundColor: C.surface,
      border: `1px solid ${C.windowBorder}`,
      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      ...style,
    }}
  >
    <div style={{ fontSize: 14, fontWeight: 600, color: accent, fontFamily: F.sans }}>
      {title}
    </div>
    <div style={{ fontSize: 12, color: C.textMuted, fontFamily: F.sans, marginTop: 4 }}>
      {body}
    </div>
  </div>
);
