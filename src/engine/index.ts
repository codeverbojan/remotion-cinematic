export {
  defineZones,
  rectsOverlap,
  LayoutProvider,
  LayoutWindow,
  useWindowRect,
  useLayout,
} from "./layout";

export {
  Cursor,
  CursorSprite,
  resolveAnchorFromRect,
  interpolateArc,
  computeClickPulse,
  computeCursorRotation,
} from "./cursor";

export {
  CameraRig,
  AutoZoom,
  resolveTimeline,
  interpolateCamera,
  getEasing,
} from "./camera";

export {
  AudioManager,
  resolveCues,
  computeMusicVolume,
} from "./audio";

export {
  UIStateProvider,
  useUIState,
  resolveUIState,
  generatePressKeyframes,
} from "./ui-state";

export {
  getSceneStartFrame,
  getTotalFrames,
} from "./types";

export type { SceneTiming, SceneTimingMap, Rect, CanvasSize, SFXEntry } from "./types";

export type {
  ComputedRect,
  ReservedZone,
  SlotDef,
  WindowPlacement,
  ZoneConfig,
  ZoneSystem,
} from "./layout";

export type {
  AnchorPoint,
  CursorAction,
  CursorActionClick,
  CursorActionDrag,
  CursorActionIdle,
  CursorActionMoveTo,
  CursorSFXMap,
  ResolvedPosition,
  CanvasBounds,
} from "./cursor";

export type {
  CameraKeyframe,
  CameraPose,
  EasingPreset,
  ResolvedCameraKey,
  ZoomKeyframe,
} from "./camera";

export type {
  AudioCue,
  DuckingRange,
  MusicConfig,
  ResolvedAudioCue,
} from "./audio";

export type { UIKeyframe } from "./ui-state";

export {
  resolveWindowPose,
  mapCursorPath,
} from "./choreography";

export type { WindowPose } from "./choreography";
