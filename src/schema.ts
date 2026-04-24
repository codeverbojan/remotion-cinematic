import { z } from "zod";
import { zColor } from "@remotion/zod-types";

const BrandColorsSchema = z.object({
  primary: zColor().default("#6366F1"),
  accent: zColor().default("#22D3EE"),
  background: zColor().default("#0F0F14"),
  backgroundLight: zColor().default("#1A1A24"),
  surface: zColor().default("#24243A"),
  text: zColor().default("#F5F5FF"),
  textMuted: zColor().default("#A0A0C0"),
  success: zColor().default("#34D399"),
  warning: zColor().default("#FBBF24"),
  error: zColor().default("#F87171"),
});

const BRAND_COLORS_DEFAULTS = BrandColorsSchema.parse({});

const BrandSchema = z.object({
  name: z.string().max(100).default("Product"),
  colors: BrandColorsSchema.default(BRAND_COLORS_DEFAULTS),
  fontSans: z.string().max(100).default("Inter"),
  fontSerif: z.string().max(100).default("Fraunces"),
  fontMono: z.string().max(100).default("JetBrains Mono"),
  logoUrl: z.string().max(500).optional(),
});

const BRAND_DEFAULTS = BrandSchema.parse({});

const HeadlinesSchema = z.object({
  pain: z.array(z.string().max(200)).default(["Where did that", "request go?"]),
  painFontSize: z.number().int().min(8).max(400).optional(),
  resolution: z.array(z.string().max(200)).default(["Every request.", "Tracked."]),
  resolutionFontSize: z.number().int().min(8).max(400).optional(),
  closer: z.array(z.string().max(200)).default(["Try it free."]),
  closerFontSize: z.number().int().min(8).max(400).optional(),
  color: zColor().optional(),
});

const HEADLINES_DEFAULTS = HeadlinesSchema.parse({});

const ProductFeatureSchema = z.object({
  title: z.string().max(100),
  description: z.string().max(500),
});

const SceneDirection = z.enum(["top", "bottom", "left", "right", "none"]);
const WallpaperVariant = z.enum(["dark", "light", "gradient", "none"]);

const SceneConfigSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
  durationInFrames: z.number().int().min(30).max(900),
  enterFrom: SceneDirection.default("bottom"),
  exitTo: SceneDirection.default("top"),
  background: WallpaperVariant.default("dark"),
});

const EasingPreset = z.enum([
  "cinematic",
  "snappy",
  "smooth",
  "elastic",
  "bounce",
  "spring",
]);

const WindowEntranceStyle = z.enum(["fade", "scale", "slide-up", "slide-left", "slide-right"]);

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
  enterFrom: WindowEntranceStyle.default("scale"),
  animateAt: z.number().int().min(0).optional(),
  animateDuration: z.number().int().min(1).default(18),
  exitAt: z.number().int().min(0).optional(),
  exitDuration: z.number().int().min(1).default(12),
  zIndex: z.number().int().min(0).default(1),
  title: z.string().max(200).default("Window"),
});

const AnchorPreset = z.enum([
  "center",
  "top-bar",
  "corner-top-left",
  "corner-top-right",
  "corner-bottom-left",
  "corner-bottom-right",
]);

const CursorPathEntrySchema = z.object({
  at: z.number().int().min(0),
  action: z.enum(["idle", "moveTo", "click", "drag"]),
  target: z.string().max(100).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  anchor: AnchorPreset.default("center"),
  anchorXPct: z.number().min(0).max(100).optional(),
  anchorYPct: z.number().min(0).max(100).optional(),
  toX: z.number().optional(),
  toY: z.number().optional(),
  duration: z.number().int().min(1).optional(),
}).refine(
  (e) => (e.anchorXPct === undefined) === (e.anchorYPct === undefined),
  { message: "anchorXPct and anchorYPct must both be set or both be unset" },
);

