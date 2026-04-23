import { describe, expect, it } from "vitest";
import { defineZones, rectsOverlap } from "../zones";
import type { ZoneConfig } from "../types";

const BASE_CONFIG: ZoneConfig = {
  canvas: { width: 1920, height: 1080 },
  slots: [
    { id: "top-left", region: { x: 0, y: 0, w: 960, h: 540 } },
    { id: "top-right", region: { x: 960, y: 0, w: 960, h: 540 } },
    { id: "bottom-left", region: { x: 0, y: 540, w: 960, h: 540 } },
    { id: "bottom-right", region: { x: 960, y: 540, w: 960, h: 540 } },
    { id: "center", region: { x: 240, y: 135, w: 1440, h: 810 } },
    { id: "full", region: { x: 0, y: 0, w: 1920, h: 1080 } },
  ],
  reserved: [
    { id: "headline", region: { x: 200, y: 300, w: 1520, h: 480 } },
  ],
};

describe("rectsOverlap", () => {
  it("detects overlapping rects", () => {
    expect(
      rectsOverlap({ x: 0, y: 0, w: 100, h: 100 }, { x: 50, y: 50, w: 100, h: 100 }),
    ).toBe(true);
  });

  it("returns false for adjacent rects", () => {
    expect(
      rectsOverlap({ x: 0, y: 0, w: 100, h: 100 }, { x: 100, y: 0, w: 100, h: 100 }),
    ).toBe(false);
  });

  it("returns false for non-overlapping rects", () => {
    expect(
      rectsOverlap({ x: 0, y: 0, w: 50, h: 50 }, { x: 200, y: 200, w: 50, h: 50 }),
    ).toBe(false);
  });

  it("detects containment as overlap", () => {
    expect(
      rectsOverlap({ x: 0, y: 0, w: 200, h: 200 }, { x: 50, y: 50, w: 50, h: 50 }),
    ).toBe(true);
  });
});

describe("defineZones", () => {
  it("creates a zone system from valid config", () => {
    const system = defineZones(BASE_CONFIG);
    expect(system.canvas).toEqual({ width: 1920, height: 1080 });
    expect(system.slots).toHaveLength(6);
    expect(system.reserved).toHaveLength(1);
  });

  it("throws for slot exceeding canvas bounds", () => {
    expect(() =>
      defineZones({
        canvas: { width: 1920, height: 1080 },
        slots: [{ id: "overflow", region: { x: 1800, y: 0, w: 200, h: 100 } }],
        reserved: [],
      }),
    ).toThrow("exceeds canvas bounds");
  });

  it("throws for slot with negative coordinates", () => {
    expect(() =>
      defineZones({
        canvas: { width: 1920, height: 1080 },
        slots: [{ id: "neg", region: { x: -10, y: 0, w: 100, h: 100 } }],
        reserved: [],
      }),
    ).toThrow("exceeds canvas bounds");
  });
});

