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

## Phase 5: Visual Editor

**Goal**: Turn Remotion Studio into a full visual motion design editor — click elements to select, drag to reposition, floating panels to edit properties.

### Architecture

```
┌──────────────────────────────────────────────┐
│  Editor Shell                                │
│  ┌──────────────────────────────┬───────────┐│
│  │                              │ Inspector ││
│  │   Canvas Overlay             │ Panel     ││
│  │   (interactive layer)        │           ││
│  │   ┌──────────────────────┐   │ • Position││
│  │   │                      │   │ • Size    ││
│  │   │   Composition        │   │ • Text    ││
│  │   │   (read-only render) │   │ • Color   ││
│  │   │                      │   │ • Motion  ││
│  │   │   [Window]  [Headline│   │ • Easing  ││
│  │   │                      │   │ • Timing  ││
│  │   └──────────────────────┘   │           ││
│  │                              │           ││
│  │   ┌─────────────┐           │           ││
│  │   │ Float Panel │           │           ││
│  │   │ (on-canvas) │           │           ││
│  │   └─────────────┘           │           ││
│  ├──────────────────────────────┴───────────┤│
│  │  Timeline                                ││
│  │  [scene1][scene2][scene3]  ▶ ■ ◀       ││
│  │  ──●────●──●─────●── cursor keyframes   ││
│  │  ──■────■──────── ui state keyframes     ││
│  └──────────────────────────────────────────┘│
└──────────────────────────────────────────────┘
```

### 5.1 — Element Selection & Identification

Every renderable element gets a `data-editor-id` and `data-editor-type` attribute:

```tsx
<div data-editor-id="window-dashboard" data-editor-type="window">
  <Window ... />
</div>
```

The editor overlay listens for clicks, finds the nearest `data-editor-id`, and selects it. Selection shows:
- Blue bounding box around the element
- Resize handles on corners and edges
- A small label showing the element type

### 5.2 — Floating Property Panel

When an element is selected, a floating panel appears near it (or docked to the right) with context-aware controls:

**For a Window:**
| Property | Control | Maps to |
|----------|---------|---------|
| Position X, Y | Number input + drag | `windowLayout[i].startX/Y` |
| Size W, H | Number input + drag | `windowLayout[i].startW/H` |
| Title | Text input | `windowLayout[i].title` |
| Enter at | Frame scrubber | `windowLayout[i].enterAt` |
| Enter style | Dropdown (fade/scale/slide) | `windowLayout[i].enterFrom` |
| Easing | Dropdown + curve preview | `windowLayout[i].easing` |
| Exit at | Frame scrubber | `windowLayout[i].exitAt` |

**For a Headline:**
| Property | Control |
|----------|---------|
| Text lines | Multi-line text input |
| Font size | Slider (48–144px) |
| Color | Color picker |
| Line delay | Frame slider |
| Word stream | Toggle + stagger/duration controls |
| Entrance | Dropdown (fade/rise/typewriter) |

**For a Button / Interactive element:**
| Property | Control |
|----------|---------|
| Label | Text input |
| Variant | Dropdown (primary/secondary/ghost) |
| Click reaction | Dropdown (press/highlight/none) |
| Click at frame | Frame scrubber (auto-linked to cursor) |

### 5.3 — Canvas Drag & Drop

Direct manipulation on the preview canvas:

- **Drag to move**: click and drag any selected element to reposition. Snapping guides appear (center, edges, grid). Position writes back to props.
- **Drag to resize**: corner handles resize the element. Aspect ratio lock with Shift.
- **Cursor path drawing**: toggle "cursor path" mode. Click on the canvas to add waypoints. Drag waypoints to adjust. The path renders as a dotted line with action icons (click = circle, drag = arrows).
- **Add elements**: drag from a sidebar palette (Window, Headline, Button, Panel) onto the canvas. Creates a new entry in the props array.

### 5.4 — Timeline Editor

