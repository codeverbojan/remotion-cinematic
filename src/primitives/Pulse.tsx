import React from "react";
import { useCurrentFrame } from "remotion";

interface PulseProps {
  delay?: number;
  period?: number;
  intensity?: number;
  count?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export interface PulsePose {
  scale: number;
  active: boolean;
}

export function getPulsePose(
  frame: number,
  delay: number,
  period: number,
  intensity: number,
  count: number,
): PulsePose {
  const rel = frame - delay;
  if (rel < 0) return { scale: 1, active: false };

  const safePeriod = Math.max(1, period);
  const cycleIndex = rel / safePeriod;

  if (count > 0 && cycleIndex >= count) return { scale: 1, active: false };

  const phase = (cycleIndex % 1) * Math.PI * 2;
  const wave = (1 - Math.cos(phase)) / 2;
  const scale = 1 + wave * (intensity - 1);

  return { scale, active: true };
}

export const Pulse: React.FC<PulseProps> = ({
  delay = 0,
  period = 20,
  intensity = 1.06,
  count = 0,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const pose = getPulsePose(frame, delay, period, intensity, count);

  if (!pose.active) {
    return <div style={style}>{children}</div>;
  }

  return (
    <div
      style={{
        transform: `scale(${pose.scale}) translateZ(0)`,
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
