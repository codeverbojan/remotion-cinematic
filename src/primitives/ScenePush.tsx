import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { SFXEntry } from "../engine/types";
import { Wallpaper } from "./Wallpaper";
import { CANVAS, EASE } from "../tokens";

export type PushDirection = "top" | "bottom" | "left" | "right";

function getDirectionOffset(direction: PushDirection): { x: number; y: number } {
  const buf = 120;
  switch (direction) {
    case "top":    return { x: 0, y: -(CANVAS.height + buf) };
    case "bottom": return { x: 0, y:  (CANVAS.height + buf) };
    case "left":   return { x: -(CANVAS.width + buf), y: 0 };
    case "right":  return { x:  (CANVAS.width + buf), y: 0 };
  }
}

export interface ScenePushProps {
  duration: number;
  overlap: number;
  enterFrom?: PushDirection | "none";
  exitTo?: PushDirection | "none";
  background?: "dark" | "light" | "gradient" | "none";
  enterSfx?: SFXEntry;
  children: React.ReactNode;
}

export const ScenePush: React.FC<ScenePushProps> = ({
  duration,
  overlap,
  enterFrom = "bottom",
  exitTo = "top",
  background = "dark",
  enterSfx,
  children,
}) => {
  const frame = useCurrentFrame();

  let tx = 0;
  let ty = 0;

  if (enterFrom !== "none") {
    const prog = interpolate(frame, [0, overlap], [0, 1], EASE.snappy);
    const off = getDirectionOffset(enterFrom);
    tx += off.x * (1 - prog);
    ty += off.y * (1 - prog);
  }

  if (exitTo !== "none") {
    const prog = interpolate(frame, [duration - overlap, duration], [0, 1], EASE.snappy);
    const off = getDirectionOffset(exitTo);
    tx += off.x * prog;
    ty += off.y * prog;
  }

  const hasTransform = tx !== 0 || ty !== 0;

  return (
    <AbsoluteFill
      style={hasTransform ? {
        transform: `translate(${Math.round(tx)}px, ${Math.round(ty)}px) translateZ(0)`,
        willChange: "transform",
      } : undefined}
    >
      {background !== "none" && <Wallpaper variant={background} />}
      {enterSfx && (
        <Sequence from={0} durationInFrames={enterSfx.durationInFrames ?? 30} layout="none">
          <Audio src={staticFile(enterSfx.src)} volume={enterSfx.volume ?? 0.5} />
        </Sequence>
      )}
      {children}
    </AbsoluteFill>
  );
};
