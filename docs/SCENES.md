# Scenes

Scenes are the building blocks of your video. Each scene is a React component wrapped in `ScenePush` for continuous push transitions between scenes.

## Included scenes

| Scene | File | Duration | What it does |
|-------|------|----------|--------------|
| Chaos Desktop | `ChaosDesktop.tsx` | 260 frames (~8.7s) | Sticky notes, windows (spreadsheet, email, chat), and notifications pile up — all as editable WindowLayout entries with rotation support — then headline pushes everything away |
| Product Reveal | `ProductReveal.tsx` | 150 frames (5s) | Full-screen product window, cursor drags corner to resize, side panels appear |
| Feature Showcase | `FeatureShowcase.tsx` | 200 frames (~6.7s) | Three feature windows with AutoZoom focus on each |
| Headline Resolution | `HeadlineResolution.tsx` | 120 frames (4s) | Clean resolution headline on dark background |
| Closer | `Closer.tsx` | 90 frames (3s) | End card with tagline and CTA |

All five scenes use **prop-driven choreography** via `resolveWindowPose` for window positioning (see Pattern A below). Window definitions live in `schema.ts` `DEFAULT_WINDOW_LAYOUT` and are editable in Studio. Scene config (enabled, duration, transitions) is in `schema.ts` `DEFAULT_SCENES`. The `content.ts` `SCENES` array is only used for camera timeline timing.

## Scene transitions

Scenes use **push transitions** — no fades or cuts. The incoming scene slides in and pushes the outgoing scene off-canvas during a 15-frame overlap (`SCENE_OVERLAP` in content.ts).

Every scene wraps its content in `ScenePush`, which handles:
- Entrance slide (configurable direction)
- Exit slide (configurable direction)
- Per-scene Wallpaper (prevents bleed-through during overlap)

```tsx
<ScenePush duration={150} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="top">
  {/* scene content */}
</ScenePush>
```

## Anatomy of a scene

Scenes follow one of two patterns depending on their positioning needs.

### Pattern A: Prop-driven choreography (all current scenes)

Used by **all five current scenes**: ChaosDesktop, ProductReveal, FeatureShowcase, HeadlineResolution, and Closer. Window positions, sizes, entrances, and animations are defined as Studio-editable props in `schema.ts` `DEFAULT_WINDOW_LAYOUT`. Each scene filters windows by ID, then uses `resolveWindowPose()` to compute position/visibility/opacity for any given frame.

```tsx
import React from "react";
import { useCurrentFrame } from "remotion";
import { Cursor, resolveWindowPose } from "../engine";
import type { CursorAction } from "../engine";
import { ScenePush, Window } from "../primitives";
import { CURSOR_SFX, SCENE_OVERLAP } from "../content";
import { useWindowLayout } from "../VideoPropsContext";

const DURATION = 150;

const SCENE_WINDOW_IDS = ["my-window-1", "my-window-2"];

const CURSOR_ACTIONS: CursorAction[] = [
  { at: 0, action: "idle", position: { x: 960, y: 540 } },
  { at: 15, action: "moveTo", target: "my-window-1", anchor: "center", duration: 12 },
  { at: 35, action: "click", target: "my-window-1" },
];

export const MyScene: React.FC = () => {
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

  return (
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="top">
      {windows.map((def) => {
        const pose = resolveWindowPose(def, frame);
        if (!pose.visible) return null;
        return (
          <div key={def.id} data-cursor-target={def.id} style={{
            position: "absolute",
            left: pose.left, top: pose.top, width: pose.width, height: pose.height,
            opacity: pose.opacity,
            transform: `scale(${pose.scale}) translate(${pose.translateX}px, ${pose.translateY}px) translateZ(0)`,
            transformOrigin: "top left", zIndex: def.zIndex,
          }}>
            <Window id={def.id} title={def.title}>{/* content */}</Window>
          </div>
        );
      })}
      <Cursor actions={CURSOR_ACTIONS} getRect={getRect} sfx={CURSOR_SFX} />
    </ScenePush>
  );
};
```

### Pattern B: Headline only (no windows)

Used by HeadlineResolution and Closer. No cursor, no window layout. Headlines flow through schema props via `useHeadlines()`. The `Headline` component accepts a `headlineKey` prop for self-wiring Studio editing — no callback props needed.

