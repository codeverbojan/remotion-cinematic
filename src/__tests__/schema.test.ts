import { describe, it, expect } from "vitest";
import { CinematicSchema } from "../schema";
import type { CinematicProps } from "../schema";

describe("CinematicSchema", () => {
  it("parses empty object with all defaults", () => {
    const result = CinematicSchema.parse({});
    expect(result.brand.name).toBe("Product");
    expect(result.brand.colors.primary).toBe("#6366F1");
    expect(result.headlines.pain).toEqual(["Where did that", "request go?"]);
    expect(result.cta).toBe("Try it free");
    expect(result.scenes).toHaveLength(5);
    expect(result.overlap).toBe(15);
    expect(result.easing).toBe("snappy");
    expect(result.music.enabled).toBe(true);
    expect(result.music.volume).toBe(0.35);
    expect(result.sfxEnabled).toBe(true);
    expect(result.sfxVolume).toBe(0.4);
  });

  it("preserves user overrides alongside defaults", () => {
    const result = CinematicSchema.parse({
      brand: { name: "SampleHQ", colors: { primary: "#FF0000" } },
      cta: "Start now",
    });
    expect(result.brand.name).toBe("SampleHQ");
    expect(result.brand.colors.primary).toBe("#FF0000");
    expect(result.brand.colors.accent).toBe("#22D3EE");
    expect(result.cta).toBe("Start now");
    expect(result.headlines.pain).toEqual(["Where did that", "request go?"]);
  });

  it("validates scene durationInFrames min/max", () => {
    expect(() =>
      CinematicSchema.parse({
        scenes: [{ id: "too-short", durationInFrames: 10 }],
      }),
    ).toThrow();

    expect(() =>
      CinematicSchema.parse({
        scenes: [{ id: "too-long", durationInFrames: 9999 }],
      }),
    ).toThrow();
  });

  it("rejects invalid easing preset", () => {
    expect(() =>
      CinematicSchema.parse({ easing: "invalid-easing" }),
    ).toThrow();
  });

  it("rejects invalid scene direction", () => {
    expect(() =>
      CinematicSchema.parse({
        scenes: [{ id: "bad", durationInFrames: 60, enterFrom: "diagonal" }],
      }),
    ).toThrow();
  });

  it("clamps sfxVolume to 0-1 range", () => {
    expect(() =>
      CinematicSchema.parse({ sfxVolume: 2.5 }),
    ).toThrow();

    expect(() =>
      CinematicSchema.parse({ sfxVolume: -0.5 }),
    ).toThrow();
  });

  it("accepts valid custom scenes array", () => {
    const result = CinematicSchema.parse({
      scenes: [
        { id: "intro", durationInFrames: 90, enterFrom: "left", exitTo: "right" },
        { id: "outro", durationInFrames: 60, enterFrom: "bottom", exitTo: "none" },
      ],
    });
    expect(result.scenes).toHaveLength(2);
    expect(result.scenes[0].id).toBe("intro");
    expect(result.scenes[0].enabled).toBe(true);
    expect(result.scenes[0].background).toBe("dark");
    expect(result.scenes[1].exitTo).toBe("none");
  });

  it("accepts custom product features", () => {
    const result = CinematicSchema.parse({
      productFeatures: [
        { title: "Analytics", description: "Real-time insights" },
      ],
    });
    expect(result.productFeatures).toHaveLength(1);
    expect(result.productFeatures[0].title).toBe("Analytics");
  });

  it("requires title and description on product features", () => {
    expect(() =>
      CinematicSchema.parse({
        productFeatures: [{ title: "Missing desc" }],
      }),
    ).toThrow();
  });

  it("round-trips through parse (idempotent)", () => {
    const first = CinematicSchema.parse({});
    const second = CinematicSchema.parse(first);
    expect(second).toEqual(first);
  });

  it("scene enabled defaults to true", () => {
    const result = CinematicSchema.parse({
      scenes: [{ id: "test", durationInFrames: 60 }],
    });
    expect(result.scenes[0].enabled).toBe(true);
  });

  it("all default scenes match expected IDs", () => {
    const result = CinematicSchema.parse({});
    const ids = result.scenes.map((s) => s.id);
    expect(ids).toEqual([
      "chaos",
      "product-reveal",
      "feature-showcase",
      "headline-resolution",
      "closer",
    ]);
  });

  it("accepts music disabled", () => {
    const result = CinematicSchema.parse({ music: { enabled: false } });
    expect(result.music.enabled).toBe(false);
    expect(result.music.volume).toBe(0.35);
  });

  it("logoUrl is optional and absent by default", () => {
    const result = CinematicSchema.parse({});
    expect(result.brand.logoUrl).toBeUndefined();
  });

  it("accepts logoUrl when provided", () => {
    const result = CinematicSchema.parse({
      brand: { logoUrl: "logos/sample.png" },
    });
    expect(result.brand.logoUrl).toBe("logos/sample.png");
  });

  it("rejects empty scenes array", () => {
    expect(() => CinematicSchema.parse({ scenes: [] })).toThrow();
  });

  it("rejects empty productFeatures array", () => {
    expect(() => CinematicSchema.parse({ productFeatures: [] })).toThrow();
  });

  it("rejects duplicate scene IDs", () => {
    expect(() =>
      CinematicSchema.parse({
        scenes: [
          { id: "intro", durationInFrames: 60 },
          { id: "intro", durationInFrames: 90 },
        ],
      }),
    ).toThrow(/unique/i);
  });

  it("rejects brand name exceeding max length", () => {
    expect(() =>
      CinematicSchema.parse({ brand: { name: "A".repeat(101) } }),
    ).toThrow();
  });

  it("preserves music defaults under partial override", () => {
    const result = CinematicSchema.parse({ music: { volume: 0.8 } });
    expect(result.music.volume).toBe(0.8);
    expect(result.music.enabled).toBe(true);
    expect(result.music.fadeInFrames).toBe(45);
    expect(result.music.fadeOutFrames).toBe(90);
  });

  it("preserves brand color defaults under partial override", () => {
    const result = CinematicSchema.parse({
      brand: { colors: { primary: "#FF0000" } },
    });
    expect(result.brand.colors.primary).toBe("#FF0000");
    expect(result.brand.colors.accent).toBe("#22D3EE");
    expect(result.brand.colors.text).toBe("#F5F5FF");
    expect(result.brand.colors.background).toBe("#0F0F14");
  });
});
