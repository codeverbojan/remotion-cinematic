import React, { useCallback, useMemo, useRef, useState } from "react";
import { resolveWindowPose, getSceneAtFrame } from "../engine";
import { persistUpdate } from "./updateProps";
import type { CinematicProps, CursorPathEntry, WindowLayout } from "../schema";

interface CursorPathEditorProps {
  props: CinematicProps;
  frame: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  showCursorPath: boolean;
  onTogglePath: (show: boolean) => void;
}

type ActionType = CursorPathEntry["action"];

const CANVAS_W = 1920;
const CANVAS_H = 1080;

const ACTION_OPTIONS: { value: ActionType; label: string; icon: string }[] = [
  { value: "moveTo", label: "Move", icon: "→" },
  { value: "click", label: "Click", icon: "●" },
  { value: "idle", label: "Idle", icon: "◇" },
  { value: "drag", label: "Drag", icon: "↔" },
];

const TOOLBAR_FONT = "system-ui, -apple-system, sans-serif";

function updateCursorPath(_props: CinematicProps, path: CursorPathEntry[]) {
  persistUpdate((prev) => ({ ...prev, cursorPath: path }));
}

function updateCursorStyle(_props: CinematicProps, updates: Partial<Pick<CinematicProps, "cursorScale" | "cursorRotation">>) {
  persistUpdate((prev) => ({ ...prev, ...updates }));
}

function canvasPositionFromEvent(
  e: React.MouseEvent,
  containerRef: React.RefObject<HTMLDivElement | null>,
): { x: number; y: number } | null {
  const container = containerRef.current;
  if (!container) return null;
  const rect = container.getBoundingClientRect();
  const scale = rect.width / CANVAS_W;
  const x = Math.max(0, Math.min(CANVAS_W, Math.round((e.clientX - rect.left) / scale)));
  const y = Math.max(0, Math.min(CANVAS_H, Math.round((e.clientY - rect.top) / scale)));
  return { x, y };
}

export function findWindowAtPosition(
  x: number,
  y: number,
  windows: WindowLayout[],
  frame: number,
): WindowLayout | null {
  const sorted = [...windows].sort((a, b) => b.zIndex - a.zIndex);
  for (const win of sorted) {
    const pose = resolveWindowPose(win, frame);
    if (!pose.visible) continue;
    if (
      x >= pose.left &&
      x < pose.left + pose.width &&
      y >= pose.top &&
      y < pose.top + pose.height
    ) {
      return win;
    }
  }
  return null;
}

