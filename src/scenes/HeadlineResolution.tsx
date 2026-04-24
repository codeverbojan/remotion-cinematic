import React from "react";
import { Headline, ScenePush } from "../primitives";
import { SCENE_OVERLAP, TRANSITION_SFX } from "../content";
import { useHeadlines } from "../VideoPropsContext";

const DURATION = 120;

export const HeadlineResolution: React.FC = () => {
  const headlines = useHeadlines();

  return (
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="top" enterSfx={TRANSITION_SFX} background="gradient">
      <Headline
        lines={headlines.resolution}
        fontSize={headlines.resolutionFontSize ?? 110}
        color={headlines.color}
        lineDelay={18}
        entranceDuration={12}
        yRise={80}
        wordStream={{ stagger: 3, duration: 5, yRise: 50 }}
        headlineKey="resolution"
      />
    </ScenePush>
  );
};
