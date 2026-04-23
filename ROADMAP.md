# Remotion Cinematic — Roadmap

> Remotion on steroids: a framework where anyone can build cinematic product demo videos from their actual app, tweak everything visually, and render in minutes.

## Vision

Three layers working together:

| Layer | Who uses it | Purpose |
|-------|------------|---------|
| **Claude** | Developer / AI | Build scenes, wire cursor paths, compose UI from Figma/screenshots |
| **Remotion Studio** | Anyone | Tweak copy, colors, timing, easing, layout — zero code, live preview |
| **Figma bridge** | Designer / Developer | Export real app layouts as structured data, feeds directly into props |

No screenshots. Live React components that the cursor clicks, tabs that switch, rows that highlight, windows that resize — everything interactive and animated.

---

## Phase 1: Input Props System

**Goal**: Make every customizable value editable in Remotion Studio without touching code.

### 1.1 — Props Schema (Zod)

Define a comprehensive Zod schema that covers all user-facing configuration:

```tsx
const CinematicSchema = z.object({
  // Brand
  brand: z.object({
    name: z.string().default("Product"),
    colors: z.object({
      primary: z.string().default("#6366F1"),
      accent: z.string().default("#22D3EE"),
      background: z.string().default("#0F0F14"),
      text: z.string().default("#F5F5FF"),
    }),
    fontSans: z.string().default("Inter"),
    fontSerif: z.string().default("Fraunces"),
    logoUrl: z.string().optional(),
  }),

  // Copy
  headlines: z.object({
    pain: z.array(z.string()).default(["Where did that", "request go?"]),
    resolution: z.array(z.string()).default(["Every request.", "Tracked."]),
    closer: z.array(z.string()).default(["Try it free."]),
  }),
  cta: z.string().default("Try it free"),

  // Scene configuration
  scenes: z.array(z.object({
    id: z.string(),
    enabled: z.boolean().default(true),
    durationInFrames: z.number().min(30).max(600),
    enterFrom: z.enum(["top", "bottom", "left", "right", "none"]),
    exitTo: z.enum(["top", "bottom", "left", "right", "none"]),
    background: z.enum(["dark", "light", "gradient", "none"]),
  })),

  // Timing
  overlap: z.number().min(0).max(30).default(15),
  fps: z.number().default(30),

  // Animation
  easing: z.enum(["cinematic", "snappy", "elastic", "bounce", "spring"]).default("cinematic"),

  // Audio
  music: z.object({
    enabled: z.boolean().default(true),
    volume: z.number().min(0).max(1).default(0.35),
    fadeInFrames: z.number().default(45),
    fadeOutFrames: z.number().default(90),
  }),
  sfxEnabled: z.boolean().default(true),
  sfxVolume: z.number().min(0).max(1).default(0.4),
});
```

### 1.2 — Wire into Composition

- `Root.tsx`: register composition with `schema` and `defaultProps`
- `calculateMetadata`: compute total duration from scene array
- `CinematicDemo.tsx`: read props instead of importing from `content.ts`
- `tokens.ts`: accept brand overrides from props context

### 1.3 — Easing Presets

Expand easing beyond snappy/smooth to include:

| Preset | Curve | Best for |
|--------|-------|----------|
| `cinematic` | Bezier(0.22, 0.61, 0.36, 1) | Camera moves, scene transitions |
| `snappy` | Easing.out(Easing.exp) | Window entrances, UI interactions |
| `smooth` | Easing.out(Easing.cubic) | Fade-ins, subtle motion |
| `elastic` | Easing.elastic(1) | Playful bounces, attention-grabbing |
| `bounce` | Easing.bounce | Physical impacts, landing |
| `spring` | Easing.bezier(0.34, 1.56, 0.64, 1) | Overshoot, organic feel |

Expose as a dropdown per-scene and globally.

### 1.4 — Deliverable

A user opens Remotion Studio and sees a right panel with:
- Text fields for all copy
- Color pickers for brand
- Number sliders for timing
- Dropdowns for easing and transitions
- Toggles for scenes and audio
- Live preview updates as they type

---

## Phase 2: Interaction Layer

**Goal**: UI primitives respond to cursor actions — clicks switch tabs, highlight rows, toggle states.

### 2.1 — UIKeyframe System

A timeline of state changes that syncs with cursor actions:

```tsx
const UI_STATES: UIKeyframe[] = [
  { at: 24, target: "sidebar", set: { activeIndex: 1 } },
  { at: 40, target: "tabs", set: { activeTab: "Orders" } },
  { at: 56, target: "table", set: { selectedRow: 2 } },
  { at: 70, target: "table", set: { selectedRow: null } },
  { at: 85, target: "notification", set: { visible: true } },
];
```

