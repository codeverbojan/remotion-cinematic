import React, { useMemo } from "react";
import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { AutoZoom, Cursor, resolveWindowPose, mapCursorPath, filterCursorPath, getSceneStartFrame } from "../engine";
import type { CursorAction, ZoomKeyframe } from "../engine";
import { ScenePush, Window, Panel, Placeholder } from "../primitives";
import { CURSOR_SFX, SCENE_OVERLAP, SFX, TRANSITION_SFX } from "../content";
import { useProductFeatures, useWindowLayout, useCursorPath, useVideoProps, useCursorStyle } from "../VideoPropsContext";

const DURATION = 200;

const SCENE_WINDOW_IDS = ["feature-0", "feature-1", "feature-2"];

const CURSOR_ACTIONS: CursorAction[] = [
  { at: 0, action: "idle", position: { x: 300, y: 400 } },
  { at: 8, action: "moveTo", target: "feature-0", anchor: { xPct: 50, yPct: 35 }, duration: 12 },
  { at: 24, action: "click", target: "feature-0" },
  { at: 40, action: "moveTo", target: "feature-1", anchor: { xPct: 50, yPct: 35 }, duration: 12 },
  { at: 56, action: "click", target: "feature-1" },
  { at: 78, action: "moveTo", target: "feature-2", anchor: { xPct: 40, yPct: 30 }, duration: 12 },
  { at: 94, action: "click", target: "feature-2" },
  { at: 115, action: "moveTo", target: "feature-2", anchor: "top-bar", duration: 10 },
  { at: 130, action: "click", target: "feature-2", anchor: "top-bar" },
];

const ZOOM_KEYFRAMES: ZoomKeyframe[] = [
  { at: 0, scale: 1 },
  { at: 15, target: "feature-0", scale: 1.06 },
  { at: 32, target: "feature-0", scale: 1.06 },
  { at: 42, scale: 1 },
  { at: 52, target: "feature-1", scale: 1.06 },
  { at: 68, target: "feature-1", scale: 1.06 },
  { at: 78, scale: 1 },
  { at: 88, target: "feature-2", scale: 1.04 },
  { at: 120, target: "feature-2", scale: 1.04 },
  { at: 135, scale: 1 },
];

const FeatureContent: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <Panel
    title={title}
    subtitle={description}
    padding={24}
    style={{ border: "none", borderRadius: 0, backgroundColor: "transparent" }}
  >
    <Placeholder height={280} />
  </Panel>
);

export const FeatureShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const props = useVideoProps();
  const features = useProductFeatures();
  const allWindows = useWindowLayout();
  const windows = allWindows.filter((w) => SCENE_WINDOW_IDS.includes(w.id));
  const cursorPathRaw = useCursorPath();
  const cursorStyle = useCursorStyle();
  const enabledScenes = useMemo(() => props.scenes.filter((s) => s.enabled), [props.scenes]);
  const cursorActions = useMemo(() => {
    const offset = getSceneStartFrame(enabledScenes, "feature-showcase", props.overlap);
    const sceneEntries = filterCursorPath(cursorPathRaw, SCENE_WINDOW_IDS, offset, DURATION);
    return sceneEntries.length > 0 ? mapCursorPath(sceneEntries) : CURSOR_ACTIONS;
  }, [cursorPathRaw, enabledScenes, props.overlap]);

  const sortedWindows = useMemo(
    () => [...windows].sort((a, b) => a.zIndex - b.zIndex),
    [windows],
  );

  const getRect = (id: string) => {
    const def = windows.find((w) => w.id === id);
    if (!def) return undefined;
    const pose = resolveWindowPose(def, frame);
    if (!pose.visible) return undefined;
    return { left: pose.left, top: pose.top, width: pose.width, height: pose.height };
  };

  return (
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="left" exitTo="top" enterSfx={TRANSITION_SFX}>
      <AutoZoom keyframes={ZOOM_KEYFRAMES} getRect={getRect}>
        {sortedWindows.map((def, i) => {
          const pose = resolveWindowPose(def, frame);
          if (!pose.visible) return null;

          const feat = features[i];

          return (
            <div
              key={def.id}
              data-cursor-target={def.id}
              style={{
                position: "absolute",
                left: pose.left, top: pose.top,
                width: pose.width, height: pose.height,
                opacity: pose.opacity,
                transform: `scale(${pose.scale}) translate(${pose.translateX}px, ${pose.translateY}px) translateZ(0)`,
                transformOrigin: "top left",
                zIndex: def.zIndex,
                willChange: "transform",
              }}
            >
              <Window id={def.id} title={def.title}>
                <FeatureContent
                  title={feat?.title ?? def.title}
                  description={feat?.description ?? ""}
                />
              </Window>
            </div>
          );
        })}

        {windows.map((def) => (
          <Sequence key={`pop-${def.id}`} from={def.enterAt} durationInFrames={SFX.pop.durationInFrames} layout="none">
            <Audio src={staticFile(SFX.pop.src)} volume={SFX.pop.volume} />
          </Sequence>
        ))}

        <Cursor actions={cursorActions} getRect={getRect} sfx={CURSOR_SFX} size={Math.round(52 * cursorStyle.scale)} baseRotation={cursorStyle.rotation} />
      </AutoZoom>
    </ScenePush>
  );
};
