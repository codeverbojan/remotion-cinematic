# remotion-cinematic — Claude Skill

You are working on **remotion-cinematic**, a Remotion template for building cinematic product demo videos. The template provides a smart motion engine (layout, cursor, camera, audio) and reusable primitives. Users customize scenes, drop in screenshots, and render polished videos.

## Project structure

```
src/
├── engine/              # Smart motion engine (DO NOT modify unless adding features)
│   ├── layout/          # Zone-based layout system
│   ├── cursor/          # Geometry-aware cursor
│   ├── camera/          # CameraRig (global) + AutoZoom (per-scene)
│   ├── audio/           # Audio manager (music + SFX)
│   └── types.ts         # Shared types (SceneTiming, Rect)
├── primitives/          # Reusable visual components
│   ├── Window.tsx       # macOS-style window with traffic lights
│   ├── Headline.tsx     # Serif headline with word-stream animation
│   ├── EndCard.tsx      # Logo + CTA end card
│   ├── Enter.tsx        # Generic entrance animation
│   ├── Wallpaper.tsx    # Background (dark/light/gradient)
│   ├── ScenePush.tsx    # Push transition wrapper (handles enter/exit slides + wallpaper)
│   └── app-ui/          # App UI building blocks (for recreating real app interfaces)
│       ├── AppShell     # Sidebar + topbar + content layout
│       ├── SidebarNav   # Vertical navigation list
│       ├── DataTable    # Spreadsheet/table with status colors
│       ├── MessageList  # Chat or email thread
│       ├── StatCard     # Metric card with delta
│       └── ...          # Panel, PanelGrid, TopNav, TabBar, ListItems,
│                        # Placeholder, NotificationToast, Avatar, Badge,
│                        # Button, SearchBar (16 total)
├── scenes/              # Scene components (users add/edit these)
│   ├── ChaosDesktop.tsx
│   ├── ProductReveal.tsx
│   ├── FeatureShowcase.tsx
│   ├── HeadlineResolution.tsx
│   └── Closer.tsx
├── content.ts           # ALL copy, scene order, timing — single source of truth
├── tokens.ts            # Brand colors, fonts, easing presets (user edits this)
├── fonts.ts             # Font loading (Inter, Fraunces, JetBrains Mono)
├── CinematicDemo.tsx    # Main composition — wires scenes with Sequences
├── Root.tsx             # Remotion composition registration
└── index.ts             # Entry point
public/
├── music/               # Background music (MP3/WAV)
├── sfx/                 # Sound effects (ui/, transitions/)
└── screenshots/         # Product screenshots (PNG, referenced in scenes)
```

## Constraints

- Canvas: **1920x1080 @ 30fps**
- No `Math.random()` — causes Remotion render jitter. Use deterministic values
- Guard against zero-duration interpolation: always `Math.max(1, duration)`
- All text content lives in `content.ts`, not inline in scene files
- Colors/fonts come from `tokens.ts` (`C` and `F` exports)
- Use `EASE.snappy` from `tokens.ts` for all animation easing (not raw `Easing` imports)
- Import fonts via `./fonts.ts` (already done in CinematicDemo.tsx)

## Scene positioning: two patterns

Scenes use one of two positioning approaches depending on their needs:

### Layout engine (auto-placement)
Use for scenes with **static windows in predictable slots** — the engine handles positioning, avoidance, and alignment. See FeatureShowcase for a working example.

```tsx
const ZONES: ZoneConfig = { canvas: { width: 1920, height: 1080 }, slots: [...], reserved: [...] };
const zoneSystem = defineZones(ZONES);
<LayoutProvider zones={zoneSystem}><LayoutWindow id="win" zone="center" ... /></LayoutProvider>
```

### Choreographed positioning (manual)
Use for scenes with **animated windows, overlapping elements, or complex choreography** — staggered entrances, drag-to-resize, mission-control scatter. See ChaosDesktop and ProductReveal.

```tsx
const WINDOW_DEFS = [{ id: "win", x: 500, y: 30, w: 1100, h: 500 }];
// Provide getRect for cursor/zoom targeting:
const getRect = (id: string) => { ... return { left, top, width, height }; };
```

Both patterns work with Cursor and AutoZoom via `getRect`. Choose the right one for your scene — don't force the layout engine on choreographed motion.

