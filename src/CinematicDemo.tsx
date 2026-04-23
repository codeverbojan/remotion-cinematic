import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CameraRig, AudioManager, getSceneStartFrame } from "./engine";
import { SCENES, SCENE_OVERLAP, CAMERA_TIMELINE, SFX_TIMELINE } from "./content";
import { Wallpaper } from "./primitives";
import "./fonts";
import {
  ChaosDesktop,
  ProductReveal,
  FeatureShowcase,
  HeadlineResolution,
  Closer,
} from "./scenes";

const SCENE_COMPONENTS: Record<string, React.FC> = {
  "chaos": ChaosDesktop,
  "product-reveal": ProductReveal,
  "feature-showcase": FeatureShowcase,
  "headline-resolution": HeadlineResolution,
  "closer": Closer,
};

export const CinematicDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Wallpaper variant="dark" />
      <CameraRig
        timeline={CAMERA_TIMELINE}
        scenes={SCENES}
        overlap={SCENE_OVERLAP}
      >
        {SCENES.map((scene) => {
          const Component = SCENE_COMPONENTS[scene.id];
          if (!Component) return null;
          const from = getSceneStartFrame(SCENES, scene.id, SCENE_OVERLAP);
          return (
            <Sequence
              key={scene.id}
              from={from}
              durationInFrames={scene.durationInFrames}
              layout="none"
            >
              <Component />
            </Sequence>
          );
        })}
      </CameraRig>
      <AudioManager
        music={{ src: "music/background.mp3", volume: 0.35, fadeInFrames: 45, fadeOutFrames: 90 }}
        sfxTimeline={SFX_TIMELINE}
        scenes={SCENES}
        overlap={SCENE_OVERLAP}
        duckMusicDuring={[
          { startFrame: 150, endFrame: 260, duckedVolume: 0.12 },
          { startFrame: 565, endFrame: 685, duckedVolume: 0.12 },
        ]}
      />
    </AbsoluteFill>
  );
};
