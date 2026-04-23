import type { SceneTiming } from "../types";
import { getSceneStartFrame } from "../types";
import type { CameraKeyframe, ResolvedCameraKey } from "./types";

export function resolveTimeline(
  keyframes: CameraKeyframe[],
  scenes: SceneTiming[],
  overlap: number = 0,
): ResolvedCameraKey[] {
  const resolved: ResolvedCameraKey[] = [];

  for (const kf of keyframes) {
    const sceneStart = getSceneStartFrame(scenes, kf.scene, overlap);
    if (sceneStart < 0) continue;

    const scene = scenes.find((s) => s.id === kf.scene)!;
    let frame: number;

    if (kf.at === "start") {
      frame = sceneStart;
    } else if (kf.at === "end") {
      frame = sceneStart + scene.durationInFrames - 1;
    } else {
      const clamped = Math.max(0, Math.min(1, kf.at));
      frame = sceneStart + Math.round((scene.durationInFrames - 1) * clamped);
    }

    resolved.push({
      frame,
      x: kf.x,
      y: kf.y,
      scale: kf.scale,
    });
  }

  resolved.sort((a, b) => a.frame - b.frame);
  return resolved;
}
