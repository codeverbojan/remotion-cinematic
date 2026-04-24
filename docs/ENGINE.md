# Engine API Reference

The engine provides five systems: **choreography**, **layout**, **cursor**, **camera**, and **audio**. All are imported from `../engine`.

## Choreography

Prop-driven window positioning. All 5 scenes use this system. Window definitions are Studio-editable props defined in `schema.ts` `DEFAULT_WINDOW_LAYOUT`.

### `resolveWindowPose(def: WindowLayout, frame: number): WindowPose`

Pure function — computes a window's position, size, opacity, and visibility for any frame. Handles entrance animations, position/size transitions, and exit fades.

```ts
import { resolveWindowPose } from "../engine";

const pose = resolveWindowPose(windowDef, frame);
// Returns:
// {
//   left: number, top: number, width: number, height: number,
//   opacity: number, scale: number,
//   translateX: number, translateY: number,
//   visible: boolean
// }
```

### `mapCursorPath(entries: CursorPathEntry[]): CursorAction[]`

Converts Studio-friendly flat cursor path entries (from schema props) to internal `CursorAction[]` format. Handles anchor type conversion (named presets vs. percentage anchors).

```ts
import { mapCursorPath } from "../engine";
import { useCursorPath } from "../VideoPropsContext";

const cursorPath = useCursorPath();
const actions = useMemo(() => mapCursorPath(cursorPath), [cursorPath]);
```

### Usage pattern (all scenes follow this)

```tsx
const frame = useCurrentFrame();
const allWindows = useWindowLayout();
const windows = allWindows.filter((w) => SCENE_WINDOW_IDS.includes(w.id));

const getRect = (id: string) => {
  const def = windows.find((w) => w.id === id);
  if (!def) return undefined;
  const pose = resolveWindowPose(def, frame);
  if (!pose.visible) return undefined;
  return { left: pose.left, top: pose.top, width: pose.width, height: pose.height };
};

{windows.map((def) => {
  const pose = resolveWindowPose(def, frame);
  if (!pose.visible) return null;
  return (
    <div style={{
      position: "absolute",
      left: pose.left, top: pose.top,
      width: pose.width, height: pose.height,
      opacity: pose.opacity,
      transform: `scale(${pose.scale}) translate(${pose.translateX}px, ${pose.translateY}px) translateZ(0)`,
      transformOrigin: "top left", zIndex: def.zIndex,
    }}>
      <Window id={def.id} title={def.title}>{content}</Window>
    </div>
  );
})}
```

### WindowLayout fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | — | Unique window ID (cursor target) |
| `title` | string | `"Window"` | Window title bar text (inline-editable in Studio) |
| `startX/Y` | int | — | Initial position |
| `startW/H` | int | — | Initial size |
| `endX/Y/W/H` | int? | — | Animate to position/size |
| `enterAt` | int | — | Frame to appear |
| `enterDuration` | int | `12` | Entrance animation length |
| `enterFrom` | enum | `"scale"` | `"fade"` \| `"scale"` \| `"slide-up"` \| `"slide-left"` \| `"slide-right"` |
| `animateAt` | int? | `enterAt+enterDuration` | Frame to start position/size animation |
| `animateDuration` | int | `18` | Position/size animation length |
| `exitAt` | int? | — | Frame to start exit fade |
| `exitDuration` | int | `12` | Exit fade length |
| `zIndex` | int | `1` | Stacking order |

---

## Layout

Zone-based positioning system. You define named slots on the 1920x1080 canvas, then place windows into those slots. The engine computes pixel positions, handles alignment, stacking, and avoidance of reserved regions.

### `defineZones(config: ZoneConfig): ZoneSystem`

Creates a zone system from a config. Validates that all slots and reserved zones fit within the canvas.

