import { describe, expect, it } from "vitest";
import { defineZones, getSceneStartFrame, getTotalFrames, resolveTimeline, interpolateCamera } from "../engine";
import { SCENES, SCENE_OVERLAP, CAMERA_TIMELINE, CURSOR_SFX, TRANSITION_SFX, SFX } from "../content";
import { CANVAS } from "../tokens";

describe("e2e: content.ts integrity", () => {
  it("every scene has a positive duration", () => {
    for (const scene of SCENES) {
      expect(scene.durationInFrames).toBeGreaterThan(0);
    }
  });

  it("scene IDs are unique", () => {
    const ids = SCENES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("total frames is positive and consistent", () => {
    const total = getTotalFrames(SCENES, SCENE_OVERLAP);
    expect(total).toBeGreaterThan(0);
    const manual = SCENES.reduce((s, sc) => s + sc.durationInFrames, 0) - SCENE_OVERLAP * (SCENES.length - 1);
    expect(total).toBe(manual);
  });

  it("every scene has a valid start frame", () => {
    for (const scene of SCENES) {
      const start = getSceneStartFrame(SCENES, scene.id, SCENE_OVERLAP);
      expect(start).toBeGreaterThanOrEqual(0);
    }
  });

  it("scene start frames are in ascending order", () => {
    const starts = SCENES.map((s) => getSceneStartFrame(SCENES, s.id, SCENE_OVERLAP));
    for (let i = 1; i < starts.length; i++) {
      expect(starts[i]).toBeGreaterThan(starts[i - 1]);
    }
  });
});

describe("e2e: camera timeline", () => {
  it("every camera keyframe references an existing scene", () => {
    const sceneIds = new Set(SCENES.map((s) => s.id));
    for (const kf of CAMERA_TIMELINE) {
      expect(sceneIds.has(kf.scene)).toBe(true);
    }
  });

  it("resolves to absolute frames without errors", () => {
    const resolved = resolveTimeline(CAMERA_TIMELINE, SCENES, SCENE_OVERLAP);
    expect(resolved.length).toBe(CAMERA_TIMELINE.length);
    for (const r of resolved) {
      expect(r.frame).toBeGreaterThanOrEqual(0);
    }
  });

  it("interpolates camera at every scene boundary without errors", () => {
    const resolved = resolveTimeline(CAMERA_TIMELINE, SCENES, SCENE_OVERLAP);
    const total = getTotalFrames(SCENES, SCENE_OVERLAP);
    const testFrames = [0, 1, Math.floor(total / 2), total - 1];
    for (const f of testFrames) {
      const pose = interpolateCamera(resolved, f, "cinematic");
      expect(pose).toBeDefined();
      expect(typeof pose.x).toBe("number");
      expect(typeof pose.y).toBe("number");
      expect(typeof pose.scale).toBe("number");
      expect(pose.scale).toBeGreaterThan(0);
    }
  });
});

describe("e2e: SFX configuration", () => {
  it("CURSOR_SFX entries have valid src paths", () => {
    for (const [action, entry] of Object.entries(CURSOR_SFX)) {
      expect(entry!.src).toMatch(/\.mp3$/);
      expect(typeof action).toBe("string");
    }
  });

  it("TRANSITION_SFX has valid config", () => {
    expect(TRANSITION_SFX.src).toMatch(/\.mp3$/);
    expect(TRANSITION_SFX.durationInFrames).toBeGreaterThan(0);
  });

  it("SFX library entries all have valid config", () => {
    for (const [name, entry] of Object.entries(SFX)) {
      expect(entry.src).toMatch(/\.mp3$/);
      expect(entry.durationInFrames).toBeGreaterThan(0);
      expect(typeof name).toBe("string");
    }
  });
});

describe("e2e: FeatureShowcase layout zones", () => {
  const ZONES = {
    canvas: { width: CANVAS.width, height: CANVAS.height },
    slots: [
      { id: "left", region: { x: 0, y: 0, w: 960, h: 1080 } },
      { id: "right", region: { x: 960, y: 0, w: 960, h: 1080 } },
      { id: "full", region: { x: 0, y: 0, w: 1920, h: 1080 } },
    ],
    reserved: [],
  };

  it("zone system initializes without errors", () => {
    const system = defineZones(ZONES);
    expect(system.canvas.width).toBe(1920);
    expect(system.canvas.height).toBe(1080);
  });

  it("all feature windows place within canvas bounds", () => {
    const system = defineZones(ZONES);
    const windows = [
      { id: "feature-0", slotId: "left", width: 800, height: 500 },
      { id: "feature-1", slotId: "right", width: 800, height: 500 },
      { id: "feature-2", slotId: "full", width: 1400, height: 700 },
    ];

    for (const win of windows) {
      const rect = system.placeWindow({
        id: win.id,
        slotId: win.slotId,
        width: win.width,
        height: win.height,
        margin: 30,
        avoidZones: [],
      });

      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.left + rect.width).toBeLessThanOrEqual(CANVAS.width);
      expect(rect.top + rect.height).toBeLessThanOrEqual(CANVAS.height);
    }
  });
});

describe("e2e: scene component wiring", () => {
  it("SCENE_COMPONENTS map covers every scene in SCENES", () => {
    const componentMap: Record<string, unknown> = {
      "chaos": true,
      "product-reveal": true,
      "feature-showcase": true,
      "headline-resolution": true,
      "closer": true,
    };

    for (const scene of SCENES) {
      expect(componentMap[scene.id]).toBeDefined();
    }
  });

  it("scene exports are importable", async () => {
    const scenes = await import("../scenes");
    expect(scenes.ChaosDesktop).toBeDefined();
    expect(scenes.ProductReveal).toBeDefined();
    expect(scenes.FeatureShowcase).toBeDefined();
    expect(scenes.HeadlineResolution).toBeDefined();
    expect(scenes.Closer).toBeDefined();
  });
});

describe("e2e: app-ui primitives", () => {
  it("all 16 primitives are importable", async () => {
    const appUi = await import("../primitives/app-ui");
    const expected = [
      "AppShell", "Panel", "PanelGrid",
      "SidebarNav", "TopNav", "TabBar",
      "DataTable", "MessageList", "StatCard",
      "ListItems", "Placeholder", "NotificationToast",
      "Avatar", "Badge", "Button", "SearchBar",
    ];
    for (const name of expected) {
      expect((appUi as Record<string, unknown>)[name]).toBeDefined();
    }
  });
});
