import React from "react";
import { EndCard, ScenePush } from "../primitives";
import { HEADLINES, SCENE_OVERLAP, TRANSITION_SFX } from "../content";
import { C, F } from "../tokens";

const DURATION = 90;

const DemoLogo: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontFamily: F.sans,
      fontWeight: 700,
      fontSize: 32,
      color: C.brand,
      letterSpacing: "-0.02em",
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: C.brand,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: 800,
      }}
    >
      P
    </div>
    Product
  </div>
);

export const Closer: React.FC = () => {
  return (
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="none" enterSfx={TRANSITION_SFX} background="light">
      <EndCard
        tagline="Your Product Name"
        cta={HEADLINES.closer[0]}
        entranceDelay={5}
        entranceDuration={18}
        logo={<DemoLogo />}
        backgroundColor={C.bgLight}
        textColor={C.text}
      />
    </ScenePush>
  );
};
