import React from "react";
import { useUIState } from "../../engine/ui-state";
import { C, F } from "../../tokens";

export interface PanelProps {
  title?: string;
  subtitle?: string;
  accent?: string;
  padding?: number;
  id?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

interface PanelUIState {
  expanded: boolean;
}

const DEFAULT_STATE: PanelUIState = { expanded: true };

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  accent = C.brandLight,
  padding = 16,
  id,
  children,
  style,
}) => {
  const { expanded } = useUIState(id ?? "", DEFAULT_STATE);

  return (
    <div
      data-cursor-target={id}
      data-editor-id={id}
      data-editor-type="panel"
      style={{
        backgroundColor: C.bgLight,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding,
        overflow: "hidden",
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: accent,
            fontFamily: F.sans,
            marginBottom: expanded && subtitle ? 4 : expanded ? 12 : 0,
          }}
        >
          {title}
        </div>
      )}
      {expanded && subtitle && (
        <div
          style={{
            fontSize: 13,
            color: C.textMuted,
            fontFamily: F.sans,
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        >
          {subtitle}
        </div>
      )}
      {expanded && children}
    </div>
  );
};
