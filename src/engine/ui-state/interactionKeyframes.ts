import type { CursorAction } from "../cursor/types";
import type { UIKeyframe } from "./types";
export function panelInteractionKeyframes(actions: readonly CursorAction[]): UIKeyframe[] {
  const targets: Record<string, string> = { "top-panel": "top-inner-panel", "left-panel": "left-inner-panel" };
  return [
    ...Object.values(targets).map((target) => ({at: 0, target, set: {expanded: false}})),
    ...actions.flatMap((action) => action.action === "click" && action.target && targets[action.target] ? [{at: action.at, target: targets[action.target], set: {expanded: true}}] : []),
  ];
}
