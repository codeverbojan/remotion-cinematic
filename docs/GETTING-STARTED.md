# Getting Started

Get a cinematic product demo video running in 5 minutes.

## Prerequisites

- Node.js 18+
- npm 9+

## 1. Clone and install

```bash
npx degit your-org/remotion-cinematic my-video
cd my-video
npm install
```

## 2. Preview in Remotion Studio

```bash
npm run studio
```

Opens a browser at `http://localhost:3000` with the 25-second demo video. Scrub the timeline, play, and inspect individual frames.

## 3. Set your brand

Edit `src/tokens.ts`:

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

All text lives in `src/content.ts`. Change headlines, demo data, and scene order:

```ts
export const HEADLINES = {
  pain: ["Your pain point", "question here?"],
  resolution: ["Your solution.", "Statement."],
  closer: ["Try it free."],
} as const;
```

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

## 6. Adjust timing

Scene durations are in `content.ts` (frames = seconds x 30):

```ts
export const SCENES: SceneTiming[] = [
  { id: "chaos", durationInFrames: 260 },               // ~8.7s
  { id: "product-reveal", durationInFrames: 150 },      // 5s
  { id: "feature-showcase", durationInFrames: 200 },    // ~6.7s
  { id: "headline-resolution", durationInFrames: 120 }, // 4s
  { id: "closer", durationInFrames: 90 },               // 3s
];
```

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
