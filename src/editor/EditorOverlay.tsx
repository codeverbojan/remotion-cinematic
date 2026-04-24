import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getRemotionEnvironment, useCurrentFrame } from "remotion";
import { updateDefaultProps } from "@remotion/studio";
import { useVideoProps } from "../VideoPropsContext";
import { CursorInteractionProvider } from "../CursorInteractionContext";
import { useEditorState } from "./useEditorState";
import { SelectionBox } from "./SelectionBox";
import { SnapGuides, computeSnapGuides, applySnap } from "./SnapGuides";
import { PropertyPanel } from "./PropertyPanel";
import { CursorPathOverlay } from "./CursorPathOverlay";
import { CursorPathEditor } from "./CursorPathEditor";
import { ElementPalette } from "./ElementPalette";
import type { HandleDirection } from "./SelectionBox";
import type { CinematicProps, WindowLayout } from "../schema";
import type { Guides } from "./SnapGuides";

export const EditorOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const env = getRemotionEnvironment();
  const containerRef = useRef<HTMLDivElement>(null);

  if (!env.isStudio) {
    return <>{children}</>;
  }

  return <EditorOverlayInner containerRef={containerRef}>{children}</EditorOverlayInner>;
};

function updateWindowProps(
  props: CinematicProps,
  windowId: string,
  updates: Partial<WindowLayout>,
) {
  const updated = props.windowLayout.map((w) =>
    w.id === windowId ? { ...w, ...updates } : w,
  );
  updateDefaultProps({
    compositionId: "CinematicDemo",
    defaultProps: () => ({ ...props, windowLayout: updated }),
  });
}

const CANVAS_W = 1920;
const CANVAS_H = 1080;
const MIN_SIZE = 50;

function shouldEditEnd(win: WindowLayout, frame: number): boolean {
  const hasEnd = win.endX !== undefined || win.endY !== undefined || win.endW !== undefined || win.endH !== undefined;
  if (!hasEnd) return false;
  const animStart = win.animateAt ?? (win.enterAt + win.enterDuration);
  return frame >= animStart;
}

