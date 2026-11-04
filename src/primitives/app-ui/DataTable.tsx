import React from "react";
import { useUIState } from "../../engine/ui-state";
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

interface TableUIState {
  selectedRow: number | null;
  highlightedCell: [number, number] | null;
}

const DEFAULT_STATE: TableUIState = { selectedRow: null, highlightedCell: null };

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
  const { selectedRow, highlightedCell } = useUIState(id ?? "", DEFAULT_STATE);
  const colors = { ...DEFAULT_STATUS_COLORS, ...statusColors };
  const cellPad = compact ? "3px 0" : "4px 0";

  return (
    <div
      data-cursor-target={id}
      data-editor-id={id}
      data-editor-type="data-table"
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
          <div key={col} style={{ flex: 1, minWidth: 0, paddingRight: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700, color: C.textMuted }}>
            {col}
          </div>
        ))}
      </div>
      {rows.map((row, ri) => {
        const isSelected = selectedRow === ri;
        return (
          <div
            key={ri}
            style={{
              display: "flex",
              padding: cellPad,
              borderBottom: `1px solid color-mix(in srgb, ${C.border} 13%, transparent)`,
              backgroundColor: isSelected ? `color-mix(in srgb, ${C.brand} 9%, transparent)` : "transparent",
              borderRadius: isSelected ? 4 : 0,
            }}
          >
            {row.map((cell, ci) => {
              const isCellHighlighted =
                highlightedCell !== null &&
                highlightedCell[0] === ri &&
                highlightedCell[1] === ci;
              return (
                <div
                  key={ci}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    paddingRight: 8,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color:
                      ci === statusColumn
                        ? colors[cell] ?? C.textMuted
                        : C.text,
                    outline: isCellHighlighted
                      ? `1px solid color-mix(in srgb, ${C.brand} 53%, transparent)`
                      : undefined,
                    borderRadius: isCellHighlighted ? 3 : undefined,
                    padding: isCellHighlighted ? "0 4px" : undefined,
                    margin: isCellHighlighted ? "0 -4px" : undefined,
                  }}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
