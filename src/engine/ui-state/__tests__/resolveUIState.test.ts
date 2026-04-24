import { describe, it, expect } from "vitest";
import { resolveUIState } from "../types";
import type { UIKeyframe } from "../types";

describe("resolveUIState", () => {
  it("returns defaultState when keyframes is empty", () => {
    const result = resolveUIState([], "sidebar", 50, { activeIndex: 0 });
    expect(result).toEqual({ activeIndex: 0 });
  });

  it("returns defaultState when no keyframes target this element", () => {
    const kfs: UIKeyframe[] = [
      { at: 10, target: "tabs", set: { activeTab: "Orders" } },
    ];
    const result = resolveUIState(kfs, "sidebar", 50, { activeIndex: 0 });
    expect(result).toEqual({ activeIndex: 0 });
  });

  it("returns defaultState before first matching keyframe", () => {
    const kfs: UIKeyframe[] = [
      { at: 20, target: "sidebar", set: { activeIndex: 1 } },
    ];
    const result = resolveUIState(kfs, "sidebar", 10, { activeIndex: 0 });
    expect(result).toEqual({ activeIndex: 0 });
  });

  it("applies keyframe at exact frame", () => {
    const kfs: UIKeyframe[] = [
      { at: 20, target: "sidebar", set: { activeIndex: 2 } },
    ];
    const result = resolveUIState(kfs, "sidebar", 20, { activeIndex: 0 });
    expect(result).toEqual({ activeIndex: 2 });
  });

  it("holds state after keyframe frame", () => {
    const kfs: UIKeyframe[] = [
      { at: 20, target: "sidebar", set: { activeIndex: 2 } },
    ];
    const result = resolveUIState(kfs, "sidebar", 100, { activeIndex: 0 });
    expect(result).toEqual({ activeIndex: 2 });
  });

  it("accumulates multiple keyframes for same target", () => {
    const kfs: UIKeyframe[] = [
      { at: 10, target: "sidebar", set: { activeIndex: 1 } },
      { at: 30, target: "sidebar", set: { activeIndex: 3 } },
    ];
    expect(resolveUIState(kfs, "sidebar", 25, { activeIndex: 0 })).toEqual({ activeIndex: 1 });
    expect(resolveUIState(kfs, "sidebar", 30, { activeIndex: 0 })).toEqual({ activeIndex: 3 });
    expect(resolveUIState(kfs, "sidebar", 50, { activeIndex: 0 })).toEqual({ activeIndex: 3 });
  });

  it("merges partial updates into state", () => {
    const kfs: UIKeyframe[] = [
      { at: 10, target: "table", set: { selectedRow: 2 } },
      { at: 20, target: "table", set: { highlightedCell: [1, 3] } },
    ];
    const def = { selectedRow: null as number | null, highlightedCell: null as [number, number] | null };
    expect(resolveUIState(kfs, "table", 15, def)).toEqual({ selectedRow: 2, highlightedCell: null });
    expect(resolveUIState(kfs, "table", 25, def)).toEqual({ selectedRow: 2, highlightedCell: [1, 3] });
  });

  it("filters by target — different targets don't cross-contaminate", () => {
    const kfs: UIKeyframe[] = [
      { at: 10, target: "sidebar", set: { activeIndex: 1 } },
      { at: 15, target: "tabs", set: { activeTab: "Orders" } },
      { at: 20, target: "sidebar", set: { activeIndex: 2 } },
    ];
    expect(resolveUIState(kfs, "sidebar", 25, { activeIndex: 0 })).toEqual({ activeIndex: 2 });
    expect(resolveUIState(kfs, "tabs", 25, { activeTab: "Overview" })).toEqual({ activeTab: "Orders" });
  });

  it("handles keyframe that resets state to default-like value", () => {
    const kfs: UIKeyframe[] = [
      { at: 10, target: "table", set: { selectedRow: 3 } },
      { at: 30, target: "table", set: { selectedRow: null } },
    ];
    expect(resolveUIState(kfs, "table", 20, { selectedRow: null })).toEqual({ selectedRow: 3 });
    expect(resolveUIState(kfs, "table", 40, { selectedRow: null })).toEqual({ selectedRow: null });
  });

  it("does not mutate the defaultState object", () => {
    const def = { activeIndex: 0 };
    const kfs: UIKeyframe[] = [
      { at: 10, target: "sidebar", set: { activeIndex: 5 } },
    ];
    resolveUIState(kfs, "sidebar", 20, def);
    expect(def.activeIndex).toBe(0);
  });

  it("handles frame 0", () => {
    const kfs: UIKeyframe[] = [
      { at: 0, target: "sidebar", set: { activeIndex: 1 } },
    ];
    expect(resolveUIState(kfs, "sidebar", 0, { activeIndex: 0 })).toEqual({ activeIndex: 1 });
  });

  it("handles boolean state values", () => {
    const kfs: UIKeyframe[] = [
      { at: 10, target: "btn", set: { pressed: true } },
      { at: 13, target: "btn", set: { pressed: false } },
    ];
    expect(resolveUIState(kfs, "btn", 5, { pressed: false })).toEqual({ pressed: false });
    expect(resolveUIState(kfs, "btn", 11, { pressed: false })).toEqual({ pressed: true });
    expect(resolveUIState(kfs, "btn", 15, { pressed: false })).toEqual({ pressed: false });
  });

  it("handles string state values", () => {
    const kfs: UIKeyframe[] = [
      { at: 10, target: "search", set: { value: "hel" } },
      { at: 15, target: "search", set: { value: "hello" } },
    ];
    expect(resolveUIState(kfs, "search", 12, { value: "" })).toEqual({ value: "hel" });
    expect(resolveUIState(kfs, "search", 20, { value: "" })).toEqual({ value: "hello" });
  });

  it("handles unsorted keyframes via defensive sort", () => {
    const kfs: UIKeyframe[] = [
      { at: 30, target: "sidebar", set: { activeIndex: 2 } },
      { at: 10, target: "sidebar", set: { activeIndex: 1 } },
    ];
    expect(resolveUIState(kfs, "sidebar", 15, { activeIndex: 0 })).toEqual({ activeIndex: 1 });
    expect(resolveUIState(kfs, "sidebar", 35, { activeIndex: 0 })).toEqual({ activeIndex: 2 });
  });

  it("last-writer-wins when two keyframes share the same at", () => {
    const kfs: UIKeyframe[] = [
      { at: 10, target: "sidebar", set: { activeIndex: 1 } },
      { at: 10, target: "sidebar", set: { activeIndex: 2 } },
    ];
    expect(resolveUIState(kfs, "sidebar", 10, { activeIndex: 0 })).toEqual({ activeIndex: 2 });
  });
});
