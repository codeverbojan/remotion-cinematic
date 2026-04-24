import { describe, it, expect } from "vitest";

import { resolveWindowPose } from "../engine";
import { resolveWaypointPosition } from "./CursorPathOverlay";
import type { WindowLayout, CursorPathEntry } from "../schema";

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

describe("CursorPathOverlay waypoint resolution", () => {
  it("resolves window center position via resolveWindowPose", () => {
    const win = makeWindow({
      id: "test-win",
      startX: 200,
      startY: 100,
      startW: 400,
      startH: 300,
    });

    const pose = resolveWindowPose(win, 20);
    expect(pose.visible).toBe(true);
    const center = {
      x: pose.left + pose.width / 2,
      y: pose.top + pose.height / 2,
    };
    expect(center.x).toBe(400);
    expect(center.y).toBe(250);
  });

  it("returns invisible before enterAt", () => {
    const win = makeWindow({
      id: "test-win",
      enterAt: 30,
    });

    const pose = resolveWindowPose(win, 0);
    expect(pose.visible).toBe(false);
  });

  it("resolves end position after animation", () => {
    const win = makeWindow({
      id: "test-win",
      startX: 100,
      startY: 100,
      startW: 400,
      startH: 300,
      endX: 500,
      endY: 200,
      animateAt: 20,
      animateDuration: 10,
    });

    const pose = resolveWindowPose(win, 40);
    expect(pose.visible).toBe(true);
    expect(pose.left).toBe(500);
    expect(pose.top).toBe(200);
  });
});

describe("resolveWaypointPosition", () => {
  const windows = [
    makeWindow({ id: "win-a", startX: 200, startY: 100, startW: 400, startH: 300 }),
  ];

  it("returns position for idle with positionX/Y", () => {
    const entry = { at: 0, action: "idle", positionX: 500, positionY: 300, anchor: "center" } as CursorPathEntry;
    expect(resolveWaypointPosition(entry, windows, 20)).toEqual({ x: 500, y: 300 });
  });

  it("returns null for idle without positionX/Y", () => {
    const entry = { at: 0, action: "idle", anchor: "center" } as CursorPathEntry;
    expect(resolveWaypointPosition(entry, windows, 20)).toBeNull();
  });

  it("returns drag endpoint from toX/toY", () => {
    const entry = { at: 10, action: "drag", toX: 800, toY: 600, anchor: "center" } as CursorPathEntry;
    expect(resolveWaypointPosition(entry, windows, 20)).toEqual({ x: 800, y: 600 });
  });

  it("resolves drag from target when toX/toY missing", () => {
    const entry = { at: 10, action: "drag", target: "win-a", anchor: "center" } as CursorPathEntry;
    const pos = resolveWaypointPosition(entry, windows, 20);
    expect(pos).toEqual({ x: 400, y: 250 });
  });

  it("resolves moveTo from target window center", () => {
    const entry = { at: 5, action: "moveTo", target: "win-a", anchor: "center" } as CursorPathEntry;
    const pos = resolveWaypointPosition(entry, windows, 20);
    expect(pos).toEqual({ x: 400, y: 250 });
  });

  it("returns null for moveTo with nonexistent target", () => {
    const entry = { at: 5, action: "moveTo", target: "no-such-win", anchor: "center" } as CursorPathEntry;
    expect(resolveWaypointPosition(entry, windows, 20)).toBeNull();
  });

  it("returns null for click targeting invisible window", () => {
    const hiddenWindows = [makeWindow({ id: "hidden", enterAt: 100 })];
    const entry = { at: 5, action: "click", target: "hidden", anchor: "center" } as CursorPathEntry;
    expect(resolveWaypointPosition(entry, hiddenWindows, 0)).toBeNull();
  });

  it("returns null for moveTo without target", () => {
    const entry = { at: 5, action: "moveTo", anchor: "center" } as CursorPathEntry;
    expect(resolveWaypointPosition(entry, windows, 20)).toBeNull();
  });
});
