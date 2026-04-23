import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../tokens";

interface EnterProps {
  delay?: number;
  duration?: number;
  translateY?: number;
  translateX?: number;
  rotate?: number;
  scaleFrom?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export interface EnterPose {
  opacity: number;
  translateY: number;
  translateX: number;
  rotate: number;
  scale: number;
}

export function getEnterPose(
  frame: number,
  delay: number,
  duration: number,
  translateY: number,
  scaleFrom: number,
  translateX = 0,
  rotate = 0,
): EnterPose {
  const rel = frame - delay;
  const dur = Math.max(1, duration);
  const opacity = interpolate(rel, [0, dur], [0, 1], EASE.smooth);
  const ty = interpolate(rel, [0, dur], [translateY, 0], EASE.smooth);
  const tx = interpolate(rel, [0, dur], [translateX, 0], EASE.smooth);
  const r = interpolate(rel, [0, dur], [rotate, 0], EASE.smooth);
  const s = interpolate(rel, [0, dur], [scaleFrom, 1], EASE.smooth);

  return { opacity, translateY: ty, translateX: tx, rotate: r, scale: s };
}

export const Enter: React.FC<EnterProps> = ({
  delay = 0,
  duration = 12,
  translateY = 20,
  translateX = 0,
  rotate = 0,
  scaleFrom = 1,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const pose = getEnterPose(frame, delay, duration, translateY, scaleFrom, translateX, rotate);

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
