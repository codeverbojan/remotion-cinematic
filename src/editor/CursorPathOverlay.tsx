import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { resolveWindowPose, resolveAnchorFromRect, getSceneAtFrame, interpolateCurve } from "../engine";
import { persistUpdate } from "./updateProps";
import { setPendingDrag, clearPendingDrag } from "./pendingCursorEdits";
import type { AnchorPoint, CurveType } from "../engine";
import type { CinematicProps, CursorPathEntry } from "../schema";
import type { WindowLayout } from "../schema";

const CANVAS_W = 1920;
const CANVAS_H = 1080;

interface CursorPathOverlayProps {
  props: CinematicProps;
  frame: number;
  interactive?: boolean;
}

interface ResolvedWaypoint {
  x: number;
  y: number;
  action: string;
  at: number;
  target?: string;
  index: number;
  curve?: CurveType;
}

function resolveEntryAnchor(entry: CinematicProps["cursorPath"][0]): AnchorPoint {
  if (entry.anchorXPct !== undefined && entry.anchorYPct !== undefined) {
    return { xPct: entry.anchorXPct, yPct: entry.anchorYPct };
  }
  return entry.anchor ?? "center";
}

export function resolveWaypointPosition(
  entry: CinematicProps["cursorPath"][0],
  windows: WindowLayout[],
  entryFrame: number,
): { x: number; y: number } | null {
  if (entry.action === "idle") {
    if (entry.positionX !== undefined && entry.positionY !== undefined) {
      return { x: entry.positionX, y: entry.positionY };
    }
    return null;
  }

  if (entry.action === "drag" && entry.toX !== undefined && entry.toY !== undefined) {
    return { x: entry.toX, y: entry.toY };
  }

  if (entry.positionX !== undefined && entry.positionY !== undefined) {
    return { x: entry.positionX, y: entry.positionY };
  }

  if (entry.target) {
    const win = windows.find((w) => w.id === entry.target);
    if (win) {
      const anchor = resolveEntryAnchor(entry);
      const pose = resolveWindowPose(win, entryFrame);
      const rect = pose.visible
        ? { left: pose.left, top: pose.top, width: pose.width, height: pose.height }
        : { left: win.startX, top: win.startY, width: win.startW, height: win.startH };
      return resolveAnchorFromRect(rect, anchor);
    }
  }

  return null;
}

const PATH_SAMPLES = 16;

function buildCurvePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  curve: CurveType = "arc",
): string {
  const points: string[] = [`M ${from.x} ${from.y}`];
  for (let i = 1; i <= PATH_SAMPLES; i++) {
    const t = i / PATH_SAMPLES;
    const p = interpolateCurve(from, to, t, curve);
    points.push(`L ${Math.round(p.x * 10) / 10} ${Math.round(p.y * 10) / 10}`);
  }
  return points.join(" ");
}

const ACTION_COLORS: Record<string, string> = {
  idle: "#888",
  moveTo: "#6366F1",
  click: "#22D3EE",
  drag: "#F59E0B",
};

const ACTION_SHAPES: Record<string, string> = {
  idle: "◇",
  moveTo: "→",
  click: "●",
  drag: "↔",
};

const TOOLBAR_FONT = "system-ui, -apple-system, sans-serif";
const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "3px 5px",
  fontSize: 11,
  fontFamily: TOOLBAR_FONT,
  backgroundColor: "#2A2A3A",
  color: "#E0E0F0",
  border: "1px solid #444",
  borderRadius: 3,
  outline: "none",
  boxSizing: "border-box",
};

const ACTION_OPTIONS = [
  { value: "idle", label: "Idle" },
  { value: "moveTo", label: "Move To" },
  { value: "click", label: "Click" },
  { value: "drag", label: "Drag" },
];

const CURVE_OPTIONS = [
  { value: "arc", label: "Arc" },
  { value: "linear", label: "Linear" },
  { value: "ease", label: "Ease" },
];

