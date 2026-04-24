import React, { useMemo } from "react";
import { Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Cursor, resolveWindowPose, mapCursorPath, filterCursorPath, getSceneStartFrame } from "../engine";
import type { CursorAction } from "../engine";
import { Headline, ScenePush, Window, DataTable, MessageList, NotificationToast } from "../primitives";
import {
  CHAT_MESSAGES,
  CURSOR_SFX,
  EMAIL_THREAD,
  NOTIFICATIONS,
  SCENE_OVERLAP,
  SFX,
  SPREADSHEET_COLUMNS,
  SPREADSHEET_ROWS,
  STICKY_NOTES,
} from "../content";
import { useHeadlines, useWindowLayout, useCursorPath, useVideoProps, useCursorStyle } from "../VideoPropsContext";
import { C, EASE, F } from "../tokens";

const DURATION = 260;

const SCENE_WINDOW_IDS = ["spreadsheet", "email", "chat", "notification-0", "notification-1", "notification-2"];

const CURSOR_ACTIONS: CursorAction[] = [
  { at: 0, action: "idle", position: { x: 1400, y: 300 } },
  { at: 10, action: "moveTo", target: "spreadsheet", anchor: { xPct: 60, yPct: 40 }, duration: 12 },
  { at: 26, action: "click", target: "spreadsheet" },
  { at: 34, action: "moveTo", target: "email", anchor: "top-bar", duration: 12 },
  { at: 50, action: "click", target: "email" },
  { at: 58, action: "moveTo", target: "chat", anchor: { xPct: 40, yPct: 30 }, duration: 12 },
  { at: 76, action: "click", target: "chat" },
  { at: 84, action: "moveTo", target: "notification-0", anchor: "center", duration: 12 },
  { at: 100, action: "click", target: "notification-0" },
  { at: 108, action: "moveTo", target: "notification-1", anchor: "center", duration: 10 },
  { at: 122, action: "click", target: "notification-1" },
];

const NOTIFICATION_COLORS = [C.accent, C.error, C.warning];

const STICKY_ROTATIONS = [-3, 2.5, -4];
const STICKY_POSITIONS = [
  { left: 30, top: 20 },
  { left: 260, top: 35 },
  { left: 140, top: 190 },
];
const STICKY_MC = [
  { left: -100, top: -180 },
  { left: 60, top: -200 },
  { left: -60, top: -160 },
];

const WINDOW_CONTENT: Record<string, React.ReactNode> = {
  spreadsheet: (
    <DataTable
      columns={[...SPREADSHEET_COLUMNS]}
      rows={SPREADSHEET_ROWS.map((r) => [...r])}
      statusColumn={2}
      style={{ padding: 8 }}
    />
  ),
  email: (
    <MessageList
      messages={EMAIL_THREAD.map((e) => ({ from: e.from, text: e.body, subject: e.subject }))}
      variant="email"
      style={{ padding: 12 }}
    />
  ),
  chat: (
    <MessageList
      messages={CHAT_MESSAGES.map((m) => ({ from: m.from, text: m.text }))}
      variant="chat"
      style={{ padding: 12 }}
    />
  ),
};

