import { describe, it, expect } from "vitest";
import { resolveWindowPose } from "../resolveWindowPose";
import type { WindowLayout } from "../../../schema";

function makeDef(overrides: Partial<WindowLayout> = {}): WindowLayout {
  return {
    id: "win",
    startX: 100,
    startY: 200,
    startW: 800,
    startH: 600,
    enterAt: 10,
    enterDuration: 12,
    enterFrom: "scale",
    animateDuration: 18,
    exitDuration: 12,
    zIndex: 1,
    title: "Test",
    ...overrides,
  };
}

describe("resolveWindowPose", () => {
  it("returns hidden before enterAt", () => {
    const pose = resolveWindowPose(makeDef(), 5);
    expect(pose.visible).toBe(false);
    expect(pose.opacity).toBe(0);
  });

  it("returns hidden at frame before enterAt", () => {
    const pose = resolveWindowPose(makeDef({ enterAt: 10 }), 9);
    expect(pose.visible).toBe(false);
  });

  it("starts entrance at enterAt", () => {
    const pose = resolveWindowPose(makeDef({ enterAt: 10 }), 10);
    expect(pose.visible).toBe(true);
    expect(pose.opacity).toBe(0);
  });

  it("has partial opacity mid-entrance", () => {
    const pose = resolveWindowPose(makeDef({ enterAt: 10, enterDuration: 12 }), 16);
    expect(pose.opacity).toBeGreaterThan(0);
    expect(pose.opacity).toBeLessThan(1);
  });

  it("completes entrance after enterDuration", () => {
    const def = makeDef({ enterAt: 10, enterDuration: 12 });
    const pose = resolveWindowPose(def, 22);
    expect(pose.opacity).toBe(1);
    expect(pose.scale).toBe(1);
    expect(pose.translateX).toBe(0);
    expect(pose.translateY).toBe(0);
  });

  it("holds fully visible after entrance", () => {
    const pose = resolveWindowPose(makeDef({ enterAt: 0, enterDuration: 10 }), 50);
    expect(pose.opacity).toBe(1);
    expect(pose.scale).toBe(1);
    expect(pose.visible).toBe(true);
  });

  describe("entrance styles", () => {
    it("fade — no scale or translate offset", () => {
      const pose = resolveWindowPose(makeDef({ enterAt: 0, enterDuration: 20, enterFrom: "fade" }), 1);
      expect(pose.scale).toBe(1);
      expect(pose.translateX).toBe(0);
      expect(pose.translateY).toBe(0);
      expect(pose.opacity).toBeGreaterThan(0);
    });

    it("scale — starts smaller", () => {
      const pose = resolveWindowPose(makeDef({ enterAt: 0, enterDuration: 20, enterFrom: "scale" }), 1);
      expect(pose.scale).toBeLessThan(1);
      expect(pose.scale).toBeGreaterThanOrEqual(0.92);
    });

    it("slide-up — positive translateY at start", () => {
      const pose = resolveWindowPose(makeDef({ enterAt: 0, enterDuration: 20, enterFrom: "slide-up" }), 1);
      expect(pose.translateY).toBeGreaterThan(0);
      expect(pose.scale).toBe(1);
    });

    it("slide-left — negative translateX at start", () => {
      const pose = resolveWindowPose(makeDef({ enterAt: 0, enterDuration: 20, enterFrom: "slide-left" }), 1);
      expect(pose.translateX).toBeLessThan(0);
    });

    it("slide-right — positive translateX at start", () => {
      const pose = resolveWindowPose(makeDef({ enterAt: 0, enterDuration: 20, enterFrom: "slide-right" }), 1);
      expect(pose.translateX).toBeGreaterThan(0);
    });
  });

  describe("position/size animation", () => {
    it("interpolates from start to end", () => {
      const def = makeDef({
        enterAt: 0, enterDuration: 5,
        startX: 0, startY: 0, startW: 100, startH: 100,
        endX: 200, endY: 300, endW: 400, endH: 500,
        animateAt: 10, animateDuration: 20,
      });
      const mid = resolveWindowPose(def, 20);
      expect(mid.left).toBeGreaterThan(0);
      expect(mid.left).toBeLessThan(200);
      expect(mid.width).toBeGreaterThan(100);
      expect(mid.width).toBeLessThan(400);
    });

    it("reaches end values after animation", () => {
      const def = makeDef({
        enterAt: 0, enterDuration: 5,
        startX: 0, startY: 0, startW: 100, startH: 100,
        endX: 200, endY: 300, endW: 400, endH: 500,
        animateAt: 10, animateDuration: 20,
      });
      const pose = resolveWindowPose(def, 100);
      expect(pose.left).toBe(200);
      expect(pose.top).toBe(300);
      expect(pose.width).toBe(400);
      expect(pose.height).toBe(500);
    });

    it("defaults animateAt to enterAt + enterDuration", () => {
      const def = makeDef({
        enterAt: 10, enterDuration: 5,
        startX: 0, endX: 100,
        animateDuration: 10,
      });
      const before = resolveWindowPose(def, 14);
      expect(before.left).toBe(0);

      const after = resolveWindowPose(def, 30);
      expect(after.left).toBe(100);
    });

    it("only animates provided end fields", () => {
      const def = makeDef({
        enterAt: 0, enterDuration: 5,
        startX: 100, startY: 200,
        endX: 500,
        animateAt: 10, animateDuration: 20,
      });
      const pose = resolveWindowPose(def, 100);
      expect(pose.left).toBe(500);
      expect(pose.top).toBe(200);
    });
  });

  describe("exit", () => {
    it("fades out after exitAt", () => {
      const def = makeDef({ enterAt: 0, enterDuration: 5, exitAt: 50, exitDuration: 10 });
      const mid = resolveWindowPose(def, 55);
      expect(mid.opacity).toBeGreaterThan(0);
      expect(mid.opacity).toBeLessThan(1);
    });

    it("hidden after exitAt + exitDuration", () => {
      const def = makeDef({ enterAt: 0, enterDuration: 5, exitAt: 50, exitDuration: 10 });
      const pose = resolveWindowPose(def, 60);
      expect(pose.visible).toBe(false);
    });

    it("fully visible just before exitAt", () => {
      const def = makeDef({ enterAt: 0, enterDuration: 5, exitAt: 50, exitDuration: 10 });
      const pose = resolveWindowPose(def, 49);
      expect(pose.opacity).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("enterDuration of 1 frame", () => {
      const def = makeDef({ enterAt: 0, enterDuration: 1, enterFrom: "fade" });
      const at0 = resolveWindowPose(def, 0);
      expect(at0.visible).toBe(true);
      expect(at0.opacity).toBe(0);
      const at1 = resolveWindowPose(def, 1);
      expect(at1.opacity).toBe(1);
    });

    it("returns correct position at frame 0 with enterAt 0", () => {
      const def = makeDef({ enterAt: 0, enterDuration: 10, startX: 50, startY: 75 });
      const pose = resolveWindowPose(def, 0);
      expect(pose.left).toBe(50);
      expect(pose.top).toBe(75);
      expect(pose.visible).toBe(true);
    });

    it("clamps animateAt to enterAt when animateAt is before enterAt", () => {
      const def = makeDef({
        enterAt: 10, enterDuration: 5,
        startX: 0, endX: 100,
        animateAt: 5, animateDuration: 10,
      });
      const atEnter = resolveWindowPose(def, 10);
      expect(atEnter.left).toBe(0);
    });

    it("handles overlapping entrance and exit", () => {
      const def = makeDef({
        enterAt: 0, enterDuration: 20,
        exitAt: 10, exitDuration: 20,
      });
      const mid = resolveWindowPose(def, 15);
      expect(mid.opacity).toBeGreaterThan(0);
      expect(mid.opacity).toBeLessThanOrEqual(1);
      const entranceOnly = resolveWindowPose(makeDef({ enterAt: 0, enterDuration: 20 }), 15);
      expect(mid.opacity).toBeLessThanOrEqual(entranceOnly.opacity);
    });

    it("rounds position and size", () => {
      const def = makeDef({
        enterAt: 0, enterDuration: 5,
        startX: 0, endX: 33,
        animateAt: 10, animateDuration: 3,
      });
      const pose = resolveWindowPose(def, 11);
      expect(Number.isInteger(pose.left)).toBe(true);
      expect(Number.isInteger(pose.width)).toBe(true);
    });
  });
});