A horizontal panel below the canvas:

```
0s        5s        10s       15s       20s       25s
├─────────┼─────────┼─────────┼─────────┼─────────┤
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░│▓▓▓▓▓▓▓▓▓▓│░░░░│▓▓▓▓│  scenes
│  chaos          │ reveal │ showcase  │head│close│
├─────────────────┼────────┼──────────┼────┼─────┤
│ ●→  ●⊕  ●→ ●⊕  │●→ ●⊕ ●↔│ ●→ ●⊕    │    │     │  cursor
├─────────────────┼────────┼──────────┼────┼─────┤
│          ■  ■   │   ■    │  ■  ■    │    │     │  ui states
└─────────────────┴────────┴──────────┴────┴─────┘

●→ = moveTo   ●⊕ = click   ●↔ = drag   ■ = state change
```

- Drag scene edges to adjust duration
- Drag keyframe markers to retime actions
- Right-click a marker to edit its properties
- Drag between markers to adjust easing curves
- Add new keyframes by double-clicking the timeline

### 5.5 — Animation Controls

A toolbar for quick animation adjustments:

- **Easing curve editor**: visual bezier curve with draggable control points. Presets dropdown (cinematic, snappy, elastic, bounce, spring). Click a preset to apply, or customize the curve.
- **Motion path preview**: when a moveTo or drag is selected, the path renders on canvas with velocity visualization (thicker = slower, thinner = faster).
- **Onion skinning**: toggle ghost frames showing previous/next positions — see the motion arc.
- **Speed ramping**: select a time range, apply slow-mo or speed-up. Useful for emphasizing a click moment.

### 5.6 — Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Select tool (click to select elements) |
| `M` | Move tool (drag to reposition) |
| `C` | Cursor path tool (click to add waypoints) |
| `T` | Text edit (click element to edit text inline) |
| `Space` | Play/pause preview |
| `←` `→` | Step one frame back/forward |
| `Delete` | Remove selected element |
| `Cmd+D` | Duplicate selected element |
| `Cmd+Z` | Undo |
| `Cmd+G` | Toggle grid/snapping |

### 5.7 — Technical Implementation

The editor is a **Remotion Studio extension** using:

- `@remotion/studio` API for custom panels and overlays
- React portal for the floating panel (renders outside composition iframe)
- `postMessage` bridge between overlay and composition for element detection
- Zustand store for editor state (selection, tool mode, drag state)
- All changes write to Remotion input props → composition re-renders
- Undo/redo via props history stack

The composition itself never knows about the editor — it's pure. The editor is a separate layer that reads/writes props.

### 5.8 — Deliverable

Click any element in the video preview → see its properties → edit text, colors, position, animation directly. Drag windows around the canvas. Draw cursor paths by clicking. Adjust timing on a visual timeline. Full visual editor — no code for any customization.

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

Phase 5 depends on Phase 1–3 being solid:
  Phase 5a (Selection + float panel) — 1 week, after Phase 3
  Phase 5b (Canvas drag & drop) — 1 week, after 5a
  Phase 5c (Timeline editor) — 2 weeks, after 5b
  Phase 5d (Animation controls) — 1 week, after 5c

Phase 6 can start after Phase 2:
  Phase 6 (Scene templates) — ongoing
```

### Priority

1. **Phase 1** — Input props. Unlocks Studio editing immediately. Foundation for everything else.
2. **Phase 2** — Interaction layer. Makes the video feel real, not a slideshow.
3. **Phase 3** — Window choreography props. Power users who want full control.
4. **Phase 4** — Figma bridge (Path B: Claude from screenshot is already partially working, formalize it).
5. **Phase 5a–b** — Selection + drag. The "click to edit" moment that changes everything.
6. **Phase 6** — Scene templates. Grows the library, makes the template more versatile.
7. **Phase 5c–d** — Timeline + animation controls. Full motion design editor.

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
