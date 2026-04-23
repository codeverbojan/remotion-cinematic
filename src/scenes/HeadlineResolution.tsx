import React from "react";
import { Headline, ScenePush } from "../primitives";
import { HEADLINES, SCENE_OVERLAP, TRANSITION_SFX } from "../content";

const DURATION = 120;

export const HeadlineResolution: React.FC = () => {
  return (
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="top" enterSfx={TRANSITION_SFX} background="gradient">
      <Headline
        lines={HEADLINES.resolution}
        fontSize={110}
        lineDelay={18}
        entranceDuration={12}
        yRise={80}
        wordStream={{ stagger: 3, duration: 5, yRise: 50 }}
      />
    </ScenePush>
  );
};
