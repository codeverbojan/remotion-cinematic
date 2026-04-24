export interface UIKeyframe {
  at: number;
  target: string;
  set: Record<string, unknown>;
}

function isSorted(keyframes: readonly UIKeyframe[]): boolean {
  for (let i = 1; i < keyframes.length; i++) {
    if (keyframes[i].at < keyframes[i - 1].at) return false;
  }
  return true;
}

export function resolveUIState<T extends object>(
  keyframes: readonly UIKeyframe[],
  target: string,
  frame: number,
  defaultState: T,
): T {
  const sorted = isSorted(keyframes)
    ? keyframes
    : [...keyframes].sort((a, b) => a.at - b.at);

  let state = defaultState;
  let changed = false;

  for (const kf of sorted) {
    if (kf.at > frame) break;
    if (kf.target === target) {
      if (!changed) {
        state = { ...defaultState };
        changed = true;
      }
      Object.assign(state, kf.set);
    }
  }

  return state;
}
