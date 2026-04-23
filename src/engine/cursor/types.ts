export type AnchorPoint =
  | "center"
  | "top-bar"
  | "corner-top-left"
  | "corner-top-right"
  | "corner-bottom-left"
  | "corner-bottom-right"
  | { x: number; y: number }
  | { xPct: number; yPct: number };

export interface CursorActionIdle {
  at: number;
  action: "idle";
  position: { x: number; y: number };
}

export interface CursorActionMoveTo {
  at: number;
  action: "moveTo";
  target: string;
  anchor: AnchorPoint;
  duration?: number;
}

export interface CursorActionClick {
  at: number;
  action: "click";
  target: string;
  anchor?: AnchorPoint;
}

export interface CursorActionDrag {
  at: number;
  action: "drag";
  target: string;
  anchor: AnchorPoint;
  to: { x: number; y: number };
  duration?: number;
}

export type CursorAction =
  | CursorActionIdle
  | CursorActionMoveTo
  | CursorActionClick
  | CursorActionDrag;

export interface ResolvedPosition {
  x: number;
  y: number;
}

export interface CanvasBounds {
  width: number;
  height: number;
}

export type { SFXEntry } from "../types";
import type { SFXEntry } from "../types";

export type CursorSFXMap = Partial<Record<CursorAction["action"], SFXEntry>>;