### 2.2 — useUIState Hook

```tsx
function useUIState<T>(target: string, defaultState: T): T {
  const frame = useCurrentFrame();
  // Resolves state at current frame from UIKeyframe timeline
  // Returns the most recent state set for this target
}
```

Primitives consume this internally:

```tsx
// Inside SidebarNav
const { activeIndex } = useUIState("sidebar", { activeIndex: 0 });

// Inside TabBar
const { activeTab } = useUIState("tabs", { activeTab: "Overview" });

// Inside DataTable
const { selectedRow } = useUIState("table", { selectedRow: null });
```

### 2.3 — Primitive Upgrades

Each app-ui primitive gets interaction support:

| Primitive | Interactive states |
|-----------|-------------------|
| `SidebarNav` | `activeIndex` — which item is highlighted |
| `TabBar` | `activeTab` — which tab is selected |
| `DataTable` | `selectedRow`, `highlightedCell` — row selection, cell focus |
| `Button` | `pressed` — momentary press visual (2-3 frames) |
| `SearchBar` | `value` — text changes as if typing |
| `MessageList` | `newMessageIndex` — new message slides in |
| `NotificationToast` | `visible` — enter/exit animation |
| `Panel` | `expanded` — collapse/expand |

### 2.4 — Auto-sync with Cursor

When a cursor `click` action fires at frame N targeting element X, automatically inject a UI state change (e.g., button press) without needing a manual UIKeyframe. Manual keyframes override for complex state changes.

### 2.5 — Deliverable

Cursor clicks a sidebar item → sidebar highlights that item and content area changes. Cursor clicks a table row → row highlights with a subtle background. All driven by the same timeline, all editable in Studio props.

---

## Phase 3: Window Choreography Props

**Goal**: Window positions, sizes, and motion paths are editable — in Studio forms and eventually with visual drag handles.

### 3.1 — Window Layout Schema

```tsx
windowLayout: z.array(z.object({
  id: z.string(),
  startX: z.number(), startY: z.number(),
  startW: z.number(), startH: z.number(),
  endX: z.number().optional(),   // animate to position
  endY: z.number().optional(),
  endW: z.number().optional(),   // animate to size
  endH: z.number().optional(),
  enterAt: z.number(),           // frame to appear
  enterDuration: z.number().default(12),
  enterFrom: z.enum(["fade", "scale", "slide-up", "slide-left", "slide-right"]),
  exitAt: z.number().optional(), // frame to disappear
  zIndex: z.number().default(1),
})),
```

### 3.2 — Cursor Path Schema

```tsx
cursorPath: z.array(z.object({
  at: z.number(),
  action: z.enum(["idle", "moveTo", "click", "drag"]),
  target: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  anchor: z.string().default("center"),
  duration: z.number().optional(),
})),
```

### 3.3 — Deliverable

All choreography lives in the props schema. Studio shows editable arrays: add a window, set its position and entrance, adjust cursor timing. No scene code changes needed for layout tweaks.

---

## Phase 4: Figma Bridge

**Goal**: Import real app layouts from Figma as structured data that maps to app-ui primitives.

### 4.1 — Figma Layout Descriptor

A JSON format that describes an app's UI structure:

```json
{
  "layout": "sidebar",
  "sidebar": {
    "width": 220,
    "items": [
      { "label": "Dashboard", "icon": "grid", "active": true },
      { "label": "Orders", "icon": "package", "badge": "12" },
      { "label": "Settings", "icon": "settings" }
    ],
    "avatar": { "name": "Alex Chen" }
  },
  "topBar": {
    "title": "Dashboard",
    "search": true,
    "actions": [{ "label": "New Order", "variant": "primary" }]
  },
  "content": {
    "type": "dashboard",
    "panels": [
      { "type": "stat", "label": "Revenue", "value": "$12,400", "delta": "+12%" },
      { "type": "stat", "label": "Orders", "value": "342", "delta": "+8%" },
      { "type": "table", "columns": ["Name", "Status", "Amount"], "rows": [...] }
    ]
  }
}
```

### 4.2 — Import Methods (three paths)

**Path A — Figma Plugin (richest)**
- Figma plugin reads selected frame
- Identifies layout patterns: sidebar, nav, content grid
- Detects component types: tables, cards, lists, buttons
- Exports layout descriptor JSON
- User pastes JSON into Remotion Studio prop field or saves as file

**Path B — Claude from Screenshot (fastest)**
- User provides screenshot of their app
- Claude identifies layout and maps to primitives
- Generates the layout descriptor JSON
- Already partially works with current app-ui primitives

