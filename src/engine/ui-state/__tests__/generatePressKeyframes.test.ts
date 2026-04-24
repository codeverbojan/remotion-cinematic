import { describe, it, expect } from "vitest";
import { generatePressKeyframes } from "../generatePressKeyframes";
import type { CursorAction } from "../../cursor/types";

describe("generatePressKeyframes", () => {
  it("returns empty array for no actions", () => {
    expect(generatePressKeyframes([])).toEqual([]);
  });

  it("ignores non-click actions", () => {
    const actions: CursorAction[] = [
      { at: 0, action: "idle", position: { x: 0, y: 0 } },
      { at: 10, action: "moveTo", target: "btn", anchor: "center", duration: 5 },
    ];
    expect(generatePressKeyframes(actions)).toEqual([]);
  });

  it("generates press + release for a click", () => {
    const actions: CursorAction[] = [
      { at: 20, action: "click", target: "save-btn" },
    ];
    const result = generatePressKeyframes(actions);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      at: 20,
      target: "save-btn",
      set: { pressed: true, pressedAt: 20 },
    });
    expect(result[1]).toEqual({
      at: 24,
      target: "save-btn",
      set: { pressed: false },
    });
  });

  it("generates press keyframes for multiple clicks", () => {
    const actions: CursorAction[] = [
      { at: 10, action: "click", target: "btn-a" },
      { at: 30, action: "click", target: "btn-b" },
    ];
    const result = generatePressKeyframes(actions);
    expect(result).toHaveLength(4);
    expect(result[0].target).toBe("btn-a");
    expect(result[1].target).toBe("btn-a");
    expect(result[2].target).toBe("btn-b");
    expect(result[3].target).toBe("btn-b");
  });

  it("handles click mixed with other actions", () => {
    const actions: CursorAction[] = [
      { at: 0, action: "idle", position: { x: 100, y: 100 } },
      { at: 5, action: "moveTo", target: "btn", anchor: "center", duration: 8 },
      { at: 15, action: "click", target: "btn" },
      { at: 25, action: "moveTo", target: "other", anchor: "center", duration: 10 },
    ];
    const result = generatePressKeyframes(actions);
    expect(result).toHaveLength(2);
    expect(result[0].at).toBe(15);
    expect(result[0].target).toBe("btn");
  });
});
