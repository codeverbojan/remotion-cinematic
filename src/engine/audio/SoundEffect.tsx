import React from "react";
import { Audio } from "remotion";
import { useVideoProps } from "../../VideoPropsContext";
export function effectVolume(enabled: boolean, master: number, volume = 1): number { return enabled ? master * volume : 0; }
export const SoundEffect: React.FC<{ src: string; volume?: number }> = ({src, volume = 1}) => {
  const props = useVideoProps();
  const level = effectVolume(props.sfxEnabled, props.sfxVolume, volume);
  return level > 0 ? <Audio src={src} volume={level} /> : null;
};
