import React, { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { resolveUIState } from "./types";
import type { UIKeyframe } from "./types";

const UIStateContext = createContext<readonly UIKeyframe[]>([]);

export const UIStateProvider: React.FC<{
  keyframes: readonly UIKeyframe[];
  children: React.ReactNode;
}> = ({ keyframes, children }) => (
  <UIStateContext.Provider value={keyframes}>
    {children}
  </UIStateContext.Provider>
);

export function useUIState<T extends object>(
  target: string,
  defaultState: T,
): T {
  const keyframes = useContext(UIStateContext);
  const frame = useCurrentFrame();
  return resolveUIState(keyframes, target, frame, defaultState);
}
