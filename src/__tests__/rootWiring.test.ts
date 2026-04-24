import { describe, it, expect } from "vitest";
import { CinematicSchema } from "../schema";
import { calculateDuration } from "../Root";

describe("calculateDuration", () => {
  it("computes total from default scenes", () => {
    const props = CinematicSchema.parse({});
    const duration = calculateDuration(props);
    // 260 + 150 + 200 + 120 + 90 = 820, minus 4 * 15 overlap = 760
    expect(duration).toBe(760);
  });

  it("returns minimum 30 when all scenes disabled", () => {
    const props = CinematicSchema.parse({
      scenes: [{ id: "only", durationInFrames: 60, enabled: false }],
    });
    const duration = calculateDuration(props);
    expect(duration).toBe(30);
  });

  it("skips disabled scenes in calculation", () => {
    const props = CinematicSchema.parse({
      scenes: [
        { id: "a", durationInFrames: 100, enabled: true },
        { id: "b", durationInFrames: 200, enabled: false },
        { id: "c", durationInFrames: 100, enabled: true },
      ],
      overlap: 10,
    });
    const duration = calculateDuration(props);
    // 100 + 100 - 1 * 10 = 190
    expect(duration).toBe(190);
  });

  it("handles single enabled scene with no overlap subtracted", () => {
    const props = CinematicSchema.parse({
      scenes: [{ id: "solo", durationInFrames: 120 }],
      overlap: 15,
    });
    const duration = calculateDuration(props);
    expect(duration).toBe(120);
  });

  it("handles zero overlap", () => {
    const props = CinematicSchema.parse({
      scenes: [
        { id: "a", durationInFrames: 100 },
        { id: "b", durationInFrames: 100 },
      ],
      overlap: 0,
    });
    const duration = calculateDuration(props);
    expect(duration).toBe(200);
  });

  it("uses custom overlap value", () => {
    const props = CinematicSchema.parse({
      scenes: [
        { id: "a", durationInFrames: 100 },
        { id: "b", durationInFrames: 100 },
        { id: "c", durationInFrames: 100 },
      ],
      overlap: 20,
    });
    const duration = calculateDuration(props);
    // 300 - 2 * 20 = 260
    expect(duration).toBe(260);
  });
});