## How to add a new scene

### Step 1: Add timing to `content.ts`

```ts
export const SCENES: SceneTiming[] = [
  // ... existing scenes
  { id: "my-new-scene", durationInFrames: 150 },  // 5 seconds at 30fps
];
```

### Step 2: Add any needed content data to `content.ts`

```ts
export const MY_FEATURE_DATA = [
  { title: "Feature A", description: "Does something cool" },
];
```

### Step 3: Create the scene file in `src/scenes/`

```tsx
import React from "react";
import { Cursor } from "../engine";
import type { CursorAction } from "../engine";
import { ScenePush, Window } from "../primitives";
import { CURSOR_SFX, SCENE_OVERLAP } from "../content";
import { C, EASE, F } from "../tokens";

const DURATION = 150;

const CURSOR_ACTIONS: CursorAction[] = [
  { at: 0, action: "idle", position: { x: 960, y: 540 } },
  { at: 15, action: "moveTo", target: "my-window", anchor: "center", duration: 20 },
  { at: 45, action: "click", target: "my-window" },
];

const MyContent: React.FC = () => (
  <div style={{ fontFamily: F.sans, color: C.text, padding: 20 }}>
    Your content here
  </div>
);

export const MyNewScene: React.FC = () => {
  const getRect = (id: string) => {
    if (id === "my-window") return { left: 460, top: 240, width: 1000, height: 600 };
    return undefined;
  };

  return (
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="top">
      <div
        data-cursor-target="my-window"
        style={{ position: "absolute", left: 460, top: 240, width: 1000, height: 600 }}
      >
        <Window id="my-window" title="My Window">
          <MyContent />
        </Window>
      </div>
      <Cursor actions={CURSOR_ACTIONS} getRect={getRect} sfx={CURSOR_SFX} />
    </ScenePush>
  );
};
```

For auto-placed windows, use `LayoutProvider` + `LayoutWindow` instead of manual positioning (see FeatureShowcase).

### Step 4: Register in `src/scenes/index.ts`

```ts
export { MyNewScene } from "./MyNewScene";
```

### Step 5: Wire into `src/CinematicDemo.tsx`

Add to the `SCENE_COMPONENTS` map:

```ts
const SCENE_COMPONENTS: Record<string, React.FC> = {
  // ... existing
  "my-new-scene": MyNewScene,
};
```

### Step 6: Add camera keyframes to `content.ts`

```ts
export const CAMERA_TIMELINE: CameraKeyframe[] = [
  // ... existing
  { scene: "my-new-scene", at: "start", x: 0, y: 0, scale: 1.0 },
  { scene: "my-new-scene", at: "end", x: 0, y: 0, scale: 1.0 },
];
```

### Step 7: Verify

```bash
npm run typecheck
npm test
npm run studio  # preview in browser
```

## Engine API cheat sheet

### Layout engine

```tsx
// Define zones — slots are regions where windows can be placed
const ZONES: ZoneConfig = {
  canvas: { width: 1920, height: 1080 },
  slots: [
    { id: "top-left", region: { x: 0, y: 0, w: 960, h: 540 } },
    { id: "center", region: { x: 240, y: 135, w: 1440, h: 810 } },
  ],
  reserved: [
    { id: "headline", region: { x: 200, y: 300, w: 1520, h: 480 } },
  ],
};
const zoneSystem = defineZones(ZONES);

// LayoutWindow — positions a window within a zone
<LayoutProvider zones={zoneSystem}>
  <LayoutWindow
    id="my-window"       // unique ID, also used as data-cursor-target
    zone="center"        // which slot to place in
    width={1000}         // desired width
    height={600}         // desired height
    margin={30}          // padding from zone edges
    avoidZones={["headline"]}  // avoid reserved regions
    align={{ horizontal: "center", vertical: "start" }}  // optional alignment
    stackIndex={0}       // for stacking multiple windows in same zone
    stackPitch={102}     // vertical offset per stack item
  >
    {children}
  </LayoutWindow>
</LayoutProvider>

// Read computed position of any registered window
const rect = useWindowRect("my-window");
// Returns: { left, top, width, height } | undefined
```

### Cursor system

