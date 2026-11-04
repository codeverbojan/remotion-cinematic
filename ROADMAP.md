# Reliability and adoption milestones

Active goal: close the November 2026 audit findings and make the first customized export dependable.

| Milestone | Tasks | Acceptance evidence | Status |
|---|---|---|---|
| M1 — Reliable saving | Fix reducer contract; preserve consecutive edits; show save errors; remove backup server and unused defaults | Persistence regression tests, typecheck | Verified locally |
| M2 — Real product content | Render imported descriptors; screenshot/recording inputs with focus and fit; validate imports before writing | Import-to-scene integration checks; real media preview | Verified with component tests and media frames |
| M3 — Consistent controls | Shared scene configuration; scene-relative cursor actions; linked UI responses; theme/fonts/logo/CTA/easing; global SFX policy | Retiming/removal/control regressions and rendered frames | Verified with regressions and frame renders |
| M4 — Useful outputs | Feature announcement, walkthrough, before/after presets; landscape/portrait/square layouts; text fit and content warnings | Three exported examples, representative format frames | Initial exports passed; sizing correction under review |
| M5 — Verified first-use workflow | Save/reload/render tests; resolve failing waypoint expectation; single-worker CI; clean-install and render smoke checks | Passing checks and recorded visual review | Clean install and hosted exports passed; sizing regressions added |
| M6 — Discovery and release | Outcome-led README; exact quickstart; tutorials; showcase/help forms; demo assets; changelog; release and GitHub metadata preparation | Links and instructions checked; concrete publication bundle | Docs and release materials in progress |

Process discipline: one project stack and one automation browser maximum; preserve unrelated services; close owned processes after each verification. Publication follows a concrete, verified local release.

## Audit baseline

- 531 tests passed; one waypoint test failed. Typechecking passed.
- Save handler reset unrelated customized props in a focused reproduction.
- Imported app descriptors were not rendered by any scene.
- Timing, transitions, fonts/logo/easing, CTA and SFX controls were partly disconnected.
- Public CI failed; no releases, homepage, or template-repository setting.
- README preview was a 61-second, 8 MB editor recording with placeholder content.

## Evidence and remaining work

- Native Remotion file-writer integration verifies preset load, consecutive saved edits, and reload; schema validation rejects invalid projects before writing.
- The baseline failed waypoint expectation was confirmed as the public CI failure via GitHub check annotations. Future click targets intentionally remain editable before their entrance.
- Landscape, portrait and square frames rendered and were visually inspected; this exposed and fixed off-canvas geometry and unreadable repeated dashboards.
- Full local exports encountered Remotion's bundled FFmpeg/macOS 12.5 incompatibility. Hosted Linux CI now renders all three videos including audio; the initial run passed at https://github.com/codeverbojan/remotion-cinematic/actions/runs/41846593463.
- User review found stretched windows and undersized UI. Window ratios are now preserved, interface typography scales with geometry, and new aspect-ratio tests cover all three formats. Revised full exports are pending.
- Temporary renderer browsers and servers were closed; unrelated services remain untouched.

## Next feature work (outside this reliability release)

- A visual keyframe timeline and richer animation tools.
- Additional scene types: testimonials, pricing, mobile showcases, comparisons.
- A richer Figma plugin; the current CLI is a heuristic reconstruction path.
- More explicit descriptor interactions and accessible editing controls.

## Adoption baseline — retrieved 2026-11-04

GitHub's reported window is October 21–November 3, 2026: 251 views from 167 unique visitors; 163 clones from 136 unique cloners. Google accounts for 93 referred views from 76 unique visitors, GitHub for 12/9, aocr.org for 8/8, and Brave for 1/1. These are GitHub traffic counts, not confirmed users or finished exports. The README should serve visitors arriving from search as well as developers already familiar with Remotion.

## Adoption measurements

Track weekly GitHub traffic and referring sites (where permissions allow), clones, forks with actual project changes, first-export help requests, and submitted videos. Stars alone do not establish usage. Record time to the first useful export from showcase/help responses. No telemetry is added to users' projects.

The release's success is a user loading a preset, adding their product, saving edits, and exporting a useful video without reading engine code. The tutorials, samples and regression checks support that path.
