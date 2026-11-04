import { useCanvas, useEasing } from "../../VideoPropsContext";
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
  canvas: {width: number; height: number},
): { x: number; y: number } {
  if (!kf.target) return { x: canvas.width / 2, y: canvas.height / 2 };
  const rect = getRect(kf.target);
  if (!rect) return { x: canvas.width / 2, y: canvas.height / 2 };
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export const AutoZoom: React.FC<AutoZoomProps> = ({ keyframes, getRect, children }) => {
  const frame = useCurrentFrame();
  const easing = useEasing();
  const canvas = useCanvas();

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

  const fromOrigin = resolveOrigin(fromKf, getRect, canvas);
  const toOrigin = resolveOrigin(toKf, getRect, canvas);

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

  const scale = interpolate(frame, [fromKf.at, toKf.at], [fromKf.scale, toKf.scale], easing);
  const originX = interpolate(frame, [fromKf.at, toKf.at], [fromOrigin.x, toOrigin.x], easing);
  const originY = interpolate(frame, [fromKf.at, toKf.at], [fromOrigin.y, toOrigin.y], easing);

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
