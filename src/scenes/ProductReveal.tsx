import { panelInteractionKeyframes } from "../engine/ui-state/interactionKeyframes";
import { SoundEffect } from "../engine/audio/SoundEffect";
import { useSceneConfig } from "../SceneContext";
import { ProductContent } from "../primitives/ProductContent";
import React, { useMemo } from "react";
import { Sequence, staticFile, useCurrentFrame } from "remotion";
import { Cursor, UIStateProvider, generatePressKeyframes, resolveWindowPose, mapCursorPath, filterCursorPath, getSceneStartFrame } from "../engine";
import { Window, Panel } from "../primitives";
import { CURSOR_SFX, SFX } from "../content";
import { useWindowLayout, useCursorPath, useVideoProps, useCursorStyle } from "../VideoPropsContext";
import { applyPendingEdits, getPendingRevision } from "../editor/pendingCursorEdits";


const SCENE_WINDOW_IDS = ["product-window", "top-panel", "left-panel"];

export const ProductReveal: React.FC = () => {
  const { durationInFrames: DURATION } = useSceneConfig();
  const frame = useCurrentFrame();
  const videoProps = useVideoProps();
  const allWindows = useWindowLayout();
  const windows = allWindows.filter((w) => SCENE_WINDOW_IDS.includes(w.id));

  const topPanelDef = windows.find((w) => w.id === "top-panel");
  const leftPanelDef = windows.find((w) => w.id === "left-panel");

  const cursorPathRaw = useCursorPath();
  const cursorStyle = useCursorStyle();
  const enabledScenes = useMemo(() => videoProps.scenes.filter((s) => s.enabled), [videoProps.scenes]);
  const pendingRev = getPendingRevision();
  const cursorActions = useMemo(() => {
    const merged = applyPendingEdits(cursorPathRaw);
    const offset = getSceneStartFrame(enabledScenes, "product-reveal", videoProps.overlap);
    const sceneEntries = filterCursorPath(merged, allWindows.filter((w) => SCENE_WINDOW_IDS.includes(w.id) || w.sceneId === "product-reveal").map((w) => w.id), offset, DURATION, "product-reveal");
    return mapCursorPath(sceneEntries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorPathRaw, enabledScenes, videoProps.overlap, pendingRev, DURATION, allWindows]);

  const pressKeyframes = useMemo(() => generatePressKeyframes(cursorActions), [cursorActions]);
  const allKeyframes = useMemo(
    () => [...panelInteractionKeyframes(cursorActions), ...pressKeyframes],
    [pressKeyframes, cursorActions],
  );

  const getRect = (id: string) => {
    const def = allWindows.find((w) => w.id === id);
    if (!def) return undefined;
    const pose = resolveWindowPose(def, frame, videoProps.easing);
    if (!pose.visible) {
      return { left: def.startX, top: def.startY, width: def.startW, height: def.startH };
    }
    return { left: pose.left, top: pose.top, width: pose.width, height: pose.height };
  };

  const sortedWindows = useMemo(
    () => [...windows].sort((a, b) => a.zIndex - b.zIndex),
    [windows],
  );

  const sfxFrame1 = topPanelDef?.enterAt ?? 48;
  const sfxFrame2 = leftPanelDef?.enterAt ?? 53;

  return (
    <>
      <UIStateProvider keyframes={allKeyframes}>
        {sortedWindows.map((def) => {
          const pose = resolveWindowPose(def, frame, videoProps.easing);
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
                {def.id === "product-window" ? <ProductContent width={pose.width} height={pose.height - 42} /> : (
                  <Panel id={def.id === "top-panel" ? "top-inner-panel" : "left-inner-panel"} padding={0} style={{height: "100%", boxSizing: "border-box"}}
                    collapsedContent={<ProductContent featureIndex={def.id === "top-panel" ? 1 : 2} summaryOnly width={pose.width} height={pose.height - 44} />}>
                    <ProductContent featureIndex={def.id === "top-panel" ? 1 : 2} id={`${def.id}-app`} width={pose.width} height={pose.height - 44} />
                  </Panel>
                )}
              </Window>
            </div>
          );
        })}

        {/* Pop SFX when panels appear */}
        <Sequence from={sfxFrame1} durationInFrames={SFX.pop.durationInFrames} layout="none">
          <SoundEffect src={staticFile(SFX.pop.src)} volume={SFX.pop.volume} />
        </Sequence>
        <Sequence from={sfxFrame2} durationInFrames={SFX.pop.durationInFrames} layout="none">
          <SoundEffect src={staticFile(SFX.pop.src)} volume={SFX.pop.volume} />
        </Sequence>

        <Cursor actions={cursorActions} getRect={getRect} sfx={CURSOR_SFX} size={Math.round(52 * cursorStyle.scale)} baseRotation={cursorStyle.rotation} />
      </UIStateProvider>
    </>
  );
};
