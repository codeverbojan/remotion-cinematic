import { describe, it, expect } from "vitest";
import { CinematicSchema } from "../schema";
import type { LayoutDescriptor, ContentPanel } from "../schema";

function parseDescriptor(input: Record<string, unknown>): LayoutDescriptor {
  const result = CinematicSchema.parse({ appDescriptor: input });
  return result.appDescriptor;
}

function parsePanel(input: Record<string, unknown>): ContentPanel {
  const desc = parseDescriptor({
    content: { panels: [input] },
  });
  return desc.content.panels[0];
}

describe("LayoutDescriptorSchema", () => {
  it("parses empty object with all defaults", () => {
    const desc = parseDescriptor({});
    expect(desc.layout).toBe("sidebar");
    expect(desc.content.columnCount).toBe(2);
    expect(desc.content.gap).toBe(16);
    expect(desc.content.panels).toEqual([]);
  });

  it("supports all three layout modes", () => {
    for (const layout of ["sidebar", "topbar", "minimal"] as const) {
      const desc = parseDescriptor({ layout });
      expect(desc.layout).toBe(layout);
    }
  });

  it("rejects invalid layout mode", () => {
    expect(() => parseDescriptor({ layout: "grid" })).toThrow();
  });

  it("parses sidebar with items and avatar", () => {
    const desc = parseDescriptor({
      sidebar: {
        width: 200,
        items: [
          { label: "Home", icon: "🏠", active: true },
          { label: "Settings", badge: "!" },
        ],
        avatar: { name: "Test User" },
      },
    });
    expect(desc.sidebar).toBeDefined();
    expect(desc.sidebar!.width).toBe(200);
    expect(desc.sidebar!.items).toHaveLength(2);
    expect(desc.sidebar!.items[0].active).toBe(true);
    expect(desc.sidebar!.items[1].badge).toBe("!");
    expect(desc.sidebar!.avatar?.name).toBe("Test User");
  });

  it("applies sidebar defaults", () => {
    const desc = parseDescriptor({ sidebar: { items: [] } });
    expect(desc.sidebar!.width).toBe(220);
  });

  it("parses topBar with title, search, tabs, and actions", () => {
    const desc = parseDescriptor({
      topBar: {
        title: "Dashboard",
        search: true,
        searchPlaceholder: "Find...",
        tabs: [
          { label: "Tab A", active: true },
          { label: "Tab B" },
        ],
        actions: [
          { label: "Save", variant: "primary" },
          { label: "Cancel", variant: "ghost" },
        ],
      },
    });
    expect(desc.topBar).toBeDefined();
    expect(desc.topBar!.title).toBe("Dashboard");
    expect(desc.topBar!.search).toBe(true);
    expect(desc.topBar!.searchPlaceholder).toBe("Find...");
    expect(desc.topBar!.tabs).toHaveLength(2);
    expect(desc.topBar!.tabs[0].active).toBe(true);
    expect(desc.topBar!.actions).toHaveLength(2);
    expect(desc.topBar!.actions[1].variant).toBe("ghost");
  });

  it("applies topBar defaults", () => {
    const desc = parseDescriptor({ topBar: {} });
    expect(desc.topBar!.title).toBe("");
    expect(desc.topBar!.search).toBe(false);
    expect(desc.topBar!.searchPlaceholder).toBe("Search...");
    expect(desc.topBar!.tabs).toEqual([]);
    expect(desc.topBar!.actions).toEqual([]);
  });

  it("rejects invalid topBar action variant", () => {
    expect(() =>
      parseDescriptor({
        topBar: { actions: [{ label: "X", variant: "danger" }] },
      }),
    ).toThrow();
  });

  it("clamps content columnCount to 1-6", () => {
    expect(() => parseDescriptor({ content: { columnCount: 0 } })).toThrow();
    expect(() => parseDescriptor({ content: { columnCount: 7 } })).toThrow();
    const desc = parseDescriptor({ content: { columnCount: 4 } });
    expect(desc.content.columnCount).toBe(4);
  });

  it("clamps content gap to 0-40", () => {
    expect(() => parseDescriptor({ content: { gap: -1 } })).toThrow();
    expect(() => parseDescriptor({ content: { gap: 50 } })).toThrow();
  });

  it("clamps sidebar width to 100-400", () => {
    expect(() => parseDescriptor({ sidebar: { width: 50 } })).toThrow();
    expect(() => parseDescriptor({ sidebar: { width: 500 } })).toThrow();
  });
});

describe("ContentPanelSchema — stat", () => {
  it("parses stat panel with value", () => {
    const panel = parsePanel({ type: "stat", label: "Revenue", value: "$1,000", delta: "+5%" });
    expect(panel.type).toBe("stat");
    expect(panel.label).toBe("Revenue");
    expect(panel.value).toBe("$1,000");
    expect(panel.delta).toBe("+5%");
  });

  it("rejects stat panel without value", () => {
    expect(() => parsePanel({ type: "stat", label: "Bad" })).toThrow("stat panel requires value");
  });
});

