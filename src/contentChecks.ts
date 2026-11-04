import type { CinematicProps } from "./schema";
import { defaultSceneForWindow } from "./sceneDefaults";

export function fitTextSize(lines: readonly string[], requested: number, width: number, height: number): number {
  const longest = Math.max(1, ...lines.map((line) => Array.from(line).length));
  return Math.max(24, Math.min(requested, width / (longest * 0.62), height / (Math.max(1, lines.length) * 1.3)));
}

export function contentWarnings(props: CinematicProps): string[] {
  const warnings: string[] = [];
  const scenes = props.scenes.filter((s) => s.enabled);
  if (!scenes.length) warnings.push("Enable at least one scene before exporting.");
  for (const scene of scenes) {
    if (scene.durationInFrames <= props.overlap * 2) warnings.push(`${scene.id}: transitions leave no time to read the content. Increase its duration or reduce overlap.`);
    const key = scene.id === "chaos" ? "pain" : scene.id === "headline-resolution" ? "resolution" : scene.id === "closer" ? "closer" : undefined;
    if (key) {
      const lines = props.headlines[key];
      const words = lines.join(' ').split(/\s+/).filter(Boolean).length;
      const start = scene.id === "chaos" ? props.windowLayout.find((w) => w.id === "spreadsheet")?.animateAt ?? 150 : 0;
      if (start + words * 8 + props.overlap > scene.durationInFrames) warnings.push(`${scene.id}: give the headline more reading time or shorten the copy.`);
      if (lines.some((line) => line.length > 70)) warnings.push(`${scene.id}: split long headlines into shorter lines for readability.`);
    }
  }
  for (const entry of props.cursorPath) {
    const scene = scenes.find((s) => s.id === entry.sceneId);
    if (scene && entry.at + (entry.duration ?? 1) >= scene.durationInFrames) warnings.push(`${scene.id}: a cursor action extends beyond the scene. Retiming or a longer scene is needed.`);
    if (entry.target && !props.windowLayout.some((w) => w.id === entry.target)) warnings.push(`Cursor target "${entry.target}" is missing.`);
  }
  for (const feature of props.productFeatures) {
    if (feature.title.length > 60 || feature.description.length > 180) warnings.push(`${feature.title}: shorten feature copy so the detail card remains readable.`);
  }
  for (const win of props.windowLayout) {
    const scene = scenes.find((s) => s.id === (win.sceneId ?? defaultSceneForWindow(win.id)));
    if (scene && win.enterAt + win.enterDuration >= scene.durationInFrames) warnings.push(`${win.title}: the window has no visible hold before the scene ends.`);
  }
  return [...new Set(warnings)];
}