describe("placeWindow", () => {
  it("places a window within the specified slot", () => {
    const system = defineZones(BASE_CONFIG);
    const rect = system.placeWindow({
      id: "win1",
      slotId: "top-right",
      width: 400,
      height: 300,
      margin: 20,
      avoidZones: [],
    });

    expect(rect.left).toBeGreaterThanOrEqual(960 + 20);
    expect(rect.top).toBeGreaterThanOrEqual(0 + 20);
    expect(rect.left + rect.width).toBeLessThanOrEqual(960 + 960 - 20);
    expect(rect.top + rect.height).toBeLessThanOrEqual(0 + 540 - 20);
    expect(rect.width).toBe(400);
    expect(rect.height).toBe(300);
  });

  it("clamps window larger than slot", () => {
    const system = defineZones(BASE_CONFIG);
    const rect = system.placeWindow({
      id: "big",
      slotId: "top-left",
      width: 2000,
      height: 2000,
      margin: 10,
      avoidZones: [],
    });

    expect(rect.width).toBeLessThanOrEqual(960 - 20);
    expect(rect.height).toBeLessThanOrEqual(540 - 20);
  });

  it("avoids reserved headline zone by shifting down", () => {
    const system = defineZones({
      canvas: { width: 1920, height: 1080 },
      slots: [{ id: "full", region: { x: 0, y: 0, w: 1920, h: 1080 } }],
      reserved: [{ id: "headline", region: { x: 200, y: 300, w: 1520, h: 200 } }],
    });
    const rect = system.placeWindow({
      id: "avoid",
      slotId: "full",
      width: 400,
      height: 300,
      margin: 20,
      avoidZones: ["headline"],
    });

    const headlineBottom = 300 + 200;
    expect(rect.top).toBeGreaterThanOrEqual(headlineBottom);
  });

  it("clamps when window cannot fit below avoided zone", () => {
    const system = defineZones(BASE_CONFIG);
    const rect = system.placeWindow({
      id: "tight-fit",
      slotId: "center",
      width: 400,
      height: 200,
      margin: 20,
      avoidZones: ["headline"],
    });

    expect(rect.left).toBeGreaterThanOrEqual(240);
    expect(rect.top + rect.height).toBeLessThanOrEqual(135 + 810);
  });

  it("throws for unknown slot", () => {
    const system = defineZones(BASE_CONFIG);
    expect(() =>
      system.placeWindow({
        id: "x",
        slotId: "nonexistent",
        width: 100,
        height: 100,
        margin: 0,
        avoidZones: [],
      }),
    ).toThrow('Unknown slot "nonexistent"');
  });

  it("ignores unknown avoidZone ids without error", () => {
    const system = defineZones(BASE_CONFIG);
    const rect = system.placeWindow({
      id: "safe",
      slotId: "top-left",
      width: 200,
      height: 200,
      margin: 0,
      avoidZones: ["does-not-exist"],
    });

    expect(rect.left).toBe(0);
    expect(rect.top).toBe(0);
  });

  it("places window with zero margin", () => {
    const system = defineZones(BASE_CONFIG);
    const rect = system.placeWindow({
      id: "tight",
      slotId: "top-left",
      width: 960,
      height: 540,
      margin: 0,
      avoidZones: [],
    });

    expect(rect.left).toBe(0);
    expect(rect.top).toBe(0);
    expect(rect.width).toBe(960);
    expect(rect.height).toBe(540);
  });

  it("handles full-canvas slot", () => {
    const system = defineZones(BASE_CONFIG);
    const rect = system.placeWindow({
      id: "full-win",
      slotId: "full",
      width: 1800,
      height: 1000,
      margin: 40,
      avoidZones: [],
    });

    expect(rect.left).toBe(40);
    expect(rect.top).toBe(40);
    expect(rect.width).toBe(1800);
    expect(rect.height).toBe(1000);
  });

  it("stacks windows vertically with stackIndex and stackPitch", () => {
    const system = defineZones(BASE_CONFIG);
    const r0 = system.placeWindow({
      id: "card-0",
      slotId: "top-right",
      width: 300,
      height: 80,
      margin: 10,
      avoidZones: [],
      stackIndex: 0,
      stackPitch: 100,
    });
    const r1 = system.placeWindow({
      id: "card-1",
      slotId: "top-right",
      width: 300,
      height: 80,
      margin: 10,
      avoidZones: [],
      stackIndex: 1,
      stackPitch: 100,
    });
    const r2 = system.placeWindow({
      id: "card-2",
      slotId: "top-right",
      width: 300,
      height: 80,
      margin: 10,
      avoidZones: [],
      stackIndex: 2,
      stackPitch: 100,
    });

    expect(r1.top - r0.top).toBe(100);
    expect(r2.top - r1.top).toBe(100);
    expect(r0.left).toBe(r1.left);
  });

  it("centers window horizontally and vertically", () => {
    const system = defineZones(BASE_CONFIG);
    const rect = system.placeWindow({
      id: "centered",
      slotId: "full",
      width: 800,
      height: 600,
      margin: 0,
      avoidZones: [],
      align: { horizontal: "center", vertical: "center" },
    });

    expect(rect.left).toBe((1920 - 800) / 2);
    expect(rect.top).toBe((1080 - 600) / 2);
  });

  it("aligns window to end (bottom-right)", () => {
    const system = defineZones(BASE_CONFIG);
    const rect = system.placeWindow({
      id: "end-aligned",
      slotId: "top-right",
      width: 200,
      height: 100,
      margin: 20,
      avoidZones: [],
      align: { horizontal: "end", vertical: "end" },
    });

    expect(rect.left + rect.width + 20).toBe(960 + 960);
    expect(rect.top + rect.height + 20).toBe(540);
  });

  it("produces zero-size rect when margin exceeds half the slot", () => {
    const system = defineZones(BASE_CONFIG);
    const rect = system.placeWindow({
      id: "oversized-margin",
      slotId: "top-left",
      width: 100,
      height: 100,
      margin: 500,
      avoidZones: [],
    });

    expect(rect.width).toBe(0);
    expect(rect.height).toBe(0);
  });

  it("handles multiple avoid zones by updating candidate between checks", () => {
    const system = defineZones({
      canvas: { width: 1920, height: 1080 },
      slots: [{ id: "full", region: { x: 0, y: 0, w: 1920, h: 1080 } }],
      reserved: [
        { id: "top-banner", region: { x: 0, y: 0, w: 1920, h: 200 } },
        { id: "mid-banner", region: { x: 0, y: 200, w: 1920, h: 200 } },
      ],
    });
    const rect = system.placeWindow({
      id: "below-both",
      slotId: "full",
      width: 400,
      height: 200,
      margin: 10,
      avoidZones: ["top-banner", "mid-banner"],
    });

    expect(rect.top).toBeGreaterThanOrEqual(400);
  });

  it("returns false for zero-area rects in rectsOverlap", () => {
    expect(
      rectsOverlap({ x: 50, y: 50, w: 0, h: 100 }, { x: 0, y: 0, w: 100, h: 100 }),
    ).toBe(false);
    expect(
      rectsOverlap({ x: 50, y: 50, w: 100, h: 0 }, { x: 0, y: 0, w: 100, h: 100 }),
    ).toBe(false);
  });
});

describe("defineZones validation", () => {
  it("throws for reserved zone exceeding canvas bounds", () => {
    expect(() =>
      defineZones({
        canvas: { width: 1920, height: 1080 },
        slots: [],
        reserved: [{ id: "huge", region: { x: 0, y: 0, w: 5000, h: 5000 } }],
      }),
    ).toThrow('Reserved zone "huge" exceeds canvas bounds');
  });

  it("does not mutate input config", () => {
    const config: ZoneConfig = {
      canvas: { width: 1920, height: 1080 },
      slots: [{ id: "a", region: { x: 0, y: 0, w: 960, h: 540 } }],
      reserved: [],
    };
    const system = defineZones(config);
    system.slots[0].region.x = 999;
    expect(config.slots[0].region.x).toBe(0);
  });
});
