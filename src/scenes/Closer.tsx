import React from "react";
import { EndCard, ScenePush } from "../primitives";
import { SCENE_OVERLAP, TRANSITION_SFX } from "../content";
import { F } from "../tokens";
import { useBrand, useHeadlines, useVideoProps } from "../VideoPropsContext";

const DURATION = 90;

const DemoLogo: React.FC = () => {
  const brand = useBrand();
  const color = brand.colors.primary;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: F.sans,
        fontWeight: 700,
        fontSize: 32,
        color,
        letterSpacing: "-0.02em",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontSize: 24,
          fontWeight: 800,
        }}
      >
        {brand.name.charAt(0)}
      </div>
      {brand.name}
    </div>
  );
};

export const Closer: React.FC = () => {
  const headlines = useHeadlines();
  const props = useVideoProps();
  const { cta, brand } = props;

  return (
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="none" enterSfx={TRANSITION_SFX} background="light">
      <EndCard
        tagline={brand.name}
        cta={headlines.closer[0] ?? cta}
        entranceDelay={5}
        entranceDuration={18}
        logo={<DemoLogo />}
        backgroundColor={brand.colors.backgroundLight}
        textColor={brand.colors.text}
        accentColor={brand.colors.primary}
      />
    </ScenePush>
  );
};