```tsx
import React from "react";
import { Headline, ScenePush } from "../primitives";
import { SCENE_OVERLAP } from "../content";
import { useHeadlines } from "../VideoPropsContext";

export const MyHeadline: React.FC = () => {
  const headlines = useHeadlines();

  return (
    <ScenePush duration={120} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="top">
      <Headline
        lines={headlines.resolution}
        fontSize={headlines.resolutionFontSize ?? 110}
        color={headlines.color}
        wordStream={{ stagger: 3, duration: 5, yRise: 50 }}
        headlineKey="resolution"
      />
    </ScenePush>
  );
};
```

### Pattern C: Layout engine (available but unused)

The zone-based layout engine (`defineZones`, `LayoutProvider`, `LayoutWindow`) still exists in `src/engine/layout/` but is **not used by any current scene**. All scenes were refactored to use prop-driven choreography (Pattern A). The layout engine remains available if you need auto-placed windows with collision avoidance.

## Adding a new scene

### 1. Register in `schema.ts` and `content.ts`

Add your scene config to `DEFAULT_SCENES` in `schema.ts` (controls enabled state, duration, transitions, background):

```ts
export const DEFAULT_SCENES: SceneConfig[] = [
  // ... existing scenes
  { id: "my-scene", enabled: true, durationInFrames: 180, enterFrom: "bottom", exitTo: "top", background: "dark" },
];
```

If your scene has windows, add their definitions to `DEFAULT_WINDOW_LAYOUT` in `schema.ts`:

```ts
export const DEFAULT_WINDOW_LAYOUT: WindowLayout[] = [
  // ... existing windows
  { id: "my-window", title: "My Window", startX: 460, startY: 240, startW: 1000, startH: 600, enterAt: 5, enterDuration: 12, enterFrom: "scale", zIndex: 1 },
];
```

Add camera timeline timing to `content.ts` `SCENES` array (used only for camera keyframe resolution):

```ts
export const SCENES: SceneTiming[] = [
  // ... existing scenes
  { id: "my-scene", durationInFrames: 180 },
];
```

Add camera keyframes (keep scale at 1.0 — use AutoZoom for per-scene zoom):

```ts
export const CAMERA_TIMELINE: CameraKeyframe[] = [
  // ... existing
  { scene: "my-scene", at: "start", x: 0, y: 0, scale: 1.0 },
  { scene: "my-scene", at: "end", x: 0, y: 0, scale: 1.0 },
];
```

### 2. Create the scene file

Create `src/scenes/MyScene.tsx` using Pattern A (prop-driven choreography) or Pattern B (headline only) above.

### 3. Export from barrel

Add to `src/scenes/index.ts`:

```ts
export { MyScene } from "./MyScene";
```

### 4. Wire into the composition

In `src/CinematicDemo.tsx`, add to the `SCENE_COMPONENTS` map:

```ts
const SCENE_COMPONENTS: Record<string, React.FC> = {
  // ... existing
  "my-scene": MyScene,
};
```

The key must match the `id` in `schema.ts` `DEFAULT_SCENES`.

### 5. Verify

```bash
npm run typecheck
npm run studio
```

## Per-scene zoom with AutoZoom

AutoZoom provides target-aware zoom within a scene. It uses the same `getRect` function as Cursor, so zoom origins track actual element positions.

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

Keep zoom subtle (1.04–1.06x). The global CameraRig should stay at scale 1.0 — all zoom is per-scene.

## Tips

- Frame numbers in cursor actions and AutoZoom keyframes are **scene-relative** (start at 0)
- Camera keyframes in `CAMERA_TIMELINE` (content.ts) are also scene-relative via the `scene` field
- Use `EASE.snappy` from tokens.ts for all interpolations — never import `Easing` directly
- Keep `getRect` in sync with window positions — cursor and zoom both depend on it
- Use `Enter` to stagger window appearances for a more dynamic feel
- Deterministic only — no `Math.random()`, no mutable state outside React
- ScenePush directions: first scene uses `enterFrom="none"`, last scene uses `exitTo="none"`
- Window, Headline, and EndCard are self-wiring — they handle their own Studio editing, no callback props needed