```tsx
// Cursor actions — frame numbers are scene-relative
const CURSOR_ACTIONS: CursorAction[] = [
  // Idle: cursor appears at a fixed position
  { at: 0, action: "idle", position: { x: 960, y: 540 } },

  // MoveTo: arc-interpolated movement to a target element
  { at: 20, action: "moveTo", target: "window-id", anchor: "center", duration: 15 },

  // Click: visual click pulse at target
  { at: 50, action: "click", target: "window-id" },

  // Drag: move from anchor to absolute position (for resize/reposition)
  { at: 80, action: "drag", target: "window-id", anchor: "corner-top-left",
    to: { x: 980, y: 500 }, duration: 18 },
];

// Anchor types:
// "center"              — element center
// "top-bar"             — center of top 40px (window title bar)
// "corner-top-left"     — top-left corner
// "corner-top-right"    — top-right corner
// "corner-bottom-left"  — bottom-left corner
// "corner-bottom-right" — bottom-right corner
// { x: 100, y: 200 }   — absolute position
// { xPct: 0.5, yPct: 0.3 } — percentage within element bounds

// The getRect function resolves element positions for the cursor.
// The sfx prop maps action types to sounds — fires automatically.
<Cursor actions={CURSOR_ACTIONS} getRect={(id) => {
  // Return { left, top, width, height } or undefined
}} sfx={CURSOR_SFX} />

// CURSOR_SFX is defined once in content.ts:
// export const CURSOR_SFX: CursorSFXMap = {
//   click: { src: "sfx/ui/click.mp3", volume: 0.4 },
//   drag:  { src: "sfx/ui/window-resize.mp3", volume: 0.5 },
// };
```

### Camera system

```tsx
// CameraRig — global camera that wraps all scenes (keep at scale 1.0)
<CameraRig timeline={CAMERA_TIMELINE} scenes={SCENES} overlap={SCENE_OVERLAP} easing="cinematic">
  {children}
</CameraRig>

// CameraKeyframe — defined in content.ts
// Keep scale at 1.0 globally; use AutoZoom for per-scene zoom.
{ scene: "chaos", at: "start", x: 0, y: 0, scale: 1.0 }
{ scene: "chaos", at: "end", x: 0, y: 0, scale: 1.0 }

// AutoZoom — target-aware per-scene zoom (uses getRect like Cursor)
// Zoom origin resolves from element IDs — no hardcoded coordinates.
const ZOOM_KEYFRAMES: ZoomKeyframe[] = [
  { at: 0, scale: 1 },                              // start neutral
  { at: 15, target: "feature-0", scale: 1.06 },     // zoom to feature-0
  { at: 30, target: "feature-0", scale: 1.06 },     // hold
  { at: 40, scale: 1 },                              // zoom out
];
<AutoZoom keyframes={ZOOM_KEYFRAMES} getRect={getRect}>
  {children}
</AutoZoom>

// Easing presets: "cinematic" (default), "snappy", "linear"
```

### Audio & SFX system

The framework has three layers of SFX, from most automatic to most manual:

```tsx
// 1. CURSOR SFX — auto-fires on cursor actions (click, drag, moveTo, idle)
// Define once in content.ts, pass to every <Cursor sfx={CURSOR_SFX} />
export const CURSOR_SFX: CursorSFXMap = {
  click: { src: "sfx/ui/click.mp3", volume: 0.4 },
  drag:  { src: "sfx/ui/click.mp3", volume: 0.35 },
};

// 2. TRANSITION SFX — auto-fires on ScenePush entrance
// Pass to ScenePush via enterSfx prop
export const TRANSITION_SFX: SFXEntry = {
  src: "sfx/transitions/whoosh.mp3", volume: 0.35, durationInFrames: 20,
};
<ScenePush enterSfx={TRANSITION_SFX} ... />

// 3. SCENE-SPECIFIC SFX — for events like notifications, typing
// Use Sequence + Audio with entries from the SFX library
import { SFX } from "../content";
<Sequence from={90} durationInFrames={SFX.notification.durationInFrames} layout="none">
  <Audio src={staticFile(SFX.notification.src)} volume={SFX.notification.volume} />
</Sequence>

// SFX library (all pre-configured in content.ts):
// SFX.click, SFX.notification, SFX.pop, SFX.typing,
// SFX.whoosh, SFX.impact, SFX.boom
```

