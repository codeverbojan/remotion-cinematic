import type { CursorPathEntry } from "../../schema";

export function filterCursorPath(
  entries: readonly CursorPathEntry[],
  windowIds: readonly string[],
  globalOffset: number = 0,
  sceneDuration: number = Infinity,
  sceneId?: string,
): CursorPathEntry[] {
  const idSet = new Set(windowIds);
  return entries
    .filter(
      (e) =>
        (!sceneId || !e.sceneId || e.sceneId === sceneId) &&
        ((e.target && idSet.has(e.target)) || (!e.target && e.positionX !== undefined)) &&
        e.at >= globalOffset &&
        e.at < globalOffset + sceneDuration,
    )
    .map((e) => ({ ...e, at: e.at - globalOffset }));
}
