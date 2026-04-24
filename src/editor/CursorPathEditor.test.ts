import { describe, it, expect } from "vitest";
import { findWindowAtPosition } from "./CursorPathEditor";
import type { WindowLayout } from "../schema";

function makeWindow(overrides: Partial<WindowLayout> & { id: string }): WindowLayout {
  return {
    title: "Test",
    startX: 100,
    startY: 100,
    startW: 400,
    startH: 300,
    enterAt: 0,
    enterDuration: 12,
    enterFrom: "scale",
    animateDuration: 18,
    exitDuration: 12,
    zIndex: 1,
    ...overrides,
  };
}

describe("findWindowAtPosition", () => {
  const windows = [
    makeWindow({ id: "win-1", startX: 100, startY: 100, startW: 400, startH: 300, zIndex: 1 }),
    makeWindow({ id: "win-2", startX: 600, startY: 100, startW: 400, startH: 300, zIndex: 2 }),
  ];

  it("returns window when point is inside its bounds", () => {
    const hit = findWindowAtPosition(300, 250, windows, 20);
    expect(hit).not.toBeNull();
    expect(hit!.id).toBe("win-1");
  });

  it("returns null when point is outside all windows", () => {
    expect(findWindowAtPosition(550, 250, windows, 20)).toBeNull();
  });

  it("returns higher zIndex window when windows overlap", () => {
    const overlapping = [
      makeWindow({ id: "back", startX: 100, startY: 100, startW: 400, startH: 300, zIndex: 1 }),
      makeWindow({ id: "front", startX: 200, startY: 100, startW: 400, startH: 300, zIndex: 5 }),
    ];
    const hit = findWindowAtPosition(300, 250, overlapping, 20);
    expect(hit!.id).toBe("front");
  });

  it("returns null for invisible windows", () => {
    const hidden = [makeWindow({ id: "hidden", enterAt: 100 })];
    expect(findWindowAtPosition(300, 250, hidden, 0)).toBeNull();
  });

  it("returns null for empty windows array", () => {
    expect(findWindowAtPosition(300, 250, [], 20)).toBeNull();
  });

  it("excludes point on far boundary (exclusive right/bottom)", () => {
    const win = makeWindow({ id: "test", startX: 100, startY: 100, startW: 400, startH: 300 });
    expect(findWindowAtPosition(500, 250, [win], 20)).toBeNull();
    expect(findWindowAtPosition(300, 400, [win], 20)).toBeNull();
  });
});