const DEFAULT_WINDOW_LAYOUT = z.array(WindowLayoutSchema).parse([
  {
    id: "spreadsheet", title: "Tracking Sheet",
    startX: 500, startY: 30, startW: 1100, startH: 500,
    endX: 1450, endY: -200,
    enterAt: 5, enterDuration: 14, enterFrom: "scale",
    animateAt: 150, animateDuration: 25,
    zIndex: 1,
  },
  {
    id: "email", title: "Email — Q2 Requests",
    startX: 20, startY: 200, startW: 1020, startH: 400,
    endX: -680, endY: 400,
    enterAt: 30, enterDuration: 14, enterFrom: "scale",
    animateAt: 150, animateDuration: 25,
    zIndex: 2,
  },
  {
    id: "chat", title: "Team Chat",
    startX: 200, startY: 350, startW: 1200, startH: 500,
    endX: 900, endY: 850,
    enterAt: 60, enterDuration: 14, enterFrom: "scale",
    animateAt: 150, animateDuration: 25,
    zIndex: 3,
  },
  {
    id: "product-window", title: "Dashboard — Overview",
    startX: 30, startY: 30, startW: 1860, startH: 1020,
    endX: 980, endY: 500, endW: 960, endH: 600,
    enterAt: 0, enterDuration: 1, enterFrom: "fade",
    animateAt: 30, animateDuration: 18,
    zIndex: 1,
  },
  {
    id: "top-panel", title: "Request Manager",
    startX: 30, startY: 30, startW: 920, startH: 440,
    enterAt: 48, enterDuration: 10, enterFrom: "slide-up",
    zIndex: 2,
  },
  {
    id: "left-panel", title: "Smart Alerts",
    startX: 30, startY: 500, startW: 920, startH: 570,
    enterAt: 53, enterDuration: 10, enterFrom: "slide-up",
    zIndex: 3,
  },
  // FeatureShowcase
  {
    id: "feature-0", title: "Dashboard",
    startX: 30, startY: 30, startW: 800, startH: 500,
    enterAt: 0, enterDuration: 12, enterFrom: "scale",
    zIndex: 1,
  },
  {
    id: "feature-1", title: "Request Manager",
    startX: 990, startY: 30, startW: 800, startH: 500,
    enterAt: 35, enterDuration: 12, enterFrom: "scale",
    zIndex: 2,
  },
  {
    id: "feature-2", title: "Smart Alerts",
    startX: 30, startY: 30, startW: 1400, startH: 700,
    enterAt: 70, enterDuration: 12, enterFrom: "scale",
    zIndex: 3,
  },
]);

const DEFAULT_CURSOR_PATH = z.array(CursorPathEntrySchema).parse([]);

// --- Layout Descriptor (Figma Bridge) ---

const SidebarItemSchema = z.object({
  label: z.string().max(100),
  icon: z.string().max(50).optional(),
  active: z.boolean().default(false),
  badge: z.string().max(20).optional(),
});

const SidebarSchema = z.object({
  width: z.number().int().min(100).max(400).default(220),
  items: z.array(SidebarItemSchema).default([]),
  avatar: z.object({
    name: z.string().max(100),
  }).optional(),
});

const TopBarActionSchema = z.object({
  label: z.string().max(100),
  variant: z.enum(["primary", "secondary", "ghost"]).default("primary"),
});

const TopBarTabSchema = z.object({
  label: z.string().max(100),
  active: z.boolean().default(false),
});

const TopBarSchema = z.object({
  title: z.string().max(200).default(""),
  search: z.boolean().default(false),
  searchPlaceholder: z.string().max(100).default("Search..."),
  tabs: z.array(TopBarTabSchema).default([]),
  actions: z.array(TopBarActionSchema).default([]),
});

const ContentPanelSchema = z.object({
  type: z.enum(["stat", "table", "list", "messages", "placeholder"]),
  title: z.string().max(200).optional(),

  label: z.string().max(200).optional(),
  value: z.string().max(100).optional(),
  delta: z.string().max(50).optional(),

  columns: z.array(z.string().max(100)).optional(),
  rows: z.array(z.array(z.string().max(200))).optional(),
  statusColumn: z.number().int().min(0).optional(),

  items: z.array(z.object({
    label: z.string().max(200),
    description: z.string().max(500).optional(),
    badge: z.string().max(50).optional(),
  })).optional(),

  messages: z.array(z.object({
    from: z.string().max(100),
    text: z.string().max(1000),
    subject: z.string().max(200).optional(),
    timestamp: z.string().max(50).optional(),
  })).optional(),
  messageVariant: z.enum(["chat", "email"]).default("chat"),

  height: z.number().int().min(20).max(2000).optional(),
}).superRefine((panel, ctx) => {
  if (panel.type === "stat" && !panel.value) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "stat panel requires value" });
  }
  if (panel.type === "table" && (!panel.columns || panel.columns.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "table panel requires columns" });
  }
  if (panel.type === "list" && (!panel.items || panel.items.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "list panel requires items" });
  }
  if (panel.type === "messages" && (!panel.messages || panel.messages.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "messages panel requires messages" });
  }
});

const LayoutDescriptorSchema = z.object({
  layout: z.enum(["sidebar", "topbar", "minimal"]).default("sidebar"),
  sidebar: SidebarSchema.optional(),
  topBar: TopBarSchema.optional(),
  content: z.object({
    columnCount: z.number().int().min(1).max(6).default(2),
    gap: z.number().int().min(0).max(40).default(16),
    panels: z.array(ContentPanelSchema).default([]),
  }).default({ columnCount: 2, gap: 16, panels: [] }),
});

