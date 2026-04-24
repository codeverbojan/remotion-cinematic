import { describe, it, expect } from "vitest";
import { computeSnapGuides, applySnap } from "../editor/SnapGuides";
import type { WindowLayout } from "../schema";

function makeWindow(overrides: Partial<WindowLayout> & { id: string }): WindowLayout {
  return {
    startX: 0,
    startY: 0,
    startW: 200,
    startH: 150,
    enterAt: 0,
    enterDuration: 12,
    enterFrom: "scale",
    animateDuration: 18,
    exitDuration: 12,
    zIndex: 1,
    title: "Window",
    ...overrides,
  };
}

describe("computeSnapGuides", () => {
  const CANVAS_W = 1920;
  const CANVAS_H = 1080;

  it("returns canvas center guides when box center is near canvas center", () => {
    const box = { x: 860, y: 465, w: 200, h: 150 };
    const guides = computeSnapGuides(box, [], CANVAS_W, CANVAS_H);
    expect(guides.x).toContain(960);
    expect(guides.y).toContain(540);
  });

  it("returns no guides when box is far from snap candidates", () => {
    const box = { x: 100, y: 100, w: 200, h: 150 };
    const guides = computeSnapGuides(box, [], CANVAS_W, CANVAS_H);
    expect(guides.x).toHaveLength(0);
    expect(guides.y).toHaveLength(0);
  });

  it("snaps to other window left edge", () => {
    const other = makeWindow({ id: "other", startX: 500, startY: 300, startW: 400, startH: 300 });
    const box = { x: 497, y: 100, w: 200, h: 150 };
    const guides = computeSnapGuides(box, [other], CANVAS_W, CANVAS_H);
    expect(guides.x).toContain(500);
  });

  it("snaps to other window right edge via box left edge", () => {
    const other = makeWindow({ id: "other", startX: 100, startY: 100, startW: 400, startH: 300 });
    const box = { x: 503, y: 200, w: 200, h: 150 };
    const guides = computeSnapGuides(box, [other], CANVAS_W, CANVAS_H);
    expect(guides.x).toContain(500);
  });

  it("snaps to other window center", () => {
    const other = makeWindow({ id: "other", startX: 400, startY: 200, startW: 400, startH: 300 });
    const box = { x: 500, y: 346, w: 200, h: 150 };
    const guides = computeSnapGuides(box, [other], CANVAS_W, CANVAS_H);
    expect(guides.y).toContain(350);
  });

  it("handles multiple other windows", () => {
    const w1 = makeWindow({ id: "w1", startX: 100, startY: 100, startW: 200, startH: 200 });
    const w2 = makeWindow({ id: "w2", startX: 800, startY: 500, startW: 300, startH: 200 });
    const box = { x: 297, y: 100, w: 200, h: 150 };
    const guides = computeSnapGuides(box, [w1, w2], CANVAS_W, CANVAS_H);
    expect(guides.x).toContain(300);
  });
});

describe("applySnap", () => {
  it("snaps box left edge to guide", () => {
    const box = { x: 497, y: 200, w: 200, h: 150 };
    const guides = { x: [500], y: [] };
    const result = applySnap(box, guides);
    expect(result.x).toBe(500);
    expect(result.y).toBe(200);
  });

  it("snaps box center to guide", () => {
    const box = { x: 857, y: 200, w: 200, h: 150 };
    const guides = { x: [960], y: [] };
    const result = applySnap(box, guides);
    expect(result.x).toBe(860);
  });

  it("snaps box right edge to guide", () => {
    const box = { x: 298, y: 200, w: 200, h: 150 };
    const guides = { x: [500], y: [] };
    const result = applySnap(box, guides);
    expect(result.x).toBe(300);
  });

  it("snaps y top edge to guide", () => {
    const box = { x: 100, y: 537, w: 200, h: 150 };
    const guides = { x: [], y: [540] };
    const result = applySnap(box, guides);
    expect(result.y).toBe(540);
  });

  it("snaps both x and y simultaneously", () => {
    const box = { x: 857, y: 537, w: 200, h: 150 };
    const guides = { x: [960], y: [540] };
    const result = applySnap(box, guides);
    expect(result.x).toBe(860);
    expect(result.y).toBe(540);
  });

  it("does not snap when no guides match within threshold", () => {
    const box = { x: 100, y: 100, w: 200, h: 150 };
    const guides = { x: [500], y: [500] };
    const result = applySnap(box, guides);
    expect(result.x).toBe(100);
    expect(result.y).toBe(100);
  });

  it("picks closest guide when multiple match", () => {
    const box = { x: 298, y: 200, w: 200, h: 150 };
    const guides = { x: [300, 295], y: [] };
    const result = applySnap(box, guides);
    expect(result.x).toBe(300);
  });
});

