import React, { useRef } from "react";
import { Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { computeClickPulse, computeCursorRotation, interpolateArc } from "./arc";
import { CursorSprite } from "./CursorSprite";
import { resolveAnchorFromRect } from "./resolveAnchor";
import type { CursorAction, CursorSFXMap, ResolvedPosition } from "./types";

interface CursorProps {
  actions: CursorAction[];
  getRect?: (id: string) => { left: number; top: number; width: number; height: number } | undefined;
  sfx?: CursorSFXMap;
  canvas?: { width: number; height: number };
  size?: number;
  color?: string;
  visible?: boolean;
}

const DEFAULT_MOVE_DURATION = 20;
const DEFAULT_DRAG_DURATION = 30;

interface ResolvedSegment {
  startFrame: number;
  endFrame: number;
  from: ResolvedPosition;
  to: ResolvedPosition;
  clickFrame: number | null;
}

const warnedTargets = new Set<string>();

function resolvePosition(
  action: CursorAction,
  getRect: NonNullable<CursorProps["getRect"]>,
): ResolvedPosition {
  if (action.action === "idle") {
    return action.position;
  }

  const anchor = action.action === "click"
    ? (action.anchor ?? "center")
    : action.anchor;

  const rect = getRect(action.target);
  if (!rect) {
    if (!warnedTargets.has(action.target)) {
      warnedTargets.add(action.target);
      console.warn(`[Cursor] Target "${action.target}" not found — falling back to (0, 0)`);
    }
    return { x: 0, y: 0 };
  }

  return resolveAnchorFromRect(rect, anchor);
}

function buildSegments(
  actions: CursorAction[],
  getRect: NonNullable<CursorProps["getRect"]>,
): ResolvedSegment[] {
  if (actions.length === 0) return [];

  const segments: ResolvedSegment[] = [];
  let currentPos = resolvePosition(actions[0], getRect);

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const nextAction = actions[i + 1];
    const endFrame = nextAction ? nextAction.at : action.at + 60;

    if (action.action === "idle") {
      segments.push({
        startFrame: action.at,
        endFrame,
        from: action.position,
        to: action.position,
        clickFrame: null,
      });
      currentPos = action.position;
    } else if (action.action === "moveTo") {
      const target = resolvePosition(action, getRect);
      const dur = Math.max(1, action.duration ?? DEFAULT_MOVE_DURATION);
      const moveEnd = Math.min(action.at + dur, endFrame);
      segments.push({
        startFrame: action.at,
        endFrame: moveEnd,
        from: currentPos,
        to: target,
        clickFrame: null,
      });
      if (moveEnd < endFrame) {
        segments.push({
          startFrame: moveEnd,
          endFrame,
          from: target,
          to: target,
          clickFrame: null,
        });
      }
      currentPos = target;
    } else if (action.action === "click") {
      const target = resolvePosition(action, getRect);
      segments.push({
        startFrame: action.at,
        endFrame,
        from: target,
        to: target,
        clickFrame: action.at,
      });
      currentPos = target;
    } else if (action.action === "drag") {
      const grabPos = resolvePosition(action, getRect);
      const dur = Math.max(2, action.duration ?? DEFAULT_DRAG_DURATION);
      const moveDur = Math.max(1, Math.min(DEFAULT_MOVE_DURATION, Math.floor(dur / 3)));
      const dragEnd = Math.min(action.at + dur, endFrame);

      segments.push({
        startFrame: action.at,
        endFrame: action.at + moveDur,
        from: currentPos,
        to: grabPos,
        clickFrame: null,
      });

      segments.push({
        startFrame: action.at + moveDur,
        endFrame: dragEnd,
        from: grabPos,
        to: action.to,
        clickFrame: action.at + moveDur,
      });

      if (dragEnd < endFrame) {
        segments.push({
          startFrame: dragEnd,
          endFrame,
          from: action.to,
          to: action.to,
          clickFrame: null,
        });
      }
      currentPos = action.to;
    }
  }

  return segments;
}

function findSegment(segments: ResolvedSegment[], frame: number): ResolvedSegment | null {
  for (let i = segments.length - 1; i >= 0; i--) {
    if (frame >= segments[i].startFrame) return segments[i];
  }
  return segments[0] ?? null;
}

export const Cursor: React.FC<CursorProps> = ({
  actions,
  getRect: getRectProp,
  sfx,
  canvas = { width: 1920, height: 1080 },
  size = 28,
  color = "#FFFFFF",
  visible = true,
}) => {
  const frame = useCurrentFrame();
  const getRectRef = useRef(getRectProp);
  getRectRef.current = getRectProp;

  const getRect = getRectRef.current ?? (() => undefined);
  const segments = buildSegments(actions, getRect);

  if (!visible || segments.length === 0) return null;

  const seg = findSegment(segments, frame);
  if (!seg) return null;

  const segDuration = seg.endFrame - seg.startFrame;
  const rawProgress = segDuration > 0
    ? (frame - seg.startFrame) / segDuration
    : 1;
  const progress = interpolate(
    Math.max(0, Math.min(1, rawProgress)),
    [0, 1],
    [0, 1],
    { easing: Easing.bezier(0.22, 0.61, 0.36, 1) },
  );

  const pos = interpolateArc(seg.from, seg.to, progress, { canvas });
  const rotation = computeCursorRotation(seg.from, seg.to, progress);

  let pulseOpacity = 0;
  let pulseScale = 1;
  if (seg.clickFrame !== null && frame >= seg.clickFrame) {
    const pulse = computeClickPulse(frame - seg.clickFrame);
    pulseOpacity = pulse.opacity;
    pulseScale = pulse.scale;
  }

  return (
    <>
      {sfx && actions.map((action, i) => {
        const entry = sfx[action.action];
        if (!entry) return null;
        return (
          <Sequence
            key={`sfx-${action.action}-${action.at}-${i}`}
            from={action.at}
            durationInFrames={entry.durationInFrames ?? 30}
            layout="none"
          >
            <Audio src={staticFile(entry.src)} volume={entry.volume ?? 0.5} />
          </Sequence>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          zIndex: 9999,
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        <CursorSprite
          size={size}
          color={color}
          rotation={rotation}
          pulseOpacity={pulseOpacity}
          pulseScale={pulseScale}
        />
      </div>
    </>
  );
};
