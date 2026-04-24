import { describe, it, expect } from "vitest";
import { generateId } from "./ElementPalette";
import type { WindowLayout } from "../schema";

function makeWindow(id: string): WindowLayout {
  return {
    id,
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
  };
}

describe("generateId", () => {
  it("returns window-1 when no windows exist", () => {
    expect(generateId([])).toBe("window-1");
  });

  it("returns window-2 when window-1 exists", () => {
    expect(generateId([makeWindow("window-1")])).toBe("window-2");
  });

  it("fills gaps in numbering", () => {
    const windows = [makeWindow("window-1"), makeWindow("window-3")];
    expect(generateId(windows)).toBe("window-2");
  });

  it("increments past all existing windows", () => {
    const windows = [
      makeWindow("window-1"),
      makeWindow("window-2"),
      makeWindow("window-3"),
    ];
    expect(generateId(windows)).toBe("window-4");
  });

  it("ignores non-numbered window ids", () => {
    const windows = [makeWindow("spreadsheet"), makeWindow("email")];
    expect(generateId(windows)).toBe("window-1");
  });
});
