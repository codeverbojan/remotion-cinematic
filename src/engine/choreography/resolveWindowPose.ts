import type { WindowLayout } from "../../schema";

export interface WindowPose {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
  scale: number;
  translateX: number;
  translateY: number;
  visible: boolean;
}

const HIDDEN: Readonly<WindowPose> = {
  left: 0, top: 0, width: 0, height: 0,
  opacity: 0, scale: 1, translateX: 0, translateY: 0,
  visible: false,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
}

function entranceOffsets(style: WindowLayout["enterFrom"]): { scale: number; tx: number; ty: number } {
  switch (style) {
    case "fade": return { scale: 1, tx: 0, ty: 0 };
    case "scale": return { scale: 0.92, tx: 0, ty: 0 };
    case "slide-up": return { scale: 1, tx: 0, ty: 40 };
    case "slide-left": return { scale: 1, tx: -60, ty: 0 };
    case "slide-right": return { scale: 1, tx: 60, ty: 0 };
  }
}

export function resolveWindowPose(def: WindowLayout, frame: number): WindowPose {
  if (frame < def.enterAt) return HIDDEN;

  if (def.exitAt !== undefined && frame >= def.exitAt + def.exitDuration) {
    return HIDDEN;
  }

  let x = def.startX;
  let y = def.startY;
  let w = def.startW;
  let h = def.startH;

  if (def.endX !== undefined || def.endY !== undefined || def.endW !== undefined || def.endH !== undefined) {
    const animStart = Math.max(def.animateAt ?? def.enterAt + def.enterDuration, def.enterAt);
    const animEnd = animStart + def.animateDuration;
    const animT = easeOut((frame - animStart) / Math.max(1, animEnd - animStart));
    if (def.endX !== undefined) x = lerp(def.startX, def.endX, animT);
    if (def.endY !== undefined) y = lerp(def.startY, def.endY, animT);
    if (def.endW !== undefined) w = lerp(def.startW, def.endW, animT);
    if (def.endH !== undefined) h = lerp(def.startH, def.endH, animT);
  }

  const enterEnd = def.enterAt + def.enterDuration;
  const enterT = easeOut((frame - def.enterAt) / Math.max(1, def.enterDuration));
  const offsets = entranceOffsets(def.enterFrom);

  let opacity = enterT;
  let scale = lerp(offsets.scale, 1, enterT);
  let translateX = lerp(offsets.tx, 0, enterT);
  let translateY = lerp(offsets.ty, 0, enterT);

  if (frame >= enterEnd) {
    opacity = 1;
    scale = 1;
    translateX = 0;
    translateY = 0;
  }

  if (def.exitAt !== undefined && frame >= def.exitAt) {
    const exitT = easeOut((frame - def.exitAt) / Math.max(1, def.exitDuration));
    opacity = Math.min(opacity, 1 - exitT);
  }

  return {
    left: Math.round(x),
    top: Math.round(y),
    width: Math.round(w),
    height: Math.round(h),
    opacity,
    scale,
    translateX,
    translateY,
    visible: true,
  };
}
