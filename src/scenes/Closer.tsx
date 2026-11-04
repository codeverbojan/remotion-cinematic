import { Img } from "remotion";
import { mediaSource } from "../primitives/ProductContent";
import React from "react";
import { EndCard } from "../primitives";
import { F } from "../tokens";
import { useBrand, useHeadlines, useVideoProps } from "../VideoPropsContext";


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
    <>
      <EndCard
        tagline={brand.name}
        cta={cta}
        headline={headlines.closer.join(" ")}
        headlineFontSize={headlines.closerFontSize}
        entranceDelay={5}
        entranceDuration={18}
        logo={brand.logoUrl ? <Img src={mediaSource(brand.logoUrl)} style={{ maxWidth: 280, maxHeight: 120, objectFit: "contain" }} /> : <DemoLogo />}
        backgroundColor="transparent"
        textColor={brand.colors.text}
        accentColor={brand.colors.primary}
      />
    </>
  );
};
