import { describe, expect, it } from "vitest";
import type { SceneTiming } from "../../types";
import { resolveTimeline } from "../resolveTimeline";
import type { CameraKeyframe } from "../types";

const SCENES: SceneTiming[] = [
  { id: "intro", durationInFrames: 100 },
  { id: "middle", durationInFrames: 200 },
  { id: "outro", durationInFrames: 100 },
];

describe("resolveTimeline", () => {
  it("resolves start and end to correct absolute frames", () => {
    const keys: CameraKeyframe[] = [
      { scene: "intro", at: "start", x: 0, y: 0, scale: 1 },
      { scene: "intro", at: "end", x: 0, y: 0, scale: 1.1 },
      { scene: "middle", at: "start", x: 10, y: 0, scale: 1 },
      { scene: "outro", at: "end", x: 0, y: 0, scale: 1 },
    ];

    const resolved = resolveTimeline(keys, SCENES);

    expect(resolved[0].frame).toBe(0);
    expect(resolved[1].frame).toBe(99);
    expect(resolved[2].frame).toBe(100);
    expect(resolved[3].frame).toBe(399);
  });

  it("resolves fractional 'at' as portion of scene duration", () => {
    const keys: CameraKeyframe[] = [
      { scene: "middle", at: 0.5, x: 0, y: 0, scale: 1.2 },
    ];

    const resolved = resolveTimeline(keys, SCENES);
    // middle starts at frame 100, half of (200-1) = 99.5, rounded = 100
    expect(resolved[0].frame).toBe(100 + 100);
  });

  it("skips keyframes for missing scenes", () => {
    const keys: CameraKeyframe[] = [
      { scene: "intro", at: "start", x: 0, y: 0, scale: 1 },
      { scene: "deleted-scene", at: "start", x: 0, y: 0, scale: 2 },
      { scene: "outro", at: "end", x: 0, y: 0, scale: 1 },
    ];

    const resolved = resolveTimeline(keys, SCENES);
    expect(resolved).toHaveLength(2);
    expect(resolved[0].frame).toBe(0);
    expect(resolved[1].frame).toBe(399);
  });

  it("returns sorted by frame even if input is unsorted", () => {
    const keys: CameraKeyframe[] = [
      { scene: "outro", at: "end", x: 0, y: 0, scale: 1 },
      { scene: "intro", at: "start", x: 0, y: 0, scale: 1 },
    ];

    const resolved = resolveTimeline(keys, SCENES);
    expect(resolved[0].frame).toBeLessThan(resolved[1].frame);
  });

  it("returns empty for empty keyframes", () => {
    expect(resolveTimeline([], SCENES)).toEqual([]);
  });

  it("handles scene reordering", () => {
    const reordered: SceneTiming[] = [
      { id: "outro", durationInFrames: 100 },
      { id: "intro", durationInFrames: 100 },
      { id: "middle", durationInFrames: 200 },
    ];

    const keys: CameraKeyframe[] = [
      { scene: "intro", at: "start", x: 0, y: 0, scale: 1 },
      { scene: "middle", at: "start", x: 0, y: 0, scale: 1.1 },
    ];

    const resolved = resolveTimeline(keys, reordered);
    expect(resolved[0].frame).toBe(100);
    expect(resolved[1].frame).toBe(200);
  });
});