const WaypointEditor: React.FC<{
  entry: CursorPathEntry;
  index: number;
  wp: ResolvedWaypoint;
  props: CinematicProps;
  onClose: () => void;
}> = ({ entry, index, wp, props, onClose }) => {
  const propsRef = useRef(props);
  propsRef.current = props;
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const commitUpdate = useCallback(
    (updates: Partial<CursorPathEntry>) => {
      persistUpdate((prev) => ({
        ...prev,
        cursorPath: prev.cursorPath.map((e, i) =>
          i === index ? { ...e, ...updates } : e,
        ),
      }));
    },
    [index],
  );

  const update = useCallback(
    (updates: Partial<CursorPathEntry>, immediate = false) => {
      clearTimeout(debounceRef.current);
      if (immediate) {
        commitUpdate(updates);
      } else {
        debounceRef.current = setTimeout(() => commitUpdate(updates), 300);
      }
    },
    [commitUpdate],
  );

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const remove = useCallback(() => {
    persistUpdate((prev) => ({
      ...prev,
      cursorPath: prev.cursorPath.filter((_, i) => i !== index),
    }));
    onClose();
  }, [index, onClose]);

  const panelLeft = wp.x > 960 ? -220 : 30;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        left: panelLeft,
        top: -10,
        width: 200,
        backgroundColor: "#1A1A28",
        border: "1px solid #444",
        borderRadius: 6,
        padding: 10,
        boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
        fontFamily: TOOLBAR_FONT,
        fontSize: 11,
        color: "#E0E0F0",
        zIndex: 100002,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 12 }}>Waypoint #{index + 1}</span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontSize: 14,
            padding: 0,
            lineHeight: 1,
          }}
        >
          x
        </button>
      </div>

      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Action</div>
        <select
          value={entry.action}
          onChange={(e) => update({ action: e.target.value as CursorPathEntry["action"] }, true)}
          style={{ ...INPUT_STYLE, appearance: "none", paddingRight: 16 }}
        >
          {ACTION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Frame</div>
        <input
          type="number"
          value={entry.at}
          min={0}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n) && n >= 0) update({ at: Math.round(n) });
          }}
          style={INPUT_STYLE}
        />
      </div>

      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Target</div>
        <select
          value={entry.target ?? ""}
          onChange={(e) =>
            update({ target: e.target.value || undefined }, true)
          }
          style={{ ...INPUT_STYLE, appearance: "none", paddingRight: 16 }}
        >
          <option value="">(none)</option>
          {props.windowLayout.map((w) => (
            <option key={w.id} value={w.id}>{w.title || w.id}</option>
          ))}
        </select>
      </div>

      {(entry.action === "idle" || !entry.target) && (
        <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>X</div>
            <input
              type="number"
              value={entry.positionX ?? ""}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) update({ positionX: Math.round(n) });
              }}
              style={INPUT_STYLE}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Y</div>
            <input
              type="number"
              value={entry.positionY ?? ""}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) update({ positionY: Math.round(n) });
              }}
              style={INPUT_STYLE}
            />
          </div>
        </div>
      )}

      {entry.action === "drag" && (
        <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>To X</div>
            <input
              type="number"
              value={entry.toX ?? ""}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) update({ toX: Math.round(n) });
              }}
              style={INPUT_STYLE}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>To Y</div>
            <input
              type="number"
              value={entry.toY ?? ""}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) update({ toY: Math.round(n) });
              }}
              style={INPUT_STYLE}
            />
          </div>
        </div>
      )}

      {(entry.action === "moveTo" || entry.action === "drag") && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Duration</div>
          <input
            type="number"
            value={entry.duration ?? ""}
            min={1}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n >= 1) update({ duration: Math.round(n) });
            }}
            style={INPUT_STYLE}
          />
        </div>
      )}

      {(entry.action === "moveTo" || entry.action === "drag") && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Curve</div>
          <select
            value={entry.curve ?? "arc"}
            onChange={(e) => update({ curve: e.target.value as CursorPathEntry["curve"] }, true)}
            style={{ ...INPUT_STYLE, appearance: "none", paddingRight: 16 }}
          >
            {CURVE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={remove}
        style={{
          width: "100%",
          padding: "4px 8px",
          fontSize: 10,
          fontFamily: TOOLBAR_FONT,
          backgroundColor: "transparent",
          color: "#EF4444",
          border: "1px solid #444",
          borderRadius: 4,
          cursor: "pointer",
          marginTop: 4,
        }}
      >
        Delete Waypoint
      </button>
    </div>
  );
};

