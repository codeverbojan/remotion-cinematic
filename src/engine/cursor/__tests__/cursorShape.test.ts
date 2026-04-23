import { describe, expect, it } from "vitest";
import { getCursorShape } from "../CursorSprite";

describe("getCursorShape", () => {
  it("returns default for idle", () => {
    expect(getCursorShape("idle", false, false)).toBe("default");
  });

  it("returns pointer for click", () => {
    expect(getCursorShape("click", false, false)).toBe("pointer");
  });

  it("returns grab (open hand) when approaching drag target", () => {
    expect(getCursorShape("drag", false, false)).toBe("grab");
  });

  it("returns grabbing (closed hand) during active drag", () => {
    expect(getCursorShape("drag", false, true)).toBe("grabbing");
  });

  it("returns pointer for moveTo when next action is click", () => {
    expect(getCursorShape("moveTo", true, false)).toBe("pointer");
  });

  it("returns default for moveTo when next action is not click", () => {
    expect(getCursorShape("moveTo", false, false)).toBe("default");
  });
});
