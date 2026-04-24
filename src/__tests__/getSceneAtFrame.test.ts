import { describe, it, expect } from "vitest";
import { getSceneAtFrame } from "../engine";

const scenes = [
  { id: "chaos", durationInFrames: 260 },
  { id: "product-reveal", durationInFrames: 150 },
  { id: "feature-showcase", durationInFrames: 200 },
];

describe("getSceneAtFrame", () => {
  it("returns the first scene for frame 0", () => {
    const result = getSceneAtFrame(scenes, 0, 15);
    expect(result).toEqual({ id: "chaos", startFrame: 0, duration: 260 });
  });

  it("returns the first scene for a mid-scene frame", () => {
    const result = getSceneAtFrame(scenes, 100, 15);
    expect(result).toEqual({ id: "chaos", startFrame: 0, duration: 260 });
  });

  it("during overlap, returns the later (entering) scene", () => {
    const result = getSceneAtFrame(scenes, 250, 15);
    expect(result).toEqual({ id: "product-reveal", startFrame: 245, duration: 150 });
  });

  it("returns the second scene after overlap zone", () => {
    const result = getSceneAtFrame(scenes, 300, 15);
    expect(result).toEqual({ id: "product-reveal", startFrame: 245, duration: 150 });
  });

  it("returns the third scene", () => {
    const result = getSceneAtFrame(scenes, 400, 15);
    expect(result).toEqual({ id: "feature-showcase", startFrame: 380, duration: 200 });
  });

  it("returns null for frame past all scenes", () => {
    const result = getSceneAtFrame(scenes, 9999, 15);
    expect(result).toBeNull();
  });

  it("works with zero overlap", () => {
    const result = getSceneAtFrame(scenes, 260, 0);
    expect(result).toEqual({ id: "product-reveal", startFrame: 260, duration: 150 });
  });

  it("returns null for empty scene list", () => {
    expect(getSceneAtFrame([], 0, 15)).toBeNull();
  });

  it("returns null for negative frame", () => {
    expect(getSceneAtFrame(scenes, -1, 15)).toBeNull();
  });

  it("handles single scene", () => {
    const single = [{ id: "only", durationInFrames: 100 }];
    expect(getSceneAtFrame(single, 50, 0)).toEqual({ id: "only", startFrame: 0, duration: 100 });
    expect(getSceneAtFrame(single, 100, 0)).toBeNull();
  });

  it("at exact scene boundary without overlap, returns next scene", () => {
    const result = getSceneAtFrame(scenes, 245, 15);
    expect(result!.id).toBe("product-reveal");
  });
});
