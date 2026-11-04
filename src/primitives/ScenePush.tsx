import { useCanvas, useEasing } from "../VideoPropsContext";
import { SoundEffect } from "../engine/audio/SoundEffect";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { SFXEntry } from "../engine/types";
import { Wallpaper } from "./Wallpaper";

export type PushDirection = "top" | "bottom" | "left" | "right";

function getDirectionOffset(direction: PushDirection, canvas: {width: number; height: number}): { x: number; y: number } {
  const buf = 120;
  switch (direction) {
    case "top":    return { x: 0, y: -(canvas.height + buf) };
    case "bottom": return { x: 0, y:  (canvas.height + buf) };
    case "left":   return { x: -(canvas.width + buf), y: 0 };
    case "right":  return { x:  (canvas.width + buf), y: 0 };
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
  const easing = useEasing();
  const canvas = useCanvas();

  let tx = 0;
  let ty = 0;

  if (enterFrom !== "none" && overlap > 0) {
    const prog = frame >= overlap ? 1 : frame <= 0 ? 0 : interpolate(frame, [0, overlap], [0, 1], easing);
    const off = getDirectionOffset(enterFrom, canvas);
    tx += off.x * (1 - prog);
    ty += off.y * (1 - prog);
  }

  if (exitTo !== "none" && overlap > 0) {
    const prog = frame <= duration - overlap ? 0 : frame >= duration ? 1 : interpolate(frame, [duration - overlap, duration], [0, 1], easing);
    const off = getDirectionOffset(exitTo, canvas);
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
          <SoundEffect src={staticFile(enterSfx.src)} volume={enterSfx.volume ?? 0.5} />
        </Sequence>
      )}
      {children}
    </AbsoluteFill>
  );
};
