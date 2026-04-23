# remotion-cinematic

A Remotion template for building cinematic product demo videos. Smart layout engine, geometry-aware cursor, scene-relative camera — all wired up and ready to customize.

Clone it, drop in your product screenshots, and use Claude to build your video.

![Demo preview](docs/assets/demo-preview.gif)

## What you get

- **Zone-based layout engine** — declare named regions, windows auto-position and avoid reserved areas
- **Geometry-aware cursor** — targets real elements by ID, arc-interpolated movement, click/drag/resize
- **Scene-relative camera** — keyframes reference scene names, not absolute frame numbers
- **Audio manager** — music bed with auto-fade, SFX cues with volume ducking
- **Push transitions** — continuous scene-to-scene slides, no fades or cuts
- **Per-scene zoom** — AutoZoom targets elements by ID for smooth, subtle focus shifts
- **5 example scenes** — chaos desktop, product reveal, feature showcase, headline, end card
- **Claude skill** — `.claude/CLAUDE.md` teaches Claude how to build scenes with this template

## Quickstart

```bash
npx degit your-org/remotion-cinematic my-video
cd my-video
npm install
npm run studio
```

Open `http://localhost:3000` and scrub through the 25-second demo video.

## Customize

1. **Brand colors + fonts** — edit `src/tokens.ts`
2. **Scene content** — edit `src/content.ts` (all copy, timing, scene order)
3. **Add scenes** — create files in `src/scenes/`, wire in `CinematicDemo.tsx`
4. **Product screenshots** — drop PNGs in `public/screenshots/`
5. **Music + SFX** — drop audio in `public/music/` and `public/sfx/`

## Project structure

```
src/
  engine/           Layout, cursor, camera, audio systems
  primitives/       Window, Headline, EndCard, Enter, Wallpaper, ScenePush
  scenes/           5 example scenes (edit or replace these)
  content.ts        All copy, scene order, timing
  tokens.ts         Colors, fonts, canvas size
  CinematicDemo.tsx Main composition wiring
public/
  music/            Background music tracks
  sfx/              Sound effects (ui/, transitions/)
  screenshots/      Product screenshots
```

## Using with Claude

This template includes a Claude skill at `.claude/CLAUDE.md`. When you open the project with Claude Code, Claude knows the full API and can:

- Add new scenes from a description
- Wire up cursor choreography
- Set up camera keyframes
- Integrate your product screenshots
- Adjust timing and transitions

Example: *"Add a feature showcase scene that walks through three screenshots of my billing page"*

## Commands

```bash
npm run studio     # Preview in Remotion Studio
npm run build      # Render final MP4
npm test           # Run tests
npm run typecheck  # TypeScript check
```

## Docs

- [Getting Started](docs/GETTING-STARTED.md) — 5-minute setup guide
- [Engine API](docs/ENGINE.md) — layout, cursor, camera, audio reference
- [Scenes](docs/SCENES.md) — how to create and customize scenes
- [Customization](docs/CUSTOMIZATION.md) — tokens, fonts, screenshots, music

## Tech stack

- [Remotion](https://remotion.dev) 4.x — React-based video framework
- React 19 + TypeScript 5.9
- 1920x1080 @ 30fps
- Vitest for testing

## License

MIT