```ts
import { defineZones } from "../engine";
import type { ZoneConfig } from "../engine";

const ZONES: ZoneConfig = {
  canvas: { width: 1920, height: 1080 },
  slots: [
    { id: "top-left", region: { x: 0, y: 0, w: 960, h: 540 } },
    { id: "top-right", region: { x: 960, y: 0, w: 960, h: 540 } },
    { id: "center", region: { x: 240, y: 135, w: 1440, h: 810 } },
  ],
  reserved: [
    { id: "headline", region: { x: 200, y: 300, w: 1520, h: 480 } },
  ],
};

const zoneSystem = defineZones(ZONES);
```

Slots can overlap — a window placed in `"center"` can coexist with windows in `"top-left"`. Reserved zones are regions that windows can opt to avoid via `avoidZones`.

### `<LayoutProvider zones={zoneSystem}>`

React context provider. Wrap your scene content in this to enable `LayoutWindow` and `useWindowRect`.

### `<LayoutWindow>`

Positions a child element within a zone slot.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | required | Unique ID, also sets `data-cursor-target` |
| `zone` | `string` | required | Slot ID to place in |
| `width` | `number` | required | Desired width in px |
| `height` | `number` | required | Desired height in px |
| `margin` | `number` | `0` | Padding from zone edges |
| `avoidZones` | `string[]` | `[]` | Reserved zone IDs to avoid |
| `align` | `{ horizontal?, vertical? }` | — | `"start"`, `"center"`, or `"end"` |
| `stackIndex` | `number` | — | Position in stack (0-based) |
| `stackPitch` | `number` | — | Vertical offset per stack item (px) |

### `useWindowRect(id: string): ComputedRect | undefined`

Hook to read the computed position of a registered window. Returns `{ left, top, width, height }`.

### Types

```ts
interface ZoneConfig {
  canvas: { width: number; height: number };
  slots: SlotDef[];
  reserved: ReservedZone[];
}

interface SlotDef {
  id: string;
  region: { x: number; y: number; w: number; h: number };
}

interface ReservedZone {
  id: string;
  region: { x: number; y: number; w: number; h: number };
}

interface ComputedRect {
  left: number;
  top: number;
  width: number;
  height: number;
}
```

---

## Cursor

Geometry-aware cursor that targets elements by ID. Movements support three curve types: arc (quadratic bezier), linear (straight line), and ease (smoothstep). The cursor resolves positions from a `getRect` callback at render time.

### `<Cursor>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actions` | `CursorAction[]` | required | Choreography timeline (scene-relative frames) |
| `getRect` | `(id: string) => { left, top, width, height } \| undefined` | — | Position resolver (optional) |
| `sfx` | `CursorSFXMap` | — | Maps action types to sounds — fires automatically |
| `canvas` | `{ width: number; height: number }` | — | Canvas dimensions (for clamp/defaults) |
| `size` | `number` | — | Cursor size in px (also controlled by `cursorScale` prop) |
| `baseRotation` | `number` | — | Cursor rotation in degrees (from `cursorRotation` prop) |
| `color` | `string` | — | Cursor color |
| `visible` | `boolean` | — | Show/hide cursor |
| `fadeOutDelay` | `number` | — | Frames after last action before fade-out starts |
| `fadeOutDuration` | `number` | — | Fade-out duration in frames |

### Cursor SFX

When the `sfx` prop is provided, the Cursor automatically plays sounds for matching actions. Define the mapping once in `content.ts` and pass it to every `<Cursor>`:

```tsx
import { CURSOR_SFX } from "../content";

// In content.ts:
export const CURSOR_SFX: CursorSFXMap = {
  click: { src: "sfx/ui/click.mp3", volume: 0.4 },
  drag:  { src: "sfx/ui/window-resize.mp3", volume: 0.5 },
};

// In any scene:
<Cursor actions={CURSOR_ACTIONS} getRect={getRect} sfx={CURSOR_SFX} />
```

Every click action in every scene will play `click.mp3`. Every drag will play `window-resize.mp3`. No manual frame timing needed.

