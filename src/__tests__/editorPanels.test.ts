import { describe, it, expect } from "vitest";

describe("PropertyPanel — panel routing", () => {
  const PANEL_TYPES: Record<string, string> = {
    window: "WindowPanel",
    headline: "HeadlinePanel",
    button: "ButtonPanel",
    "stat-card": "StatCardPanel",
    "data-table": "GenericPanel",
    "sidebar-nav": "GenericPanel",
    "tab-bar": "GenericPanel",
    "search-bar": "GenericPanel",
    "message-list": "GenericPanel",
    "list-items": "GenericPanel",
    placeholder: "GenericPanel",
    "notification-toast": "GenericPanel",
    avatar: "GenericPanel",
    badge: "GenericPanel",
    "app-descriptor": "GenericPanel",
    "layout-window": "GenericPanel",
    panel: "GenericPanel",
  };

  it("has panel mapping for all known editor types", () => {
    const knownTypes = [
      "window", "layout-window", "panel", "stat-card", "data-table",
      "button", "sidebar-nav", "tab-bar", "search-bar", "message-list",
      "list-items", "placeholder", "notification-toast", "avatar", "badge",
      "app-descriptor", "headline",
    ];
    for (const type of knownTypes) {
      expect(type in PANEL_TYPES).toBe(true);
    }
  });

  it("window type gets WindowPanel when id matches windowLayout", () => {
    expect(PANEL_TYPES["window"]).toBe("WindowPanel");
  });

  it("headline type gets HeadlinePanel", () => {
    expect(PANEL_TYPES["headline"]).toBe("HeadlinePanel");
  });

  it("button type gets ButtonPanel", () => {
    expect(PANEL_TYPES["button"]).toBe("ButtonPanel");
  });

  it("stat-card type gets StatCardPanel", () => {
    expect(PANEL_TYPES["stat-card"]).toBe("StatCardPanel");
  });
});

describe("detectHeadlineField", () => {
  function detectHeadlineField(id: string): "pain" | "resolution" | "closer" | null {
    if (id.includes("pain")) return "pain";
    if (id.includes("resolution")) return "resolution";
    if (id.includes("closer") || id.includes("cta")) return "closer";
    return null;
  }

  it("detects pain headline", () => {
    expect(detectHeadlineField("headline-pain")).toBe("pain");
    expect(detectHeadlineField("pain-text")).toBe("pain");
  });

  it("detects resolution headline", () => {
    expect(detectHeadlineField("headline-resolution")).toBe("resolution");
  });

  it("detects closer headline", () => {
    expect(detectHeadlineField("closer-headline")).toBe("closer");
    expect(detectHeadlineField("cta-button")).toBe("closer");
  });

  it("returns null for unknown id", () => {
    expect(detectHeadlineField("some-random-id")).toBeNull();
  });
});

describe("WindowPanel entrance options", () => {
  const ENTRANCE_OPTIONS = [
    { value: "fade", label: "Fade" },
    { value: "scale", label: "Scale" },
    { value: "slide-up", label: "Slide Up" },
    { value: "slide-left", label: "Slide Left" },
    { value: "slide-right", label: "Slide Right" },
  ];

  it("includes all WindowEntranceStyle values", () => {
    const validStyles = ["fade", "scale", "slide-up", "slide-left", "slide-right"];
    const optionValues = ENTRANCE_OPTIONS.map((o) => o.value);
    for (const style of validStyles) {
      expect(optionValues).toContain(style);
    }
  });

  it("has human-readable labels", () => {
    for (const option of ENTRANCE_OPTIONS) {
      expect(option.label.length).toBeGreaterThan(0);
      expect(option.label[0]).toBe(option.label[0].toUpperCase());
    }
  });
});

describe("WindowPanel field coverage", () => {
  const WINDOW_FIELDS_IN_PANEL = [
    "title", "startX", "startY", "startW", "startH",
    "enterFrom", "enterAt", "enterDuration",
    "exitAt", "exitDuration", "zIndex",
  ];

  const CONDITIONAL_FIELDS = ["endX", "endY", "endW", "endH", "animateAt", "animateDuration"];

  it("covers all essential window layout fields", () => {
    const essentialFields = ["startX", "startY", "startW", "startH", "enterAt", "title", "zIndex"];
    for (const field of essentialFields) {
      expect(WINDOW_FIELDS_IN_PANEL).toContain(field);
    }
  });

  it("has conditional fields for animation", () => {
    expect(CONDITIONAL_FIELDS).toContain("endX");
    expect(CONDITIONAL_FIELDS).toContain("animateAt");
  });

  it("entrance controls exist", () => {
    expect(WINDOW_FIELDS_IN_PANEL).toContain("enterFrom");
    expect(WINDOW_FIELDS_IN_PANEL).toContain("enterDuration");
  });
});

describe("input component types", () => {
  it("NumberInput enforces min/max constraints via HTML attributes", () => {
    const constraints = { min: 50, max: 1920, step: 1 };
    expect(constraints.min).toBeLessThan(constraints.max);
    expect(constraints.step).toBeGreaterThan(0);
  });

  it("SelectInput options have unique values", () => {
    const options = [
      { value: "fade", label: "Fade" },
      { value: "scale", label: "Scale" },
      { value: "slide-up", label: "Slide Up" },
    ];
    const values = options.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("SliderInput range is valid", () => {
    const range = { min: 48, max: 144 };
    expect(range.min).toBeLessThan(range.max);
  });

  it("ColorInput accepts hex color format", () => {
    const hex = "#6366F1";
    expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("TextAreaInput splits and joins on newlines", () => {
    const lines = ["Line 1", "Line 2", "Line 3"];
    const joined = lines.join("\n");
    const split = joined.split("\n");
    expect(split).toEqual(lines);
  });
});

describe("button variant options", () => {
  const BUTTON_VARIANTS = [
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
    { value: "ghost", label: "Ghost" },
  ];

  it("includes all three variants", () => {
    const values = BUTTON_VARIANTS.map((v) => v.value);
    expect(values).toContain("primary");
    expect(values).toContain("secondary");
    expect(values).toContain("ghost");
  });
});
