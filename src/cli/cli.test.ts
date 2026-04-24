import { describe, it, expect } from "vitest";

import { parseFigmaUrl } from "./figma-client";
import { convertFigmaToDescriptor } from "./figma-to-descriptor";
import { parseArgs } from "./index";
import type { FigmaNode } from "./figma-client";

describe("CLI integration", () => {
  it("parseFigmaUrl → fetchFigmaNode → convertFigmaToDescriptor pipeline", () => {
    const url = "https://www.figma.com/design/abc123/MyApp?node-id=1-2";
    const parsed = parseFigmaUrl(url);
    expect(parsed).toEqual({ fileKey: "abc123", nodeId: "1:2" });

    const mockNode: FigmaNode = {
      id: "1-2",
      name: "Dashboard",
      type: "FRAME",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [
        {
          id: "sidebar",
          name: "Sidebar",
          type: "FRAME",
          absoluteBoundingBox: { x: 0, y: 0, width: 220, height: 900 },
          children: [
            {
              id: "nav-1",
              name: "Nav 1",
              type: "TEXT",
              characters: "Dashboard",
              absoluteBoundingBox: { x: 20, y: 60, width: 180, height: 20 },
            },
          ],
        },
        {
          id: "main",
          name: "Main Content",
          type: "FRAME",
          absoluteBoundingBox: { x: 220, y: 0, width: 1220, height: 900 },
          children: [
            {
              id: "card",
              name: "Revenue",
              type: "FRAME",
              absoluteBoundingBox: { x: 240, y: 20, width: 300, height: 120 },
              children: [
                {
                  id: "label",
                  name: "Label",
                  type: "TEXT",
                  characters: "Revenue",
                  absoluteBoundingBox: { x: 250, y: 30, width: 100, height: 20 },
                },
                {
                  id: "value",
                  name: "Value",
                  type: "TEXT",
                  characters: "$12,400",
                  absoluteBoundingBox: { x: 250, y: 55, width: 150, height: 30 },
                },
              ],
            },
          ],
        },
      ],
    };

    const descriptor = convertFigmaToDescriptor(mockNode);

    expect(descriptor.layout).toBe("sidebar");
    expect(descriptor.sidebar).toBeDefined();
    expect(descriptor.sidebar!.items[0].label).toBe("Dashboard");
    expect(descriptor.content.panels.length).toBeGreaterThan(0);
    expect(descriptor.content.panels[0].type).toBe("stat");
    expect(descriptor.content.panels[0].value).toBe("$12,400");
  });

  it("parseArgs extracts all flags", () => {
    const args = parseArgs([
      "node", "cli",
      "--figma-url=https://figma.com/file/abc/Test?node-id=1-2",
      "--token=my-token",
      "--out=output.json",
      "--inject",
    ]);

    expect(args.figmaUrl).toBe("https://figma.com/file/abc/Test?node-id=1-2");
    expect(args.token).toBe("my-token");
    expect(args.out).toBe("output.json");
    expect(args.inject).toBe(true);
  });

  it("parseArgs handles screenshot mode", () => {
    const args = parseArgs(["node", "cli", "--screenshot=./app.png"]);
    expect(args.screenshot).toBe("./app.png");
    expect(args.figmaUrl).toBeUndefined();
    expect(args.inject).toBe(false);
  });

  it("output is valid JSON matching LayoutDescriptor shape", () => {
    const node: FigmaNode = {
      id: "root",
      name: "Root",
      type: "FRAME",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [],
    };

    const descriptor = convertFigmaToDescriptor(node);
    const json = JSON.stringify(descriptor);
    const parsed = JSON.parse(json);

    expect(parsed).toHaveProperty("layout");
    expect(parsed).toHaveProperty("content");
    expect(parsed.content).toHaveProperty("columnCount");
    expect(parsed.content).toHaveProperty("gap");
    expect(parsed.content).toHaveProperty("panels");
    expect(Array.isArray(parsed.content.panels)).toBe(true);
  });
});
