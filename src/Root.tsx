import React from "react";
import { Composition } from "remotion";
import { SCENES, SCENE_OVERLAP } from "./content";
import { getTotalFrames } from "./engine/types";
import { CANVAS, FPS } from "./tokens";
import { CinematicDemo } from "./CinematicDemo";

export const RemotionRoot: React.FC = () => {
  const total = getTotalFrames(SCENES, SCENE_OVERLAP);

  return (
    <>
      <Composition
        id="CinematicDemo"
        component={CinematicDemo}
        durationInFrames={total}
        fps={FPS}
        width={CANVAS.width}
        height={CANVAS.height}
      />
    </>
  );
};