const EditorOverlayInner: React.FC<{
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ children, containerRef }) => {
  const props = useVideoProps();
  const frame = useCurrentFrame();
  const { selection, handleClick, clearSelection, dragState, dragRef, startDrag, endDrag } = useEditorState();
  const propsRef = useRef(props);
  propsRef.current = props;
  const frameRef = useRef(frame);
  frameRef.current = frame;
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const [guides, setGuides] = useState<Guides>({ x: [], y: [] });
  const [showCursorPath, setShowCursorPath] = useState(false);
  const handleCursorClick = useCallback(() => {
    setShowCursorPath((prev) => !prev);
  }, []);
  const cursorInteraction = useMemo(
    () => ({ onCursorClick: handleCursorClick }),
    [handleCursorClick],
  );
  const didDragRef = useRef(false);
  const editingEndRef = useRef(false);
  const dragOverrideRef = useRef<{ id: string; x: number; y: number; w: number; h: number; editingEnd: boolean } | null>(null);

  const getScaleFactor = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 1;
    return container.getBoundingClientRect().width / CANVAS_W;
  }, [containerRef]);

  const handleMoveStart = useCallback(
    (e: React.MouseEvent) => {
      const sel = selectionRef.current;
      if (!sel) return;
      const win = propsRef.current.windowLayout.find((w) => w.id === sel.id);
      if (!win) return;
      didDragRef.current = false;
      const editEnd = shouldEditEnd(win, frameRef.current);
      editingEndRef.current = editEnd;
      if (editEnd) {
        startDrag("move", win.endX ?? win.startX, win.endY ?? win.startY, win.endW ?? win.startW, win.endH ?? win.startH, e.clientX, e.clientY);
      } else {
        startDrag("move", win.startX, win.startY, win.startW, win.startH, e.clientX, e.clientY);
      }
    },
    [startDrag],
  );

  const handleResizeStart = useCallback(
    (dir: HandleDirection, e: React.MouseEvent) => {
      const sel = selectionRef.current;
      if (!sel) return;
      const win = propsRef.current.windowLayout.find((w) => w.id === sel.id);
      if (!win) return;
      didDragRef.current = false;
      const editEnd = shouldEditEnd(win, frameRef.current);
      editingEndRef.current = editEnd;
      if (editEnd) {
        startDrag("resize", win.endX ?? win.startX, win.endY ?? win.startY, win.endW ?? win.startW, win.endH ?? win.startH, e.clientX, e.clientY, dir);
      } else {
        startDrag("resize", win.startX, win.startY, win.startW, win.startH, e.clientX, e.clientY, dir);
      }
    },
    [startDrag],
  );

  const wrappedHandleClick = useCallback(
    (e: React.MouseEvent) => {
      if (didDragRef.current) {
        didDragRef.current = false;
        return;
      }
      handleClick(e);
    },
    [handleClick],
  );

  const applyDragToDOM = useCallback((id: string, x: number, y: number, w: number, h: number) => {
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-editor-id="${CSS.escape(id)}"]`);
    if (!el?.parentElement) return;
    const wrapper = el.parentElement as HTMLElement;
    wrapper.style.left = `${x}px`;
    wrapper.style.top = `${y}px`;
    wrapper.style.width = `${w}px`;
    wrapper.style.height = `${h}px`;
  }, [containerRef]);

  // After React re-renders during drag, reapply DOM override so React doesn't reset positions
  useLayoutEffect(() => {
    const override = dragOverrideRef.current;
    if (!override) return;
    applyDragToDOM(override.id, override.x, override.y, override.w, override.h);
  });

  // Clear override once props reflect the persisted position
  useEffect(() => {
    const override = dragOverrideRef.current;
    if (!override) return;
    const win = props.windowLayout.find((w) => w.id === override.id);
    if (!win) return;
    if (override.editingEnd) {
      if ((win.endX ?? win.startX) === override.x && (win.endY ?? win.startY) === override.y &&
          (win.endW ?? win.startW) === override.w && (win.endH ?? win.startH) === override.h) {
        dragOverrideRef.current = null;
      }
    } else {
      if (win.startX === override.x && win.startY === override.y &&
          win.startW === override.w && win.startH === override.h) {
        dragOverrideRef.current = null;
      }
    }
  }, [props.windowLayout]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const sel = selectionRef.current;
      if (!sel) return;
      didDragRef.current = true;

      const scale = getScaleFactor();
      const dx = (e.clientX - drag.startMouseX) / scale;
      const dy = (e.clientY - drag.startMouseY) / scale;

      let newX = drag.startX;
      let newY = drag.startY;
      let newW = drag.startW;
      let newH = drag.startH;

      if (drag.kind === "move") {
        newX = Math.round(drag.startX + dx);
        newY = Math.round(drag.startY + dy);

        const otherWindows = propsRef.current.windowLayout.filter((w) => w.id !== sel.id);
        const newGuides = computeSnapGuides(
          { x: newX, y: newY, w: newW, h: newH },
          otherWindows, CANVAS_W, CANVAS_H,
        );
        setGuides(newGuides);

        const snapped = applySnap({ x: newX, y: newY, w: newW, h: newH }, newGuides);
        newX = snapped.x;
        newY = snapped.y;
      } else if (drag.kind === "resize") {
        const dir = drag.direction!;
        if (dir.includes("e")) newW = Math.max(MIN_SIZE, Math.round(drag.startW + dx));
        if (dir.includes("w")) {
          const dw = Math.round(dx);
          newW = Math.max(MIN_SIZE, drag.startW - dw);
          newX = drag.startX + (drag.startW - newW);
        }
        if (dir.includes("s")) newH = Math.max(MIN_SIZE, Math.round(drag.startH + dy));
        if (dir.includes("n")) {
          const dh = Math.round(dy);
          newH = Math.max(MIN_SIZE, drag.startH - dh);
          newY = drag.startY + (drag.startH - newH);
        }
        newW = Math.max(MIN_SIZE, newW);
        newH = Math.max(MIN_SIZE, newH);
      }

      // Instant visual feedback via DOM manipulation
      applyDragToDOM(sel.id, newX, newY, newW, newH);
      dragOverrideRef.current = { id: sel.id, x: newX, y: newY, w: newW, h: newH, editingEnd: editingEndRef.current };
    };

    const onMouseUp = () => {
      if (dragRef.current) {
        const override = dragOverrideRef.current;
        if (override) {
          if (override.editingEnd) {
            updateWindowProps(propsRef.current, override.id, {
              endX: override.x,
              endY: override.y,
              endW: override.w,
              endH: override.h,
            });
          } else {
            updateWindowProps(propsRef.current, override.id, {
              startX: override.x,
              startY: override.y,
              startW: override.w,
              startH: override.h,
            });
          }
        }
        setGuides({ x: [], y: [] });
        endDrag();
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragRef, endDrag, getScaleFactor, applyDragToDOM]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const sel = selectionRef.current;
      if (!sel) return;

      if (e.key === "Escape") {
        clearSelection();
        return;
      }

      const isInput = (e.target as HTMLElement).tagName === "INPUT"
        || (e.target as HTMLElement).tagName === "TEXTAREA"
        || (e.target as HTMLElement).tagName === "SELECT";
      if (isInput) return;

      const win = propsRef.current.windowLayout.find((w) => w.id === sel.id);
      if (!win) return;

      const step = e.shiftKey ? 10 : 1;
      const editEnd = shouldEditEnd(win, frameRef.current);

      if (editEnd) {
        const curX = win.endX ?? win.startX;
        const curY = win.endY ?? win.startY;
        switch (e.key) {
          case "ArrowLeft": e.preventDefault(); updateWindowProps(propsRef.current, sel.id, { endX: curX - step }); break;
          case "ArrowRight": e.preventDefault(); updateWindowProps(propsRef.current, sel.id, { endX: curX + step }); break;
          case "ArrowUp": e.preventDefault(); updateWindowProps(propsRef.current, sel.id, { endY: curY - step }); break;
          case "ArrowDown": e.preventDefault(); updateWindowProps(propsRef.current, sel.id, { endY: curY + step }); break;
        }
      } else {
        switch (e.key) {
          case "ArrowLeft": e.preventDefault(); updateWindowProps(propsRef.current, sel.id, { startX: win.startX - step }); break;
          case "ArrowRight": e.preventDefault(); updateWindowProps(propsRef.current, sel.id, { startX: win.startX + step }); break;
          case "ArrowUp": e.preventDefault(); updateWindowProps(propsRef.current, sel.id, { startY: win.startY - step }); break;
          case "ArrowDown": e.preventDefault(); updateWindowProps(propsRef.current, sel.id, { startY: win.startY + step }); break;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSelection]);

  const isEditableWindow = selection && props.windowLayout.some((w) => w.id === selection.id);

  return (
    <div
      ref={containerRef}
      onClick={wrappedHandleClick}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <CursorInteractionProvider value={cursorInteraction}>
        {children}
      </CursorInteractionProvider>

      {selection && (
        <SelectionBox
          targetId={selection.id}
          containerRef={containerRef}
          onResizeStart={isEditableWindow ? handleResizeStart : undefined}
          onMoveStart={isEditableWindow ? handleMoveStart : undefined}
        />
      )}

      {showCursorPath && <CursorPathOverlay props={props} frame={frame} />}
      <CursorPathEditor props={props} frame={frame} containerRef={containerRef} showCursorPath={showCursorPath} onTogglePath={setShowCursorPath} />
      <ElementPalette props={props} frame={frame} />

      {dragState && <SnapGuides guides={guides} canvasW={CANVAS_W} canvasH={CANVAS_H} />}

      {selection && (
        <PropertyPanel
          selectedId={selection.id}
          selectedType={selection.type}
          props={props}
          containerRef={containerRef}
        />
      )}
    </div>
  );
};
