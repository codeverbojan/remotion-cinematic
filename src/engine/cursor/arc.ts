import type { CanvasBounds, CurveType, ResolvedPosition } from "./types";

const DEFAULT_BULGE = 0.22;
const DEFAULT_ROTATION_AMPLITUDE = 10;
const CLICK_PULSE_SCALE = 0.82;
const CLICK_PULSE_FRAMES = 2;

export interface ArcConfig {
  bulge?: number;
  rotationAmplitude?: number;
  canvas?: CanvasBounds;
}

function quadBezier(t: number, p0: number, cp: number, p1: number): number {
  const inv = 1 - t;
  return inv * inv * p0 + 2 * inv * t * cp + t * t * p1;
}

export function interpolateArc(
  from: ResolvedPosition,
  to: ResolvedPosition,
  progress: number,
  config: ArcConfig = {},
): ResolvedPosition {
  const bulge = config.bulge ?? DEFAULT_BULGE;
  const canvas = config.canvas ?? { width: 1920, height: 1080 };

  const t = Math.max(0, Math.min(1, progress));

  if (t === 0) return { ...from };
  if (t === 1) return { ...to };

  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 1) return { x: mx, y: my };

  const perpX = -dy / dist;
  const perpY = dx / dist;
  const offset = dist * bulge;

  const margin = 20;
  const cx = Math.max(margin, Math.min(canvas.width - margin, mx + perpX * offset));
  const cy = Math.max(margin, Math.min(canvas.height - margin, my + perpY * offset));

  return {
    x: quadBezier(t, from.x, cx, to.x),
    y: quadBezier(t, from.y, cy, to.y),
  };
}

export function interpolateLinear(
  from: ResolvedPosition,
  to: ResolvedPosition,
  progress: number,
): ResolvedPosition {
  const t = Math.max(0, Math.min(1, progress));
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}

export function interpolateEase(
  from: ResolvedPosition,
  to: ResolvedPosition,
  progress: number,
): ResolvedPosition {
  const t = Math.max(0, Math.min(1, progress));
  const eased = t * t * (3 - 2 * t);
  return {
    x: from.x + (to.x - from.x) * eased,
    y: from.y + (to.y - from.y) * eased,
  };
}

export function interpolateCurve(
  from: ResolvedPosition,
  to: ResolvedPosition,
  progress: number,
  curve: CurveType = "arc",
  config: ArcConfig = {},
): ResolvedPosition {
  switch (curve) {
    case "linear":
      return interpolateLinear(from, to, progress);
    case "ease":
      return interpolateEase(from, to, progress);
    case "arc":
    default:
      return interpolateArc(from, to, progress, config);
  }
}

export function computeClickPulse(
  framesSinceClick: number,
): { scale: number; opacity: number } {
  if (framesSinceClick < 0 || framesSinceClick > CLICK_PULSE_FRAMES) {
    return { scale: 1, opacity: 0 };
  }

  const t = framesSinceClick / CLICK_PULSE_FRAMES;
  return {
    scale: 1 + (CLICK_PULSE_SCALE - 1) * (1 - t),
    opacity: 1 - t,
  };
}

export function computeCursorRotation(
  from: ResolvedPosition,
  to: ResolvedPosition,
  progress: number,
  amplitude: number = DEFAULT_ROTATION_AMPLITUDE,
): number {
  if (progress <= 0 || progress >= 1) return 0;
  const wave = Math.sin(progress * Math.PI);
  const dx = to.x - from.x;
  const sign = dx >= 0 ? 1 : -1;
  return wave * amplitude * sign;
}
