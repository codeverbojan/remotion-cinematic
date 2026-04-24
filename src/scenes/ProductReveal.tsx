import React, { useMemo } from "react";
import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Cursor, UIStateProvider, generatePressKeyframes, resolveWindowPose } from "../engine";
import type { CursorAction, UIKeyframe } from "../engine";
import { ScenePush, Window, Panel, PanelGrid, Placeholder } from "../primitives";
import { CURSOR_SFX, SCENE_OVERLAP, SFX, TRANSITION_SFX } from "../content";
import { useProductFeatures, useWindowLayout } from "../VideoPropsContext";

const DURATION = 150;

const SCENE_WINDOW_IDS = ["product-window", "top-panel", "left-panel"];

function buildCursorActions(dragTo: { x: number; y: number }): CursorAction[] {
  return [
    { at: 0, action: "idle", position: { x: 200, y: 180 } },
    { at: 5, action: "moveTo", target: "product-window", anchor: "corner-top-left", duration: 12 },
    { at: 20, action: "click", target: "product-window", anchor: "corner-top-left" },
    {
      at: 30,
      action: "drag",
      target: "product-window",
      anchor: "corner-top-left",
      to: dragTo,
      duration: 18,
    },
    { at: 58, action: "moveTo", target: "top-panel", anchor: { xPct: 50, yPct: 40 }, duration: 12 },
    { at: 74, action: "click", target: "top-panel" },
    { at: 84, action: "moveTo", target: "left-panel", anchor: { xPct: 50, yPct: 40 }, duration: 12 },
    { at: 100, action: "click", target: "left-panel" },
  ];
}

const INTERACTION_KEYFRAMES: UIKeyframe[] = [
  { at: 0, target: "top-inner-panel", set: { expanded: false } },
  { at: 0, target: "left-inner-panel", set: { expanded: false } },
  { at: 74, target: "top-inner-panel", set: { expanded: true } },
  { at: 100, target: "left-inner-panel", set: { expanded: true } },
];

const DashboardContent: React.FC = () => {
  const features = useProductFeatures();
  return (
    <div style={{ padding: 20 }}>
      <PanelGrid columns={3} gap={20} style={{ marginBottom: 24 }}>
        {features.map((feat, i) => (
          <Panel key={i} title={feat.title} subtitle={feat.description} />
        ))}
      </PanelGrid>
      <Placeholder label="Drop your product screenshot here" height={120} />
    </div>
  );
};

const TopPanelContent: React.FC = () => {
  const features = useProductFeatures();
  return (
    <Panel
      id="top-inner-panel"
      title={features[1]?.title ?? "Feature"}
      subtitle={features[1]?.description ?? ""}
      style={{ border: "none", borderRadius: 0 }}
    >
      <Placeholder height={200} />
    </Panel>
  );
};

const LeftPanelContent: React.FC = () => {
  const features = useProductFeatures();
  return (
    <Panel
      id="left-inner-panel"
      title={features[2]?.title ?? "Feature"}
      subtitle={features[2]?.description ?? ""}
      style={{ border: "none", borderRadius: 0 }}
    >
      <Placeholder height={180} />
    </Panel>
  );
};

const WINDOW_CONTENT: Record<string, React.ReactNode> = {
  "product-window": <DashboardContent />,
  "top-panel": <TopPanelContent />,
  "left-panel": <LeftPanelContent />,
};

export const ProductReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const allWindows = useWindowLayout();
  const windows = allWindows.filter((w) => SCENE_WINDOW_IDS.includes(w.id));

  const productWin = windows.find((w) => w.id === "product-window");
  const topPanelDef = windows.find((w) => w.id === "top-panel");
  const leftPanelDef = windows.find((w) => w.id === "left-panel");

  const dragToX = productWin?.endX ?? productWin?.startX ?? 980;
  const dragToY = productWin?.endY ?? productWin?.startY ?? 500;
  const cursorActions = useMemo(
    () => buildCursorActions({ x: dragToX, y: dragToY }),
    [dragToX, dragToY],
  );

  const pressKeyframes = useMemo(() => generatePressKeyframes(cursorActions), [cursorActions]);
  const allKeyframes = useMemo(
    () => [...INTERACTION_KEYFRAMES, ...pressKeyframes],
    [pressKeyframes],
  );

  const getRect = (id: string) => {
    const def = windows.find((w) => w.id === id);
    if (!def) return undefined;
    const pose = resolveWindowPose(def, frame);
    if (!pose.visible) return undefined;
    return { left: pose.left, top: pose.top, width: pose.width, height: pose.height };
  };

  const sortedWindows = useMemo(
    () => [...windows].sort((a, b) => a.zIndex - b.zIndex),
    [windows],
  );

  const sfxFrame1 = topPanelDef?.enterAt ?? 48;
  const sfxFrame2 = leftPanelDef?.enterAt ?? 53;

  return (
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="right" enterSfx={TRANSITION_SFX}>
      <UIStateProvider keyframes={allKeyframes}>
        {sortedWindows.map((def) => {
          const pose = resolveWindowPose(def, frame);
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
                transform: `scale(${pose.scale}) translate(${pose.translateX}px, ${pose.translateY}px) translateZ(0)`,
                transformOrigin: "top left",
                zIndex: def.zIndex,
                willChange: "transform",
              }}
            >
              <Window id={def.id} title={def.title}>
                {WINDOW_CONTENT[def.id]}
              </Window>
            </div>
          );
        })}

        {/* Pop SFX when panels appear */}
        <Sequence from={sfxFrame1} durationInFrames={SFX.pop.durationInFrames} layout="none">
          <Audio src={staticFile(SFX.pop.src)} volume={SFX.pop.volume} />
        </Sequence>
        <Sequence from={sfxFrame2} durationInFrames={SFX.pop.durationInFrames} layout="none">
          <Audio src={staticFile(SFX.pop.src)} volume={SFX.pop.volume} />
        </Sequence>

        <Cursor actions={cursorActions} getRect={getRect} sfx={CURSOR_SFX} />
      </UIStateProvider>
    </ScenePush>
  );
};
