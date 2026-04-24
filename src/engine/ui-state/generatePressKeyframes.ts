import type { CursorAction } from "../cursor/types";
import type { UIKeyframe } from "./types";

const PRESS_DURATION = 4;

export function generatePressKeyframes(actions: readonly CursorAction[]): UIKeyframe[] {
  const keyframes: UIKeyframe[] = [];

  for (const action of actions) {
    if (action.action === "click") {
      keyframes.push({
        at: action.at,
        target: action.target,
        set: { pressed: true, pressedAt: action.at },
      });
      keyframes.push({
        at: action.at + PRESS_DURATION,
        target: action.target,
        set: { pressed: false },
      });
    }
  }

  return keyframes;
}
