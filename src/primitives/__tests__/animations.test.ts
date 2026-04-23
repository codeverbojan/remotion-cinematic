import { describe, expect, it } from "vitest";
import { getExitPose } from "../Exit";
import { getTypeWriterPose } from "../TypeWriter";
import { getHighlightPose } from "../Highlight";
import { getPulsePose } from "../Pulse";
import { getCountUpPose } from "../CountUp";
import { getStaggerItemPose } from "../Stagger";

describe("getExitPose", () => {
  it("returns full opacity before startAt", () => {
    const pose = getExitPose(0, 10, 12, -20, 0.9);
    expect(pose.opacity).toBe(1);
    expect(pose.translateY).toBe(0);
    expect(pose.scale).toBe(1);
  });

  it("fades to zero after full duration", () => {
    const pose = getExitPose(100, 10, 12, -20, 0.9);
    expect(pose.opacity).toBe(0);
  });

  it("translates during exit", () => {
    const mid = getExitPose(16, 10, 12, -30, 1);
    expect(mid.translateY).toBeLessThan(0);
    expect(mid.translateY).toBeGreaterThan(-30);
  });

  it("scales during exit", () => {
    const mid = getExitPose(16, 10, 12, 0, 0.8);
    expect(mid.scale).toBeLessThan(1);
    expect(mid.scale).toBeGreaterThan(0.8);
  });

  it("handles translateX and rotate", () => {
    const pose = getExitPose(100, 10, 12, 0, 1, 50, 15);
    expect(pose.translateX).toBe(50);
    expect(pose.rotate).toBe(15);
  });

  it("guards against zero duration", () => {
    const pose = getExitPose(10, 10, 0, -20, 0.9);
    expect(pose.opacity).toBeGreaterThanOrEqual(0);
    expect(pose.opacity).toBeLessThanOrEqual(1);
  });
});

describe("getTypeWriterPose", () => {
  it("shows zero chars before delay", () => {
    const pose = getTypeWriterPose(0, 10, 20, 2, 8);
    expect(pose.visibleChars).toBe(0);
    expect(pose.done).toBe(false);
  });

  it("reveals chars at correct speed", () => {
    const pose = getTypeWriterPose(14, 10, 20, 2, 8);
    expect(pose.visibleChars).toBe(2);
  });

  it("completes when all chars visible", () => {
    const pose = getTypeWriterPose(100, 0, 5, 2, 8);
    expect(pose.visibleChars).toBe(5);
    expect(pose.done).toBe(true);
  });

  it("cursor blinks after done", () => {
    const results = [];
    for (let f = 20; f < 36; f++) {
      results.push(getTypeWriterPose(f, 0, 5, 2, 8).cursorVisible);
    }
    const hasTrue = results.includes(true);
    const hasFalse = results.includes(false);
    expect(hasTrue).toBe(true);
    expect(hasFalse).toBe(true);
  });

  it("cursor is steady during typing", () => {
    const pose = getTypeWriterPose(12, 10, 20, 2, 8);
    expect(pose.cursorVisible).toBe(true);
  });

  it("never exceeds text length", () => {
    const pose = getTypeWriterPose(9999, 0, 3, 1, 8);
    expect(pose.visibleChars).toBe(3);
  });
});

describe("getHighlightPose", () => {
  it("starts at zero intensity before delay", () => {
    const pose = getHighlightPose(0, 10, 8, 0, 10);
    expect(pose.intensity).toBe(0);
  });

  it("reaches full intensity after fade-in", () => {
    const pose = getHighlightPose(100, 10, 8, 0, 10);
    expect(pose.intensity).toBeCloseTo(1, 1);
  });

  it("holds intensity during holdFrames", () => {
    const pose = getHighlightPose(25, 10, 8, 30, 10);
    expect(pose.intensity).toBeCloseTo(1, 1);
  });

  it("fades out after hold period", () => {
    const pose = getHighlightPose(100, 10, 8, 10, 10);
    expect(pose.intensity).toBeCloseTo(0, 1);
  });

  it("stays at full intensity when holdFrames is 0 (no fade out)", () => {
    const pose = getHighlightPose(50, 10, 8, 0, 10);
    expect(pose.intensity).toBeCloseTo(1, 2);
  });
});