**Path C — Figma API Script (automated)**
- CLI script: `npx cinematic-import --figma-url=<frame-url>`
- Uses Figma REST API to read frame tree
- Converts nodes to layout descriptor
- Writes to props file or injects into composition

### 4.3 — Descriptor → React Renderer

A single component that takes a layout descriptor and renders the full app-ui composition:

```tsx
<AppFromDescriptor
  descriptor={figmaLayout}
  uiStates={UI_STATES}
  style={{ width: "100%", height: "100%" }}
/>
```

Internally maps to: `AppShell` → `SidebarNav` → `TopNav` → `PanelGrid` → `DataTable`, etc. Connected to the interaction layer so cursor clicks actually work.

### 4.4 — Deliverable

User selects a frame in Figma → exports JSON → pastes into Remotion Studio → sees their actual app UI rendered as live React components → cursor interacts with it → tweak anything in the Studio panel → render.

---

## Phase 5: Visual Studio Panels

**Goal**: Custom Remotion Studio panels for drag-and-drop editing of positions, paths, and timing.

### 5.1 — Canvas Overlay

A transparent overlay on the Remotion preview where users can:
- Drag windows to reposition them
- Drag corners to resize
- See cursor path as a dotted line
- Click to add cursor waypoints
- Drag waypoints to adjust the path

Position changes write back to input props in real time.

### 5.2 — Timeline Editor

A custom panel below the preview:
- Horizontal timeline with scene blocks
- Drag edges to adjust scene duration
- Drag cursor action markers along the timeline
- Drag UI state keyframes
- Visual easing curve preview per segment

### 5.3 — Animation Preview Toolbar

Quick controls:
- Easing preset dropdown with live preview
- Enter/exit animation type selector with thumbnail previews
- Speed multiplier for the whole video
- Per-scene animation intensity slider

### 5.4 — Deliverable

Remotion Studio becomes a full visual editor. Drag windows, draw cursor paths, adjust timing on a timeline — all without code. Claude builds the initial structure, Studio handles all refinement.

---

## Phase 6: Scene Templates Library

**Goal**: Pre-built scene types that cover common product demo patterns.

### Scene types to build

| Scene | Description | Key primitives |
|-------|-------------|---------------|
| `SplitCompare` | Before/after split screen with sliding divider | Two windows side by side |
| `FeatureZoom` | Zoom into a specific UI element, annotate it | AutoZoom + Highlight |
| `Testimonial` | Quote card with avatar, name, role | Custom card + Enter |
| `PricingTable` | Pricing tiers side by side | PanelGrid + StatCard |
| `Workflow` | Step-by-step flow with animated connections | Stagger + connecting lines |
| `MobileShowcase` | Phone mockup with app UI inside | Phone frame + AppShell |
| `DataStory` | Animated charts/numbers telling a metric story | CountUp + Stagger |
| `BeforeAfter` | Problem scene dissolves into solution scene | Cross-fade transition |
| `LogoReveal` | Animated logo entrance with particles/glow | Scale + Pulse + Highlight |
| `SocialProof` | Logos of customers/integrations grid | Stagger + grid layout |

Each scene template:
- Has full input props schema (editable in Studio)
- Works with the interaction layer
- Accepts a layout descriptor for app UI content
- Includes cursor choreography presets
- Has 2-3 animation style variants

---

## Build Order

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4
  Props      Interact     Choreo      Figma
  (1 week)   (1 week)    (3 days)    (1 week)

Phase 5 and 6 can start after Phase 1:
  Phase 5 (Visual panels) — 2 weeks, independent after Phase 3
  Phase 6 (Scene templates) — ongoing, can start after Phase 2
```

### Priority

1. **Phase 1** — Input props. Unlocks Studio editing immediately. Foundation for everything else.
2. **Phase 2** — Interaction layer. Makes the video feel real, not a slideshow.
3. **Phase 4** — Figma bridge (Path B: Claude from screenshot is already partially working, formalize it).
4. **Phase 3** — Window choreography props. Power users who want full control.
5. **Phase 6** — Scene templates. Grows the library, makes the template more versatile.
6. **Phase 5** — Visual panels. Polish layer, biggest engineering investment.

---

## Success Criteria

The template is "done" when this workflow takes under 30 minutes:

1. Open Figma, select your app's main screen
2. Export layout descriptor (plugin or Claude)
3. Paste into Remotion Studio
4. See your app rendered as live, interactive React components
5. Pick a scene template, adjust timing and easing with sliders
6. Edit headlines and CTA in text fields
7. Preview with cursor interactions — clicks switch tabs, highlight rows
8. Render to MP4

No code written. No Claude tokens burned for tweaks. Ship a professional product demo video from design to render in 30 minutes.
