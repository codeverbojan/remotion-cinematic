import { describe, expect, it } from "vitest";
import { interpolateCamera } from "../interpolate";
import type { ResolvedCameraKey } from "../types";

const KEYS: ResolvedCameraKey[] = [
  { frame: 0, x: 0, y: 0, scale: 1.0 },
  { frame: 100, x: -50, y: -30, scale: 1.2 },
  { frame: 200, x: 0, y: 0, scale: 1.0 },
];

describe("interpolateCamera", () => {
  it("returns first key before all keyframes", () => {
    const pose = interpolateCamera(KEYS, -10);
    expect(pose).toEqual({ x: 0, y: 0, scale: 1 });
  });

  it("returns exact key at keyframe frame", () => {
    const pose = interpolateCamera(KEYS, 0);
    expect(pose).toEqual({ x: 0, y: 0, scale: 1 });
  });

  it("returns last key after all keyframes", () => {
    const pose = interpolateCamera(KEYS, 300);
    expect(pose).toEqual({ x: 0, y: 0, scale: 1 });
  });

  it("interpolates between keyframes", () => {
    const pose = interpolateCamera(KEYS, 50, "linear");
    expect(pose.x).toBeCloseTo(-25, 0);
    expect(pose.y).toBeCloseTo(-15, 0);
    expect(pose.scale).toBeCloseTo(1.1, 1);
  });

  it("returns neutral for empty keys", () => {
    const pose = interpolateCamera([], 50);
    expect(pose).toEqual({ x: 0, y: 0, scale: 1 });
  });

  it("handles single key", () => {
    const pose = interpolateCamera([KEYS[0]], 50);
    expect(pose).toEqual({ x: 0, y: 0, scale: 1 });
  });

  it("cinematic easing differs from linear", () => {
    const linear = interpolateCamera(KEYS, 50, "linear");
    const cinematic = interpolateCamera(KEYS, 50, "cinematic");
    expect(cinematic.x).not.toBeCloseTo(linear.x, 5);
  });

  it("snappy easing differs from linear", () => {
    const linear = interpolateCamera(KEYS, 50, "linear");
    const snappy = interpolateCamera(KEYS, 50, "snappy");
    expect(snappy.x).not.toBeCloseTo(linear.x, 5);
  });

  it("reaches exact end values at last frame", () => {
    const pose = interpolateCamera(KEYS, 200);
    expect(pose).toEqual({ x: 0, y: 0, scale: 1 });
  });
});