const DEFAULT_DESCRIPTOR = LayoutDescriptorSchema.parse({
  layout: "sidebar",
  sidebar: {
    width: 220,
    items: [
      { label: "Dashboard", icon: "📊", active: true },
      { label: "Orders", icon: "📦", badge: "3" },
      { label: "Analytics", icon: "📈" },
      { label: "Settings", icon: "⚙" },
    ],
    avatar: { name: "Alex Chen" },
  },
  topBar: {
    title: "Dashboard",
    search: true,
    tabs: [
      { label: "Overview", active: true },
      { label: "Details" },
      { label: "History" },
    ],
    actions: [{ label: "New Order", variant: "primary" }],
  },
  content: {
    columnCount: 3,
    gap: 16,
    panels: [
      { type: "stat", title: "Revenue", label: "Revenue", value: "$12,400", delta: "+12%" },
      { type: "stat", title: "Orders", label: "Orders", value: "342", delta: "+8%" },
      { type: "stat", title: "Customers", label: "Customers", value: "1,205", delta: "+3%" },
      {
        type: "table", title: "Recent Orders",
        columns: ["Name", "Status", "Amount"],
        rows: [
          ["Alex Chen", "Shipped", "$2,400"],
          ["Jordan Lee", "Pending", "$1,800"],
          ["Sam Park", "Delivered", "$950"],
        ],
        statusColumn: 1,
      },
      {
        type: "list", title: "Quick Actions",
        items: [
          { label: "API Keys", description: "Manage access tokens" },
          { label: "Webhooks", description: "Configure event hooks", badge: "2" },
          { label: "Billing", description: "View invoices and plans" },
        ],
      },
      { type: "placeholder", title: "Chart", height: 200 },
    ],
  },
});

const MusicSchema = z.object({
  enabled: z.boolean().default(true),
  volume: z.number().min(0).max(1).default(0.35),
  fadeInFrames: z.number().int().min(0).max(300).default(45),
  fadeOutFrames: z.number().int().min(0).max(300).default(90),
});

const MUSIC_DEFAULTS = MusicSchema.parse({});

const DEFAULT_SCENES: z.infer<typeof SceneConfigSchema>[] = [
  { id: "chaos", enabled: true, durationInFrames: 260, enterFrom: "none", exitTo: "top", background: "dark" },
  { id: "product-reveal", enabled: true, durationInFrames: 150, enterFrom: "bottom", exitTo: "right", background: "dark" },
  { id: "feature-showcase", enabled: true, durationInFrames: 200, enterFrom: "left", exitTo: "top", background: "dark" },
  { id: "headline-resolution", enabled: true, durationInFrames: 120, enterFrom: "bottom", exitTo: "top", background: "gradient" },
  { id: "closer", enabled: true, durationInFrames: 90, enterFrom: "bottom", exitTo: "none", background: "light" },
];

const DEFAULT_FEATURES = [
  { title: "Dashboard", description: "Live metrics and KPIs at a glance" },
  { title: "Request Manager", description: "Track every request from submission to delivery" },
  { title: "Smart Alerts", description: "Get notified when things need attention" },
];

export const CinematicSchema = z.object({
  brand: BrandSchema.default(BRAND_DEFAULTS),

  headlines: HeadlinesSchema.default(HEADLINES_DEFAULTS),
  cta: z.string().max(100).default("Try it free"),

  productFeatures: z.array(ProductFeatureSchema).min(1).default(DEFAULT_FEATURES),

  scenes: z.array(SceneConfigSchema).min(1)
    .refine(
      (scenes) => new Set(scenes.map((s) => s.id)).size === scenes.length,
      { message: "Scene IDs must be unique" },
    )
    .default(DEFAULT_SCENES),

  overlap: z.number().int().min(0).max(30).default(15),
  easing: EasingPreset.default("snappy"),

  windowLayout: z.array(WindowLayoutSchema).default(DEFAULT_WINDOW_LAYOUT),
  cursorPath: z.array(CursorPathEntrySchema).default(DEFAULT_CURSOR_PATH),

  appDescriptor: LayoutDescriptorSchema.default(DEFAULT_DESCRIPTOR),

  music: MusicSchema.default(MUSIC_DEFAULTS),
  sfxEnabled: z.boolean().default(true),
  sfxVolume: z.number().min(0).max(1).default(0.4),
});

export type CinematicProps = z.infer<typeof CinematicSchema>;
export type BrandConfig = z.infer<typeof BrandSchema>;
export type BrandColors = z.infer<typeof BrandColorsSchema>;
export type HeadlinesConfig = z.infer<typeof HeadlinesSchema>;
export type ProductFeature = z.infer<typeof ProductFeatureSchema>;
export type SceneConfig = z.infer<typeof SceneConfigSchema>;
export type MusicConfig = z.infer<typeof MusicSchema>;
export type EasingPresetType = z.infer<typeof EasingPreset>;
export type SceneDirectionType = z.infer<typeof SceneDirection>;
export type WallpaperVariantType = z.infer<typeof WallpaperVariant>;
export type WindowLayout = z.infer<typeof WindowLayoutSchema>;
export type WindowEntranceStyleType = z.infer<typeof WindowEntranceStyle>;
export type CursorPathEntry = z.infer<typeof CursorPathEntrySchema>;
export type AnchorPresetType = z.infer<typeof AnchorPreset>;
export type LayoutDescriptor = z.infer<typeof LayoutDescriptorSchema>;
export type ContentPanel = z.infer<typeof ContentPanelSchema>;
export type SidebarItem = z.infer<typeof SidebarItemSchema>;

export type HeadlineKey = "pain" | "resolution" | "closer";
