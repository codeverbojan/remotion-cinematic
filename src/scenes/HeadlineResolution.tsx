import React from "react";
import { Headline } from "../primitives";
import { useHeadlines } from "../VideoPropsContext";


export const HeadlineResolution: React.FC = () => {
  const headlines = useHeadlines();

  return (
    <>
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
    </>
  );
};
