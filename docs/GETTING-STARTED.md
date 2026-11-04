# Your first customized export

Use Node.js 20+ and npm. This Remotion version expects macOS 15+ for its bundled rendering tools; Linux is used for CI. On older macOS, preview/frame rendering may work while audio/video export fails. Start from the repository's locked dependencies:

```bash
git clone https://github.com/codeverbojan/remotion-cinematic.git my-video
cd my-video
npm ci
npm run project -- --load=examples/feature.json
npm run studio
```

Reuse an already running Studio for this project. Open the URL printed in the terminal; there is no separate prop server.

## 1. Make the example yours

In Studio's props panel, change `brand.name`, `brand.colors.primary`, `headlines.closer` and `cta`. They control separate parts of the final card. Scrub near the end to see the result. Double-clicking titles and CTA text also saves edits. The overlay shows saving, saved, or an error.

Settings live in the inline `defaultProps` object in `src/Root.tsx`. Keep it as an object: Remotion's native save writer requires this form. `src/schema.ts` supplies defaults for new projects, not a second saved project.

## 2. Add your own screenshots

Put three images in `public/screenshots/`, then stop Studio and run:

```bash
npm run init-video -- --preset=feature --format=portrait --name="Acme" --screenshots=screenshots/dashboard.png,screenshots/details.png,screenshots/activity.png --out=video.json
npm run project -- --load=video.json
npm run studio
```

Use paths relative to `public/`. One image also works; it is reused where separate feature media is absent. Use separate detail crops to keep small windows readable. `productMedia.fit=contain` preserves the full screenshot; `cover`, `focusX`, `focusY` and `zoom` let you emphasize a detail.

`init-video` creates a new file without overwriting existing work. `project --load` validates before writing and saves the previous Root file as `src/Root.tsx.bak`. This backup is replaced by the next load; use Git or export JSON to keep multiple versions.

## 3. Check the story

Scrub through every scene and transition. Read the headline aloud, confirm each cursor target exists, and check the first and last frame. Content warnings flag actions extending beyond a scene and insufficient reading time. They are estimates, so inspect the actual video too.

Scene durations and window timings are in frames: 30 frames is one second. Cursor entries with `sceneId` use time relative to that scene. Changing scene order preserves those local actions; shortening a scene may require retiming them.

## 4. Export the edits you saw

Stop Studio with Ctrl+C, then:

```bash
npm run build
npm run project -- --export=my-edited-video.json
```

The MP4 is `out/video.mp4`; the JSON stores saved settings for reuse. The build command overwrites the prior MP4. Export refuses to overwrite an existing JSON file.

For a direct, reproducible export without editing Studio settings:

```bash
npm run build -- --props=examples/before-after.json
```

Avoid launching Studio with `--props` when you want to edit: those overrides take precedence over saved default props. Load the file with `npm run project -- --load=...` instead.

## Troubleshooting

| Symptom | Check |
|---|---|
| Edit disappears | Remove `--props` from Studio; use `project --load`, then check the save status |
| Screenshot fails | Verify the file exists below `public/` and the path is relative to that directory |
| Import seems invisible | Clear `productMedia` or per-feature `media` to see the reconstructed descriptor |
| Wrong cursor time after edits | Set `sceneId` and use scene-local `at`; legacy entries without it use absolute time |
| Render stalls at font/browser loading | Allow the initial Chrome download and Google Fonts network requests |
| Video takes too much memory | Keep the default single worker; close duplicate Studio/browser instances |
| Blank output | Enable a known scene (`product-reveal`, `chaos`, `feature-showcase`, `headline-resolution`, `closer`) |

[Ask for help](https://github.com/codeverbojan/remotion-cinematic/issues/new?template=help.yml) with your Node version, command, error text and a small sanitized JSON project.
