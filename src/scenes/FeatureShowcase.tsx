import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import {
  AutoZoom,
  Cursor,
  defineZones,
  LayoutProvider,
  LayoutWindow,
} from "../engine";
import type { CursorAction, ZoomKeyframe, ZoneConfig } from "../engine";
import { Enter, ScenePush, Window, Panel, Placeholder } from "../primitives";
import { CURSOR_SFX, PRODUCT_FEATURES, SCENE_OVERLAP, SFX, TRANSITION_SFX } from "../content";

const DURATION = 200;

const ZONES: ZoneConfig = {
  canvas: { width: 1920, height: 1080 },
  slots: [
    { id: "left", region: { x: 0, y: 0, w: 960, h: 1080 } },
    { id: "right", region: { x: 960, y: 0, w: 960, h: 1080 } },
    { id: "full", region: { x: 0, y: 0, w: 1920, h: 1080 } },
  ],
  reserved: [],
};

const zoneSystem = defineZones(ZONES);

const FEATURE_WINDOWS = PRODUCT_FEATURES.map((feat, i) => ({
  id: `feature-${i}`,
  zone: i === 0 ? "left" : i === 1 ? "right" : "full",
  width: i < 2 ? 800 : 1400,
  height: i < 2 ? 500 : 700,
  delay: i * 35,
  title: feat.title,
  description: feat.description,
}));

const CURSOR_ACTIONS: CursorAction[] = [
  { at: 0, action: "idle", position: { x: 300, y: 400 } },
  { at: 8, action: "moveTo", target: "feature-0", anchor: { xPct: 0.5, yPct: 0.35 }, duration: 12 },
  { at: 24, action: "click", target: "feature-0" },
  { at: 40, action: "moveTo", target: "feature-1", anchor: { xPct: 0.5, yPct: 0.35 }, duration: 12 },
  { at: 56, action: "click", target: "feature-1" },
  { at: 78, action: "moveTo", target: "feature-2", anchor: { xPct: 0.4, yPct: 0.3 }, duration: 12 },
  { at: 94, action: "click", target: "feature-2" },
  { at: 115, action: "moveTo", target: "feature-2", anchor: "top-bar", duration: 10 },
  { at: 130, action: "click", target: "feature-2", anchor: "top-bar" },
];

// Zoom follows the cursor — targets are element IDs, resolved via getRect
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
  const getRect = (id: string) => {
    const feat = FEATURE_WINDOWS.find((f) => f.id === id);
    if (!feat) return undefined;
    try {
      return zoneSystem.placeWindow({
        id: feat.id,
        slotId: feat.zone,
        width: feat.width,
        height: feat.height,
        margin: 30,
        avoidZones: [],
      });
    } catch {
      return undefined;
    }
  };

  return (
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="left" exitTo="top" enterSfx={TRANSITION_SFX}>
      <AutoZoom keyframes={ZOOM_KEYFRAMES} getRect={getRect}>
        <LayoutProvider zones={zoneSystem}>
          {FEATURE_WINDOWS.map((feat) => (
            <Enter
              key={feat.id}
              delay={feat.delay}
              duration={12}
              translateY={25}
              scaleFrom={0.95}
            >
              <LayoutWindow
                id={feat.id}
                zone={feat.zone}
                width={feat.width}
                height={feat.height}
                margin={30}
              >
                <Window id={feat.id} title={feat.title}>
                  <FeatureContent title={feat.title} description={feat.description} />
                </Window>
              </LayoutWindow>
            </Enter>
          ))}
          {/* Pop SFX on window entrance */}
          {FEATURE_WINDOWS.map((feat) => (
            <Sequence key={`pop-${feat.id}`} from={feat.delay} durationInFrames={SFX.pop.durationInFrames} layout="none">
              <Audio src={staticFile(SFX.pop.src)} volume={SFX.pop.volume} />
            </Sequence>
          ))}
          <Cursor actions={CURSOR_ACTIONS} getRect={getRect} sfx={CURSOR_SFX} />
        </LayoutProvider>
      </AutoZoom>
    </ScenePush>
  );
};