export const CursorPathEditor: React.FC<CursorPathEditorProps> = ({
  props,
  frame,
  containerRef,
  showCursorPath,
  onTogglePath,
}) => {
  const [drawMode, setDrawMode] = useState(false);
  const [actionType, setActionType] = useState<ActionType>("moveTo");
  const [localScale, setLocalScale] = useState<number | null>(null);
  const [localRotation, setLocalRotation] = useState<number | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!drawMode) return;
      e.stopPropagation();
      e.preventDefault();

      const pos = canvasPositionFromEvent(e, containerRef);
      if (!pos) return;

      const currentProps = propsRef.current;
      const hitWindow = findWindowAtPosition(
        pos.x,
        pos.y,
        currentProps.windowLayout,
        frame,
      );

      const newEntry: Partial<CursorPathEntry> & { at: number; action: ActionType; anchor: "center" } = {
        at: frame,
        action: actionType,
        anchor: "center",
        positionX: pos.x,
        positionY: pos.y,
      };

      if (hitWindow && actionType !== "idle") {
        newEntry.target = hitWindow.id;
      }

      if (actionType === "drag") {
        newEntry.toX = pos.x + 100;
        newEntry.toY = pos.y;
        newEntry.duration = 18;
      }

      if (actionType === "moveTo") {
        newEntry.duration = 15;
      }

      const updated = [...currentProps.cursorPath, newEntry as CursorPathEntry].sort(
        (a, b) => a.at - b.at,
      );
      updateCursorPath(currentProps, updated);
    },
    [drawMode, actionType, frame, containerRef],
  );

  const enabledScenes = useMemo(
    () => props.scenes.filter((s) => s.enabled),
    [props.scenes],
  );
  const sceneRange = useMemo(
    () => getSceneAtFrame(enabledScenes, frame, props.overlap),
    [enabledScenes, frame, props.overlap],
  );

  const { cursorPath } = props;

  const sceneStart = sceneRange?.startFrame ?? 0;
  const sceneEnd = sceneStart + (sceneRange?.duration ?? Infinity);
  const TIME_WINDOW = 50;
  const windowStart = frame - TIME_WINDOW;
  const windowEnd = frame + TIME_WINDOW;
  const scenePtCount = cursorPath.filter(
    (e) => e.at >= sceneStart && e.at < sceneEnd && e.at >= windowStart && e.at <= windowEnd,
  ).length;

  const nearestCurveEntry = useMemo(() => {
    let best: CursorPathEntry | null = null;
    let bestDist = Infinity;
    for (const e of cursorPath) {
      if (e.action !== "moveTo" && e.action !== "drag") continue;
      const dist = Math.abs(e.at - frame);
      if (dist < bestDist) {
        bestDist = dist;
        best = e;
      }
    }
    return bestDist <= 30 ? best : null;
  }, [cursorPath, frame]);

  const handleClearScene = useCallback(() => {
    const current = propsRef.current;
    const range = getSceneAtFrame(
      current.scenes.filter((s) => s.enabled),
      frame,
      current.overlap,
    );
    if (!range) return;
    const s = range.startFrame;
    const end = s + range.duration;
    const kept = current.cursorPath.filter((e) => e.at < s || e.at >= end);
    updateCursorPath(current, kept);
  }, [frame]);

  return (
    <>
      {/* Click capture overlay in draw mode */}
      {drawMode && (
        <div
          onClick={handleCanvasClick}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 9997,
            cursor: "crosshair",
          }}
        />
      )}

      {/* Floating toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100001,
          display: "flex",
          alignItems: "center",
          gap: 6,
          backgroundColor: "#1A1A28",
          border: "1px solid #333",
          borderRadius: 8,
          padding: "6px 10px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          fontFamily: TOOLBAR_FONT,
          fontSize: 11,
          color: "#E0E0F0",
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={() => onTogglePath(!showCursorPath)}
          title="Click cursor on canvas to toggle, or use this button"
          style={{
            padding: "4px 10px",
            fontSize: 11,
            fontFamily: TOOLBAR_FONT,
            backgroundColor: showCursorPath ? "#22D3EE" : "#2A2A3A",
            color: showCursorPath ? "#0F0F14" : "#E0E0F0",
            border: showCursorPath ? "1px solid #67E8F9" : "1px solid #444",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: showCursorPath ? 600 : 400,
          }}
        >
          Path
        </button>

        <button
          onClick={() => {
            const next = !drawMode;
            setDrawMode(next);
            if (next && !showCursorPath) onTogglePath(true);
          }}
          style={{
            padding: "4px 10px",
            fontSize: 11,
            fontFamily: TOOLBAR_FONT,
            backgroundColor: drawMode ? "#6366F1" : "#2A2A3A",
            color: "#E0E0F0",
            border: drawMode ? "1px solid #818CF8" : "1px solid #444",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: drawMode ? 600 : 400,
          }}
        >
          {drawMode ? "Drawing" : "Draw"}
        </button>

        <div
          style={{
            width: 1,
            height: 20,
            backgroundColor: "#444",
          }}
        />

        {ACTION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActionType(opt.value)}
            title={opt.label}
            style={{
              padding: "3px 8px",
              fontSize: 11,
              fontFamily: TOOLBAR_FONT,
              backgroundColor:
                actionType === opt.value ? "#3B3B5C" : "transparent",
              color:
                actionType === opt.value ? "#E0E0F0" : "#888",
              border:
                actionType === opt.value
                  ? "1px solid #555"
                  : "1px solid transparent",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {opt.icon} {opt.label}
          </button>
        ))}

        {nearestCurveEntry && (
          <>
            <div style={{ width: 1, height: 20, backgroundColor: "#444" }} />
            <span style={{ fontSize: 10, color: "#888" }}>Curve</span>
            <select
              value={nearestCurveEntry.curve ?? "arc"}
              onChange={(e) => {
                const current = propsRef.current;
                const targetAt = nearestCurveEntry.at;
                const targetAction = nearestCurveEntry.action;
                const updated = current.cursorPath.map((c) =>
                  c.at === targetAt && c.action === targetAction
                    ? { ...c, curve: e.target.value as "arc" | "linear" | "ease" }
                    : c,
                );
                updateCursorPath(current, updated);
              }}
              style={{
                padding: "3px 6px",
                fontSize: 11,
                fontFamily: TOOLBAR_FONT,
                backgroundColor: "#2A2A3A",
                color: "#E0E0F0",
                border: "1px solid #444",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              <option value="arc">Arc</option>
              <option value="linear">Linear</option>
              <option value="ease">Ease</option>
            </select>
          </>
        )}

        <div style={{ width: 1, height: 20, backgroundColor: "#444" }} />

        <span style={{ color: "#888", fontSize: 10 }}>
          {sceneRange ? `${sceneRange.id}: ${scenePtCount} pts` : `${cursorPath.length} pts`}
        </span>

        {scenePtCount > 0 && (
          <button
            onClick={handleClearScene}
            style={{
              padding: "3px 8px",
              fontSize: 10,
              fontFamily: TOOLBAR_FONT,
              backgroundColor: "transparent",
              color: "#EF4444",
              border: "1px solid #444",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}

        <div style={{ width: 1, height: 20, backgroundColor: "#444" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10, color: "#888" }}>Size</span>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={localScale ?? props.cursorScale}
            onChange={(e) => setLocalScale(Number(e.target.value))}
            onPointerUp={() => {
              if (localScale !== null) {
                updateCursorStyle(propsRef.current, { cursorScale: localScale });
                setLocalScale(null);
              }
            }}
            style={{ width: 60, accentColor: "#6366F1" }}
          />
          <span style={{ fontSize: 10, color: "#888", minWidth: 24, textAlign: "right" }}>
            {(localScale ?? props.cursorScale).toFixed(1)}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10, color: "#888" }}>Rot</span>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={localRotation ?? props.cursorRotation}
            onChange={(e) => setLocalRotation(Number(e.target.value))}
            onPointerUp={() => {
              if (localRotation !== null) {
                updateCursorStyle(propsRef.current, { cursorRotation: localRotation });
                setLocalRotation(null);
              }
            }}
            style={{ width: 60, accentColor: "#6366F1" }}
          />
          <span style={{ fontSize: 10, color: "#888", minWidth: 24, textAlign: "right" }}>
            {localRotation ?? props.cursorRotation}°
          </span>
        </div>
      </div>
    </>
  );
};
