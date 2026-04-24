# Customization

> **Primary method: Remotion Studio props.** Most customization (colors, headlines, scenes, layout) is editable directly in Remotion Studio via the props panel. Code editing is the secondary approach for deeper changes.

## Colors

### Studio props (recommended)

Brand colors are defined in `src/schema.ts` (`BrandColorsSchema`) and editable in the Studio props panel. The schema exposes 10 color fields:

| Field | Default | Usage |
|-------|---------|-------|
| `primary` | `#6366F1` | Buttons, accents |
| `accent` | `#22D3EE` | Highlights, links |
| `background` | `#0F0F14` | Primary background |
| `backgroundLight` | `#1A1A24` | Lighter background |
| `surface` | `#24243A` | Card/window surface |
| `text` | `#F5F5FF` | Primary text |
| `textMuted` | `#A0A0C0` | Secondary text |
| `success` | `#34D399` | Success status |
| `warning` | `#FBBF24` | Warning status |
| `error` | `#F87171` | Error status |

Components read brand colors via the `useBrand()` hook:

```tsx
const brand = useBrand(); // { name, colors: { primary, accent, ... }, fontSans, ... }
```

### Code fallback

The `C` object in `src/tokens.ts` provides the full set of design tokens, including values not exposed in the Studio (window chrome, borders, traffic-light buttons, etc.). Components fall back to `C.*` tokens when no brand override applies.

```ts
export const C = {
  // Backgrounds
  bg: "#0F0F14",           // primary background
  bgLight: "#1A1A24",      // lighter background
  surface: "#24243A",      // card/window surface
  surfaceLight: "#2E2E48", // hover state surface

  // Text
  text: "#F5F5FF",         // primary text
  textMuted: "#A0A0C0",    // secondary text
  textDim: "#6B6B8D",      // tertiary text

  // Brand
  brand: "#6366F1",        // primary brand color (buttons, accents)
  brandLight: "#818CF8",   // lighter variant
  brandDim: "#4F46E5",     // darker variant

  // Accent
  accent: "#22D3EE",       // secondary accent (highlights, links)
  accentDim: "#0891B2",    // darker variant

  // Status
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",

  // Window chrome
  windowChrome: "#2A2A3E", // title bar background
  windowBorder: "#3A3A5C", // window borders
  border: "#3A3A5C",       // general borders
  trafficRed: "#FF5F57",   // close button
  trafficYellow: "#FEBC2E", // minimize button
  trafficGreen: "#28C840", // maximize button
} as const;
```

## Fonts

Three font families are loaded via `@remotion/google-fonts`:

| Token | Default | Usage |
|-------|---------|-------|
| `F.sans` | Inter | UI text, window content, labels |
| `F.serif` | Fraunces | Headlines, taglines |
| `F.mono` | JetBrains Mono | Code, data tables |

### Changing fonts

1. Edit `src/fonts.ts` to load different Google Fonts:

```ts
import { loadFont as loadMyFont } from "@remotion/google-fonts/MyFont";
loadMyFont();
```

2. Update `src/tokens.ts`:

```ts
export const F = {
  sans: "'MyFont', system-ui, sans-serif",
  // ...
} as const;
```

