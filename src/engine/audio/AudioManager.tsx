import React, { useCallback, useMemo } from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import type { SceneTiming } from "../types";
import { computeMusicVolume, resolveCues } from "./resolveCues";
import type { AudioCue, DuckingRange, MusicConfig } from "./types";

interface AudioManagerProps {
  music?: MusicConfig;
  sfxTimeline?: AudioCue[];
  scenes: SceneTiming[];
  overlap?: number;
  duckMusicDuring?: DuckingRange[];
}

export const AudioManager: React.FC<AudioManagerProps> = ({
  music,
  sfxTimeline = [],
  scenes,
  overlap = 0,
  duckMusicDuring = [],
}) => {
  const { durationInFrames } = useVideoConfig();

  const resolvedCues = useMemo(
    () => resolveCues(sfxTimeline, scenes, overlap),
    [sfxTimeline, scenes, overlap],
  );

  const baseVol = music?.volume ?? 0.5;
  const fadeIn = music?.fadeInFrames ?? 30;
  const fadeOut = music?.fadeOutFrames ?? 60;

  const musicVolumeCallback = useCallback(
    (f: number) =>
      computeMusicVolume(f, durationInFrames, baseVol, fadeIn, fadeOut, duckMusicDuring),
    [durationInFrames, baseVol, fadeIn, fadeOut, duckMusicDuring],
  );

  return (
    <>
      {music && (
        <Audio
          src={staticFile(music.src)}
          volume={musicVolumeCallback}
          loop
        />
      )}
      {resolvedCues.map((cue, i) => (
        <Sequence
          key={`${cue.sfx}-${cue.frame}-${i}`}
          from={cue.frame}
          durationInFrames={cue.durationInFrames ?? 60}
          layout="none"
        >
          <Audio
            src={staticFile(cue.sfx)}
            volume={cue.volume}
          />
        </Sequence>
      ))}
    </>
  );
};
