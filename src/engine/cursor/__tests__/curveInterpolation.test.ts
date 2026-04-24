import { describe, expect, it } from "vitest";
import { interpolateLinear, interpolateEase, interpolateCurve, interpolateArc } from "../arc";

const FROM = { x: 100, y: 100 };
const TO = { x: 500, y: 400 };

describe("interpolateLinear", () => {
  it("returns from at progress 0", () => {
    expect(interpolateLinear(FROM, TO, 0)).toEqual(FROM);
  });

  it("returns to at progress 1", () => {
    expect(interpolateLinear(FROM, TO, 1)).toEqual(TO);
  });

  it("returns exact midpoint at 0.5", () => {
    const mid = interpolateLinear(FROM, TO, 0.5);
    expect(mid.x).toBe(300);
    expect(mid.y).toBe(250);
  });

  it("clamps below 0", () => {
    expect(interpolateLinear(FROM, TO, -1)).toEqual(FROM);
  });

  it("clamps above 1", () => {
    expect(interpolateLinear(FROM, TO, 2)).toEqual(TO);
  });

  it("produces perfectly straight path", () => {
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const pos = interpolateLinear(FROM, TO, t);
      expect(pos.x).toBeCloseTo(FROM.x + (TO.x - FROM.x) * t, 10);
      expect(pos.y).toBeCloseTo(FROM.y + (TO.y - FROM.y) * t, 10);
    }
  });

  it("handles same from and to (zero distance)", () => {
    const pos = interpolateLinear(FROM, FROM, 0.5);
    expect(pos).toEqual(FROM);
  });
});

describe("interpolateEase", () => {
  it("returns from at progress 0", () => {
    expect(interpolateEase(FROM, TO, 0)).toEqual(FROM);
  });

  it("returns to at progress 1", () => {
    expect(interpolateEase(FROM, TO, 1)).toEqual(TO);
  });

  it("starts slow (less distance at t=0.25 than linear)", () => {
    const eased = interpolateEase(FROM, TO, 0.25);
    const linear = interpolateLinear(FROM, TO, 0.25);
    expect(eased.x - FROM.x).toBeLessThan(linear.x - FROM.x);
  });

  it("ends slow (less remaining distance at t=0.75 than linear)", () => {
    const eased = interpolateEase(FROM, TO, 0.75);
    const linear = interpolateLinear(FROM, TO, 0.75);
    expect(TO.x - eased.x).toBeLessThan(TO.x - linear.x);
  });

  it("midpoint matches linear exactly (smoothstep property)", () => {
    const eased = interpolateEase(FROM, TO, 0.5);
    const linear = interpolateLinear(FROM, TO, 0.5);
    expect(eased.x).toBeCloseTo(linear.x, 5);
    expect(eased.y).toBeCloseTo(linear.y, 5);
  });

  it("clamps below 0", () => {
    expect(interpolateEase(FROM, TO, -0.5)).toEqual(FROM);
  });

  it("clamps above 1", () => {
    expect(interpolateEase(FROM, TO, 1.5)).toEqual(TO);
  });

  it("handles same from and to (zero distance)", () => {
    const pos = interpolateEase(FROM, FROM, 0.5);
    expect(pos).toEqual(FROM);
  });
});

describe("interpolateCurve", () => {
  it("defaults to arc when curve is undefined", () => {
    const result = interpolateCurve(FROM, TO, 0.5);
    const arcResult = interpolateArc(FROM, TO, 0.5);
    expect(result.x).toBeCloseTo(arcResult.x, 10);
    expect(result.y).toBeCloseTo(arcResult.y, 10);
  });

  it("dispatches to arc", () => {
    const result = interpolateCurve(FROM, TO, 0.5, "arc");
    const arcResult = interpolateArc(FROM, TO, 0.5);
    expect(result.x).toBeCloseTo(arcResult.x, 10);
    expect(result.y).toBeCloseTo(arcResult.y, 10);
  });

  it("dispatches to linear", () => {
    const result = interpolateCurve(FROM, TO, 0.5, "linear");
    const linearResult = interpolateLinear(FROM, TO, 0.5);
    expect(result).toEqual(linearResult);
  });

  it("dispatches to ease", () => {
    const result = interpolateCurve(FROM, TO, 0.5, "ease");
    const easeResult = interpolateEase(FROM, TO, 0.5);
    expect(result).toEqual(easeResult);
  });

  it("passes config through to arc", () => {
    const result = interpolateCurve(FROM, TO, 0.5, "arc", { bulge: 0 });
    const midX = (FROM.x + TO.x) / 2;
    const midY = (FROM.y + TO.y) / 2;
    expect(result.x).toBeCloseTo(midX, 0);
    expect(result.y).toBeCloseTo(midY, 0);
  });

  it("all curves agree at endpoints", () => {
    for (const curve of ["arc", "linear", "ease"] as const) {
      const start = interpolateCurve(FROM, TO, 0, curve);
      const end = interpolateCurve(FROM, TO, 1, curve);
      expect(start).toEqual(FROM);
      expect(end).toEqual(TO);
    }
  });
});