export const ChaosDesktop: React.FC = () => {
  const frame = useCurrentFrame();
  const headlines = useHeadlines();
  const props = useVideoProps();
  const allWindows = useWindowLayout();
  const windows = allWindows.filter((w) => SCENE_WINDOW_IDS.includes(w.id));
  const cursorPathRaw = useCursorPath();
  const cursorStyle = useCursorStyle();
  const enabledScenes = useMemo(() => props.scenes.filter((s) => s.enabled), [props.scenes]);
  const cursorActions = useMemo(() => {
    const offset = getSceneStartFrame(enabledScenes, "chaos", props.overlap);
    const sceneEntries = filterCursorPath(cursorPathRaw, SCENE_WINDOW_IDS, offset, DURATION);
    return sceneEntries.length > 0 ? mapCursorPath(sceneEntries) : CURSOR_ACTIONS;
  }, [cursorPathRaw, enabledScenes, props.overlap]);

  const mcStart = windows[0]?.animateAt ?? 150;
  const mcDur = windows[0]?.animateDuration ?? 25;
  const mcProg = interpolate(frame, [mcStart, mcStart + mcDur], [0, 1], EASE.snappy);

  const getRect = (id: string) => {
    if (id.startsWith("notification-")) {
      const idx = parseInt(id.split("-")[1], 10);
      const mcSlide = interpolate(mcProg, [0, 1], [0, 500], EASE.snappy);
      return { left: 1920 - 30 - 360 + mcSlide, top: 30 + idx * 102, width: 360, height: 80 };
    }
    const def = windows.find((d) => d.id === id);
    if (!def) return undefined;
    const pose = resolveWindowPose(def, frame);
    if (!pose.visible) return undefined;
    return { left: pose.left, top: pose.top, width: pose.width, height: pose.height };
  };

  return (
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="none" exitTo="top">
      {/* Sticky notes */}
      {STICKY_NOTES.map((note, i) => {
        const enterProg = interpolate(frame, [i * 8, i * 8 + 12], [0, 1], EASE.snappy);
        const sX = interpolate(mcProg, [0, 1], [STICKY_POSITIONS[i].left, STICKY_MC[i].left], EASE.snappy);
        const sY = interpolate(mcProg, [0, 1], [STICKY_POSITIONS[i].top, STICKY_MC[i].top], EASE.snappy);
        const enterScale = interpolate(enterProg, [0, 1], [0.8, 1], EASE.snappy);
        const enterTY = interpolate(enterProg, [0, 1], [20, 0], EASE.snappy);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: Math.round(sX), top: Math.round(sY),
              opacity: enterProg,
              transform: `scale(${enterScale}) translateY(${Math.round(enterTY)}px) translateZ(0)`,
              transformOrigin: "top left",
              willChange: "transform",
            }}
          >
            <div
              style={{
                width: 200, height: 160,
                backgroundColor: note.color, borderRadius: 4,
                padding: 16, fontFamily: F.sans, fontSize: 14,
                fontWeight: 500, color: "#333", lineHeight: 1.4,
                boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                transform: `rotate(${STICKY_ROTATIONS[i]}deg)`,
              }}
            >
              {note.text}
            </div>
          </div>
        );
      })}

      {/* Main windows — positions driven by windowLayout props */}
      {windows.map((def) => {
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

      {/* Notifications — slide off right edge during MC */}
      {NOTIFICATIONS.map((note, i) => {
        const enterProg = interpolate(frame, [90 + i * 14, 90 + i * 14 + 10], [0, 1], EASE.snappy);
        const mcSlide = interpolate(mcProg, [0, 1], [0, 500], EASE.snappy);
        const enterSlide = interpolate(enterProg, [0, 1], [80, 0], EASE.snappy);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              right: 30, top: 30 + i * 102,
              opacity: enterProg,
              transform: `translateX(${Math.round(enterSlide + mcSlide)}px) translateZ(0)`,
              willChange: "transform",
            }}
          >
            <NotificationToast
              id={`notification-${i}`}
              title={note.title}
              body={note.body}
              accent={NOTIFICATION_COLORS[i]}
            />
          </div>
        );
      })}

      {/* Typing sound during spreadsheet/chat activity */}
      <Sequence from={8} durationInFrames={SFX.typing.durationInFrames} layout="none">
        <Audio src={staticFile(SFX.typing.src)} volume={SFX.typing.volume} />
      </Sequence>

      {/* Notification dings */}
      {NOTIFICATIONS.map((_, i) => (
        <Sequence key={`notif-sfx-${i}`} from={90 + i * 14} durationInFrames={SFX.notification.durationInFrames} layout="none">
          <Audio src={staticFile(SFX.notification.src)} volume={SFX.notification.volume} />
        </Sequence>
      ))}

      {/* Headline — stays visible until push exit (no exitAt) */}
      <Sequence from={mcStart} layout="none">
        <Headline
          lines={headlines.pain}
          fontSize={headlines.painFontSize ?? 104}
          color={headlines.color}
          lineDelay={18}
          entranceDuration={12}
          yRise={80}
          wordStream={{ stagger: 3, duration: 5, yRise: 50 }}
          headlineKey="pain"
        />
      </Sequence>

      <Cursor actions={cursorActions} getRect={getRect} sfx={CURSOR_SFX} size={Math.round(52 * cursorStyle.scale)} baseRotation={cursorStyle.rotation} />
    </ScenePush>
  );
};
