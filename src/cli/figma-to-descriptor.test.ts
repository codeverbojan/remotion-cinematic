import { describe, it, expect } from "vitest";
import { convertFigmaToDescriptor } from "./figma-to-descriptor";
import type { FigmaNode } from "./figma-client";

function makeFrame(
  overrides: Partial<FigmaNode> & { id: string; name: string },
): FigmaNode {
  return {
    type: "FRAME",
    absoluteBoundingBox: { x: 0, y: 0, width: 400, height: 300 },
    children: [],
    ...overrides,
  };
}

function makeText(id: string, text: string, x = 0, y = 0): FigmaNode {
  return {
    id,
    name: text,
    type: "TEXT",
    characters: text,
    absoluteBoundingBox: { x, y, width: 100, height: 20 },
  };
}

describe("convertFigmaToDescriptor", () => {
  it("returns minimal layout for empty frame", () => {
    const root = makeFrame({
      id: "root",
      name: "Root",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [],
    });

    const result = convertFigmaToDescriptor(root);
    expect(result.layout).toBe("minimal");
    expect(result.content.panels).toEqual([]);
  });

  it("detects sidebar from narrow left frame", () => {
    const root = makeFrame({
      id: "root",
      name: "Root",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [
        makeFrame({
          id: "sidebar",
          name: "Sidebar",
          absoluteBoundingBox: { x: 0, y: 0, width: 240, height: 900 },
          children: [
            makeText("nav-1", "Dashboard", 20, 100),
            makeText("nav-2", "Settings", 20, 140),
          ],
        }),
        makeFrame({
          id: "content",
          name: "Content",
          absoluteBoundingBox: { x: 240, y: 0, width: 1200, height: 900 },
          children: [],
        }),
      ],
    });

    const result = convertFigmaToDescriptor(root);
    expect(result.layout).toBe("sidebar");
    expect(result.sidebar).toBeDefined();
    expect(result.sidebar!.items.length).toBeGreaterThanOrEqual(2);
    expect(result.sidebar!.items[0].label).toBe("Dashboard");
    expect(result.sidebar!.items[0].active).toBe(true);
    expect(result.sidebar!.width).toBe(240);
  });

  it("detects topbar from wide top frame", () => {
    const root = makeFrame({
      id: "root",
      name: "Root",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [
        makeFrame({
          id: "topbar",
          name: "Top Bar",
          absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 60 },
          children: [makeText("title", "Dashboard", 20, 20)],
        }),
        makeFrame({
          id: "content",
          name: "Content",
          absoluteBoundingBox: { x: 0, y: 60, width: 1440, height: 840 },
          children: [],
        }),
      ],
    });

    const result = convertFigmaToDescriptor(root);
    expect(result.layout).toBe("topbar");
    expect(result.topBar).toBeDefined();
    expect(result.topBar!.title).toBe("Dashboard");
  });

  it("detects both sidebar and topbar", () => {
    const root = makeFrame({
      id: "root",
      name: "Root",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [
        makeFrame({
          id: "sidebar",
          name: "Sidebar",
          absoluteBoundingBox: { x: 0, y: 0, width: 220, height: 900 },
          children: [makeText("s1", "Home"), makeText("s2", "Tasks")],
        }),
        makeFrame({
          id: "topbar",
          name: "Top Bar",
          absoluteBoundingBox: { x: 220, y: 0, width: 1220, height: 50 },
          children: [makeText("t1", "Overview")],
        }),
        makeFrame({
          id: "main",
          name: "Main",
          absoluteBoundingBox: { x: 220, y: 50, width: 1220, height: 850 },
          children: [],
        }),
      ],
    });

    const result = convertFigmaToDescriptor(root);
    expect(result.layout).toBe("sidebar");
    expect(result.sidebar).toBeDefined();
    expect(result.topBar).toBeDefined();
  });

  it("detects stat card panels", () => {
    const root = makeFrame({
      id: "root",
      name: "Root",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [
        makeFrame({
          id: "card1",
          name: "Revenue Card",
          absoluteBoundingBox: { x: 20, y: 20, width: 300, height: 120 },
          children: [
            makeText("label1", "Revenue", 30, 30),
            makeText("value1", "$12,400", 30, 60),
            makeText("delta1", "+12%", 30, 90),
          ],
        }),
      ],
    });

    const result = convertFigmaToDescriptor(root);
    expect(result.content.panels.length).toBe(1);
    expect(result.content.panels[0].type).toBe("stat");
    expect(result.content.panels[0].value).toBe("$12,400");
    expect(result.content.panels[0].delta).toBe("+12%");
  });

  it("detects table patterns", () => {
    const root = makeFrame({
      id: "root",
      name: "Root",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [
        makeFrame({
          id: "table",
          name: "Data Table",
          absoluteBoundingBox: { x: 20, y: 20, width: 800, height: 300 },
          children: [
            makeFrame({
              id: "header",
              name: "Header Row",
              absoluteBoundingBox: { x: 20, y: 20, width: 800, height: 40 },
              children: [
                makeText("h1", "Name", 20, 20),
                makeText("h2", "Status", 220, 20),
                makeText("h3", "Amount", 420, 20),
              ],
            }),
            makeFrame({
              id: "row1",
              name: "Row 1",
              absoluteBoundingBox: { x: 20, y: 60, width: 800, height: 40 },
              children: [
                makeText("r1c1", "Alex", 20, 60),
                makeText("r1c2", "Active", 220, 60),
                makeText("r1c3", "$500", 420, 60),
              ],
            }),
            makeFrame({
              id: "row2",
              name: "Row 2",
              absoluteBoundingBox: { x: 20, y: 100, width: 800, height: 40 },
              children: [
                makeText("r2c1", "Sam", 20, 100),
                makeText("r2c2", "Pending", 220, 100),
                makeText("r2c3", "$300", 420, 100),
              ],
            }),
          ],
        }),
      ],
    });

    const result = convertFigmaToDescriptor(root);
    expect(result.content.panels.length).toBe(1);
    const panel = result.content.panels[0];
    expect(panel.type).toBe("table");
    expect(panel.columns).toEqual(["Name", "Status", "Amount"]);
    expect(panel.rows!.length).toBe(2);
    expect(panel.rows![0]).toEqual(["Alex", "Active", "$500"]);
    expect(panel.statusColumn).toBe(1);
  });

  it("detects list patterns", () => {
    const root = makeFrame({
      id: "root",
      name: "Root",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [
        makeFrame({
          id: "list",
          name: "Actions List",
          absoluteBoundingBox: { x: 20, y: 20, width: 400, height: 300 },
          children: [
            makeFrame({
              id: "item1",
              name: "Item 1",
              absoluteBoundingBox: { x: 20, y: 20, width: 400, height: 60 },
              children: [
                makeText("i1l", "API Keys", 30, 30),
                makeText("i1d", "Manage tokens", 30, 50),
              ],
            }),
            makeFrame({
              id: "item2",
              name: "Item 2",
              absoluteBoundingBox: { x: 20, y: 80, width: 400, height: 60 },
              children: [
                makeText("i2l", "Webhooks", 30, 90),
                makeText("i2d", "Event hooks", 30, 110),
              ],
            }),
            makeFrame({
              id: "item3",
              name: "Item 3",
              absoluteBoundingBox: { x: 20, y: 140, width: 400, height: 60 },
              children: [
                makeText("i3l", "Billing", 30, 150),
                makeText("i3d", "View invoices", 30, 170),
              ],
            }),
          ],
        }),
      ],
    });

    const result = convertFigmaToDescriptor(root);
    expect(result.content.panels.length).toBe(1);
    const panel = result.content.panels[0];
    expect(panel.type).toBe("list");
    expect(panel.items!.length).toBe(3);
    expect(panel.items![0].label).toBe("API Keys");
    expect(panel.items![0].description).toBe("Manage tokens");
  });

  it("falls back to placeholder for unrecognized frames", () => {
    const root = makeFrame({
      id: "root",
      name: "Root",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [
        makeFrame({
          id: "chart",
          name: "Chart",
          absoluteBoundingBox: { x: 20, y: 20, width: 800, height: 400 },
          children: [makeText("ct", "Revenue Chart", 30, 30)],
        }),
      ],
    });

    const result = convertFigmaToDescriptor(root);
    expect(result.content.panels.length).toBe(1);
    expect(result.content.panels[0].type).toBe("placeholder");
    expect(result.content.panels[0].title).toBe("Revenue Chart");
  });

  it("hides invisible nodes", () => {
    const root = makeFrame({
      id: "root",
      name: "Root",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [
        makeFrame({
          id: "visible",
          name: "Visible",
          absoluteBoundingBox: { x: 20, y: 20, width: 300, height: 120 },
          children: [
            makeText("v1", "Revenue", 30, 30),
            makeText("v2", "$100", 30, 60),
          ],
        }),
        makeFrame({
          id: "hidden",
          name: "Hidden",
          visible: false,
          absoluteBoundingBox: { x: 340, y: 20, width: 300, height: 120 },
          children: [
            makeText("h1", "Secret", 350, 30),
            makeText("h2", "$999", 350, 60),
          ],
        }),
      ],
    });

    const result = convertFigmaToDescriptor(root);
    expect(result.content.panels.length).toBe(1);
    expect(result.content.panels[0].type).toBe("stat");
    expect(result.content.panels[0].value).toBe("$100");
  });

  it("handles nodes without absoluteBoundingBox", () => {
    const root: FigmaNode = {
      id: "root",
      name: "Root",
      type: "FRAME",
      children: [
        { id: "child", name: "Child", type: "FRAME", children: [] },
      ],
    };

    const result = convertFigmaToDescriptor(root);
    expect(result.layout).toBe("minimal");
  });

  it("treats percentage values as value not delta", () => {
    const root = makeFrame({
      id: "root",
      name: "Root",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [
        makeFrame({
          id: "card",
          name: "Card",
          absoluteBoundingBox: { x: 20, y: 20, width: 200, height: 100 },
          children: [
            makeText("l", "Completion", 30, 30),
            makeText("v", "100%", 30, 60),
          ],
        }),
      ],
    });

    const result = convertFigmaToDescriptor(root);
    const panel = result.content.panels[0];
    expect(panel.type).toBe("stat");
    expect(panel.value).toBe("100%");
    expect(panel.delta).toBeUndefined();
  });

  it("estimates column count from first row of panels", () => {
    const root = makeFrame({
      id: "root",
      name: "Root",
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      children: [
        makeFrame({
          id: "c1",
          name: "Card 1",
          absoluteBoundingBox: { x: 20, y: 20, width: 300, height: 120 },
          children: [makeText("l1", "A"), makeText("v1", "$1")],
        }),
        makeFrame({
          id: "c2",
          name: "Card 2",
          absoluteBoundingBox: { x: 340, y: 20, width: 300, height: 120 },
          children: [makeText("l2", "B"), makeText("v2", "$2")],
        }),
        makeFrame({
          id: "c3",
          name: "Card 3",
          absoluteBoundingBox: { x: 660, y: 20, width: 300, height: 120 },
          children: [makeText("l3", "C"), makeText("v3", "$3")],
        }),
      ],
    });

    const result = convertFigmaToDescriptor(root);
    expect(result.content.columnCount).toBe(3);
  });
});