```tsx
// AudioManager — handles music bed + manual SFX timeline
<AudioManager
  music={{ src: "music/ambient-tech.mp3", volume: 0.5, fadeInFrames: 30, fadeOutFrames: 60 }}
  sfxTimeline={SFX_TIMELINE}
  scenes={SCENES}
  overlap={SCENE_OVERLAP}
  duckMusicDuring={[{ startFrame: 100, endFrame: 200, duckedVolume: 0.2 }]}
/>
```

### Easing

```tsx
import { EASE } from "../tokens";

// Use EASE.snappy for all animation interpolations (Easing.out(Easing.exp))
const prog = interpolate(frame, [0, 12], [0, 1], EASE.snappy);

// EASE.smooth available for gentler transitions (Easing.out(Easing.cubic))
const prog = interpolate(frame, [0, 30], [0, 1], EASE.smooth);
```

### Primitives

```tsx
// Window — macOS-style chrome with traffic lights
<Window
  id="my-window"           // required, also used as data-cursor-target
  title="Window Title"     // optional title in chrome bar
  width="100%"             // optional, default "100%"
  height="100%"            // optional, default "100%"
  chromeHeight={40}        // optional, title bar height in px
>
  {content}
</Window>

// Headline — serif text with word-stream entrance
// Defaults: fontSize=88, lineDelay=24, entranceDuration=10, yRise=20, exitDuration=10
<Headline
  lines={["First line", "Second line"]}
  fontSize={96}
  color={C.text}             // optional, default C.text
  fontFamily={F.serif}       // optional, default F.serif
  lineDelay={20}             // frames between lines
  entranceDuration={12}      // frames per line entrance
  yRise={30}                 // pixels to rise during entrance
  exitAt={90}                // frame to start fading out (optional)
  exitDuration={15}
  wordStream={{ stagger: 4, duration: 8, yRise: 16 }}  // per-word animation (optional)
/>

// Enter — generic entrance animation wrapper
<Enter delay={5} duration={15} translateY={40} scaleFrom={0.95}>
  {children}
</Enter>

// EndCard — closing card with tagline + CTA
<EndCard
  tagline="Your Product"
  cta="Try it free"
  entranceDelay={5}
  entranceDuration={20}
  logo={<img src="..." />}   // optional React node
  backgroundColor={C.bg}     // optional
  textColor={C.text}         // optional
/>

// Wallpaper — background variants
<Wallpaper variant="dark" />   // solid dark
<Wallpaper variant="light" />  // subtle gradient
<Wallpaper variant="gradient" />  // radial color accents

// ScenePush — push transition wrapper for scenes
// Each scene wraps its content in ScenePush. Handles entrance/exit slide
// animations and includes its own Wallpaper so nothing bleeds through.
<ScenePush
  duration={150}             // scene duration in frames (must match content.ts)
  overlap={SCENE_OVERLAP}    // overlap frames from content.ts (default 15)
  enterFrom="bottom"         // where content enters from (default "bottom")
  exitTo="top"               // where content exits to (default "top")
  background="dark"          // wallpaper variant (default "dark"), "none" to skip
  enterSfx={TRANSITION_SFX}  // optional — plays sound on entrance
>
  {children}
</ScenePush>
// Directions: "top" | "bottom" | "left" | "right" | "none"
// First scene: enterFrom="none" (no entrance)
// Last scene: exitTo="none" (no exit)
// Uses EASE.snappy for animations
```

## App UI primitives (screenshot-to-component)

These primitives let you recreate any SaaS app interface inside a `<Window>`. When a user provides a screenshot of their app, compose these to build a matching React component.

```
import { AppShell, SidebarNav, TopNav, DataTable, ... } from "../primitives/app-ui";
```

### Composition hierarchy

```
Window (macOS chrome)
  └── AppShell (optional — adds sidebar + topbar layout)
        ├── sidebar: SidebarNav (with Avatar, Badge in items)
        ├── topBar: TopNav (with SearchBar, Button, TabBar)
        └── children (main content area)
              └── PanelGrid (arrange panels)
                    └── Panel (bordered card)
                          └── DataTable | MessageList | StatCard | ListItems | Placeholder
```

