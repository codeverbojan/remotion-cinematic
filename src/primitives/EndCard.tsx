import React, { useCallback, useMemo } from "react";
import { AbsoluteFill, getRemotionEnvironment, interpolate, useCurrentFrame } from "remotion";
import { C, EASE, F } from "../tokens";
import { InlineEdit } from "../editor";
import { updateProp } from "../VideoPropsContext";

interface EndCardProps {
  logo?: React.ReactNode;
  tagline?: string;
  cta?: string;
  entranceDelay?: number;
  entranceDuration?: number;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

export const EndCard: React.FC<EndCardProps> = ({
  logo,
  tagline = "Your product name",
  cta = "Try it free",
  entranceDelay = 0,
  entranceDuration = 20,
  backgroundColor = C.bg,
  textColor = C.text,
  accentColor = C.brand,
}) => {
  const frame = useCurrentFrame();
  const rel = frame - entranceDelay;

  const isStudio = useMemo(() => {
    try { return getRemotionEnvironment().isStudio; } catch { return false; }
  }, []);

  const dur = Math.max(1, entranceDuration);
  const opacity = interpolate(rel, [0, dur], [0, 1], EASE.smooth);
  const scale = interpolate(rel, [0, dur], [0.92, 1], EASE.smooth);

  const onTaglineChange = useCallback(
    (value: string) => {
      updateProp((prev) => ({
        ...prev,
        brand: { ...prev.brand, name: value },
      }));
    },
    [],
  );

  const onCtaChange = useCallback(
    (value: string) => {
      updateProp((prev) => ({
        ...prev,
        headlines: { ...prev.headlines, closer: [value] },
      }));
    },
    [],
  );

  const taglineStyle: React.CSSProperties = {
    fontSize: 64,
    fontWeight: 600,
    color: textColor,
    fontFamily: F.serif,
    letterSpacing: "-0.02em",
    textAlign: "center",
  };

  const ctaStyle: React.CSSProperties = {
    marginTop: 12,
    padding: "16px 48px",
    borderRadius: 12,
    backgroundColor: accentColor,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: 600,
    fontFamily: F.sans,
    letterSpacing: "0.01em",
  };

  const taglineContent = <div style={taglineStyle}>{tagline}</div>;
  const ctaContent = <div style={ctaStyle}>{cta}</div>;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          opacity,
          transform: `scale(${scale}) translateZ(0)`,
          willChange: "transform",
        }}
      >
        {logo && <div style={{ marginBottom: 16 }}>{logo}</div>}
        {isStudio ? (
          <InlineEdit value={tagline} onChange={onTaglineChange} style={taglineStyle}>
            {taglineContent}
          </InlineEdit>
        ) : taglineContent}
        {isStudio ? (
          <InlineEdit value={cta} onChange={onCtaChange} style={ctaStyle}>
            {ctaContent}
          </InlineEdit>
        ) : ctaContent}
      </div>
    </AbsoluteFill>
  );
};
