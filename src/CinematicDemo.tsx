import React, { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CameraRig, AudioManager, getSceneStartFrame } from "./engine";
import type { SceneTiming } from "./engine";
import type { AudioCue } from "./engine";
import { CAMERA_TIMELINE, SFX_TIMELINE } from "./content";
import { Wallpaper } from "./primitives";
import { VideoPropsProvider } from "./VideoPropsContext";
import { EditorOverlay } from "./editor";
import type { CinematicProps } from "./schema";
import "./fonts";
import {
  ChaosDesktop,
  ProductReveal,
  FeatureShowcase,
  HeadlineResolution,
  Closer,
} from "./scenes";
import { DynamicWindows } from "./scenes/DynamicWindows";

const SCENE_COMPONENTS: Record<string, React.FC> = {
  "chaos": ChaosDesktop,
  "product-reveal": ProductReveal,
  "feature-showcase": FeatureShowcase,
  "headline-resolution": HeadlineResolution,
  "closer": Closer,
};

export const CinematicDemo: React.FC<CinematicProps> = (props) => {
  const enabledScenes: SceneTiming[] = useMemo(
    () =>
      props.scenes
        .filter((s) => s.enabled)
        .map((s) => ({ id: s.id, durationInFrames: s.durationInFrames })),
    [props.scenes],
  );

  const sfxTimeline: AudioCue[] = useMemo(
    () =>
      props.sfxEnabled
        ? SFX_TIMELINE.map((cue) => ({ ...cue, volume: (cue.volume ?? 1) * props.sfxVolume }))
        : [],
    [props.sfxEnabled, props.sfxVolume],
  );

  const musicConfig = useMemo(
    () =>
      props.music.enabled
        ? {
            src: "music/background.mp3",
            volume: props.music.volume,
            fadeInFrames: props.music.fadeInFrames,
            fadeOutFrames: props.music.fadeOutFrames,
          }
        : undefined,
    [props.music],
  );

  return (
    <VideoPropsProvider value={props}>
      <EditorOverlay>
      <AbsoluteFill>
        <Wallpaper variant="dark" />
        <CameraRig
          timeline={CAMERA_TIMELINE}
          scenes={enabledScenes}
          overlap={props.overlap}
        >
          {enabledScenes.map((scene) => {
            const Component = SCENE_COMPONENTS[scene.id];
            if (!Component) return null;
            const from = getSceneStartFrame(enabledScenes, scene.id, props.overlap);
            return (
              <Sequence
                key={scene.id}
                from={from}
                durationInFrames={scene.durationInFrames}
                layout="none"
              >
                <Component />
                <DynamicWindows sceneId={scene.id} />
              </Sequence>
            );
          })}
        </CameraRig>
        {musicConfig && (
          <AudioManager
            music={musicConfig}
            sfxTimeline={sfxTimeline}
            scenes={enabledScenes}
            overlap={props.overlap}
            duckMusicDuring={[
              { startFrame: 150, endFrame: 260, duckedVolume: 0.12 },
              { startFrame: 565, endFrame: 685, duckedVolume: 0.12 },
            ]}
          />
        )}
      </AbsoluteFill>
      </EditorOverlay>
    </VideoPropsProvider>
  );
};
