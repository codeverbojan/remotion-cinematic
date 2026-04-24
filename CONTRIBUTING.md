# Contributing

Thanks for your interest in contributing to remotion-cinematic!

## Getting Started

1. Fork the repo and clone your fork
2. Install dependencies: `npm install`
3. Start the dev environment: `npm run studio`
4. Run tests: `npm test`
5. Run type checks: `npm run typecheck`

## Development Workflow

1. Create a branch from `main` for your changes
2. Make your changes — keep PRs focused on a single concern
3. Ensure all tests pass and types check
4. Submit a pull request

## What to Contribute

- New scenes or scene patterns
- New app-ui primitives
- Bug fixes
- Documentation improvements
- Test coverage

## Code Style

- TypeScript strict mode
- No `Math.random()` — Remotion requires deterministic rendering
- Use `EASE.snappy` from `tokens.ts` for animations (not raw `Easing` imports)
- Guard against zero-duration: `Math.max(1, duration)`
- Keep scenes under ~200 lines; extract reusable pieces into `primitives/`

## Project Structure

- `src/engine/` — core motion engine (layout, cursor, camera, audio, choreography)
- `src/primitives/` — reusable visual components
- `src/scenes/` — scene components
- `src/editor/` — visual editor overlay (Studio-only)
- `src/schema.ts` — Zod schema for all input props

## Testing

Run the full suite with `npm test`. Tests live next to their source files as `*.test.ts` / `*.test.tsx`.

## Questions?

Open an issue for questions, bugs, or feature requests.