### Layout shells

```tsx
// AppShell — standard SaaS layout (sidebar + topbar + content)
<AppShell
  sidebar={<SidebarNav items={[...]} />}
  sidebarWidth={220}            // default 220
  topBar={<TopNav left={...} right={...} />}
  topBarHeight={48}             // default 48
>
  {main content}
</AppShell>

// PanelGrid — CSS grid for arranging panels
<PanelGrid columns={3} gap={16}>{children}</PanelGrid>

// Panel — bordered card container
<Panel title="Section" subtitle="Description" accent={C.brandLight}>
  {content}
</Panel>
```

### Navigation

```tsx
// SidebarNav — vertical nav list
<SidebarNav
  items={[
    { label: "Dashboard", icon: "📊", active: true },
    { label: "Orders", icon: "📦", badge: "3" },
    { label: "Settings", icon: "⚙" },
  ]}
  header={<div>Logo</div>}
  footer={<Avatar name="User" />}
/>

// TopNav — horizontal bar with slots
<TopNav
  left={<span style={{ fontWeight: 600 }}>Dashboard</span>}
  right={<><SearchBar /><Button label="New" /></>}
/>

// TabBar — horizontal tabs
<TabBar
  tabs={[{ label: "Overview", active: true }, { label: "Details" }]}
  variant="underline"   // or "pill"
/>
```

### Content

```tsx
// DataTable — spreadsheet/table with status colors
<DataTable
  columns={["Name", "Email", "Status"]}
  rows={[["Alex", "alex@co", "Active"], ["Sam", "sam@co", "Pending"]]}
  statusColumn={2}      // which column gets colored
  statusColors={{ Active: C.success, Pending: C.warning }}  // optional overrides
  compact={false}
/>
// Built-in colors: Pending=warning, Shipped/Approved/Active=success, Review=accent, Error/Overdue=error

// MessageList — chat or email thread
<MessageList
  messages={[{ from: "Alex", text: "Hey!", timestamp: "2:30 PM" }]}
  variant="chat"        // or "email" (shows subject, separator lines)
/>

// StatCard — metric with delta
<StatCard label="Revenue" value="$12,400" delta="+12%" />
// Auto-colors: "+" = green, "-" = red

// ListItems — generic list rows
<ListItems items={[{ label: "API Keys", description: "Manage access", badge: "2", badgeColor: C.warning }]} />

// Placeholder — screenshot/chart placeholder
<Placeholder label="Product screenshot placeholder" height={280} />
// Or use aspectRatio="16/9" instead of height

// NotificationToast — floating notification
<NotificationToast title="New order" body="Alex placed order #142" accent={C.success} id="notif-0" />
```

### Micro atoms

```tsx
<Avatar name="Alex" size={28} color={C.brand} />     // circle with initial
<Badge label="Active" color={C.success} />            // colored pill
<Button label="Save" variant="primary" size="md" />   // primary | secondary | ghost
<SearchBar placeholder="Search..." value="query" />   // search input appearance
```

### Screenshot-to-component workflow

When a user provides a screenshot of their app, follow this process:

1. **Identify layout** — Does it have a sidebar? Top navigation? Tabs?
2. **Map content areas** — Is the main content a data table? List? Dashboard with metrics? Chat?
3. **Compose the hierarchy** — Build from outside in: `Window > AppShell > nav > content`
4. **Generate placeholder data** — Create realistic data in `content.ts` matching the screenshot
5. **Wire into a scene** — Place inside a `Window` component in the scene file

**Common app patterns:**

| App type | Primitives |
|----------|-----------|
| CRM / Admin | `AppShell` + `SidebarNav` + `TabBar` + `DataTable` |
| Dashboard | `AppShell` + `TopNav` + `PanelGrid` + `StatCard` + `Placeholder` |
| Email client | `AppShell` + `SidebarNav` + `MessageList(email)` + `ListItems` |
| Chat app | `AppShell` + `SidebarNav` + `MessageList(chat)` + `SearchBar` |
| Settings | `AppShell` + `SidebarNav` + `Panel` + `ListItems` + `Button` |
| Analytics | `AppShell` + `TopNav` + `TabBar` + `PanelGrid` + `StatCard` |

