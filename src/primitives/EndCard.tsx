import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, EASE, F } from "../tokens";

interface EndCardProps {
  logo?: React.ReactNode;
  tagline?: string;
  cta?: string;
  entranceDelay?: number;
  entranceDuration?: number;
  backgroundColor?: string;
  textColor?: string;
}

export const EndCard: React.FC<EndCardProps> = ({
  logo,
  tagline = "Your product name",
  cta = "Try it free",
  entranceDelay = 0,
  entranceDuration = 20,
  backgroundColor = C.bg,
  textColor = C.text,
}) => {
  const frame = useCurrentFrame();
  const rel = frame - entranceDelay;

  const dur = Math.max(1, entranceDuration);
  const opacity = interpolate(rel, [0, dur], [0, 1], EASE.smooth);
  const scale = interpolate(rel, [0, dur], [0.92, 1], EASE.smooth);

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
          transform: `scale(${scale})`,
        }}
      >
        {logo && <div style={{ marginBottom: 16 }}>{logo}</div>}
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: textColor,
            fontFamily: F.serif,
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            marginTop: 12,
            padding: "16px 48px",
            borderRadius: 12,
            backgroundColor: C.brand,
            color: "#FFFFFF",
            fontSize: 24,
            fontWeight: 600,
            fontFamily: F.sans,
            letterSpacing: "0.01em",
          }}
        >
          {cta}
        </div>
      </div>
    </AbsoluteFill>
  );
};
