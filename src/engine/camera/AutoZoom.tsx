import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CANVAS, EASE } from "../../tokens";

export interface ZoomKeyframe {
  at: number;
  target?: string;
  scale: number;
}

export interface AutoZoomProps {
  keyframes: ZoomKeyframe[];
  getRect: (id: string) => { left: number; top: number; width: number; height: number } | undefined;
  children: React.ReactNode;
}

const CENTER_X = CANVAS.width / 2;
const CENTER_Y = CANVAS.height / 2;

function resolveOrigin(
  kf: ZoomKeyframe,
  getRect: AutoZoomProps["getRect"],
): { x: number; y: number } {
  if (!kf.target) return { x: CENTER_X, y: CENTER_Y };
  const rect = getRect(kf.target);
  if (!rect) return { x: CENTER_X, y: CENTER_Y };
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export const AutoZoom: React.FC<AutoZoomProps> = ({ keyframes, getRect, children }) => {
  const frame = useCurrentFrame();

  if (keyframes.length === 0) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  let fromIdx = 0;
  for (let i = 0; i < keyframes.length; i++) {
    if (keyframes[i].at <= frame) fromIdx = i;
  }
  const toIdx = Math.min(fromIdx + 1, keyframes.length - 1);

  const fromKf = keyframes[fromIdx];
  const toKf = keyframes[toIdx];

  const fromOrigin = resolveOrigin(fromKf, getRect);
  const toOrigin = resolveOrigin(toKf, getRect);

  if (fromIdx === toIdx || fromKf.at === toKf.at) {
    if (fromKf.scale === 1) {
      return <AbsoluteFill>{children}</AbsoluteFill>;
    }
    return (
      <AbsoluteFill
        style={{
          transform: `scale(${fromKf.scale}) translateZ(0)`,
          transformOrigin: `${Math.round(fromOrigin.x)}px ${Math.round(fromOrigin.y)}px`,
          willChange: "transform",
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  const scale = interpolate(frame, [fromKf.at, toKf.at], [fromKf.scale, toKf.scale], EASE.snappy);
  const originX = interpolate(frame, [fromKf.at, toKf.at], [fromOrigin.x, toOrigin.x], EASE.snappy);
  const originY = interpolate(frame, [fromKf.at, toKf.at], [fromOrigin.y, toOrigin.y], EASE.snappy);

  if (scale === 1) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translateZ(0)`,
        transformOrigin: `${Math.round(originX)}px ${Math.round(originY)}px`,
        willChange: "transform",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
