import React from "react";
import { C, F } from "../../tokens";

export interface DataTableProps {
  columns: string[];
  rows: string[][];
  statusColumn?: number;
  statusColors?: Record<string, string>;
  compact?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

const DEFAULT_STATUS_COLORS: Record<string, string> = {
  Pending: C.warning,
  Shipped: C.success,
  Approved: C.success,
  Active: C.success,
  Review: C.accent,
  Inactive: C.textDim,
  Error: C.error,
  Overdue: C.error,
};

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  statusColumn,
  statusColors,
  compact = false,
  id,
  style,
}) => {
  const colors = { ...DEFAULT_STATUS_COLORS, ...statusColors };
  const cellPad = compact ? "3px 0" : "4px 0";

  return (
    <div
      data-cursor-target={id}
      style={{ fontFamily: F.mono, fontSize: 12, color: C.text, ...style }}
    >
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: 6,
          marginBottom: 4,
        }}
      >
        {columns.map((col) => (
          <div key={col} style={{ flex: 1, fontWeight: 700, color: C.textMuted }}>
            {col}
          </div>
        ))}
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            padding: cellPad,
            borderBottom: `1px solid ${C.border}22`,
          }}
        >
          {row.map((cell, j) => (
            <div
              key={j}
              style={{
                flex: 1,
                color:
                  j === statusColumn
                    ? colors[cell] ?? C.textMuted
                    : C.text,
              }}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
