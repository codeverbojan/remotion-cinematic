import React from "react";

export interface PanelGridProps {
  columns?: number | string;
  rows?: number | string;
  gap?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const PanelGrid: React.FC<PanelGridProps> = ({
  columns = 2,
  rows,
  gap = 16,
  children,
  style,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: typeof columns === "number" ? `repeat(${columns}, 1fr)` : columns,
      gridTemplateRows: rows
        ? typeof rows === "number"
          ? `repeat(${rows}, 1fr)`
          : rows
        : undefined,
      gap,
      ...style,
    }}
  >
    {children}
  </div>
);
