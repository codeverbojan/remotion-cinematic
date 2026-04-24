# Getting Started

Get a cinematic product demo video running in 5 minutes.

## Prerequisites

- Node.js 18+
- npm 9+

## 1. Clone and install

```bash
npx degit codeverbojan/remotion-cinematic my-video
cd my-video
npm install
```

## 2. Preview in Remotion Studio

```bash
npm run studio
```

Opens a browser at `http://localhost:3000` with the 25-second demo video. Scrub the timeline, play, and inspect individual frames.

## 3. Set your brand

Edit `src/tokens.ts`, or use the **Studio props panel** (right sidebar) to change colors live:

```ts
export const C = {
  bg: "#0F0F14",        // your background color
  brand: "#6366F1",     // your primary brand color
  brandLight: "#818CF8",
  accent: "#22D3EE",    // your accent color
  // ... rest of colors
} as const;
```

Save and see changes live in the studio.

## 4. Edit content

Headlines and scene config are managed through the **schema props system**, not `content.ts`.

**Option A — Studio props panel (no code):**
Open Remotion Studio, expand the props panel on the right, and edit `headlines.pain`, `headlines.resolution`, `headlines.closer`, plus `cta`, `brand`, and `scenes` directly. Changes preview instantly.

**Option B — Edit defaults in code:**
Change the defaults in `src/schema.ts` under `HeadlinesSchema`:

```ts
const HeadlinesSchema = z.object({
  pain: z.array(z.string().max(200)).default(["Where did that", "request go?"]),
  resolution: z.array(z.string().max(200)).default(["Every request.", "Tracked."]),
  closer: z.array(z.string().max(200)).default(["Try it free."]),
  // ...
});
```

**Option C — Visual editor:**
Studio includes a visual editor overlay. Click any headline, window, or CTA directly in the preview to select it, then edit text and properties in the floating panel. Drag to move or resize windows.

## 5. Add your product screenshots

Drop PNG files into `public/screenshots/`:

```
public/screenshots/
  dashboard.png
  feature-catalog.png
  settings.png
```

Use them in scenes:

```tsx
import { Img, staticFile } from "remotion";
<Img src={staticFile("screenshots/dashboard.png")} />
```

## 6. Adjust timing and scene order

Scene configuration (enabled, duration, enter/exit directions) lives in `src/schema.ts` as `DEFAULT_SCENES`, and is editable in the Studio props panel under `scenes`:

```ts
{ id: "chaos", enabled: true, durationInFrames: 260, enterFrom: "none", exitTo: "top" },
{ id: "product-reveal", enabled: true, durationInFrames: 150, enterFrom: "bottom", exitTo: "right" },
// ... toggle enabled, change durations, set enter/exit directions
```

`content.ts` also has a `SCENES` array, but it only holds camera timeline timing (`SceneTiming` with `id` + `durationInFrames`). Keep both in sync when changing durations.

Frames = seconds x 30.

## 7. Render

```bash
npm run build
```

Outputs an MP4 in the `out/` directory.

## Using with Claude

Open the project in Claude Code. The included `.claude/CLAUDE.md` skill teaches Claude the full API. Try:

- *"Add a new scene showing my billing page screenshot"*
- *"Change the brand colors to match our website"*
- *"Add cursor animation that clicks through three tabs"*

## Next steps

- [Engine API](ENGINE.md) — layout, cursor, camera, audio reference
- [Scenes](SCENES.md) — how to create and customize scenes
- [Customization](CUSTOMIZATION.md) — fonts, screenshots, music
