import type { SceneTiming } from "../types";
import { getSceneStartFrame } from "../types";
import type { AudioCue, DuckingRange, ResolvedAudioCue } from "./types";

export function resolveCues(
  cues: AudioCue[],
  scenes: SceneTiming[],
  overlap: number = 0,
): ResolvedAudioCue[] {
  const resolved: ResolvedAudioCue[] = [];

  for (const cue of cues) {
    const sceneStart = getSceneStartFrame(scenes, cue.scene, overlap);
    if (sceneStart < 0) continue;

    resolved.push({
      frame: sceneStart + cue.at,
      sfx: cue.sfx,
      volume: cue.volume ?? 0.5,
      durationInFrames: cue.durationInFrames,
    });
  }

  resolved.sort((a, b) => a.frame - b.frame);
  return resolved;
}

export function computeMusicVolume(
  frame: number,
  totalFrames: number,
  baseVolume: number,
  fadeInFrames: number,
  fadeOutFrames: number,
  duckingRanges: DuckingRange[],
): number {
  let vol = baseVolume;

  if (fadeInFrames > 0 && frame < fadeInFrames) {
    vol *= frame / fadeInFrames;
  }

  const fadeOutStart = totalFrames - fadeOutFrames;
  if (fadeOutFrames > 0 && frame > fadeOutStart) {
    vol *= (totalFrames - frame) / fadeOutFrames;
  }

  const DUCK_RAMP = 8;

  for (const range of duckingRanges) {
    if (frame >= range.startFrame - DUCK_RAMP && frame <= range.endFrame + DUCK_RAMP) {
      let target = range.duckedVolume;
      if (frame < range.startFrame) {
        const t = (range.startFrame - frame) / DUCK_RAMP;
        target = range.duckedVolume + (vol - range.duckedVolume) * t;
      } else if (frame > range.endFrame) {
        const t = (frame - range.endFrame) / DUCK_RAMP;
        target = range.duckedVolume + (vol - range.duckedVolume) * t;
      }
      vol = Math.min(vol, target);
      break;
    }
  }

  return Math.max(0, vol);
}
