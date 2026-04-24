import { describe, it, expect } from "vitest";
import { filterCursorPath } from "../filterCursorPath";
import type { CursorPathEntry } from "../../../schema";

function entry(overrides: Partial<CursorPathEntry> & { at: number; action: CursorPathEntry["action"] }): CursorPathEntry {
  return { anchor: "center", ...overrides } as CursorPathEntry;
}

describe("filterCursorPath", () => {
  const sceneIds = ["win-a", "win-b"];

  it("keeps entries whose target is in the window ID set", () => {
    const entries = [
      entry({ at: 0, action: "moveTo", target: "win-a" }),
      entry({ at: 10, action: "click", target: "win-b" }),
      entry({ at: 20, action: "click", target: "win-c" }),
    ];
    const result = filterCursorPath(entries, sceneIds);
    expect(result).toHaveLength(2);
    expect(result[0].target).toBe("win-a");
    expect(result[1].target).toBe("win-b");
  });

  it("keeps untargeted entries with positionX", () => {
    const entries = [
      entry({ at: 0, action: "idle", positionX: 500, positionY: 300 }),
      entry({ at: 10, action: "idle" }),
    ];
    const result = filterCursorPath(entries, sceneIds);
    expect(result).toHaveLength(1);
    expect(result[0].positionX).toBe(500);
  });

  it("returns empty array when no entries match", () => {
    const entries = [
      entry({ at: 0, action: "click", target: "other-win" }),
    ];
    expect(filterCursorPath(entries, sceneIds)).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(filterCursorPath([], sceneIds)).toHaveLength(0);
  });

  it("handles drag entries with matching target", () => {
    const entries = [
      entry({ at: 0, action: "drag", target: "win-a", toX: 800, toY: 600 }),
      entry({ at: 10, action: "drag", target: "unrelated", toX: 100, toY: 100 }),
    ];
    const result = filterCursorPath(entries, sceneIds);
    expect(result).toHaveLength(1);
    expect(result[0].target).toBe("win-a");
  });

  it("handles empty window ID set", () => {
    const entries = [
      entry({ at: 0, action: "idle", positionX: 960, positionY: 540 }),
      entry({ at: 10, action: "click", target: "win-a" }),
    ];
    const result = filterCursorPath(entries, []);
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe("idle");
  });

  it("subtracts globalOffset from at values", () => {
    const entries = [
      entry({ at: 100, action: "moveTo", target: "win-a" }),
      entry({ at: 120, action: "click", target: "win-b" }),
    ];
    const result = filterCursorPath(entries, sceneIds, 100);
    expect(result).toHaveLength(2);
    expect(result[0].at).toBe(0);
    expect(result[1].at).toBe(20);
  });

  it("excludes entries outside the scene frame range", () => {
    const entries = [
      entry({ at: 50, action: "click", target: "win-a" }),
      entry({ at: 100, action: "click", target: "win-a" }),
      entry({ at: 200, action: "click", target: "win-a" }),
      entry({ at: 300, action: "click", target: "win-a" }),
    ];
    const result = filterCursorPath(entries, sceneIds, 100, 150);
    expect(result).toHaveLength(2);
    expect(result[0].at).toBe(0);
    expect(result[1].at).toBe(100);
  });

  it("uses scene-relative frames with offset and duration", () => {
    const entries = [
      entry({ at: 245, action: "idle", positionX: 200, positionY: 180 }),
      entry({ at: 260, action: "moveTo", target: "win-a" }),
      entry({ at: 400, action: "click", target: "win-a" }),
    ];
    const result = filterCursorPath(entries, sceneIds, 245, 150);
    expect(result).toHaveLength(2);
    expect(result[0].at).toBe(0);
    expect(result[1].at).toBe(15);
  });

  it("keeps entry with both target and positionX if target matches", () => {
    const entries = [
      entry({ at: 0, action: "moveTo", target: "win-a", positionX: 500, positionY: 300 }),
    ];
    const result = filterCursorPath(entries, sceneIds);
    expect(result).toHaveLength(1);
    expect(result[0].target).toBe("win-a");
  });
});
