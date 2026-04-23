import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../tokens";

interface ExitProps {
  startAt: number;
  duration?: number;
  translateY?: number;
  translateX?: number;
  rotate?: number;
  scaleTo?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export interface ExitPose {
  opacity: number;
  translateY: number;
  translateX: number;
  rotate: number;
  scale: number;
}

export function getExitPose(
  frame: number,
  startAt: number,
  duration: number,
  translateY: number,
  scaleTo: number,
  translateX = 0,
  rotate = 0,
): ExitPose {
  const rel = frame - startAt;
  const dur = Math.max(1, duration);
  const opacity = interpolate(rel, [0, dur], [1, 0], EASE.smooth);
  const ty = interpolate(rel, [0, dur], [0, translateY], EASE.smooth);
  const tx = interpolate(rel, [0, dur], [0, translateX], EASE.smooth);
  const r = interpolate(rel, [0, dur], [0, rotate], EASE.smooth);
  const s = interpolate(rel, [0, dur], [1, scaleTo], EASE.smooth);

  return { opacity, translateY: ty, translateX: tx, rotate: r, scale: s };
}

export const Exit: React.FC<ExitProps> = ({
  startAt,
  duration = 12,
  translateY = -20,
  translateX = 0,
  rotate = 0,
  scaleTo = 1,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const pose = getExitPose(frame, startAt, duration, translateY, scaleTo, translateX, rotate);

  return (
    <div
      style={{
        opacity: pose.opacity,
        transform: `translate(${Math.round(pose.translateX)}px, ${Math.round(pose.translateY)}px) rotate(${pose.rotate}deg) scale(${pose.scale}) translateZ(0)`,
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