All primitives accept `id?: string` for cursor targeting and `style?: React.CSSProperties` for overrides.

## `content.ts` schema

This is the single source of truth for all content. Scene components import data from here.

```ts
// Scene overlap — frames of overlap between adjacent scenes for push transitions
export const SCENE_OVERLAP = 15;

// Scene order and duration (frames = seconds * 30)
export const SCENES: SceneTiming[] = [
  { id: "scene-id", durationInFrames: 150 },
];

// Headlines
export const HEADLINES = {
  pain: ["Line 1", "Line 2"],
  resolution: ["Line 1", "Line 2"],
  closer: ["CTA text"],
} as const;

// Camera timeline — scene-relative keyframes (keep scale at 1.0)
export const CAMERA_TIMELINE: CameraKeyframe[] = [...];

// Cursor SFX — maps action types to sounds (fired automatically by Cursor)
export const CURSOR_SFX: CursorSFXMap = { click: ..., drag: ... };

// Transition SFX — fired by ScenePush on entrance
export const TRANSITION_SFX: SFXEntry = { src: "sfx/transitions/whoosh.mp3", ... };

// SFX library — pre-configured entries for all included sounds
export const SFX = { click, notification, pop, typing, whoosh, impact, boom };

// Manual SFX timeline — only for non-automatic sounds
export const SFX_TIMELINE: AudioCue[] = [...];

// Demo data arrays — spreadsheet rows, emails, chat messages, etc.
```

## `tokens.ts` schema

```ts
export const C = {
  bg: "#0F0F14",          // primary background
  bgLight: "#1A1A24",     // lighter background
  surface: "#24243A",     // card/window surface
  text: "#F5F5FF",        // primary text
  textMuted: "#A0A0C0",   // secondary text
  brand: "#6366F1",       // brand primary
  brandLight: "#818CF8",  // brand highlight
  accent: "#22D3EE",      // accent color
  // ... see tokens.ts for full list
} as const;

export const F = {
  sans: "'Inter', system-ui, sans-serif",
  serif: "'Fraunces', Georgia, serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const CANVAS = { width: 1920, height: 1080 } as const;
export const FPS = 30;

// Shared easing — use instead of raw Easing imports
export const EASE = {
  snappy: { ... Easing.out(Easing.exp) },
  smooth: { ... Easing.out(Easing.cubic) },
};
```

## Common patterns

### Add a window to an existing scene (layout engine)

1. Add a new slot to the scene's `ZONES.slots`
2. Add a `<LayoutWindow>` with matching zone ID
3. Add cursor actions targeting the new window ID
4. Ensure the `getRect` function handles the new ID

### Add a window to an existing scene (choreographed)

1. Add position constants or a new entry to the scene's window definitions
2. Render with `position: "absolute"` and `data-cursor-target`
3. Update the scene's `getRect` to return bounds for the new ID
4. Add cursor actions targeting the new window ID

### Use product screenshots

1. Place PNG in `public/screenshots/` (recommended: 2x resolution)
2. Reference with `staticFile()` from remotion:
```tsx
import { Img, staticFile } from "remotion";
<Img src={staticFile("screenshots/dashboard.png")} style={{ width: "100%", height: "auto" }} />
```

### Change brand colors

Edit `src/tokens.ts` — all components reference `C.brand`, `C.accent`, etc.

### Change fonts

1. Edit `src/fonts.ts` to load new Google Fonts
2. Update `F.sans`, `F.serif`, `F.mono` in `src/tokens.ts`

### Adjust scene timing

Edit the `durationInFrames` in `content.ts` SCENES array. All camera/audio cues use scene-relative timing, so they adjust automatically.

### Add background music

1. Place MP3 in `public/music/`
2. Pass to AudioManager in `CinematicDemo.tsx`:
```tsx
<AudioManager
  music={{ src: "music/your-track.mp3", volume: 0.4, fadeInFrames: 30, fadeOutFrames: 60 }}
  sfxTimeline={SFX_TIMELINE}
  scenes={SCENES}
  overlap={SCENE_OVERLAP}
/>
```

## Commands

```bash
npm run studio     # Open Remotion Studio (preview + scrub)
npm run build      # Render final MP4
npm test           # Run Vitest test suite
npm run typecheck  # TypeScript check
```
