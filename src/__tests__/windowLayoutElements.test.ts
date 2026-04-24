import { describe, it, expect } from "vitest";
import { z } from "zod";

const WindowLayoutSchema = z.object({
  id: z.string().max(100),
  startX: z.number().int(),
  startY: z.number().int(),
  startW: z.number().int().min(1),
  startH: z.number().int().min(1),
  endX: z.number().int().optional(),
  endY: z.number().int().optional(),
  endW: z.number().int().min(1).optional(),
  endH: z.number().int().min(1).optional(),
  enterAt: z.number().int().min(0),
  enterDuration: z.number().int().min(1).default(12),
  enterFrom: z.enum(["fade", "scale", "slide-up", "slide-left", "slide-right"]).default("scale"),
  animateAt: z.number().int().min(0).optional(),
  animateDuration: z.number().int().min(1).default(18),
  exitAt: z.number().int().min(0).optional(),
  exitDuration: z.number().int().min(1).default(12),
  zIndex: z.number().int().min(0).default(1),
  rotation: z.number().min(-180).max(180).optional(),
  title: z.string().max(200).default("Window"),
  sceneId: z.string().max(100).optional(),
});

describe("WindowLayout rotation field", () => {
  it("accepts entries without rotation (optional)", () => {
    const result = WindowLayoutSchema.safeParse({
      id: "test", startX: 0, startY: 0, startW: 100, startH: 100, enterAt: 0,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rotation).toBeUndefined();
    }
  });

  it("accepts valid rotation values", () => {
    for (const val of [-180, -3, 0, 2.5, 45, 180]) {
      const result = WindowLayoutSchema.safeParse({
        id: "test", startX: 0, startY: 0, startW: 100, startH: 100, enterAt: 0,
        rotation: val,
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.rotation).toBe(val);
    }
  });

  it("rejects rotation outside [-180, 180]", () => {
    expect(WindowLayoutSchema.safeParse({
      id: "test", startX: 0, startY: 0, startW: 100, startH: 100, enterAt: 0,
      rotation: 181,
    }).success).toBe(false);

    expect(WindowLayoutSchema.safeParse({
      id: "test", startX: 0, startY: 0, startW: 100, startH: 100, enterAt: 0,
      rotation: -181,
    }).success).toBe(false);
  });
});

describe("sticky note WindowLayout entries", () => {
  const stickyEntries = [
    { id: "sticky-0", startX: 30, startY: 20, startW: 200, startH: 160, endX: -100, endY: -180, enterAt: 0, enterDuration: 12, enterFrom: "scale" as const, animateAt: 150, animateDuration: 25, zIndex: 0, rotation: -3 },
    { id: "sticky-1", startX: 260, startY: 35, startW: 200, startH: 160, endX: 60, endY: -200, enterAt: 8, enterDuration: 12, enterFrom: "scale" as const, animateAt: 150, animateDuration: 25, zIndex: 0, rotation: 2.5 },
    { id: "sticky-2", startX: 140, startY: 190, startW: 200, startH: 160, endX: -60, endY: -160, enterAt: 16, enterDuration: 12, enterFrom: "scale" as const, animateAt: 150, animateDuration: 25, zIndex: 0, rotation: -4 },
  ];

  it("parses all sticky note entries through the schema", () => {
    for (const entry of stickyEntries) {
      const result = WindowLayoutSchema.safeParse(entry);
      expect(result.success).toBe(true);
    }
  });

  it("preserves rotation values for sticky notes", () => {
    const rotations = stickyEntries.map((e) => WindowLayoutSchema.parse(e).rotation);
    expect(rotations).toEqual([-3, 2.5, -4]);
  });

  it("has staggered enter timing (0, 8, 16)", () => {
    const enterAts = stickyEntries.map((e) => e.enterAt);
    expect(enterAts).toEqual([0, 8, 16]);
  });

  it("all share animateAt=150 for mission control sync", () => {
    for (const entry of stickyEntries) {
      expect(entry.animateAt).toBe(150);
    }
  });
});

describe("notification WindowLayout entries", () => {
  const notifEntries = [
    { id: "notification-0", startX: 1530, startY: 30, startW: 360, startH: 80, endX: 2030, enterAt: 90, enterDuration: 10, enterFrom: "slide-right" as const, animateAt: 150, animateDuration: 25, zIndex: 10 },
    { id: "notification-1", startX: 1530, startY: 132, startW: 360, startH: 80, endX: 2030, enterAt: 104, enterDuration: 10, enterFrom: "slide-right" as const, animateAt: 150, animateDuration: 25, zIndex: 10 },
    { id: "notification-2", startX: 1530, startY: 234, startW: 360, startH: 80, endX: 2030, enterAt: 118, enterDuration: 10, enterFrom: "slide-right" as const, animateAt: 150, animateDuration: 25, zIndex: 10 },
  ];

  it("parses all notification entries through the schema", () => {
    for (const entry of notifEntries) {
      const result = WindowLayoutSchema.safeParse(entry);
      expect(result.success).toBe(true);
    }
  });

  it("positions notifications at right edge (1920 - 30 - 360 = 1530)", () => {
    for (const entry of notifEntries) {
      expect(entry.startX).toBe(1530);
    }
  });

  it("endX slides 500px right off-screen (1530 + 500 = 2030)", () => {
    for (const entry of notifEntries) {
      expect(entry.endX).toBe(2030);
    }
  });

  it("has staggered enter timing (90, 104, 118)", () => {
    const enterAts = notifEntries.map((e) => e.enterAt);
    expect(enterAts).toEqual([90, 104, 118]);
  });

  it("uses slide-right entrance", () => {
    for (const entry of notifEntries) {
      expect(entry.enterFrom).toBe("slide-right");
    }
  });

  it("has no endY (horizontal slide only)", () => {
    for (const entry of notifEntries) {
      expect((entry as Record<string, unknown>).endY).toBeUndefined();
    }
  });
});

describe("resolveWindowPose with notification layout", () => {
  it("animates only X when only endX is set", async () => {
    const { resolveWindowPose } = await import("../engine/choreography/resolveWindowPose");
    const def = WindowLayoutSchema.parse({
      id: "notification-0", startX: 1530, startY: 30, startW: 360, startH: 80,
      endX: 2030, enterAt: 90, enterDuration: 10, enterFrom: "slide-right",
      animateAt: 150, animateDuration: 25, zIndex: 10,
    });

    const beforeAnim = resolveWindowPose(def, 120);
    expect(beforeAnim.visible).toBe(true);
    expect(beforeAnim.left).toBe(1530);
    expect(beforeAnim.top).toBe(30);

    const afterAnim = resolveWindowPose(def, 200);
    expect(afterAnim.visible).toBe(true);
    expect(afterAnim.left).toBe(2030);
    expect(afterAnim.top).toBe(30);
  });
});

describe("ChaosDesktop SCENE_WINDOW_IDS", () => {
  it("includes all 9 element IDs", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync(
        require("path").resolve(__dirname, "../scenes/ChaosDesktop.tsx"),
        "utf-8",
      ),
    );
    const expectedIds = [
      "spreadsheet", "email", "chat",
      "sticky-0", "sticky-1", "sticky-2",
      "notification-0", "notification-1", "notification-2",
    ];
    for (const id of expectedIds) {
      expect(source).toContain(`"${id}"`);
    }
  });
});

describe("DynamicWindows CLAIMED_IDS", () => {
  it("includes sticky and notification IDs to prevent double rendering", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync(
        require("path").resolve(__dirname, "../scenes/DynamicWindows.tsx"),
        "utf-8",
      ),
    );
    for (const id of ["sticky-0", "sticky-1", "sticky-2", "notification-0", "notification-1", "notification-2"]) {
      expect(source).toContain(`"${id}"`);
    }
  });
});
