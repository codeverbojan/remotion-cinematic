# Sound Effects

SFX organized by category. The framework auto-plays most sounds based on actions — no manual frame timing needed.

## Included files

```
sfx/
  ui/                    # UI interaction sounds
    click.mp3            # Mouse click (0.4s) — auto-played by Cursor on click/drag
    typing.mp3           # Keyboard typing (8s) — use for chat/spreadsheet activity
    notification.mp3     # Ding (1.7s) — use for notification popups
    pop.mp3              # Bubble pop (1.1s) — use for window/element appearance
  transitions/           # Scene transition sounds
    whoosh.mp3           # Whoosh (0.6s) — auto-played by ScenePush on enter
    impact.mp3           # Thud impact (1.4s) — use for dramatic moments
    boom.mp3             # Cinematic boom (2.1s) — use for big reveals
```

## How SFX are played

### Automatic (framework-driven)
- **Cursor clicks/drags** — `CURSOR_SFX` in content.ts maps action types to sounds. Fires for every cursor action in every scene.
- **Scene transitions** — `TRANSITION_SFX` in content.ts. Pass via `enterSfx` prop to `ScenePush`.

### Manual (scene-specific)
For sounds tied to specific scene events (notification dings, typing during activity), use `Sequence` + `Audio` directly:

```tsx
import { Audio, Sequence, staticFile } from "remotion";
import { SFX } from "../content";

<Sequence from={90} durationInFrames={SFX.notification.durationInFrames} layout="none">
  <Audio src={staticFile(SFX.notification.src)} volume={SFX.notification.volume} />
</Sequence>
```

The `SFX` object in content.ts provides pre-configured entries for all included sounds.

## Adding new sounds

1. Place MP3 in the appropriate subdirectory (`ui/` or `transitions/`)
2. Add an entry to the `SFX` object in `src/content.ts`
3. Use it in scenes via `Sequence` + `Audio`, or wire into `CURSOR_SFX`/`TRANSITION_SFX`

## Requirements

- **Format**: MP3 (recommended) or WAV
- **Sample rate**: 44.1kHz or higher
- **Licensing**: only include royalty-free or properly licensed files
- Keep files short: under 3s for UI sounds, under 5s for transitions
