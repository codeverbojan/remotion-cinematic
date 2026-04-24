import React, { useEffect, useRef, useState } from "react";

export type HandleDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface SelectionBoxProps {
  targetId: string;
  containerRef: React.RefObject<HTMLElement | null>;
  onResizeStart?: (dir: HandleDirection, e: React.MouseEvent) => void;
  onMoveStart?: (e: React.MouseEvent) => void;
}

const HANDLE_SIZE = 8;

const HANDLE_POSITIONS: { dir: HandleDirection; cursor: string; style: React.CSSProperties }[] = [
  { dir: "nw", cursor: "nwse-resize", style: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 } },
  { dir: "n", cursor: "ns-resize", style: { top: -HANDLE_SIZE / 2, left: "50%", marginLeft: -HANDLE_SIZE / 2 } },
  { dir: "ne", cursor: "nesw-resize", style: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 } },
  { dir: "e", cursor: "ew-resize", style: { top: "50%", marginTop: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 } },
  { dir: "se", cursor: "nwse-resize", style: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 } },
  { dir: "s", cursor: "ns-resize", style: { bottom: -HANDLE_SIZE / 2, left: "50%", marginLeft: -HANDLE_SIZE / 2 } },
  { dir: "sw", cursor: "nesw-resize", style: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 } },
  { dir: "w", cursor: "ew-resize", style: { top: "50%", marginTop: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 } },
];

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  targetId,
  containerRef,
  onResizeStart,
  onMoveStart,
}) => {
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const el = container.querySelector(`[data-editor-id="${CSS.escape(targetId)}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      const scale = cRect.width / 1920;
      setRect({
        left: (eRect.left - cRect.left) / scale,
        top: (eRect.top - cRect.top) / scale,
        width: eRect.width / scale,
        height: eRect.height / scale,
      });
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetId, containerRef]);

  if (!rect) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: rect.left - 2,
        top: rect.top - 2,
        width: rect.width + 4,
        height: rect.height + 4,
        border: "2px solid #4F8EF7",
        borderRadius: 4,
        pointerEvents: "none",
        zIndex: 99999,
      }}
    >
      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: -22,
          left: 0,
          backgroundColor: "#4F8EF7",
          color: "#fff",
          fontSize: 11,
          fontFamily: "system-ui, sans-serif",
          padding: "2px 6px",
          borderRadius: "3px 3px 0 0",
          whiteSpace: "nowrap",
        }}
      >
        {targetId}
      </div>

      {/* Move area — the interior of the selection box */}
      {onMoveStart && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            cursor: "move",
            pointerEvents: "auto",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMoveStart(e);
          }}
        />
      )}

      {/* Resize handles — only shown when resize is wired up */}
      {onResizeStart && HANDLE_POSITIONS.map(({ dir, cursor, style }) => (
        <div
          key={dir}
          data-handle={dir}
          style={{
            position: "absolute",
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            backgroundColor: "#fff",
            border: "1.5px solid #4F8EF7",
            borderRadius: 2,
            cursor,
            pointerEvents: "auto",
            zIndex: 1,
            ...style,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onResizeStart(dir, e);
          }}
        />
      ))}
    </div>
  );
};