```ts
interface SFXEntry {
  src: string;              // path relative to public/
  volume?: number;          // default 0.5
  durationInFrames?: number; // playback duration, default 30
}

type CursorSFXMap = Partial<Record<"idle" | "moveTo" | "click" | "drag", SFXEntry>>;
```

### Actions

All `at` values are scene-relative frame numbers.

**idle** — cursor appears at a fixed position:
```ts
{ at: 0, action: "idle", position: { x: 960, y: 540 } }
```

**moveTo** — interpolated movement to a target element:
```ts
{ at: 20, action: "moveTo", target: "window-id", anchor: "center", duration: 15 }
{ at: 20, action: "moveTo", target: "window-id", anchor: "center", duration: 15, curve: "linear" }
```

**click** — visual click pulse at target:
```ts
{ at: 50, action: "click", target: "window-id" }
// anchor is optional, defaults to "center"
```

**drag** — move from anchor to an absolute position:
```ts
{ at: 80, action: "drag", target: "window-id", anchor: "corner-bottom-right",
  to: { x: 1700, y: 900 }, duration: 30 }
```

### Curve types

`moveTo` and `drag` actions accept an optional `curve` field:

| Curve | Behavior | Best for |
|-------|----------|----------|
| `"arc"` (default) | Quadratic bezier with perpendicular bulge + bezier easing | Natural mouse movements |
| `"linear"` | Straight line, constant speed | Precise UI interactions |
| `"ease"` | Straight line with smoothstep acceleration (`t*t*(3-2*t)`) | Smooth direct movements |

```ts
{ at: 20, action: "moveTo", target: "btn", duration: 15, curve: "arc" }    // default
{ at: 20, action: "moveTo", target: "btn", duration: 15, curve: "linear" } // straight
{ at: 20, action: "moveTo", target: "btn", duration: 15, curve: "ease" }   // smooth straight
```

The curve type is also editable per-waypoint in the visual cursor path editor (Studio overlay).

### Anchor types

| Anchor | Resolves to |
|--------|-------------|
| `"center"` | Element center |
| `"top-bar"` | Center of top 40px (window title bar) |
| `"corner-top-left"` | Top-left corner |
| `"corner-top-right"` | Top-right corner |
| `"corner-bottom-left"` | Bottom-left corner |
| `"corner-bottom-right"` | Bottom-right corner |
| `{ x: 100, y: 200 }` | Absolute position (ignores target) |
| `{ xPct: 0.5, yPct: 0.3 }` | Percentage within element bounds |

### The `getRect` pattern

Each scene defines a `getRect` function that resolves element IDs to pixel rects. This bridges the layout engine to the cursor:

```tsx
const getRect = (id: string) => {
  try {
    return zoneSystem.placeWindow({
      id, slotId: "center", width: 1000, height: 600, margin: 30, avoidZones: [],
    });
  } catch {
    return undefined;
  }
};
```

For elements not managed by the layout engine (e.g., hardcoded notifications), return the rect directly:

```tsx
if (id.startsWith("notification-")) {
  const idx = parseInt(id.split("-")[1], 10);
  return { left: 1530, top: 30 + idx * 102, width: 360, height: 80 };
}
```

---

## Camera

Scene-relative camera system. Keyframes reference scene IDs instead of absolute frame numbers, so timing adjusts automatically when you change scene durations.

### `<CameraRig>`

Global camera that wraps all scenes. Interpolates between keyframes. Keep at scale 1.0 — use AutoZoom for per-scene zoom.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `timeline` | `CameraKeyframe[]` | required | Keyframe sequence |
| `scenes` | `SceneTiming[]` | required | Scene timing array (from content.ts) |
| `overlap` | `number` | `0` | Scene overlap frames (use `SCENE_OVERLAP` from content.ts) |
| `easing` | `EasingPreset` | `"cinematic"` | Interpolation easing |

### `CameraKeyframe`

