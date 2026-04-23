import type { SceneTiming } from "../types";

export type EasingPreset = "cinematic" | "snappy" | "linear";

export interface CameraKeyframe {
  scene: string;
  at: "start" | "end" | number;
  x: number;
  y: number;
  scale: number;
}

export interface ResolvedCameraKey {
  frame: number;
  x: number;
  y: number;
  scale: number;
}

export interface CameraPose {
  x: number;
  y: number;
  scale: number;
}

export type { SceneTiming };
