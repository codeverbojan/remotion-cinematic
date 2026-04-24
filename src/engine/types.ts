export interface SceneTiming {
  id: string;
  durationInFrames: number;
}

export interface SceneTimingMap {
  fps: number;
  scenes: SceneTiming[];
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface SFXEntry {
  src: string;
  volume?: number;
  durationInFrames?: number;
}

export function getSceneStartFrame(
  scenes: SceneTiming[],
  sceneId: string,
  overlap: number = 0,
): number {
  let frame = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i].id === sceneId) return frame;
    frame += scenes[i].durationInFrames - overlap;
  }
  return -1;
}

export interface SceneRange {
  id: string;
  startFrame: number;
  duration: number;
}

export function getSceneAtFrame(
  scenes: SceneTiming[],
  frame: number,
  overlap: number = 0,
): SceneRange | null {
  let start = 0;
  let result: SceneRange | null = null;
  for (const scene of scenes) {
    const end = start + scene.durationInFrames;
    if (frame >= start && frame < end) {
      result = { id: scene.id, startFrame: start, duration: scene.durationInFrames };
    }
    start += scene.durationInFrames - overlap;
  }
  return result;
}

export function getTotalFrames(scenes: SceneTiming[], overlap: number = 0): number {
  const sum = scenes.reduce((s, sc) => s + sc.durationInFrames, 0);
  return sum - overlap * Math.max(0, scenes.length - 1);
}
