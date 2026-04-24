import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const APP_UI_DIR = path.resolve(__dirname, "../primitives/app-ui");
const PRIMITIVES_DIR = path.resolve(__dirname, "../primitives");
const ENGINE_LAYOUT_DIR = path.resolve(__dirname, "../engine/layout");

const EXPECTED_EDITOR_TYPES: Record<string, string> = {
  "Window.tsx": "window",
  "Panel.tsx": "panel",
  "StatCard.tsx": "stat-card",
  "DataTable.tsx": "data-table",
  "Button.tsx": "button",
  "SidebarNav.tsx": "sidebar-nav",
  "TabBar.tsx": "tab-bar",
  "SearchBar.tsx": "search-bar",
  "MessageList.tsx": "message-list",
  "ListItems.tsx": "list-items",
  "Placeholder.tsx": "placeholder",
  "NotificationToast.tsx": "notification-toast",
  "Avatar.tsx": "avatar",
  "Badge.tsx": "badge",
  "AppFromDescriptor.tsx": "app-descriptor",
};

function readPrimitive(file: string): string {
  const dir = file === "Window.tsx" ? PRIMITIVES_DIR : APP_UI_DIR;
  return fs.readFileSync(path.join(dir, file), "utf-8");
}

describe("editor attributes on app-ui primitives", () => {
  for (const [file, expectedType] of Object.entries(EXPECTED_EDITOR_TYPES)) {
    it(`${file} has data-editor-type="${expectedType}"`, () => {
      const source = readPrimitive(file);
      expect(source).toContain(`data-editor-type="${expectedType}"`);
    });

    it(`${file} has data-editor-id={id}`, () => {
      const source = readPrimitive(file);
      expect(source).toContain("data-editor-id={id}");
    });
  }
});

describe("editor attributes on LayoutWindow", () => {
  it("has data-editor-type and data-editor-id", () => {
    const source = fs.readFileSync(
      path.join(ENGINE_LAYOUT_DIR, "LayoutWindow.tsx"),
      "utf-8",
    );
    expect(source).toContain('data-editor-type="layout-window"');
    expect(source).toContain("data-editor-id={id}");
  });
});

describe("editor type values are kebab-case", () => {
  for (const [file, editorType] of Object.entries(EXPECTED_EDITOR_TYPES)) {
    it(`${file}: "${editorType}" is kebab-case`, () => {
      expect(editorType).toMatch(/^[a-z]+(-[a-z]+)*$/);
    });
  }
});

describe("scenes with visualControl import correctly", () => {
  it("ChaosDesktop imports without error", async () => {
    const mod = await import("../scenes/ChaosDesktop");
    expect(mod.ChaosDesktop).toBeDefined();
  });

  it("ProductReveal imports without error", async () => {
    const mod = await import("../scenes/ProductReveal");
    expect(mod.ProductReveal).toBeDefined();
  });

  it("HeadlineResolution imports without error", async () => {
    const mod = await import("../scenes/HeadlineResolution");
    expect(mod.HeadlineResolution).toBeDefined();
  });
});

describe("editor overlay structure", () => {
  it("EditorOverlay gates on isStudio", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../editor/EditorOverlay.tsx"),
      "utf-8",
    );
    expect(source).toContain("isStudio");
    expect(source).toContain("getRemotionEnvironment");
  });

  it("SelectionBox uses CSS.escape for safe queries", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../editor/SelectionBox.tsx"),
      "utf-8",
    );
    expect(source).toContain("CSS.escape(targetId)");
  });

  it("PropertyPanel uses CSS.escape for safe queries", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../editor/PropertyPanel.tsx"),
      "utf-8",
    );
    expect(source).toContain("CSS.escape(selectedId)");
  });

  it("SnapGuides exports pure functions", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../editor/SnapGuides.tsx"),
      "utf-8",
    );
    expect(source).toContain("export function computeSnapGuides");
    expect(source).toContain("export function applySnap");
  });

  it("EditorOverlay has keyboard shortcut handler", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../editor/EditorOverlay.tsx"),
      "utf-8",
    );
    expect(source).toContain("onKeyDown");
    expect(source).toContain("Escape");
    expect(source).toContain("ArrowLeft");
  });

  it("SelectionBox has 8 resize handles", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../editor/SelectionBox.tsx"),
      "utf-8",
    );
    for (const dir of ["nw", "n", "ne", "e", "se", "s", "sw", "w"]) {
      expect(source).toContain(`dir: "${dir}"`);
    }
  });

  it("SelectionBox has preventDefault on drag handlers", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../editor/SelectionBox.tsx"),
      "utf-8",
    );
    const preventCount = (source.match(/e\.preventDefault\(\)/g) || []).length;
    expect(preventCount).toBeGreaterThanOrEqual(2);
  });
});

describe("visual mode config", () => {
  it("remotion.config.ts enables experimental visual mode", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../remotion.config.ts"),
      "utf-8",
    );
    expect(source).toContain("setExperimentalVisualMode(true)");
  });
});