describe("getPulsePose", () => {
  it("returns scale 1 before delay", () => {
    const pose = getPulsePose(0, 10, 20, 1.06, 0);
    expect(pose.scale).toBe(1);
    expect(pose.active).toBe(false);
  });

  it("pulses between 1 and intensity", () => {
    const scales: number[] = [];
    for (let f = 10; f < 30; f++) {
      scales.push(getPulsePose(f, 10, 20, 1.1, 0).scale);
    }
    expect(Math.min(...scales)).toBeCloseTo(1, 2);
    expect(Math.max(...scales)).toBeCloseTo(1.1, 1);
  });

  it("stops after count cycles", () => {
    const pose = getPulsePose(100, 0, 20, 1.06, 2);
    expect(pose.active).toBe(false);
    expect(pose.scale).toBe(1);
  });

  it("count=0 means infinite", () => {
    const pose = getPulsePose(1000, 0, 20, 1.06, 0);
    expect(pose.active).toBe(true);
  });

  it("returns exactly 1 at cycle start", () => {
    const pose = getPulsePose(10, 10, 20, 1.06, 0);
    expect(pose.scale).toBeCloseTo(1, 5);
  });

  it("is deterministic", () => {
    const a = getPulsePose(15, 0, 20, 1.05, 3);
    const b = getPulsePose(15, 0, 20, 1.05, 3);
    expect(a.scale).toBe(b.scale);
  });
});

describe("getCountUpPose", () => {
  it("starts at from value before delay", () => {
    const pose = getCountUpPose(0, 10, 30, 0, 100, 0, "", "", ",");
    expect(pose.value).toBe(0);
    expect(pose.display).toBe("0");
  });

  it("reaches near-target value after duration", () => {
    const pose = getCountUpPose(100, 0, 30, 0, 500, 0, "", "", ",");
    expect(pose.value).toBeCloseTo(500, 0);
    expect(pose.progress).toBeCloseTo(1, 2);
  });

  it("formats with prefix and suffix", () => {
    const pose = getCountUpPose(0, 0, 10, 1000, 1000, 0, "$", "k", ",");
    expect(pose.display).toBe("$1,000k");
  });

  it("handles decimals", () => {
    const pose = getCountUpPose(0, 0, 10, 99.5, 99.5, 1, "", "%", ",");
    expect(pose.display).toBe("99.5%");
  });

  it("formats with thousand separators", () => {
    const pose = getCountUpPose(0, 0, 10, 1234567, 1234567, 0, "", "", ",");
    expect(pose.display).toBe("1,234,567");
  });

  it("works without separator", () => {
    const pose = getCountUpPose(0, 0, 10, 1234567, 1234567, 0, "", "", "");
    expect(pose.display).toBe("1234567");
  });

  it("handles negative values", () => {
    const pose = getCountUpPose(0, 0, 10, -50, -50, 0, "", "", ",");
    expect(pose.value).toBe(-50);
    expect(pose.display).toBe("-50");
  });

  it("progress is clamped 0-1", () => {
    const before = getCountUpPose(0, 10, 30, 0, 100, 0, "", "", ",");
    const after = getCountUpPose(200, 0, 30, 0, 100, 0, "", "", ",");
    expect(before.progress).toBe(0);
    expect(after.progress).toBeCloseTo(1, 2);
  });
});

describe("getStaggerItemPose", () => {
  it("first item starts at base delay", () => {
    const pose = getStaggerItemPose(5, 0, 4, 0, 12, 20, 0, 1);
    expect(pose.delay).toBe(0);
    expect(pose.opacity).toBeGreaterThan(0);
  });

  it("later items start later", () => {
    const pose0 = getStaggerItemPose(5, 0, 4, 0, 12, 20, 0, 1);
    const pose2 = getStaggerItemPose(5, 2, 4, 0, 12, 20, 0, 1);
    expect(pose2.delay).toBe(8);
    expect(pose2.opacity).toBeLessThan(pose0.opacity);
  });

  it("respects base delay", () => {
    const pose = getStaggerItemPose(0, 0, 4, 10, 12, 20, 0, 1);
    expect(pose.delay).toBe(10);
    expect(pose.opacity).toBe(0);
  });

  it("all items fully visible after enough frames", () => {
    for (let i = 0; i < 5; i++) {
      const pose = getStaggerItemPose(200, i, 4, 0, 12, 20, 0, 1);
      expect(pose.opacity).toBe(1);
      expect(pose.translateY).toBe(0);
    }
  });

  it("passes translateX through", () => {
    const pose = getStaggerItemPose(0, 0, 4, 0, 12, 0, 30, 1);
    expect(pose.translateX).toBe(30);
  });

  it("passes scaleFrom through", () => {
    const pose = getStaggerItemPose(0, 0, 4, 0, 12, 0, 0, 0.8);
    expect(pose.scale).toBe(0.8);
  });
});
