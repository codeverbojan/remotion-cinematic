import { useState, useCallback, useRef } from "react";
import type { HandleDirection } from "./SelectionBox";

export interface EditorSelection {
  id: string;
  type: string;
}

export interface DragState {
  kind: "move" | "resize";
  direction?: HandleDirection;
  startMouseX: number;
  startMouseY: number;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
}

export function useEditorState() {
  const [selection, setSelection] = useState<EditorSelection | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (dragRef.current) return;
    const target = (e.target as HTMLElement).closest("[data-editor-id]");
    if (target) {
      const id = target.getAttribute("data-editor-id");
      const type = target.getAttribute("data-editor-type");
      if (id) {
        setSelection({ id, type: type ?? "unknown" });
        return;
      }
    }
    setSelection(null);
  }, []);

  const clearSelection = useCallback(() => setSelection(null), []);

  const startDrag = useCallback(
    (kind: "move" | "resize", startX: number, startY: number, startW: number, startH: number, mouseX: number, mouseY: number, direction?: HandleDirection) => {
      const state: DragState = {
        kind,
        direction,
        startMouseX: mouseX,
        startMouseY: mouseY,
        startX,
        startY,
        startW,
        startH,
      };
      dragRef.current = state;
      setDragState(state);
    },
    [],
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setDragState(null);
  }, []);

  return { selection, handleClick, clearSelection, dragState, dragRef, startDrag, endDrag };
}
