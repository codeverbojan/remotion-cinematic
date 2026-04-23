export interface AudioCue {
  scene: string;
  at: number;
  sfx: string;
  volume?: number;
  durationInFrames?: number;
}

export interface MusicConfig {
  src: string;
  volume?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}

export interface DuckingRange {
  startFrame: number;
  endFrame: number;
  duckedVolume: number;
}

export interface ResolvedAudioCue {
  frame: number;
  sfx: string;
  volume: number;
  durationInFrames?: number;
}
