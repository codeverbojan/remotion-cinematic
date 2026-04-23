import { describe, expect, it } from "vitest";
import { getEnterPose } from "../Enter";

describe("getEnterPose", () => {
  it("returns invisible before delay", () => {
    const pose = getEnterPose(0, 10, 12, 20, 0.9);
    expect(pose.opacity).toBe(0);
    expect(pose.translateY).toBe(20);
    expect(pose.scale).toBe(0.9);
  });

  it("returns fully visible after delay + duration", () => {
    const pose = getEnterPose(22, 10, 12, 20, 0.9);
    expect(pose.opacity).toBe(1);
    expect(pose.translateY).toBe(0);
    expect(pose.scale).toBe(1);
  });

  it("interpolates during animation", () => {
    const pose = getEnterPose(16, 10, 12, 20, 0.9);
    expect(pose.opacity).toBeGreaterThan(0);
    expect(pose.opacity).toBeLessThan(1);
    expect(pose.translateY).toBeGreaterThan(0);
    expect(pose.translateY).toBeLessThan(20);
  });

  it("works with zero delay", () => {
    const pose = getEnterPose(12, 0, 12, 20, 1);
    expect(pose.opacity).toBe(1);
    expect(pose.translateY).toBe(0);
  });

  it("works with scale of 1 (no scale change)", () => {
    const pose = getEnterPose(0, 0, 10, 0, 1);
    expect(pose.scale).toBe(1);
    expect(pose.translateY).toBe(0);
  });

  it("holds at fully visible indefinitely", () => {
    const pose = getEnterPose(1000, 0, 10, 20, 0.9);
    expect(pose.opacity).toBe(1);
    expect(pose.translateY).toBe(0);
    expect(pose.scale).toBe(1);
  });

  it("interpolates translateX", () => {
    const before = getEnterPose(0, 0, 10, 0, 1, 200, 0);
    expect(before.translateX).toBe(200);
    const after = getEnterPose(10, 0, 10, 0, 1, 200, 0);
    expect(after.translateX).toBe(0);
    const mid = getEnterPose(5, 0, 10, 0, 1, 200, 0);
    expect(mid.translateX).toBeGreaterThan(0);
    expect(mid.translateX).toBeLessThan(200);
  });

  it("interpolates rotate", () => {
    const before = getEnterPose(0, 0, 10, 0, 1, 0, -5);
    expect(before.rotate).toBe(-5);
    const after = getEnterPose(10, 0, 10, 0, 1, 0, -5);
    expect(after.rotate).toBe(0);
    const mid = getEnterPose(5, 0, 10, 0, 1, 0, -5);
    expect(mid.rotate).toBeGreaterThan(-5);
    expect(mid.rotate).toBeLessThan(0);
  });

  it("defaults translateX and rotate to zero", () => {
    const pose = getEnterPose(5, 0, 10, 20, 0.9);
    expect(pose.translateX).toBe(0);
    expect(pose.rotate).toBe(0);
  });
});
