# Music

Background music tracks for the video.

## Requirements

- **Format**: MP3 or WAV
- **Sample rate**: 44.1kHz or higher
- **Style**: loop-friendly ambient tracks work best
- **Licensing**: only include royalty-free or properly licensed tracks

## Usage

Reference in `src/CinematicDemo.tsx` via the `AudioManager` component:

```tsx
<AudioManager
  music={{ src: "music/your-track.mp3", volume: 0.4, fadeInFrames: 30, fadeOutFrames: 60 }}
  sfxTimeline={SFX_TIMELINE}
  scenes={SCENES}
/>
```

Paths are relative to `public/` and resolved via Remotion's `staticFile()`.
