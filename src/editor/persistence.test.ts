import { describe, it, expect } from "vitest";

function formatPropsFile(props: unknown): string {
  return [
    'import type { CinematicProps } from "./schema";',
    "",
    "export const DEFAULT_PROPS: CinematicProps = ",
    JSON.stringify(props, null, 2) + ";",
    "",
  ].join("\n");
}

const PARSE_RE = /export const DEFAULT_PROPS:\s*CinematicProps\s*=\s*([\s\S]*);/;

describe("prop persistence round-trip", () => {
  it("formats and re-parses a simple object", () => {
    const input = { brand: { name: "Test" }, overlap: 15 };
    const file = formatPropsFile(input);
    const match = file.match(PARSE_RE);
    expect(match).not.toBeNull();
    const parsed = JSON.parse(match![1]);
    expect(parsed).toEqual(input);
  });

  it("handles nested arrays and objects", () => {
    const input = {
      scenes: [
        { id: "a", enabled: true, durationInFrames: 100 },
        { id: "b", enabled: false, durationInFrames: 200 },
      ],
      cursorPath: [
        { at: 0, action: "idle", positionX: 100, positionY: 200 },
        { at: 10, action: "moveTo", target: "win-1", duration: 12 },
      ],
    };
    const file = formatPropsFile(input);
    const match = file.match(PARSE_RE);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![1])).toEqual(input);
  });

  it("handles empty object", () => {
    const file = formatPropsFile({});
    const match = file.match(PARSE_RE);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![1])).toEqual({});
  });

  it("handles special characters in string values", () => {
    const input = { brand: { name: 'Test "with" quotes & <brackets>' } };
    const file = formatPropsFile(input);
    const match = file.match(PARSE_RE);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![1])).toEqual(input);
  });

  it("produces valid TypeScript file structure", () => {
    const file = formatPropsFile({ x: 1 });
    expect(file).toContain('import type { CinematicProps } from "./schema"');
    expect(file).toContain("export const DEFAULT_PROPS: CinematicProps =");
    expect(file.endsWith(";\n")).toBe(true);
  });
});

describe("persistUpdate", () => {
  it("does not throw when @remotion/studio is unavailable", async () => {
    const { persistUpdate } = await import("./updateProps");
    expect(() => persistUpdate((prev) => prev)).not.toThrow();
  });
});

describe("updateProp re-export", () => {
  it("re-exports persistUpdate as updateProp", async () => {
    const { updateProp } = await import("../VideoPropsContext");
    const { persistUpdate } = await import("./updateProps");
    expect(updateProp).toBe(persistUpdate);
  });
});
