# Scenes

Scenes are the building blocks of your video. Each scene is a React component wrapped in `ScenePush` for continuous push transitions between scenes.

## Included scenes

| Scene | File | Duration | What it does |
|-------|------|----------|--------------|
| Chaos Desktop | `ChaosDesktop.tsx` | 260 frames (~8.7s) | Windows pile up (spreadsheet, email, chat), notifications appear, then headline pushes everything away |
| Product Reveal | `ProductReveal.tsx` | 150 frames (5s) | Full-screen product window, cursor drags corner to resize, side panels appear |
| Feature Showcase | `FeatureShowcase.tsx` | 200 frames (~6.7s) | Three feature windows with AutoZoom focus on each |
| Headline Resolution | `HeadlineResolution.tsx` | 120 frames (4s) | Clean resolution headline on dark background |
| Closer | `Closer.tsx` | 90 frames (3s) | End card with tagline and CTA |

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

### Pattern A: Choreographed positioning (animated/overlapping windows)

Used by ChaosDesktop and ProductReveal. Windows have explicit positions with animated transitions.

```tsx
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Cursor } from "../engine";
import type { CursorAction } from "../engine";
import { ScenePush, Window } from "../primitives";
import { CURSOR_SFX, SCENE_OVERLAP } from "../content";
import { C, EASE, F } from "../tokens";

const DURATION = 150;

const CURSOR_ACTIONS: CursorAction[] = [
  { at: 0, action: "idle", position: { x: 960, y: 540 } },
  { at: 15, action: "moveTo", target: "my-window", anchor: "center", duration: 12 },
  { at: 35, action: "click", target: "my-window" },
];

export const MyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enterProg = interpolate(frame, [0, 14], [0, 1], EASE.snappy);

  const getRect = (id: string) => {
    if (id === "my-window") return { left: 460, top: 240, width: 1000, height: 600 };
    return undefined;
  };

  return (
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="top">
      <div
        data-cursor-target="my-window"
        style={{
          position: "absolute", left: 460, top: 240, width: 1000, height: 600,
          opacity: enterProg,
        }}
      >
        <Window id="my-window" title="My Window">
          {/* content */}
        </Window>
      </div>
      <Cursor actions={CURSOR_ACTIONS} getRect={getRect} sfx={CURSOR_SFX} />
    </ScenePush>
  );
};
```

### Pattern B: Layout engine (auto-placed windows)

Used by FeatureShowcase. The layout engine handles positioning and avoidance.

```tsx
import React from "react";
import { Cursor, AutoZoom, defineZones, LayoutProvider, LayoutWindow, useWindowRect } from "../engine";
import type { CursorAction, ZoneConfig, ZoomKeyframe } from "../engine";
import { ScenePush, Window } from "../primitives";
import { CURSOR_SFX, SCENE_OVERLAP } from "../content";

const ZONES: ZoneConfig = {
  canvas: { width: 1920, height: 1080 },
  slots: [{ id: "center", region: { x: 240, y: 100, w: 1440, h: 880 } }],
  reserved: [],
};
const zoneSystem = defineZones(ZONES);

export const MyScene: React.FC = () => {
  const getRect = (id: string) => {
    try {
      return zoneSystem.placeWindow({ id, slotId: "center", width: 1000, height: 600, margin: 30, avoidZones: [] });
    } catch { return undefined; }
  };

  return (
    <ScenePush duration={200} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="top">
      <AutoZoom keyframes={ZOOM_KEYFRAMES} getRect={getRect}>
        <LayoutProvider zones={zoneSystem}>
          <LayoutWindow id="win" zone="center" width={1000} height={600} margin={30}>
            <Window id="win" title="Window">{/* content */}</Window>
          </LayoutWindow>
        </LayoutProvider>
      </AutoZoom>
      <Cursor actions={CURSOR_ACTIONS} getRect={getRect} sfx={CURSOR_SFX} />
    </ScenePush>
  );
};
```

### Pattern C: Headline only (no windows)

Used by HeadlineResolution and Closer. No cursor, no layout engine.

```tsx
import React from "react";
import { Headline, ScenePush } from "../primitives";
import { HEADLINES, SCENE_OVERLAP } from "../content";

export const MyHeadline: React.FC = () => (
  <ScenePush duration={120} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="top">
    <Headline
      lines={HEADLINES.resolution}
      fontSize={110}
      wordStream={{ stagger: 3, duration: 5, yRise: 50 }}
    />
  </ScenePush>
);
```

## Adding a new scene

### 1. Register in `content.ts`

Add your scene to the `SCENES` array. Order matters — scenes play sequentially.

```ts
export const SCENES: SceneTiming[] = [
  // ... existing scenes
  { id: "my-scene", durationInFrames: 180 },  // 6 seconds
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

Create `src/scenes/MyScene.tsx` using one of the patterns above.

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

The key must match the `id` in `content.ts`.

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
