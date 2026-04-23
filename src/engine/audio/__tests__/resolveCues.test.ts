import { describe, expect, it } from "vitest";
import type { SceneTiming } from "../../types";
import { computeMusicVolume, resolveCues } from "../resolveCues";
import type { AudioCue, DuckingRange } from "../types";

const SCENES: SceneTiming[] = [
  { id: "intro", durationInFrames: 100 },
  { id: "middle", durationInFrames: 200 },
  { id: "outro", durationInFrames: 100 },
];

describe("resolveCues", () => {
  it("resolves scene-relative cues to absolute frames", () => {
    const cues: AudioCue[] = [
      { scene: "intro", at: 10, sfx: "sfx/ui/click.mp3", volume: 0.6 },
      { scene: "middle", at: 50, sfx: "sfx/transitions/whoosh.mp3", volume: 0.8 },
    ];

    const resolved = resolveCues(cues, SCENES);
    expect(resolved[0].frame).toBe(10);
    expect(resolved[1].frame).toBe(150);
  });

  it("uses default volume of 0.5 when not specified", () => {
    const cues: AudioCue[] = [
      { scene: "intro", at: 0, sfx: "sfx/ui/click.mp3" },
    ];

    const resolved = resolveCues(cues, SCENES);
    expect(resolved[0].volume).toBe(0.5);
  });

  it("skips cues for missing scenes", () => {
    const cues: AudioCue[] = [
      { scene: "intro", at: 0, sfx: "sfx/a.mp3" },
      { scene: "gone", at: 0, sfx: "sfx/b.mp3" },
    ];

    const resolved = resolveCues(cues, SCENES);
    expect(resolved).toHaveLength(1);
  });

  it("returns sorted by frame", () => {
    const cues: AudioCue[] = [
      { scene: "outro", at: 10, sfx: "sfx/b.mp3" },
      { scene: "intro", at: 5, sfx: "sfx/a.mp3" },
    ];

    const resolved = resolveCues(cues, SCENES);
    expect(resolved[0].frame).toBeLessThan(resolved[1].frame);
  });

  it("returns empty for empty cues", () => {
    expect(resolveCues([], SCENES)).toEqual([]);
  });

  it("preserves durationInFrames", () => {
    const cues: AudioCue[] = [
      { scene: "intro", at: 0, sfx: "sfx/a.mp3", durationInFrames: 45 },
    ];

    const resolved = resolveCues(cues, SCENES);
    expect(resolved[0].durationInFrames).toBe(45);
  });
});

describe("computeMusicVolume", () => {
  const TOTAL = 400;
  const BASE = 0.5;
  const FADE_IN = 30;
  const FADE_OUT = 60;

  it("fades in during first N frames", () => {
    const vol0 = computeMusicVolume(0, TOTAL, BASE, FADE_IN, FADE_OUT, []);
    const vol15 = computeMusicVolume(15, TOTAL, BASE, FADE_IN, FADE_OUT, []);
    const vol30 = computeMusicVolume(30, TOTAL, BASE, FADE_IN, FADE_OUT, []);

    expect(vol0).toBe(0);
    expect(vol15).toBeCloseTo(0.25, 2);
    expect(vol30).toBeCloseTo(0.5, 2);
  });

  it("returns base volume in the middle", () => {
    const vol = computeMusicVolume(200, TOTAL, BASE, FADE_IN, FADE_OUT, []);
    expect(vol).toBe(BASE);
  });

  it("fades out during last N frames", () => {
    const vol340 = computeMusicVolume(340, TOTAL, BASE, FADE_IN, FADE_OUT, []);
    const vol370 = computeMusicVolume(370, TOTAL, BASE, FADE_IN, FADE_OUT, []);
    const vol400 = computeMusicVolume(400, TOTAL, BASE, FADE_IN, FADE_OUT, []);

    expect(vol340).toBe(BASE);
    expect(vol370).toBeCloseTo(0.25, 2);
    expect(vol400).toBe(0);
  });

  it("ducks volume during ducking ranges with smooth ramp", () => {
    const ranges: DuckingRange[] = [
      { startFrame: 100, endFrame: 200, duckedVolume: 0.1 },
    ];

    const volWellBefore = computeMusicVolume(80, TOTAL, BASE, FADE_IN, FADE_OUT, ranges);
    const volRampIn = computeMusicVolume(96, TOTAL, BASE, FADE_IN, FADE_OUT, ranges);
    const volDuring = computeMusicVolume(150, TOTAL, BASE, FADE_IN, FADE_OUT, ranges);
    const volRampOut = computeMusicVolume(204, TOTAL, BASE, FADE_IN, FADE_OUT, ranges);
    const volWellAfter = computeMusicVolume(220, TOTAL, BASE, FADE_IN, FADE_OUT, ranges);

    expect(volWellBefore).toBe(BASE);
    expect(volRampIn).toBeLessThan(BASE);
    expect(volRampIn).toBeGreaterThan(0.1);
    expect(volDuring).toBe(0.1);
    expect(volRampOut).toBeLessThan(BASE);
    expect(volRampOut).toBeGreaterThan(0.1);
    expect(volWellAfter).toBe(BASE);
  });

  it("handles zero fade durations", () => {
    const vol = computeMusicVolume(0, TOTAL, BASE, 0, 0, []);
    expect(vol).toBe(BASE);
  });

  it("never returns negative volume", () => {
    const vol = computeMusicVolume(-10, TOTAL, BASE, FADE_IN, FADE_OUT, []);
    expect(vol).toBeGreaterThanOrEqual(0);
  });

  it("handles overlapping fade and duck", () => {
    const ranges: DuckingRange[] = [
      { startFrame: 0, endFrame: 30, duckedVolume: 0.05 },
    ];

    const vol = computeMusicVolume(10, TOTAL, BASE, FADE_IN, FADE_OUT, ranges);
    expect(vol).toBeLessThanOrEqual(0.05);
  });
});
