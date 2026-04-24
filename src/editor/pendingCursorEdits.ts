import type { CursorPathEntry } from "../schema";

type PendingEdit = { positionX: number; positionY: number };

const pending = new Map<number, PendingEdit>();
let revision = 0;

export function setPendingDrag(index: number, pos: { x: number; y: number }): void {
  pending.set(index, { positionX: pos.x, positionY: pos.y });
  revision++;
}

export function clearPendingDrag(index: number): void {
  pending.delete(index);
}

export function getPendingRevision(): number {
  return revision;
}

export function applyPendingEdits(
  entries: readonly CursorPathEntry[],
): CursorPathEntry[] {
  if (pending.size === 0) return entries as CursorPathEntry[];
  return entries.map((e, i) => {
    const edit = pending.get(i);
    if (!edit) return e;
    const { target: _, ...rest } = e;
    return { ...rest, positionX: edit.positionX, positionY: edit.positionY };
  });
}
