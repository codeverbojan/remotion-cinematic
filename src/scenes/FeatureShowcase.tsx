import { SoundEffect } from "../engine/audio/SoundEffect";
import { useSceneConfig } from "../SceneContext";
import { ProductContent } from "../primitives/ProductContent";
import React, { useMemo } from "react";
import { Sequence, staticFile, useCurrentFrame } from "remotion";
import { AutoZoom, Cursor, resolveWindowPose, mapCursorPath, filterCursorPath, getSceneStartFrame } from "../engine";
import type { ZoomKeyframe } from "../engine";
import { Window } from "../primitives";
import { CURSOR_SFX, SFX } from "../content";
import { useWindowLayout, useCursorPath, useVideoProps, useCursorStyle } from "../VideoPropsContext";
import { applyPendingEdits, getPendingRevision } from "../editor/pendingCursorEdits";


const SCENE_WINDOW_IDS = ["feature-0", "feature-1", "feature-2"];


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

export const FeatureShowcase: React.FC = () => {
  const { durationInFrames: DURATION } = useSceneConfig();
  const frame = useCurrentFrame();
  const props = useVideoProps();
  const allWindows = useWindowLayout();
  const windows = allWindows.filter((w) => SCENE_WINDOW_IDS.includes(w.id));
  const cursorPathRaw = useCursorPath();
  const cursorStyle = useCursorStyle();
  const enabledScenes = useMemo(() => props.scenes.filter((s) => s.enabled), [props.scenes]);
  const pendingRev = getPendingRevision();
  const cursorActions = useMemo(() => {
    const merged = applyPendingEdits(cursorPathRaw);
    const offset = getSceneStartFrame(enabledScenes, "feature-showcase", props.overlap);
    const sceneEntries = filterCursorPath(merged, allWindows.filter((w) => SCENE_WINDOW_IDS.includes(w.id) || w.sceneId === "feature-showcase").map((w) => w.id), offset, DURATION, "feature-showcase");
    return mapCursorPath(sceneEntries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorPathRaw, enabledScenes, props.overlap, pendingRev, DURATION, allWindows]);

  const sortedWindows = useMemo(
    () => [...windows].sort((a, b) => a.zIndex - b.zIndex),
    [windows],
  );

  const getRect = (id: string) => {
    const def = allWindows.find((w) => w.id === id);
    if (!def) return undefined;
    const pose = resolveWindowPose(def, frame, props.easing);
    if (!pose.visible) {
      return { left: def.startX, top: def.startY, width: def.startW, height: def.startH };
    }
    return { left: pose.left, top: pose.top, width: pose.width, height: pose.height };
  };

  return (
    <>
      <AutoZoom keyframes={ZOOM_KEYFRAMES} getRect={getRect}>
        {sortedWindows.map((def) => {
          const pose = resolveWindowPose(def, frame, props.easing);
          if (!pose.visible) return null;


          return (
            <div
              key={def.id}
              data-cursor-target={def.id}
              style={{
                position: "absolute",
                left: pose.left, top: pose.top,
                width: pose.width, height: pose.height,
                opacity: pose.opacity,
                transform: `scale(${pose.scale}) translate(${pose.translateX}px, ${pose.translateY}px) rotate(${def.rotation ?? 0}deg) translateZ(0)`,
                transformOrigin: "top left",
                zIndex: def.zIndex,
                willChange: "transform",
              }}
            >
              <Window id={def.id} title={def.title}>
                <ProductContent featureIndex={Number(def.id.split("-")[1])} id={`${def.id}-app`} width={pose.width} height={pose.height - 42} />
              </Window>
            </div>
          );
        })}

        {windows.map((def) => (
          <Sequence key={`pop-${def.id}`} from={def.enterAt} durationInFrames={SFX.pop.durationInFrames} layout="none">
            <SoundEffect src={staticFile(SFX.pop.src)} volume={SFX.pop.volume} />
          </Sequence>
        ))}

        <Cursor actions={cursorActions} getRect={getRect} sfx={CURSOR_SFX} size={Math.round(52 * cursorStyle.scale)} baseRotation={cursorStyle.rotation} />
      </AutoZoom>
    </>
  );
};
