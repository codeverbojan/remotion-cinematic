import type { Rect } from "../types";

export interface SlotDef {
  id: string;
  region: Rect;
}

export interface ReservedZone {
  id: string;
  region: Rect;
}

export interface ZoneConfig {
  canvas: { width: number; height: number };
  slots: SlotDef[];
  reserved: ReservedZone[];
}

export interface WindowPlacement {
  id: string;
  slotId: string;
  width: number;
  height: number;
  margin: number;
  avoidZones: string[];
  align?: {
    horizontal?: "start" | "center" | "end";
    vertical?: "start" | "center" | "end";
  };
  stackIndex?: number;
  stackPitch?: number;
}

export interface ComputedRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ZoneSystem {
  canvas: { width: number; height: number };
  slots: SlotDef[];
  reserved: ReservedZone[];
  placeWindow: (placement: WindowPlacement) => ComputedRect;
}