describe("ContentPanelSchema — table", () => {
  it("parses table panel with columns and rows", () => {
    const panel = parsePanel({
      type: "table",
      title: "Orders",
      columns: ["Name", "Status"],
      rows: [["Alice", "Active"]],
      statusColumn: 1,
    });
    expect(panel.type).toBe("table");
    expect(panel.columns).toEqual(["Name", "Status"]);
    expect(panel.rows).toHaveLength(1);
    expect(panel.statusColumn).toBe(1);
  });

  it("rejects table panel without columns", () => {
    expect(() => parsePanel({ type: "table", title: "Bad" })).toThrow("table panel requires columns");
  });

  it("rejects table panel with empty columns", () => {
    expect(() => parsePanel({ type: "table", columns: [] })).toThrow("table panel requires columns");
  });
});

describe("ContentPanelSchema — list", () => {
  it("parses list panel with items", () => {
    const panel = parsePanel({
      type: "list",
      title: "Actions",
      items: [
        { label: "Item A", description: "Desc A", badge: "3" },
        { label: "Item B" },
      ],
    });
    expect(panel.type).toBe("list");
    expect(panel.items).toHaveLength(2);
    expect(panel.items![0].badge).toBe("3");
    expect(panel.items![1].description).toBeUndefined();
  });

  it("rejects list panel without items", () => {
    expect(() => parsePanel({ type: "list", title: "Bad" })).toThrow("list panel requires items");
  });

  it("rejects list panel with empty items", () => {
    expect(() => parsePanel({ type: "list", items: [] })).toThrow("list panel requires items");
  });
});

describe("ContentPanelSchema — messages", () => {
  it("parses messages panel with chat variant", () => {
    const panel = parsePanel({
      type: "messages",
      title: "Chat",
      messages: [{ from: "Alice", text: "Hello" }],
      messageVariant: "chat",
    });
    expect(panel.type).toBe("messages");
    expect(panel.messages).toHaveLength(1);
    expect(panel.messageVariant).toBe("chat");
  });

  it("parses messages panel with email variant", () => {
    const panel = parsePanel({
      type: "messages",
      messages: [{ from: "Bob", text: "Hey", subject: "Re: Test", timestamp: "3:00 PM" }],
      messageVariant: "email",
    });
    expect(panel.messageVariant).toBe("email");
    expect(panel.messages![0].subject).toBe("Re: Test");
  });

  it("defaults messageVariant to chat", () => {
    const panel = parsePanel({
      type: "messages",
      messages: [{ from: "X", text: "Y" }],
    });
    expect(panel.messageVariant).toBe("chat");
  });

  it("rejects messages panel without messages", () => {
    expect(() => parsePanel({ type: "messages", title: "Bad" })).toThrow("messages panel requires messages");
  });

  it("rejects messages panel with empty messages", () => {
    expect(() => parsePanel({ type: "messages", messages: [] })).toThrow("messages panel requires messages");
  });
});

describe("ContentPanelSchema — placeholder", () => {
  it("parses placeholder panel with height", () => {
    const panel = parsePanel({ type: "placeholder", title: "Chart", height: 300 });
    expect(panel.type).toBe("placeholder");
    expect(panel.height).toBe(300);
  });

  it("placeholder does not require special fields", () => {
    const panel = parsePanel({ type: "placeholder" });
    expect(panel.type).toBe("placeholder");
  });
});

describe("ContentPanelSchema — invalid type", () => {
  it("rejects unknown panel type", () => {
    expect(() => parsePanel({ type: "chart" })).toThrow();
  });
});

describe("Default appDescriptor in CinematicSchema", () => {
  it("includes default descriptor with sidebar layout", () => {
    const result = CinematicSchema.parse({});
    expect(result.appDescriptor.layout).toBe("sidebar");
  });

  it("default has 4 sidebar items", () => {
    const result = CinematicSchema.parse({});
    expect(result.appDescriptor.sidebar).toBeDefined();
    expect(result.appDescriptor.sidebar!.items).toHaveLength(4);
  });

  it("default has 6 content panels", () => {
    const result = CinematicSchema.parse({});
    expect(result.appDescriptor.content.panels).toHaveLength(6);
  });

  it("default panels cover stat, table, list, and placeholder types", () => {
    const result = CinematicSchema.parse({});
    const types = result.appDescriptor.content.panels.map((p) => p.type);
    expect(types).toContain("stat");
    expect(types).toContain("table");
    expect(types).toContain("list");
    expect(types).toContain("placeholder");
  });

  it("default topBar has search enabled and 3 tabs", () => {
    const result = CinematicSchema.parse({});
    expect(result.appDescriptor.topBar).toBeDefined();
    expect(result.appDescriptor.topBar!.search).toBe(true);
    expect(result.appDescriptor.topBar!.tabs).toHaveLength(3);
  });
});

describe("AppFromDescriptor export", () => {
  it("is importable from app-ui barrel", async () => {
    const appUi = await import("../primitives/app-ui");
    expect(appUi.AppFromDescriptor).toBeDefined();
    expect(typeof appUi.AppFromDescriptor).toBe("function");
  });
});
