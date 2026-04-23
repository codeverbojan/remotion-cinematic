import React from "react";
import { useCurrentFrame } from "remotion";
import { getEnterPose } from "./Enter";

interface StaggerProps {
  interval: number;
  delay?: number;
  duration?: number;
  translateY?: number;
  translateX?: number;
  scaleFrom?: number;
  children: React.ReactNode[];
  style?: React.CSSProperties;
}

export interface StaggerItemPose {
  opacity: number;
  translateY: number;
  translateX: number;
  scale: number;
  delay: number;
}

export function getStaggerItemPose(
  frame: number,
  index: number,
  interval: number,
  baseDelay: number,
  duration: number,
  translateY: number,
  translateX: number,
  scaleFrom: number,
): StaggerItemPose {
  const itemDelay = baseDelay + index * interval;
  const pose = getEnterPose(frame, itemDelay, duration, translateY, scaleFrom, translateX);
  return {
    opacity: pose.opacity,
    translateY: pose.translateY,
    translateX: pose.translateX,
    scale: pose.scale,
    delay: itemDelay,
  };
}

export const Stagger: React.FC<StaggerProps> = ({
  interval,
  delay = 0,
  duration = 12,
  translateY = 20,
  translateX = 0,
  scaleFrom = 1,
  children,
  style,
}) => {
  const frame = useCurrentFrame();

  return (
    <div style={style}>
      {React.Children.map(children, (child, i) => {
        const pose = getStaggerItemPose(
          frame, i, interval, delay, duration,
          translateY, translateX, scaleFrom,
        );
        return (
          <div
            style={{
              opacity: pose.opacity,
              transform: `translate(${Math.round(pose.translateX)}px, ${Math.round(pose.translateY)}px) scale(${pose.scale}) translateZ(0)`,
              willChange: "transform",
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};
