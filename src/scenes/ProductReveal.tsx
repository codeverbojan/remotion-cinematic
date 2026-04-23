import React from "react";
import { Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Cursor } from "../engine";
import type { CursorAction } from "../engine";
import { ScenePush, Window } from "../primitives";
import { CURSOR_SFX, PRODUCT_FEATURES, SCENE_OVERLAP, SFX, TRANSITION_SFX } from "../content";
import { C, EASE, F } from "../tokens";

const DURATION = 150;

// Full-screen window (nearly fills canvas)
const FULL_LEFT = 30;
const FULL_TOP = 30;
const FULL_W = 1860;
const FULL_H = 1020;

// After resize — anchored bottom-right, bleeds off canvas edges
const SMALL_LEFT = 980;
const SMALL_TOP = 500;
const SMALL_W = 960;
const SMALL_H = 600;

const RESIZE_START = 30;
const RESIZE_END = 48;

// Panels in freed top-left space (can overlap with main window)
const TOP_PANEL = { left: 30, top: 30, w: 920, h: 440 };
const LEFT_PANEL = { left: 30, top: 500, w: 920, h: 570 };

const CURSOR_ACTIONS: CursorAction[] = [
  { at: 0, action: "idle", position: { x: 960, y: 540 } },
  { at: 5, action: "moveTo", target: "product-window", anchor: "corner-top-left", duration: 12 },
  { at: 20, action: "click", target: "product-window", anchor: "corner-top-left" },
  {
    at: RESIZE_START,
    action: "drag",
    target: "product-window",
    anchor: "corner-top-left",
    to: { x: SMALL_LEFT, y: SMALL_TOP },
    duration: RESIZE_END - RESIZE_START,
  },
  { at: 58, action: "moveTo", target: "top-panel", anchor: "center", duration: 12 },
  { at: 74, action: "click", target: "top-panel" },
  { at: 84, action: "moveTo", target: "left-panel", anchor: "center", duration: 12 },
  { at: 100, action: "click", target: "left-panel" },
];

const DashboardContent: React.FC = () => (
  <div style={{ fontFamily: F.sans, fontSize: 14, color: C.text, padding: 20 }}>
    <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
      {PRODUCT_FEATURES.map((feat, i) => (
        <div
          key={i}
          style={{
            flex: 1, padding: 16, borderRadius: 8,
            backgroundColor: C.bgLight,
            border: `1px solid ${C.border}`,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: C.brandLight, marginBottom: 6 }}>
            {feat.title}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4 }}>
            {feat.description}
          </div>
        </div>
      ))}
    </div>
    <div
      style={{
        flex: 1, minHeight: 120, borderRadius: 8,
        backgroundColor: C.bgLight,
        border: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: C.textDim, fontSize: 16, fontFamily: F.mono,
      }}
    >
      Drop your product screenshot here
    </div>
  </div>
);

const TopPanelContent: React.FC = () => (
  <div style={{ fontFamily: F.sans, fontSize: 13, color: C.text, padding: 16 }}>
    <div style={{ fontSize: 16, fontWeight: 600, color: C.brandLight, marginBottom: 12 }}>
      {PRODUCT_FEATURES[1].title}
    </div>
    <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5, marginBottom: 16 }}>
      {PRODUCT_FEATURES[1].description}
    </div>
    <div style={{
      height: 200, borderRadius: 8, backgroundColor: C.bgLight,
      border: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: C.textDim, fontSize: 14, fontFamily: F.mono,
    }}>
      Product screenshot placeholder
    </div>
  </div>
);

const LeftPanelContent: React.FC = () => (
  <div style={{ fontFamily: F.sans, fontSize: 13, color: C.text, padding: 16 }}>
    <div style={{ fontSize: 16, fontWeight: 600, color: C.brandLight, marginBottom: 12 }}>
      {PRODUCT_FEATURES[2].title}
    </div>
    <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5, marginBottom: 16 }}>
      {PRODUCT_FEATURES[2].description}
    </div>
    <div style={{
      height: 180, borderRadius: 8, backgroundColor: C.bgLight,
      border: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: C.textDim, fontSize: 14, fontFamily: F.mono,
    }}>
      Product screenshot placeholder
    </div>
  </div>
);