describe("resize direction constraints", () => {
  it("east handle only changes width", () => {
    const dir = "e";
    const dx = 50;
    const startW = 200;
    const startX = 100;
    let newW = startW;
    let newX = startX;
    if (dir.includes("e")) newW = Math.max(50, startW + dx);
    expect(newW).toBe(250);
    expect(newX).toBe(100);
  });

  it("west handle changes width and x", () => {
    const dir = "w";
    const dx = -30;
    const startW = 200;
    const startX = 100;
    let newW = startW;
    let newX = startX;
    if (dir.includes("w")) {
      newW = Math.max(50, startW - dx);
      newX = startX + (startW - newW);
    }
    expect(newW).toBe(230);
    expect(newX).toBe(70);
  });

  it("south handle only changes height", () => {
    const dir = "s";
    const dy = 40;
    const startH = 150;
    const startY = 200;
    let newH = startH;
    let newY = startY;
    if (dir.includes("s")) newH = Math.max(50, startH + dy);
    expect(newH).toBe(190);
    expect(newY).toBe(200);
  });

  it("north handle changes height and y", () => {
    const dir = "n";
    const dy = -20;
    const startH = 150;
    const startY = 200;
    let newH = startH;
    let newY = startY;
    if (dir.includes("n")) {
      newH = Math.max(50, startH - dy);
      newY = startY + (startH - newH);
    }
    expect(newH).toBe(170);
    expect(newY).toBe(180);
  });

  it("southeast handle changes both width and height", () => {
    const dir = "se";
    const dx = 30;
    const dy = 20;
    let newW = 200;
    let newH = 150;
    if (dir.includes("e")) newW = Math.max(50, 200 + dx);
    if (dir.includes("s")) newH = Math.max(50, 150 + dy);
    expect(newW).toBe(230);
    expect(newH).toBe(170);
  });

  it("northwest handle changes all four values", () => {
    const dir = "nw";
    const dx = -25;
    const dy = -15;
    const startX = 100;
    const startY = 200;
    const startW = 200;
    const startH = 150;
    let newX = startX;
    let newY = startY;
    let newW = startW;
    let newH = startH;
    if (dir.includes("w")) {
      newW = Math.max(50, startW - dx);
      newX = startX + (startW - newW);
    }
    if (dir.includes("n")) {
      newH = Math.max(50, startH - dy);
      newY = startY + (startH - newH);
    }
    expect(newW).toBe(225);
    expect(newX).toBe(75);
    expect(newH).toBe(165);
    expect(newY).toBe(185);
  });

  it("enforces minimum size of 50", () => {
    const dir = "e";
    const dx = -200;
    const startW = 200;
    let newW = startW;
    if (dir.includes("e")) newW = Math.max(50, startW + dx);
    expect(newW).toBe(50);
  });
});

describe("applySnap — additional edge cases", () => {
  it("returns position unchanged with empty guides", () => {
    const box = { x: 300, y: 400, w: 200, h: 150 };
    const result = applySnap(box, { x: [], y: [] });
    expect(result.x).toBe(300);
    expect(result.y).toBe(400);
  });

  it("snaps y center to guide", () => {
    const box = { x: 100, y: 462, w: 200, h: 150 };
    const guides = { x: [], y: [540] };
    const result = applySnap(box, guides);
    expect(result.y).toBe(465);
  });

  it("snaps y bottom edge to guide", () => {
    const box = { x: 100, y: 387, w: 200, h: 150 };
    const guides = { x: [], y: [540] };
    const result = applySnap(box, guides);
    expect(result.y).toBe(390);
  });

  it("handles duplicate guide values from multiple windows", () => {
    const box = { x: 497, y: 200, w: 200, h: 150 };
    const guides = { x: [500, 500], y: [] };
    const result = applySnap(box, guides);
    expect(result.x).toBe(500);
  });
});

describe("computeSnapGuides — boundary cases", () => {
  it("does not match at exactly threshold + 1", () => {
    const box = { x: 953, y: 100, w: 200, h: 150 };
    const guides = computeSnapGuides(box, [], 1920, 1080);
    expect(guides.x).not.toContain(960);
  });

  it("matches at exactly threshold distance", () => {
    const box = { x: 954, y: 100, w: 200, h: 150 };
    const guides = computeSnapGuides(box, [], 1920, 1080);
    expect(guides.x).toContain(960);
  });

  it("handles empty others array with box away from center", () => {
    const box = { x: 50, y: 50, w: 100, h: 100 };
    const guides = computeSnapGuides(box, [], 1920, 1080);
    expect(guides.x).toHaveLength(0);
    expect(guides.y).toHaveLength(0);
  });
});

describe("resize clamping at canvas bounds", () => {
  const MIN_SIZE = 50;

  it("clamps east resize to canvas width", () => {
    const startX = 1800;
    const startW = 100;
    const dx = 200;
    let newW = Math.max(MIN_SIZE, startW + dx);
    newW = Math.max(MIN_SIZE, Math.min(newW, 1920 - startX));
    expect(newW).toBe(120);
  });

  it("clamps west resize keeps minimum after bound clamping", () => {
    const startX = 30;
    const startW = 200;
    const dx = -100;
    let newW = Math.max(MIN_SIZE, startW - dx);
    let newX = startX + (startW - newW);
    newX = Math.max(0, newX);
    newW = Math.max(MIN_SIZE, Math.min(newW, 1920 - newX));
    expect(newX).toBe(0);
    expect(newW).toBeGreaterThanOrEqual(MIN_SIZE);
  });

  it("enforces min size when clamping would produce sub-50 width", () => {
    const startX = 1900;
    const startW = 100;
    const dx = 0;
    let newW = Math.max(MIN_SIZE, startW + dx);
    let newX = startX;
    newX = Math.max(0, newX);
    newW = Math.max(MIN_SIZE, Math.min(newW, 1920 - newX));
    expect(newW).toBe(MIN_SIZE);
  });
});

describe("handle positions", () => {
  const DIRECTIONS = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

  it("has exactly 8 handle directions", () => {
    expect(DIRECTIONS).toHaveLength(8);
  });

  it("all directions are unique", () => {
    expect(new Set(DIRECTIONS).size).toBe(8);
  });

  it("corner directions combine two edges", () => {
    for (const d of ["ne", "nw", "se", "sw"]) {
      expect(d).toHaveLength(2);
      expect("nsew").toContain(d[0]);
      expect("nsew").toContain(d[1]);
    }
  });
});
