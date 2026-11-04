import { layoutForOutput } from "../canvas";
import { projectForStorage, projectForTimeline } from "../project";
import { saveDefaultProps } from "@remotion/studio";
import { CinematicSchema } from "../schema";
import type { CinematicProps } from "../schema";

export type SaveStatus = { state: "saved" | "saving" | "error"; message: string };
let status: SaveStatus = { state: "saved", message: "All changes saved" };
const listeners = new Set<() => void>();
export const getSaveStatus = () => status;
export function subscribeToSaveStatus(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function report(next: SaveStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}

/** Remotion passes a wrapper to the reducer, not the props themselves. */
export function updateSavedProps(savedDefaultProps: unknown, updater: (prev: CinematicProps) => CinematicProps): CinematicProps {
  const saved = layoutForOutput(CinematicSchema.parse(savedDefaultProps));
  return CinematicSchema.parse(projectForStorage(updater(projectForTimeline(saved)), saved));
}

let queue = Promise.resolve();
let pending = 0;
let queuedProps: CinematicProps | undefined;
const staleSnapshots = new Set<string>();

export function persistUpdate(updater: (prev: CinematicProps) => CinematicProps): Promise<void> {
  pending++;
  report({ state: "saving", message: "Saving…" });
  queue = queue.then(async () => {
    try {
      let updated: CinematicProps | undefined;
      await saveDefaultProps({
        compositionId: "CinematicDemo",
        defaultProps: ({ savedDefaultProps }) => {
          const snapshot = JSON.stringify(savedDefaultProps);
          if (!staleSnapshots.has(snapshot) || (queuedProps && snapshot === JSON.stringify(queuedProps))) {
            queuedProps = undefined;
            staleSnapshots.clear();
          }
          staleSnapshots.add(snapshot);
          updated = updateSavedProps(queuedProps ?? savedDefaultProps, updater);
          return updated;
        },
      });
      queuedProps = updated;
      if (updated) staleSnapshots.add(JSON.stringify(updated));
      if (pending === 1) report({ state: "saved", message: "All changes saved" });
    } catch (error) {
      report({ state: "error", message: `Could not save: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      pending--;
    }
  });
  return queue;
}
