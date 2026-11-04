# Changelog

## 0.2.0 — 2026-11-04

A reliable path from a preset and real product content to a saved, customized export.

- Fix the native Studio save reducer so unrelated edits survive; serialize saves and show errors.
- Keep Root props compatible with Remotion's file writer and add validated project load/export commands with backups.
- Render imported descriptors, screenshots and muted recordings in product scenes, including per-feature media and crop controls.
- Connect scene duration, overlap, transitions and backgrounds to saved configuration. Store cursor actions relative to their scene; derive panel responses from edited click times.
- Apply brand colors, fonts, logo, CTA, easing and a shared SFX master. Load only required font weights/subsets.
- Preserve window proportions across output formats and scale descriptor typography with window geometry.
- Add 15s feature, 30s walkthrough and 20s before/after presets, three output formats, focused feature content, headline fitting and content warnings.
- Validate all descriptor imports; add offline JSON import and a configurable Anthropic model.
- Remove the unused defaults file and backup prop server. Replace misleading “e2e” naming with wiring tests; add native writer, component and render verification.
- Replace the editor recording with a finished demo, include reproducible examples, and document exact edit/export workflows.

Existing projects keep legacy cursor entries without `sceneId` as absolute timestamps. New presets use scene-local entries. Use `project --load` before editing JSON projects; Studio `--props` overrides can mask saved changes. Available fonts are now explicit choices; add a custom font to the schema and loader together.
