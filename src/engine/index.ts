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
  interpolateLinear,
  interpolateEase,
  interpolateCurve,
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
  getSceneAtFrame,
  getTotalFrames,
} from "./types";

export type { SceneTiming, SceneTimingMap, SceneRange, Rect, CanvasSize, SFXEntry } from "./types";

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
  CurveType,
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
  filterCursorPath,
} from "./choreography";

export type { WindowPose } from "./choreography";