```ts
interface CameraKeyframe {
  scene: string;       // scene ID from content.ts
  at: "start" | "end" | number;  // position within scene (number = fraction 0-1)
  x: number;           // horizontal offset in px
  y: number;           // vertical offset in px
  scale: number;       // zoom level (1.0 = normal — keep at 1.0, use AutoZoom instead)
}
```

- `"start"` resolves to the first frame of the scene
- `"end"` resolves to the last frame of the scene
- A number like `0.5` resolves to the midpoint

### `<AutoZoom>`

Per-scene zoom that targets elements by ID. Uses the same `getRect` pattern as Cursor — zoom origin tracks actual element positions, no hardcoded coordinates.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `keyframes` | `ZoomKeyframe[]` | required | Zoom keyframes |
| `getRect` | `(id: string) => { left, top, width, height } \| undefined` | required | Position resolver |
| `children` | `React.ReactNode` | required | Scene content to zoom |

```ts
interface ZoomKeyframe {
  at: number;       // scene-relative frame
  target?: string;  // element ID resolved via getRect (omit for canvas center)
  scale: number;    // zoom level (1.0 = no zoom, 1.04-1.06 = subtle focus)
}
```

Example:
```tsx
const ZOOM_KEYFRAMES: ZoomKeyframe[] = [
  { at: 0, scale: 1 },
  { at: 15, target: "feature-0", scale: 1.06 },
  { at: 32, target: "feature-0", scale: 1.06 },
  { at: 42, scale: 1 },
];

<AutoZoom keyframes={ZOOM_KEYFRAMES} getRect={getRect}>
  {/* scene content */}
</AutoZoom>
```

### Easing

Use `EASE.snappy` from `tokens.ts` for all animation interpolations instead of importing `Easing` directly:

```tsx
import { EASE } from "../tokens";
const prog = interpolate(frame, [0, 12], [0, 1], EASE.snappy);
```

| Preset | Easing | Usage |
|--------|--------|-------|
| `EASE.snappy` | `Easing.out(Easing.exp)` | Default for all animations — fast settle |
| `EASE.smooth` | `Easing.out(Easing.cubic)` | Gentler transitions |

CameraRig easing presets (different system, passed as string):

| Preset | Character |
|--------|-----------|
| `"cinematic"` | Smooth, slow-in/slow-out |
| `"snappy"` | Quick settle, responsive |
| `"linear"` | Constant speed |

---

## Audio

Music bed with auto-fade and SFX cues. SFX timing is scene-relative.

### `<AudioManager>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `music` | `MusicConfig` | — | Background music configuration |
| `sfxTimeline` | `AudioCue[]` | `[]` | SFX cue list |
| `scenes` | `SceneTiming[]` | required | Scene timing array |
| `overlap` | `number` | `0` | Scene overlap frames (use `SCENE_OVERLAP` from content.ts) |
| `duckMusicDuring` | `DuckingRange[]` | `[]` | Ranges to lower music volume |

### Types

```ts
interface MusicConfig {
  src: string;              // path relative to public/ (e.g., "music/track.mp3")
  volume?: number;          // base volume, default 0.5
  fadeInFrames?: number;    // fade in duration, default 30
  fadeOutFrames?: number;   // fade out duration, default 60
}

interface AudioCue {
  scene: string;            // scene ID
  at: number;               // scene-relative frame
  sfx: string;              // path relative to public/ (e.g., "sfx/ui/click.mp3")
  volume?: number;          // default 1.0
  durationInFrames?: number; // playback duration, default 60
}

interface DuckingRange {
  startFrame: number;       // absolute frame to start ducking
  endFrame: number;         // absolute frame to stop ducking
  duckedVolume: number;     // volume during duck (0-1)
}
```

Audio files go in `public/music/` and `public/sfx/`. The `src` and `sfx` paths are relative to `public/` and resolved via Remotion's `staticFile()`.
