# Customize content and output

Load a project with `npm run project -- --load=examples/feature.json`, then start `npm run studio`. Edit props in Studio or export a JSON project, edit it, and load it again. The schema in `src/schema.ts` is the complete field reference.

## Screenshots and recordings

Put media below `public/`. This example uses a muted recording beginning at frame 30:

```json
{
  "productMedia": {
    "type": "video",
    "src": "screenshots/walkthrough.mp4",
    "fit": "contain",
    "focusX": 50,
    "focusY": 50,
    "zoom": 1,
    "startFrom": 30
  }
}
```

Use `type: "image"` for screenshots. Each `productFeatures` entry and added window can have its own `media` object. The main window uses `productMedia`; features prefer their own media and fall back to it. Without media, scenes render `appDescriptor` and focused feature cards. Clear the media field when switching to descriptor content.

`contain` shows the entire source. `cover` fills the window and may crop edges. `focusX`/`focusY` are percentages; `zoom` magnifies around that point. Keep text large enough to read at the intended viewing size. Images and recordings do not acquire interactive DOM controls; scripted cursor actions can point at their enclosing windows.

## Brand and copy

Use `brand.colors` for the palette throughout the composition. `brand.logoUrl` accepts a public-relative path or HTTPS URL. Bundled fonts are Inter, Fraunces and JetBrains Mono, loaded only in normal style with the Latin subset and required weights. System font choices are also available. For other fonts or scripts, update `src/fonts.ts` and `FONT_NAMES` in `src/schema.ts` together.

`headlines.pain`, `resolution` and `closer` are arrays of lines. `cta` controls the separate end-card button. Font size overrides are upper bounds: headlines fit down to the canvas. Content warnings suggest shorter copy or longer scenes, but do not replace checking the exported frames.

`outputFormat` chooses landscape (1920×1080), portrait (1080×1920), or square (1080×1080). Built-in product windows reflow for portrait and square. Custom window sizes scale uniformly from `layoutCanvas` to preserve their aspect ratio; positions adapt to the new canvas. Descriptor interfaces and typography scale together inside each window; inspect them and save adjustments after a format change. Repeated format switches preserve the current layout rather than restoring an earlier layout. For a fresh layout, generate a new preset in the desired format.

## Motion and sound

`scenes` controls sequence order, enabled state, duration, transition directions and background. `overlap: 0` gives immediate cuts. Window entrance and movement timings are relative to their scene. Cursor entries with `sceneId` also store local time; the editor displays composition time and converts on save.

The global `easing` preset drives scene pushes, window motion, cursor easing and camera movement. Components with bespoke internal animation may define their own curves. `music.enabled` and `music.volume` control the music bed. `sfxEnabled` and `sfxVolume` cover all built-in cursor, window and transition sounds independently of music. Replace `public/music/background.mp3` to use another track; SFX sources are listed in `src/content.ts`.

## Import structured app content

A JSON descriptor reconstructs supported UI: sidebars, navigation, stats, tables, lists and messages. It is a starting point, not a pixel-perfect Figma or screenshot conversion. For exact appearance, use the image or recording directly.

```bash
# Offline: validate an existing descriptor and load it into the current project
npm run import -- --json=descriptor.json --inject

# Figma API: supply a frame URL with node-id; FIGMA_TOKEN must be set
npm run import -- --figma-url="https://www.figma.com/design/FILE/App?node-id=1-2" --inject

# AI reconstruction: ANTHROPIC_API_KEY must be set
npm run import -- --screenshot=./dashboard.png --out=descriptor.json
npm run import -- --json=descriptor.json --inject
```

Exactly one source is accepted. All outputs are checked against `LayoutDescriptorSchema` before writing. `--inject` backs up Root to `src/Root.tsx.bak`. File output through `--out` replaces that file. Screenshot reconstruction sends the image to Anthropic and uses its API; set `ANTHROPIC_MODEL` to choose a model supported by your account. The default remains `claude-sonnet-4-20250514`. Charts or unsupported visuals may be represented by placeholders; replace them with real media.

## Recipes

**A launch post:** generate `feature` in portrait format; use one dashboard and two detail images; end with one short benefit and a concrete CTA.

**A product walkthrough:** load `examples/walkthrough.json`; replace pain and resolution copy, media, and feature titles; adjust scene durations until each interaction has time to register.

**A before/after story:** load `examples/before-after.json`; customize the initial scattered-work scene and use your product as the organized result. The supplied Relay screens are fictional example assets.

[Scene authoring](SCENES.md) explains custom interactions. [Engine reference](ENGINE.md) covers lower-level animation APIs.
