import { describe, expect, it } from "vitest";
import { computeClickPulse, computeCursorRotation, interpolateArc } from "../arc";

const FROM = { x: 100, y: 100 };
const TO = { x: 500, y: 400 };

describe("interpolateArc", () => {
  it("returns from position at progress 0", () => {
    const pos = interpolateArc(FROM, TO, 0);
    expect(pos).toEqual(FROM);
  });

  it("returns to position at progress 1", () => {
    const pos = interpolateArc(FROM, TO, 1);
    expect(pos).toEqual(TO);
  });

  it("returns midpoint-ish at progress 0.5 (with arc bulge)", () => {
    const pos = interpolateArc(FROM, TO, 0.5);
    expect(pos.x).toBeGreaterThan(FROM.x);
    expect(pos.x).toBeLessThan(TO.x);
    expect(pos.y).toBeGreaterThan(FROM.y);
    expect(pos.y).toBeLessThan(TO.y);
  });

  it("clamps progress below 0", () => {
    const pos = interpolateArc(FROM, TO, -0.5);
    expect(pos).toEqual(FROM);
  });

  it("clamps progress above 1", () => {
    const pos = interpolateArc(FROM, TO, 1.5);
    expect(pos).toEqual(TO);
  });

  it("handles same from and to", () => {
    const pos = interpolateArc(FROM, FROM, 0.5);
    expect(pos.x).toBe(FROM.x);
    expect(pos.y).toBe(FROM.y);
  });

  it("respects custom canvas bounds for arc clamping", () => {
    const pos = interpolateArc(
      { x: 10, y: 10 },
      { x: 100, y: 10 },
      0.5,
      { canvas: { width: 200, height: 200 } },
    );
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThanOrEqual(200);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThanOrEqual(200);
  });

  it("produces smooth path (no jumps between samples)", () => {
    const samples = [];
    for (let i = 0; i <= 20; i++) {
      samples.push(interpolateArc(FROM, TO, i / 20));
    }
    for (let i = 1; i < samples.length; i++) {
      const dx = Math.abs(samples[i].x - samples[i - 1].x);
      const dy = Math.abs(samples[i].y - samples[i - 1].y);
      expect(dx).toBeLessThan(100);
      expect(dy).toBeLessThan(100);
    }
  });

  it("zero bulge produces straight line", () => {
    const mid = interpolateArc(FROM, TO, 0.5, { bulge: 0 });
    const expectedX = (FROM.x + TO.x) / 2;
    const expectedY = (FROM.y + TO.y) / 2;
    expect(mid.x).toBeCloseTo(expectedX, 0);
    expect(mid.y).toBeCloseTo(expectedY, 0);
  });
});

describe("computeClickPulse", () => {
  it("returns no pulse before click", () => {
    const result = computeClickPulse(-1);
    expect(result.scale).toBe(1);
    expect(result.opacity).toBe(0);
  });

  it("returns max pulse at frame 0", () => {
    const result = computeClickPulse(0);
    expect(result.scale).toBeLessThan(1);
    expect(result.opacity).toBe(1);
  });

  it("returns fading pulse at frame 1", () => {
    const result = computeClickPulse(1);
    expect(result.opacity).toBeGreaterThan(0);
    expect(result.opacity).toBeLessThan(1);
  });

  it("returns no pulse after duration", () => {
    const result = computeClickPulse(3);
    expect(result.scale).toBe(1);
    expect(result.opacity).toBe(0);
  });
});

describe("computeCursorRotation", () => {
  it("returns 0 at progress 0 and 1", () => {
    expect(computeCursorRotation(FROM, TO, 0)).toBe(0);
    expect(computeCursorRotation(FROM, TO, 1)).toBe(0);
  });

  it("returns positive rotation for rightward movement", () => {
    const rot = computeCursorRotation({ x: 0, y: 0 }, { x: 100, y: 0 }, 0.5);
    expect(rot).toBeGreaterThan(0);
  });

  it("returns negative rotation for leftward movement", () => {
    const rot = computeCursorRotation({ x: 100, y: 0 }, { x: 0, y: 0 }, 0.5);
    expect(rot).toBeLessThan(0);
  });

  it("peaks at mid-progress", () => {
    const rot25 = Math.abs(computeCursorRotation(FROM, TO, 0.25));
    const rot50 = Math.abs(computeCursorRotation(FROM, TO, 0.5));
    const rot75 = Math.abs(computeCursorRotation(FROM, TO, 0.75));
    expect(rot50).toBeGreaterThan(rot25);
    expect(rot50).toBeGreaterThan(rot75);
  });

  it("respects custom amplitude", () => {
    const rot = computeCursorRotation(FROM, TO, 0.5, 5);
    expect(Math.abs(rot)).toBeLessThanOrEqual(5);
  });
});
