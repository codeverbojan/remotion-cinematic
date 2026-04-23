import { Easing, interpolate as rInterpolate } from "remotion";
import type { CameraPose, EasingPreset, ResolvedCameraKey } from "./types";

type EasingFn = (t: number) => number;

const EASING_MAP: Record<EasingPreset, EasingFn> = {
  cinematic: Easing.bezier(0.22, 0.61, 0.36, 1),
  snappy: Easing.bezier(0.16, 1, 0.3, 1),
  linear: (t: number) => t,
};

export function getEasing(preset: EasingPreset): EasingFn {
  return EASING_MAP[preset];
}

export function interpolateCamera(
  keys: ResolvedCameraKey[],
  frame: number,
  easing: EasingPreset = "cinematic",
): CameraPose {
  if (keys.length === 0) {
    return { x: 0, y: 0, scale: 1 };
  }

  if (keys.length === 1 || frame <= keys[0].frame) {
    return { x: keys[0].x, y: keys[0].y, scale: keys[0].scale };
  }

  const last = keys[keys.length - 1];
  if (frame >= last.frame) {
    return { x: last.x, y: last.y, scale: last.scale };
  }

  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].frame <= frame) {
    i++;
  }

  const a = keys[i];
  const b = keys[i + 1];
  const easingFn = getEasing(easing);

  const x = rInterpolate(frame, [a.frame, b.frame], [a.x, b.x], { easing: easingFn });
  const y = rInterpolate(frame, [a.frame, b.frame], [a.y, b.y], { easing: easingFn });
  const scale = rInterpolate(frame, [a.frame, b.frame], [a.scale, b.scale], { easing: easingFn });

  return { x, y, scale };
}
