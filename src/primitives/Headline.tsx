import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, EASE, F } from "../tokens";

export interface HeadlineProps {
  readonly lines: readonly string[];
  readonly fontSize?: number;
  readonly color?: string;
  readonly fontFamily?: string;
  readonly lineDelay?: number;
  readonly entranceDuration?: number;
  readonly yRise?: number;
  readonly exitAt?: number;
  readonly exitDuration?: number;
  readonly wordStream?: {
    readonly stagger?: number;
    readonly duration?: number;
    readonly yRise?: number;
  };
}

export interface LinePose {
  readonly opacity: number;
  readonly translateY: number;
}

export function getLineStartFrame(
  lineIndex: number,
  entranceDuration: number,
  lineDelay: number,
): number {
  return lineIndex * (entranceDuration + lineDelay);
}

export function getHeadlinePose(args: {
  readonly frame: number;
  readonly lineIndex: number;
  readonly entranceDuration: number;
  readonly lineDelay: number;
  readonly yRise: number;
  readonly exitAt?: number;
  readonly exitDuration: number;
}): LinePose {
  const {
    frame, lineIndex, entranceDuration, lineDelay,
    yRise, exitAt, exitDuration,
  } = args;

  const lineStart = getLineStartFrame(lineIndex, entranceDuration, lineDelay);
  const rel = frame - lineStart;

  const entranceOpacity = interpolate(rel, [0, entranceDuration], [0, 1], EASE.smooth);
  const translateY = interpolate(rel, [0, entranceDuration], [yRise, 0], EASE.smooth);

  let opacity = entranceOpacity;
  if (exitAt !== undefined) {
    const exitOpacity = interpolate(
      frame - exitAt,
      [0, exitDuration],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    opacity = Math.min(entranceOpacity, exitOpacity);
  }

  return { opacity, translateY };
}

export const Headline: React.FC<HeadlineProps> = ({
  lines,
  fontSize = 88,
  color = C.text,
  fontFamily = F.serif,
  lineDelay = 24,
  entranceDuration = 10,
  yRise = 20,
  exitAt,
  exitDuration = 10,
  wordStream,
}) => {
  const frame = useCurrentFrame();
  const wordStagger = wordStream?.stagger ?? 3;
  const wordDuration = wordStream?.duration ?? 7;
  const wordYRise = wordStream?.yRise ?? 14;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        padding: "0 80px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "100%" }}>
        {lines.map((line, i) => {
          const linePose = getHeadlinePose({
            frame, lineIndex: i, entranceDuration,
            lineDelay, yRise, exitAt, exitDuration,
          });
          const lineStart = getLineStartFrame(i, entranceDuration, lineDelay);
          const commonStyle: React.CSSProperties = {
            fontSize,
            fontWeight: 500,
            color,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginTop: i === 0 ? 0 : 8,
          };

          if (wordStream) {
            const lineExitOpacity =
              exitAt !== undefined
                ? interpolate(
                    frame - exitAt,
                    [0, exitDuration],
                    [1, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  )
                : 1;
            const words = line.split(/\s+/).filter((w) => w.length > 0);
            return (
              <div key={i} style={{ ...commonStyle, opacity: lineExitOpacity }}>
                {words.map((word, wIdx) => {
                  const wStart = lineStart + wIdx * wordStagger;
                  const clampOpts = {
                    extrapolateLeft: "clamp" as const,
                    extrapolateRight: "clamp" as const,
                  };
                  const wOpacity = interpolate(
                    frame,
                    [wStart, wStart + wordDuration],
                    [0, 1],
                    clampOpts,
                  );
                  const wTy = interpolate(
                    frame,
                    [wStart, wStart + wordDuration],
                    [wordYRise, 0],
                    EASE.smooth,
                  );
                  return (
                    <React.Fragment key={wIdx}>
                      <span
                        style={{
                          display: "inline-block",
                          opacity: wOpacity,
                          transform: `translateY(${Math.round(wTy)}px) translateZ(0)`,
                          willChange: "transform",
                        }}
                      >
                        {word}
                      </span>
                      {wIdx < words.length - 1 ? " " : null}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          }

          return (
            <div
              key={i}
              style={{
                ...commonStyle,
                opacity: linePose.opacity,
                transform: `translateY(${Math.round(linePose.translateY)}px) translateZ(0)`,
                willChange: "transform",
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
