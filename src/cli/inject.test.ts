import { describe, it, expect } from "vitest";
import { injectDescriptor } from "./inject";
import type { ConvertedDescriptor } from "./figma-to-descriptor";

const MOCK_DESCRIPTOR: ConvertedDescriptor = {
  layout: "sidebar",
  sidebar: { width: 200, items: [{ label: "Home" }] },
  content: { columnCount: 2, gap: 16, panels: [] },
};

describe("injectDescriptor", () => {
  it("replaces the appDescriptor object in Root.tsx content", () => {
    const input = `defaultProps={{"brand":{},"appDescriptor":{"layout":"minimal","content":{"columnCount":1,"gap":8,"panels":[]}},"music":{}}}`;

    const result = injectDescriptor(input, MOCK_DESCRIPTOR);

    expect(result).toContain('"appDescriptor":');
    expect(result).toContain('"sidebar"');
    expect(result).toContain('"Home"');
    expect(result).toContain('"music"');
    expect(result).not.toContain('"minimal"');
  });

  it("preserves content before and after appDescriptor", () => {
    const input = `before,"appDescriptor":{"old":"data"},"after":true`;

    const result = injectDescriptor(input, MOCK_DESCRIPTOR);

    expect(result.startsWith("before,")).toBe(true);
    expect(result.endsWith(',"after":true')).toBe(true);
  });

  it("handles nested objects within appDescriptor", () => {
    const input = `"appDescriptor":{"layout":"topbar","sidebar":{"width":220,"items":[{"label":"A","active":true}]},"content":{"panels":[{"type":"stat","value":"$1"}]}},"next":"field"`;

    const result = injectDescriptor(input, MOCK_DESCRIPTOR);

    expect(result).toContain('"Home"');
    expect(result).toContain('"next":"field"');
    expect(result).not.toContain('"topbar"');
  });

  it("throws when appDescriptor is not found", () => {
    const input = `defaultProps={{"brand":{}}}`;

    expect(() => injectDescriptor(input, MOCK_DESCRIPTOR)).toThrow(
      "Could not find",
    );
  });

  it("throws on malformed braces", () => {
    const input = `"appDescriptor":{"unclosed`;

    expect(() => injectDescriptor(input, MOCK_DESCRIPTOR)).toThrow(
      "matching closing brace",
    );
  });

  it("handles braces inside string values", () => {
    const input = `"appDescriptor":{"title":"Hello {world}","nested":{"msg":"a {b} c"}},"after":1`;

    const result = injectDescriptor(input, MOCK_DESCRIPTOR);

    expect(result).toContain('"sidebar"');
    expect(result).toContain('"after":1');
    expect(result).not.toContain("Hello {world}");
  });

  it("handles escaped quotes inside string values", () => {
    const input = `"appDescriptor":{"note":"She said \\"hi\\"","x":1},"end":true`;

    const result = injectDescriptor(input, MOCK_DESCRIPTOR);

    expect(result).toContain('"sidebar"');
    expect(result).toContain('"end":true');
  });

  it("handles whitespace between key and colon", () => {
    const input = `"appDescriptor"  :  {"old":"data"},"after":true`;

    const result = injectDescriptor(input, MOCK_DESCRIPTOR);

    expect(result).toContain('"sidebar"');
    expect(result).toContain('"after":true');
    expect(result).not.toContain('"old"');
  });
});
