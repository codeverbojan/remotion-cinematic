import { describe, it, expect } from "vitest";
import { mapCursorPath } from "../mapCursorPath";
import type { CursorPathEntry } from "../../../schema";

function makeEntry(overrides: Partial<CursorPathEntry> & { at: number; action: CursorPathEntry["action"] }): CursorPathEntry {
  return {
    anchor: "center",
    ...overrides,
  } as CursorPathEntry;
}

describe("mapCursorPath", () => {
  it("returns empty array for empty input", () => {
    expect(mapCursorPath([])).toEqual([]);
  });

  it("maps idle action with position", () => {
    const entries = [makeEntry({ at: 0, action: "idle", positionX: 100, positionY: 200 })];
    const result = mapCursorPath(entries);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      at: 0,
      action: "idle",
      position: { x: 100, y: 200 },
    });
  });

  it("defaults idle position to center when not provided", () => {
    const entries = [makeEntry({ at: 5, action: "idle" })];
    const result = mapCursorPath(entries);
    expect(result[0]).toEqual({
      at: 5,
      action: "idle",
      position: { x: 960, y: 540 },
    });
  });

  it("maps moveTo action with named anchor", () => {
    const entries = [makeEntry({ at: 10, action: "moveTo", target: "win-a", anchor: "top-bar", duration: 15 })];
    const result = mapCursorPath(entries);
    expect(result[0]).toEqual({
      at: 10,
      action: "moveTo",
      target: "win-a",
      anchor: "top-bar",
      duration: 15,
    });
  });

  it("maps moveTo with percentage anchor", () => {
    const entries = [makeEntry({ at: 10, action: "moveTo", target: "win-a", anchorXPct: 30, anchorYPct: 70, duration: 10 })];
    const result = mapCursorPath(entries);
    expect(result[0]).toEqual({
      at: 10,
      action: "moveTo",
      target: "win-a",
      anchor: { xPct: 30, yPct: 70 },
      duration: 10,
    });
  });

  it("maps click action with default anchor", () => {
    const entries = [makeEntry({ at: 30, action: "click", target: "btn" })];
    const result = mapCursorPath(entries);
    expect(result[0]).toEqual({
      at: 30,
      action: "click",
      target: "btn",
      anchor: "center",
    });
  });

  it("maps click with named anchor", () => {
    const entries = [makeEntry({ at: 30, action: "click", target: "btn", anchor: "top-bar" })];
    const result = mapCursorPath(entries);
    expect(result[0]).toEqual({
      at: 30,
      action: "click",
      target: "btn",
      anchor: "top-bar",
    });
  });

  it("maps click with percentage anchor", () => {
    const entries = [makeEntry({ at: 30, action: "click", target: "btn", anchorXPct: 50, anchorYPct: 50 })];
    const result = mapCursorPath(entries);
    expect(result[0]).toEqual({
      at: 30,
      action: "click",
      target: "btn",
      anchor: { xPct: 50, yPct: 50 },
    });
  });

  it("maps drag action", () => {
    const entries = [makeEntry({
      at: 40, action: "drag", target: "win-a",
      anchor: "corner-top-left", toX: 500, toY: 300, duration: 20,
    })];
    const result = mapCursorPath(entries);
    expect(result[0]).toEqual({
      at: 40,
      action: "drag",
      target: "win-a",
      anchor: "corner-top-left",
      to: { x: 500, y: 300 },
      duration: 20,
    });
  });

  it("skips moveTo without target", () => {
    const entries = [makeEntry({ at: 10, action: "moveTo", duration: 15 })];
    const result = mapCursorPath(entries);
    expect(result).toHaveLength(0);
  });

  it("skips click without target", () => {
    const entries = [makeEntry({ at: 20, action: "click" })];
    const result = mapCursorPath(entries);
    expect(result).toHaveLength(0);
  });

  it("skips drag without toX/toY", () => {
    const entries = [makeEntry({ at: 30, action: "drag", target: "win-a" })];
    const result = mapCursorPath(entries);
    expect(result).toHaveLength(0);
  });

  it("skips drag when only toX is provided (missing toY)", () => {
    const entries = [makeEntry({ at: 30, action: "drag", target: "win-a", toX: 500 })];
    const result = mapCursorPath(entries);
    expect(result).toHaveLength(0);
  });

  it("skips drag when only toY is provided (missing toX)", () => {
    const entries = [makeEntry({ at: 30, action: "drag", target: "win-a", toY: 300 })];
    const result = mapCursorPath(entries);
    expect(result).toHaveLength(0);
  });

  it("maps a full sequence of mixed actions", () => {
    const entries: CursorPathEntry[] = [
      makeEntry({ at: 0, action: "idle", positionX: 960, positionY: 540 }),
      makeEntry({ at: 10, action: "moveTo", target: "win", anchor: "center", duration: 12 }),
      makeEntry({ at: 25, action: "click", target: "win" }),
      makeEntry({ at: 30, action: "drag", target: "win", anchor: "corner-top-left", toX: 500, toY: 300, duration: 18 }),
    ];
    const result = mapCursorPath(entries);
    expect(result).toHaveLength(4);
    expect(result[0].action).toBe("idle");
    expect(result[1].action).toBe("moveTo");
    expect(result[2].action).toBe("click");
    expect(result[3].action).toBe("drag");
  });

  it("passes curve through on moveTo", () => {
    const entries = [makeEntry({
      at: 10, action: "moveTo", target: "win", duration: 12, curve: "linear",
    })];
    const result = mapCursorPath(entries);
    expect(result[0]).toHaveProperty("curve", "linear");
  });

  it("passes curve through on drag", () => {
    const entries = [makeEntry({
      at: 30, action: "drag", target: "win", toX: 500, toY: 300, duration: 18, curve: "ease",
    })];
    const result = mapCursorPath(entries);
    expect(result[0]).toHaveProperty("curve", "ease");
  });

  it("curve defaults to undefined when not set", () => {
    const entries = [makeEntry({
      at: 10, action: "moveTo", target: "win", duration: 12,
    })];
    const result = mapCursorPath(entries);
    expect(result[0]).toHaveProperty("curve", undefined);
  });

  it("passes curve 'arc' through on moveTo", () => {
    const entries = [makeEntry({
      at: 10, action: "moveTo", target: "win", duration: 12, curve: "arc",
    })];
    const result = mapCursorPath(entries);
    expect(result[0]).toHaveProperty("curve", "arc");
  });

  it("click action does not carry curve field", () => {
    const entries = [makeEntry({
      at: 20, action: "click", target: "win", curve: "ease",
    })];
    const result = mapCursorPath(entries);
    expect(result[0]).not.toHaveProperty("curve");
  });
});
