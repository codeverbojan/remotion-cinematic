import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, EASE, F } from "../tokens";

interface CountUpProps {
  from?: number;
  to: number;
  delay?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  style?: React.CSSProperties;
}

export interface CountUpPose {
  value: number;
  display: string;
  progress: number;
}

export function getCountUpPose(
  frame: number,
  delay: number,
  duration: number,
  from: number,
  to: number,
  decimals: number,
  prefix: string,
  suffix: string,
  separator: string,
): CountUpPose {
  const dur = Math.max(1, duration);
  const progress = interpolate(frame - delay, [0, dur], [0, 1], EASE.snappy);
  const raw = from + (to - from) * progress;
  const value = Number(raw.toFixed(decimals));

  const intPart = Math.trunc(value);
  const decPart = decimals > 0
    ? "." + Math.abs(value - intPart).toFixed(decimals).slice(2)
    : "";

  let formatted = Math.abs(intPart).toString();
  if (separator) {
    formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }
  if (intPart < 0) formatted = "-" + formatted;

  const display = prefix + formatted + decPart + suffix;
  return { value, display, progress };
}

export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  delay = 0,
  duration = 30,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  fontSize = 48,
  color = C.text,
  fontFamily = F.sans,
  style,
}) => {
  const frame = useCurrentFrame();
  const pose = getCountUpPose(frame, delay, duration, from, to, decimals, prefix, suffix, separator);

  return (
    <span
      style={{
        fontSize,
        fontWeight: 700,
        color,
        fontFamily,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {pose.display}
    </span>
  );
};
