import { describe, expect, it } from "vitest";
import { resolveAnchorFromRect } from "../resolveAnchor";

const RECT = { left: 100, top: 200, width: 400, height: 300 };

describe("resolveAnchorFromRect", () => {
  it("resolves center anchor", () => {
    const pos = resolveAnchorFromRect(RECT, "center");
    expect(pos).toEqual({ x: 300, y: 350 });
  });

  it("resolves top-bar anchor (center of top 40px)", () => {
    const pos = resolveAnchorFromRect(RECT, "top-bar");
    expect(pos).toEqual({ x: 300, y: 220 });
  });

  it("resolves corner-top-left", () => {
    const pos = resolveAnchorFromRect(RECT, "corner-top-left");
    expect(pos).toEqual({ x: 106, y: 206 });
  });

  it("resolves corner-top-right", () => {
    const pos = resolveAnchorFromRect(RECT, "corner-top-right");
    expect(pos).toEqual({ x: 494, y: 206 });
  });

  it("resolves corner-bottom-left", () => {
    const pos = resolveAnchorFromRect(RECT, "corner-bottom-left");
    expect(pos).toEqual({ x: 106, y: 494 });
  });

  it("resolves corner-bottom-right", () => {
    const pos = resolveAnchorFromRect(RECT, "corner-bottom-right");
    expect(pos).toEqual({ x: 494, y: 494 });
  });

  it("resolves explicit {x, y} anchor as offset from rect origin", () => {
    const pos = resolveAnchorFromRect(RECT, { x: 50, y: 30 });
    expect(pos).toEqual({ x: 150, y: 230 });
  });

  it("handles zero-size rect", () => {
    const pos = resolveAnchorFromRect(
      { left: 500, top: 500, width: 0, height: 0 },
      "center",
    );
    expect(pos).toEqual({ x: 500, y: 500 });
  });

  it("resolves percentage anchor {xPct, yPct}", () => {
    const pos = resolveAnchorFromRect(RECT, { xPct: 50, yPct: 50 });
    expect(pos).toEqual({ x: 300, y: 350 });
  });

  it("resolves percentage anchor at 0%", () => {
    const pos = resolveAnchorFromRect(RECT, { xPct: 0, yPct: 0 });
    expect(pos).toEqual({ x: 100, y: 200 });
  });

  it("resolves percentage anchor at 100%", () => {
    const pos = resolveAnchorFromRect(RECT, { xPct: 100, yPct: 100 });
    expect(pos).toEqual({ x: 500, y: 500 });
  });

  it("resolves percentage anchor at 25%/75%", () => {
    const pos = resolveAnchorFromRect(RECT, { xPct: 25, yPct: 75 });
    expect(pos).toEqual({ x: 200, y: 425 });
  });
});
