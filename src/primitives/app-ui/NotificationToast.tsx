import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useUIState } from "../../engine/ui-state";
import { C, F, EASE } from "../../tokens";

export interface NotificationToastProps {
  title: string;
  body: string;
  accent?: string;
  id?: string;
  style?: React.CSSProperties;
}

interface ToastUIState {
  visible: boolean;
  changedAt: number;
}

const DEFAULT_STATE: ToastUIState = { visible: true, changedAt: -1 };
const TRANSITION_FRAMES = 8;

export const NotificationToast: React.FC<NotificationToastProps> = ({
  title,
  body,
  accent = C.text,
  id,
  style,
}) => {
  const frame = useCurrentFrame();
  const { visible, changedAt } = useUIState(id ?? "", DEFAULT_STATE);

  let slideX = 0;
  let opacity = 1;
  if (changedAt >= 0) {
    const elapsed = frame - changedAt;
    if (visible) {
      opacity = interpolate(elapsed, [0, TRANSITION_FRAMES], [0, 1], EASE.snappy);
      slideX = interpolate(elapsed, [0, TRANSITION_FRAMES], [80, 0], EASE.snappy);
    } else {
      opacity = interpolate(elapsed, [0, TRANSITION_FRAMES], [1, 0], EASE.snappy);
      slideX = interpolate(elapsed, [0, TRANSITION_FRAMES], [0, 80], EASE.snappy);
    }
  } else if (!visible) {
    opacity = 0;
  }

  if (opacity <= 0) return null;

  return (
    <div
      data-cursor-target={id}
      data-editor-id={id}
      data-editor-type="notification-toast"
      style={{
        width: 360,
        padding: "14px 18px",
        borderRadius: 10,
        backgroundColor: C.surface,
        border: `1px solid ${C.windowBorder}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        opacity,
        transform: slideX !== 0 ? `translateX(${Math.round(slideX)}px)` : undefined,
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
};
