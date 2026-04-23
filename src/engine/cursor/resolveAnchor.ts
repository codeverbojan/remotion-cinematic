import type { AnchorPoint, ResolvedPosition } from "./types";

const TOP_BAR_HEIGHT = 40;
const CORNER_INSET = 6;

export function resolveAnchorFromRect(
  rect: { left: number; top: number; width: number; height: number },
  anchor: AnchorPoint,
): ResolvedPosition {
  if (typeof anchor === "object") {
    if ("xPct" in anchor) {
      return {
        x: rect.left + rect.width * (anchor.xPct / 100),
        y: rect.top + rect.height * (anchor.yPct / 100),
      };
    }
    return { x: rect.left + anchor.x, y: rect.top + anchor.y };
  }

  switch (anchor) {
    case "center":
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    case "top-bar":
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + TOP_BAR_HEIGHT / 2,
      };
    case "corner-top-left":
      return {
        x: rect.left + CORNER_INSET,
        y: rect.top + CORNER_INSET,
      };
    case "corner-top-right":
      return {
        x: rect.left + rect.width - CORNER_INSET,
        y: rect.top + CORNER_INSET,
      };
    case "corner-bottom-left":
      return {
        x: rect.left + CORNER_INSET,
        y: rect.top + rect.height - CORNER_INSET,
      };
    case "corner-bottom-right":
      return {
        x: rect.left + rect.width - CORNER_INSET,
        y: rect.top + rect.height - CORNER_INSET,
      };
  }
}