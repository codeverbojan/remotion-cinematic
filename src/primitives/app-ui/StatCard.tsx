import React from "react";
import { C, F } from "../../tokens";

export interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaColor?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  delta,
  deltaColor,
  id,
  style,
}) => {
  const resolvedDeltaColor =
    deltaColor ??
    (delta?.startsWith("+") ? C.success : delta?.startsWith("-") ? C.error : C.textMuted);

  return (
    <div
      data-cursor-target={id}
      style={{
        backgroundColor: C.bgLight,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: 16,
        fontFamily: F.sans,
        ...style,
      }}
    >
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{value}</span>
        {delta && (
          <span style={{ fontSize: 12, fontWeight: 600, color: resolvedDeltaColor }}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
};
