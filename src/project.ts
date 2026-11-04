import { layoutForOutput } from "./canvas";
import type { CinematicProps, CursorPathEntry } from "./schema";
import { getSceneAtFrame, getSceneStartFrame } from "./engine/types";
import { defaultSceneForWindow } from "./sceneDefaults";

/** The Studio overlay uses composition frames; project files store scene-local frames. */
export function projectForTimeline(input: CinematicProps): CinematicProps {
  const props = layoutForOutput(input);
  const scenes = props.scenes.filter((s) => s.enabled);
  return { ...props, cursorPath: props.cursorPath.map((entry) => {
    if (!entry.sceneId) return entry; // Legacy absolute timestamps remain supported.
    const offset = getSceneStartFrame(scenes, entry.sceneId, props.overlap);
    return { ...entry, at: offset < 0 ? -entry.at - 1 : offset + entry.at };
  }) };
}

export function projectForStorage(props: CinematicProps, previous: CinematicProps): CinematicProps {
  const scenes = props.scenes.filter((s) => s.enabled);
  const cursorPath: CursorPathEntry[] = props.cursorPath.map((entry) => {
    if (entry.at < 0) return { ...entry, at: -entry.at - 1 };
    const win = props.windowLayout.find((w) => w.id === entry.target);
    const sceneId = entry.sceneId ?? win?.sceneId ?? (entry.target ? defaultSceneForWindow(entry.target) : undefined) ?? getSceneAtFrame(scenes, entry.at, props.overlap)?.id;
    if (!sceneId) return entry;
    const offset = getSceneStartFrame(scenes, sceneId, props.overlap);
    if (offset < 0) return entry;
    return { ...entry, sceneId, at: Math.max(0, entry.at - offset) };
  });
  return { ...props, cursorPath };
}
