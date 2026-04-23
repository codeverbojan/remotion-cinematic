import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneTiming } from "../types";
import { interpolateCamera } from "./interpolate";
import { resolveTimeline } from "./resolveTimeline";
import type { CameraKeyframe, EasingPreset } from "./types";

interface CameraRigProps {
  timeline: CameraKeyframe[];
  scenes: SceneTiming[];
  easing?: EasingPreset;
  overlap?: number;
  children: React.ReactNode;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  timeline,
  scenes,
  easing = "cinematic",
  overlap = 0,
  children,
}) => {
  const frame = useCurrentFrame();

  const resolvedKeys = useMemo(
    () => resolveTimeline(timeline, scenes, overlap),
    [timeline, scenes, overlap],
  );

  const pose = interpolateCamera(resolvedKeys, frame, easing);

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${Math.round(pose.x)}px, ${Math.round(pose.y)}px) scale(${pose.scale}) translateZ(0)`,
        transformOrigin: "center center",
        willChange: "transform",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
