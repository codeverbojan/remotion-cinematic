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

export function getTotalFrames(scenes: SceneTiming[], overlap: number = 0): number {
  const sum = scenes.reduce((s, sc) => s + sc.durationInFrames, 0);
  return sum - overlap * Math.max(0, scenes.length - 1);
}