export const CursorPathOverlay: React.FC<CursorPathOverlayProps> = ({
  props,
  frame,
  interactive = true,
}) => {
  const { cursorPath, windowLayout = [] } = props;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const dragPosRef = useRef(dragPos);
  dragPosRef.current = dragPos;
  const didDragRef = useRef(false);
  const [pendingDragStart, setPendingDragStart] = useState<{ index: number; mouseX: number; mouseY: number; wpX: number; wpY: number } | null>(null);
  const DRAG_THRESHOLD = 4; // pixels of mouse movement before committing to a drag
  const overlayRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const pendingDrags = useRef<Record<number, { x: number; y: number }>>({});

  useEffect(() => {
    for (const key of Object.keys(pendingDrags.current)) {
      const idx = Number(key);
      const pos = pendingDrags.current[idx];
      const entry = cursorPath[idx];
      if (entry && entry.positionX === pos.x && entry.positionY === pos.y) {
        delete pendingDrags.current[idx];
        clearPendingDrag(idx);
      }
    }
  }, [cursorPath]);

  const persistDrag = useCallback((index: number, pos: { x: number; y: number }) => {
    pendingDrags.current[index] = pos;
    setPendingDrag(index, pos);
    persistUpdate((prev) => {
      const entry = prev.cursorPath[index];
      if (!entry) return prev;
      return {
        ...prev,
        cursorPath: prev.cursorPath.map((e, i) => {
          if (i !== index) return e;
          const { target: _, ...rest } = e;
          return { ...rest, positionX: pos.x, positionY: pos.y };
        }),
      };
    });
  }, []);

  // Phase 1: pending drag — listen for mousemove to see if threshold is exceeded
  useEffect(() => {
    if (!pendingDragStart) return;
    const pending = pendingDragStart;

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - pending.mouseX;
      const dy = e.clientY - pending.mouseY;
      if (Math.abs(dx) >= DRAG_THRESHOLD || Math.abs(dy) >= DRAG_THRESHOLD) {
        // Commit to drag
        const idx = pending.index;
        const wpPos = { x: pending.wpX, y: pending.wpY };
        setPendingDragStart(null);
        didDragRef.current = false;
        setDragIndex(idx);
        setDragPos(wpPos);
        dragPosRef.current = wpPos;
      }
    };

    const handleUp = () => {
      // Mouse released before threshold — this was a click, not a drag
      setPendingDragStart(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [pendingDragStart]);

  // Phase 2: active drag — track mouse position and persist on release
  useEffect(() => {
    if (dragIndex === null) return;
    const capturedIndex = dragIndex;

    const handleMove = (e: MouseEvent) => {
      const el = overlayRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scale = rect.width / CANVAS_W;
      if (scale <= 0) return;
      const pos = {
        x: Math.max(0, Math.min(CANVAS_W, Math.round((e.clientX - rect.left) / scale))),
        y: Math.max(0, Math.min(CANVAS_H, Math.round((e.clientY - rect.top) / scale))),
      };
      didDragRef.current = true;
      dragPosRef.current = pos;
      setDragPos(pos);
    };

    const handleUp = () => {
      if (didDragRef.current && dragPosRef.current) {
        persistDrag(capturedIndex, dragPosRef.current);
      }
      setDragIndex(null);
      setDragPos(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      didDragRef.current = false;
    };
  }, [dragIndex, persistDrag]);

  const enabledScenes = useMemo(
    () => props.scenes.filter((s) => s.enabled),
    [props.scenes],
  );
  const sceneRange = useMemo(
    () => getSceneAtFrame(enabledScenes, frame, props.overlap),
    [enabledScenes, frame, props.overlap],
  );

  if (!cursorPath || cursorPath.length === 0 || !sceneRange) return null;

  const sceneStart = sceneRange.startFrame;
  const sceneEnd = sceneStart + sceneRange.duration;
  const sceneRelativeFrame = frame - sceneStart;

  const TIME_WINDOW = 50;
  const windowStart = frame - TIME_WINDOW;
  const windowEnd = frame + TIME_WINDOW;

  const sceneEntryIndices: number[] = [];
  for (let i = 0; i < cursorPath.length; i++) {
    const entry = cursorPath[i];
    if (entry.at >= sceneStart && entry.at < sceneEnd) {
      sceneEntryIndices.push(i);
    }
  }

  const inWindowSet = new Set<number>();
  let firstInWindow = sceneEntryIndices.length;
  let lastInWindow = -1;
  for (let si = 0; si < sceneEntryIndices.length; si++) {
    const idx = sceneEntryIndices[si];
    const entry = cursorPath[idx];
    if (entry.at >= windowStart && entry.at <= windowEnd) {
      inWindowSet.add(idx);
      if (si < firstInWindow) firstInWindow = si;
      if (si > lastInWindow) lastInWindow = si;
    }
  }

  if (firstInWindow > 0) inWindowSet.add(sceneEntryIndices[firstInWindow - 1]);
  if (lastInWindow >= 0 && lastInWindow < sceneEntryIndices.length - 1)
    inWindowSet.add(sceneEntryIndices[lastInWindow + 1]);

  const resolveFromDOM = (targetId: string): { x: number; y: number } | null => {
    const overlay = overlayRef.current;
    if (!overlay) return null;
    const container = overlay.parentElement;
    if (!container) return null;
    const el = container.querySelector(`[data-cursor-target="${CSS.escape(targetId)}"]`);
    if (!el) return null;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const scaleX = CANVAS_W / containerRect.width;
    const scaleY = CANVAS_H / containerRect.height;
    return {
      x: (elRect.left - containerRect.left + elRect.width / 2) * scaleX,
      y: (elRect.top - containerRect.top + elRect.height / 2) * scaleY,
    };
  };

  const waypoints: ResolvedWaypoint[] = [];
  for (const idx of sceneEntryIndices) {
    if (!inWindowSet.has(idx)) continue;
    const entry = cursorPath[idx];
    const entrySceneFrame = entry.at - sceneStart;
    let pos = resolveWaypointPosition(entry, windowLayout, entrySceneFrame);
    if (!pos && entry.target) {
      pos = resolveFromDOM(entry.target);
    }
    if (pos) {
      waypoints.push({
        x: pos.x,
        y: pos.y,
        action: entry.action,
        at: entry.at - sceneStart,
        target: entry.target,
        index: idx,
        curve: entry.curve as CurveType | undefined,
      });
    }
  }

  if (waypoints.length === 0) return null;

  const displayWaypoints = waypoints.map((wp) => {
    if (dragIndex === wp.index && dragPos) {
      return { ...wp, x: dragPos.x, y: dragPos.y };
    }
    const pending = pendingDrags.current[wp.index];
    if (pending) {
      return { ...wp, x: pending.x, y: pending.y };
    }
    return wp;
  });

  return (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9998,
      }}
    >
      <svg
        width={CANVAS_W}
        height={CANVAS_H}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {displayWaypoints.map((wp, i) => {
          if (i === 0) return null;
          const prev = displayWaypoints[i - 1];
          const curve = wp.action === "moveTo" || wp.action === "drag" ? wp.curve : undefined;
          const d = buildCurvePath(prev, wp, curve);
          return (
            <path
              key={`path-${wp.at}-${i}`}
              d={d}
              stroke={ACTION_COLORS[wp.action] ?? "#888"}
              strokeWidth={2}
              strokeDasharray="8 4"
              fill="none"
              opacity={0.6}
            />
          );
        })}
      </svg>

      {displayWaypoints.map((wp) => {
        const isSelected = selectedIndex === wp.index;
        const isDragging = dragIndex === wp.index;
        return (
          <div
            key={`wp-${wp.at}-${wp.index}`}
            style={{
              position: "absolute",
              left: `${(wp.x / CANVAS_W) * 100}%`,
              top: `${(wp.y / CANVAS_H) * 100}%`,
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              pointerEvents: interactive ? "auto" : "none",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
            }}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              e.stopPropagation();
              didDragRef.current = false;
              // Don't immediately start dragging — wait for mouse movement
              // past the threshold to distinguish click from drag
              setPendingDragStart({
                index: wp.index,
                mouseX: e.clientX,
                mouseY: e.clientY,
                wpX: wp.x,
                wpY: wp.y,
              });
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!didDragRef.current) {
                setSelectedIndex(isSelected ? null : wp.index);
              }
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: wp.action === "click" ? "50%" : 4,
                backgroundColor: ACTION_COLORS[wp.action] ?? "#888",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                boxShadow: isSelected
                  ? "0 0 0 2px #fff, 0 1px 4px rgba(0,0,0,0.4)"
                  : "0 1px 4px rgba(0,0,0,0.4)",
                transition: "box-shadow 0.15s",
              }}
            >
              {ACTION_SHAPES[wp.action] ?? "?"}
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#ccc",
                backgroundColor: "rgba(0,0,0,0.7)",
                padding: "1px 4px",
                borderRadius: 3,
                whiteSpace: "nowrap",
              }}
            >
              f{wp.at}{wp.target ? ` → ${wp.target}` : ""}
            </div>

            {isSelected && (
              <WaypointEditor
                entry={cursorPath[wp.index]}
                index={wp.index}
                wp={wp}
                props={props}
                onClose={() => setSelectedIndex(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