Available fonts: see the [@remotion/google-fonts](https://www.remotion.dev/docs/google-fonts/load-font) docs.

## Screenshots

Product screenshots go in `public/screenshots/`.

### Requirements

- **Format**: PNG (recommended) or JPEG
- **Resolution**: 2x recommended (3840x2160 for full-screen shots, or proportional for cropped areas)
- **Naming**: descriptive kebab-case — `dashboard.png`, `feature-catalog.png`, `settings-page.png`

### Using in scenes

```tsx
import { Img, staticFile } from "remotion";

<Img
  src={staticFile("screenshots/dashboard.png")}
  style={{ width: "100%", height: "auto", borderRadius: 6 }}
/>
```

Place the `<Img>` inside a `<Window>` component as the content slot.

## Music

Background music goes in `public/music/`.

### Requirements

- **Format**: MP3 or WAV, 44.1kHz+
- **Style**: loop-friendly ambient tracks work best
- **Licensing**: include only royalty-free or properly licensed tracks

### Adding music

Pass the `music` prop to `AudioManager` in `src/CinematicDemo.tsx`:

```tsx
<AudioManager
  music={{
    src: "music/your-track.mp3",  // relative to public/
    volume: 0.4,
    fadeInFrames: 30,   // ~1 second fade in
    fadeOutFrames: 60,  // ~2 second fade out
  }}
  sfxTimeline={SFX_TIMELINE}
  scenes={SCENES}
  overlap={SCENE_OVERLAP}
/>
```

### Volume ducking

If you add narration, duck the music during speech:

```tsx
<AudioManager
  music={...}
  duckMusicDuring={[
    { startFrame: 100, endFrame: 250, duckedVolume: 0.15 },
  ]}
/>
```

## Sound effects

SFX go in `public/sfx/`, organized by category:

```
public/sfx/
  ui/                   # UI interaction sounds
    click.mp3
    window-open.mp3
    window-resize.mp3
    keyboard-clack.mp3
    notification-pop.mp3
  transitions/          # Scene transition sounds
    whoosh.mp3
    reveal.mp3
    impact-soft.mp3
```

### Adding SFX cues

Add entries to `SFX_TIMELINE` in `src/content.ts`:

```ts
export const SFX_TIMELINE: AudioCue[] = [
  { scene: "chaos", at: 10, sfx: "sfx/ui/keyboard-clack.mp3", volume: 0.6 },
  { scene: "chaos", at: 30, sfx: "sfx/ui/notification-pop.mp3", volume: 0.4 },
  { scene: "product-reveal", at: 0, sfx: "sfx/transitions/reveal.mp3", volume: 0.7, durationInFrames: 45 },
];
```

The `at` value is the frame number relative to the start of the scene.

## Headlines

Headlines are defined in `src/schema.ts` (`HeadlinesSchema`) and editable in the Studio props panel or inline in the video preview. Components read them via the `useHeadlines()` hook.

| Field | Default | Scene |
|-------|---------|-------|
| `pain` | `["Where did that", "request go?"]` | HeadlineResolution |
| `resolution` | `["Every request.", "Tracked."]` | HeadlineResolution |
| `closer` | `["Try it free."]` | Closer |

Each headline also has an optional `*FontSize` field and a shared `color` override.

## Scene order and timing

### Scene config (Studio props)

Scene configuration — enabled/disabled, duration, enter/exit directions, and background variant — is defined in `src/schema.ts` (`DEFAULT_SCENES`) and editable in the Studio props panel. Each scene entry has:

```ts
{ id: "chaos", enabled: true, durationInFrames: 260, enterFrom: "none", exitTo: "top", background: "dark" }
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Scene identifier |
| `enabled` | boolean | Toggle scene on/off |
| `durationInFrames` | number | Duration in frames (30 = 1 second) |
| `enterFrom` | direction | `"top"` / `"bottom"` / `"left"` / `"right"` / `"none"` |
| `exitTo` | direction | Same options as `enterFrom` |
| `background` | variant | `"dark"` / `"light"` / `"gradient"` / `"none"` |

### Camera timeline (code)

The `SCENES` array in `src/content.ts` provides the camera timeline timing (`SceneTiming[]` with `id` and `durationInFrames`). Keep its durations in sync with the schema config:

```ts
export const SCENES: SceneTiming[] = [
  { id: "chaos", durationInFrames: 260 },
  { id: "product-reveal", durationInFrames: 150 },
  { id: "feature-showcase", durationInFrames: 200 },
  { id: "headline-resolution", durationInFrames: 120 },
  { id: "closer", durationInFrames: 90 },
];
```

- Camera and SFX cues are scene-relative, so they adjust when you change durations

### Removing a scene

To fully remove a scene, update all four locations:

1. `src/schema.ts` — remove from `DEFAULT_SCENES`
2. `src/content.ts` — remove from `SCENES` and `CAMERA_TIMELINE`
3. `src/CinematicDemo.tsx` — remove from `SCENE_COMPONENTS`
4. `src/schema.ts` — optionally remove related `windowLayout` entries

## Canvas and framerate

Defined in `src/tokens.ts`:

```ts
export const CANVAS = { width: 1920, height: 1080 } as const;
export const FPS = 30;
```

Changing these affects all layout. Scenes use `resolveWindowPose` with `windowLayout` props for positioning, so you would need to adjust the window layout entries in `schema.ts` to fit the new canvas dimensions.
