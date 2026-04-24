import React, { createContext, useContext } from "react";
import type { CinematicProps } from "./schema";
import { CinematicSchema } from "./schema";
import { EASE } from "./tokens";
import type { EasingPresetKey } from "./tokens";

const DEFAULTS = CinematicSchema.parse({});

const VideoPropsContext = createContext<CinematicProps>(DEFAULTS);

export const VideoPropsProvider: React.FC<{
  value: CinematicProps;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <VideoPropsContext.Provider value={value}>
    {children}
  </VideoPropsContext.Provider>
);

export function useVideoProps(): CinematicProps {
  return useContext(VideoPropsContext);
}

export function useHeadlines() {
  return useContext(VideoPropsContext).headlines;
}

export function useBrand() {
  return useContext(VideoPropsContext).brand;
}

export function useProductFeatures() {
  return useContext(VideoPropsContext).productFeatures;
}

export function useEasing() {
  const preset = useContext(VideoPropsContext).easing as EasingPresetKey;
  return EASE[preset] ?? EASE.snappy;
}

export function useWindowLayout() {
  return useContext(VideoPropsContext).windowLayout;
}

export function useCursorPath() {
  return useContext(VideoPropsContext).cursorPath;
}

export function useAppDescriptor() {
  return useContext(VideoPropsContext).appDescriptor;
}

export function useCursorStyle() {
  const ctx = useContext(VideoPropsContext);
  return { scale: ctx.cursorScale, rotation: ctx.cursorRotation };
}

export function updateProp(
  updater: (prev: CinematicProps) => CinematicProps,
) {
  try {
    const { updateDefaultProps } = require("@remotion/studio");
    updateDefaultProps({
      compositionId: "CinematicDemo",
      defaultProps: (current: Record<string, unknown>) => updater(current as CinematicProps),
    });
  } catch { /* not in Studio */ }
}