export const ProductReveal: React.FC = () => {
  const frame = useCurrentFrame();

  // Resize — top-left moves down-right, bottom-right stays anchored off-canvas
  const left = interpolate(frame, [RESIZE_START, RESIZE_END], [FULL_LEFT, SMALL_LEFT], EASE.snappy);
  const top = interpolate(frame, [RESIZE_START, RESIZE_END], [FULL_TOP, SMALL_TOP], EASE.snappy);
  const w = interpolate(frame, [RESIZE_START, RESIZE_END], [FULL_W, SMALL_W], EASE.snappy);
  const h = interpolate(frame, [RESIZE_START, RESIZE_END], [FULL_H, SMALL_H], EASE.snappy);

  // Panels appear after resize
  const topPanelProg = interpolate(frame, [RESIZE_END, RESIZE_END + 10], [0, 1], EASE.snappy);
  const topPanelTY = interpolate(topPanelProg, [0, 1], [20, 0], EASE.snappy);
  const leftPanelProg = interpolate(frame, [RESIZE_END + 5, RESIZE_END + 15], [0, 1], EASE.snappy);
  const leftPanelTY = interpolate(leftPanelProg, [0, 1], [20, 0], EASE.snappy);

  const getRect = (id: string) => {
    if (id === "product-window") return { left, top, width: w, height: h };
    if (id === "top-panel") return { left: TOP_PANEL.left, top: TOP_PANEL.top, width: TOP_PANEL.w, height: TOP_PANEL.h };
    if (id === "left-panel") return { left: LEFT_PANEL.left, top: LEFT_PANEL.top, width: LEFT_PANEL.w, height: LEFT_PANEL.h };
    return undefined;
  };

  return (
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="bottom" exitTo="right" enterSfx={TRANSITION_SFX}>
      {/* Main product window — starts full, cursor drags top-left to shrink toward bottom-right */}
      <div
        data-cursor-target="product-window"
        style={{
          position: "absolute",
          left, top, width: w, height: h,
        }}
      >
        <Window id="product-window" title="Dashboard — Overview">
          <DashboardContent />
        </Window>
      </div>

      {/* Top panel — appears in freed top-left space */}
      {frame >= RESIZE_END && (
        <div
          data-cursor-target="top-panel"
          style={{
            position: "absolute",
            left: TOP_PANEL.left, top: TOP_PANEL.top,
            width: TOP_PANEL.w, height: TOP_PANEL.h,
            opacity: topPanelProg,
            transform: `translateY(${topPanelTY}px)`,
          }}
        >
          <Window id="top-panel" title="Request Manager">
            <TopPanelContent />
          </Window>
        </div>
      )}

      {/* Left panel — appears slightly after top panel */}
      {frame >= RESIZE_END + 5 && (
        <div
          data-cursor-target="left-panel"
          style={{
            position: "absolute",
            left: LEFT_PANEL.left, top: LEFT_PANEL.top,
            width: LEFT_PANEL.w, height: LEFT_PANEL.h,
            opacity: leftPanelProg,
            transform: `translateY(${leftPanelTY}px)`,
          }}
        >
          <Window id="left-panel" title="Smart Alerts">
            <LeftPanelContent />
          </Window>
        </div>
      )}

      {/* Pop SFX when panels appear */}
      <Sequence from={RESIZE_END} durationInFrames={SFX.pop.durationInFrames} layout="none">
        <Audio src={staticFile(SFX.pop.src)} volume={SFX.pop.volume} />
      </Sequence>
      <Sequence from={RESIZE_END + 5} durationInFrames={SFX.pop.durationInFrames} layout="none">
        <Audio src={staticFile(SFX.pop.src)} volume={SFX.pop.volume} />
      </Sequence>

      <Cursor actions={CURSOR_ACTIONS} getRect={getRect} sfx={CURSOR_SFX} />
    </ScenePush>
  );
};
