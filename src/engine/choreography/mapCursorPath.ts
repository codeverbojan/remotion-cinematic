import type { CursorPathEntry } from "../../schema";
import type { CursorAction, AnchorPoint } from "../cursor/types";

function resolveAnchor(entry: CursorPathEntry): AnchorPoint {
  if (entry.anchorXPct !== undefined && entry.anchorYPct !== undefined) {
    return { xPct: entry.anchorXPct, yPct: entry.anchorYPct };
  }
  return entry.anchor ?? "center";
}

export function mapCursorPath(entries: readonly CursorPathEntry[]): CursorAction[] {
  const actions: CursorAction[] = [];

  for (const entry of entries) {
    switch (entry.action) {
      case "idle":
        actions.push({
          at: entry.at,
          action: "idle",
          position: {
            x: entry.positionX ?? 960,
            y: entry.positionY ?? 540,
          },
        });
        break;

      case "moveTo":
        if (entry.positionX !== undefined && entry.positionY !== undefined) {
          actions.push({
            at: entry.at,
            action: "moveTo",
            position: { x: entry.positionX, y: entry.positionY },
            duration: entry.duration,
            curve: entry.curve,
          });
        } else if (entry.target) {
          actions.push({
            at: entry.at,
            action: "moveTo",
            target: entry.target,
            anchor: resolveAnchor(entry),
            duration: entry.duration,
            curve: entry.curve,
          });
        }
        break;

      case "click":
        if (entry.positionX !== undefined && entry.positionY !== undefined) {
          actions.push({
            at: entry.at,
            action: "click",
            position: { x: entry.positionX, y: entry.positionY },
          });
        } else if (entry.target) {
          actions.push({
            at: entry.at,
            action: "click",
            target: entry.target,
            anchor: resolveAnchor(entry),
          });
        }
        break;

      case "drag":
        if (entry.toX !== undefined && entry.toY !== undefined) {
          if (entry.positionX !== undefined && entry.positionY !== undefined) {
            actions.push({
              at: entry.at,
              action: "drag",
              position: { x: entry.positionX, y: entry.positionY },
              to: { x: entry.toX, y: entry.toY },
              duration: entry.duration,
              curve: entry.curve,
            });
          } else if (entry.target) {
            actions.push({
              at: entry.at,
              action: "drag",
              target: entry.target,
              anchor: resolveAnchor(entry),
              to: { x: entry.toX, y: entry.toY },
              duration: entry.duration,
              curve: entry.curve,
            });
          }
        }
        break;
    }
  }

  return actions;
}
