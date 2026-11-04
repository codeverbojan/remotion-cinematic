# 0.2.0 release preparation

The release fixes the first customized export: preserved Studio edits, actual product media and descriptor content, connected controls, three presets and three output formats. See [CHANGELOG.md](../CHANGELOG.md) for migration notes and [ROADMAP.md](../ROADMAP.md) for verification evidence.

## Verified review bundle

The regression suite, typecheck, all three full MP4s with audio, and actual recording input passed in [the sizing verification run](https://github.com/codeverbojan/remotion-cinematic/actions/runs/41849106892). The draft [PR #1](https://github.com/codeverbojan/remotion-cinematic/pull/1) holds the complete changes. CI generates the same preview assets alongside its example artifacts.

The prepared local bundle is `out/release-v0.2.0/`: three MP4s, matching JSON projects, release notes and SHA256 checksums. Example exports use two-thirds scale for review; normal project rendering uses full configured resolution. No external API credentials were needed for these examples.

## Publication order

1. Review the change set and the CI-rendered videos; require a passing CI run.
2. Merge the reviewed implementation to main.
3. Tag `v0.2.0` and create a GitHub release using the description below, attaching the three MP4s and JSON examples.
4. Enable the repository's template setting and use the gallery as the homepage after it is on main.

Template repositories expose GitHub's “Use this template” workflow; this is an admin repository setting ([GitHub documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)).

Proposed repository description:

> Create product demo videos from screenshots, recordings or app data. Editable Remotion presets for landscape, portrait and square.

Homepage after merge: `https://github.com/codeverbojan/remotion-cinematic/tree/main/examples`

Topics: `remotion`, `product-demo`, `video-template`, `video-generation`, `screenshots`, `react`, `typescript`, `saas`.

## Release description

Make a useful product demo from your own screenshots or recordings, with a 15s feature announcement, a 30s walkthrough, or a 20s before/after story.

This release fixes saved edits being reset, connects imported app content and customization controls, and adds landscape, portrait and square layouts. Included examples show the actual exported output. Start with `npm ci`, load an example with `npm run project -- --load=examples/feature.json`, then run `npm run studio`.

Changes save into Root's inline default props. Load a JSON project before editing; launching Studio with `--props` can override saved edits. New cursor entries use scene-local timing. Older macOS versions may fail in Remotion's bundled audio/video tools; use a supported rendering environment.

## After release

Use the showcase and help issue forms to collect completed videos, setup friction, and time to first export. Check GitHub traffic, referrals and clones weekly alongside those outcomes. Revisit copy and tutorials using that evidence. Do not treat stars or unchanged forks as proof of active use.
