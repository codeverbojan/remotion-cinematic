# v0.2.0 — Reliable product video exports

Released November 4, 2026. [Download v0.2.0](https://github.com/codeverbojan/remotion-cinematic/releases/tag/v0.2.0).

Make a product demo from screenshots, recordings or app data, starting with a 15-second feature announcement, a 30-second walkthrough, or a 20-second before/after story.

## What changed

- Studio saves preserve consecutive edits and report save errors.
- Imported descriptors, screenshots and recordings appear in the product scenes; customization controls affect the export.
- Landscape, portrait and square layouts preserve window proportions and scale the content with the windows.
- Validated project commands, complete examples and tutorials make the first customized export reproducible.

See [CHANGELOG.md](../CHANGELOG.md) for the complete changes and [ROADMAP.md](../ROADMAP.md) for the audit findings and verification evidence.

## Try an example

```bash
npm ci
npm run project -- --load=examples/feature.json
npm run studio
```

Edit the product and brand, stop Studio, then run `npm run build`. See [the first video tutorial](GETTING-STARTED.md) for setup requirements and the complete workflow.

## Downloads and verification

The release includes three MP4s, matching JSON projects, preview images, a GIF and SHA256 checksums. Browse the [example gallery](../examples/README.md) for direct video downloads. Example brands and data are fictional; no API credentials are needed.

The downloadable videos use two-thirds resolution: 1280×720, 720×1280 and 720×720. Normal rendering uses the full configured resolution: 1920×1080, 1080×1920 and 1080×1080.

Assets come from [CI run 41852182623](https://github.com/codeverbojan/remotion-cinematic/actions/runs/41852182623), which passed typechecking, all 554 tests, three full video exports with audio, actual recording input and GIF generation. Publication edits after that run only update documentation. The implementation is in [PR #1](https://github.com/codeverbojan/remotion-cinematic/pull/1).

## Existing projects

Load a JSON project before editing; launching Studio with `--props` can override saved changes. Saves update Root's inline default props. New cursor entries use scene-local timing; older entries without `sceneId` retain absolute timing. Available fonts are explicit choices; add custom fonts to the schema and loader together.

Older macOS versions may fail in Remotion's bundled audio/video tools. Full exports were verified on Linux; use a supported rendering environment.

## Share your results

Use the [showcase form](https://github.com/codeverbojan/remotion-cinematic/issues/new?template=showcase.yml) to share a finished video, or the [help form](https://github.com/codeverbojan/remotion-cinematic/issues/new?template=help.yml) if setup or export fails. The next adoption review will consider completed videos and first-export friction alongside GitHub traffic and clones.
