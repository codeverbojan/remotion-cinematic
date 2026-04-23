import type { Rect } from "../types";
import type {
  ComputedRect,
  ReservedZone,
  SlotDef,
  WindowPlacement,
  ZoneConfig,
  ZoneSystem,
} from "./types";

function rectsOverlap(a: Rect, b: Rect): boolean {
  if (a.w <= 0 || a.h <= 0 || b.w <= 0 || b.h <= 0) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function findSlot(slots: SlotDef[], id: string): SlotDef {
  const slot = slots.find((s) => s.id === id);
  if (!slot) {
    throw new Error(`Unknown slot "${id}". Available: ${slots.map((s) => s.id).join(", ")}`);
  }
  return slot;
}

function resolveReservedZones(
  allReserved: ReservedZone[],
  avoidIds: string[],
): Rect[] {
  return avoidIds
    .map((id) => allReserved.find((r) => r.id === id))
    .filter((r): r is ReservedZone => r !== undefined)
    .map((r) => r.region);
}

function placeInSlot(
  slot: SlotDef,
  width: number,
  height: number,
  margin: number,
  avoidRects: Rect[],
  align: WindowPlacement["align"],
  stackOffset: number,
): ComputedRect {
  const fitW = Math.max(0, Math.min(width, slot.region.w - margin * 2));
  const fitH = Math.max(0, Math.min(height, slot.region.h - margin * 2));

  const slotRight = slot.region.x + slot.region.w;
  const slotBottom = slot.region.y + slot.region.h;

  let left: number;
  let top: number;

  const hAlign = align?.horizontal ?? "start";
  const vAlign = align?.vertical ?? "start";

  if (hAlign === "center") {
    left = slot.region.x + (slot.region.w - fitW) / 2;
  } else if (hAlign === "end") {
    left = slotRight - fitW - margin;
  } else {
    left = slot.region.x + margin;
  }

  if (vAlign === "center") {
    top = slot.region.y + (slot.region.h - fitH) / 2;
  } else if (vAlign === "end") {
    top = slotBottom - fitH - margin;
  } else {
    top = slot.region.y + margin;
  }

  top += stackOffset;

  for (const avoid of avoidRects) {
    const candidate: Rect = { x: left, y: top, w: fitW, h: fitH };
    if (rectsOverlap(candidate, avoid)) {
      if (avoid.y + avoid.h + margin + fitH <= slotBottom) {
        top = avoid.y + avoid.h + margin;
      } else if (avoid.x + avoid.w + margin + fitW <= slotRight) {
        left = avoid.x + avoid.w + margin;
      } else {
        top = avoid.y + avoid.h + margin;
      }
    }
  }

  left = clamp(left, slot.region.x + margin, Math.max(slot.region.x + margin, slotRight - fitW - margin));
  top = clamp(top, slot.region.y + margin, Math.max(slot.region.y + margin, slotBottom - fitH - margin));

  return { left, top, width: fitW, height: fitH };
}

export function defineZones(config: ZoneConfig): ZoneSystem {
  const { canvas } = config;
  const slots = config.slots.map((s) => ({
    id: s.id,
    region: { ...s.region },
  }));
  const reserved = config.reserved.map((r) => ({
    id: r.id,
    region: { ...r.region },
  }));

  for (const slot of slots) {
    const r = slot.region;
    if (r.x < 0 || r.y < 0 || r.x + r.w > canvas.width || r.y + r.h > canvas.height) {
      throw new Error(`Slot "${slot.id}" exceeds canvas bounds (${canvas.width}x${canvas.height})`);
    }
  }

  for (const r of reserved) {
    const reg = r.region;
    if (reg.x < 0 || reg.y < 0 || reg.x + reg.w > canvas.width || reg.y + reg.h > canvas.height) {
      throw new Error(`Reserved zone "${r.id}" exceeds canvas bounds (${canvas.width}x${canvas.height})`);
    }
  }

  return {
    canvas,
    slots,
    reserved,
    placeWindow(placement: WindowPlacement): ComputedRect {
      const slot = findSlot(slots, placement.slotId);
      const avoidRects = resolveReservedZones(reserved, placement.avoidZones);
      const stackOffset = (placement.stackIndex ?? 0) * (placement.stackPitch ?? 0);
      return placeInSlot(
        slot,
        placement.width,
        placement.height,
        placement.margin,
        avoidRects,
        placement.align,
        stackOffset,
      );
    },
  };
}

export { rectsOverlap };
