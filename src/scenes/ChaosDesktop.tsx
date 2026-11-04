import { ContentViewport } from "../primitives/ContentViewport";
import { SoundEffect } from "../engine/audio/SoundEffect";
import { useSceneConfig } from "../SceneContext";
import React, { useMemo } from "react";
import { Sequence, staticFile, useCurrentFrame } from "remotion";
import { Cursor, resolveWindowPose, mapCursorPath, filterCursorPath, getSceneStartFrame } from "../engine";
import { Headline, Window, DataTable, MessageList, NotificationToast } from "../primitives";
import {
  CHAT_MESSAGES,
  CURSOR_SFX,
  EMAIL_THREAD,
  NOTIFICATIONS,
  SFX,
  SPREADSHEET_COLUMNS,
  SPREADSHEET_ROWS,
  STICKY_NOTES,
} from "../content";
import { useHeadlines, useWindowLayout, useCursorPath, useVideoProps, useCursorStyle } from "../VideoPropsContext";
import { applyPendingEdits, getPendingRevision } from "../editor/pendingCursorEdits";
import { C, F } from "../tokens";


const SCENE_WINDOW_IDS = [
  "spreadsheet", "email", "chat",
  "sticky-0", "sticky-1", "sticky-2",
  "notification-0", "notification-1", "notification-2",
];


const NOTIFICATION_COLORS: Record<string, string> = {
  "notification-0": C.accent,
  "notification-1": C.error,
  "notification-2": C.warning,
};

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
  const { durationInFrames: DURATION } = useSceneConfig();
  const frame = useCurrentFrame();
  const headlines = useHeadlines();
  const props = useVideoProps();
  const allWindows = useWindowLayout();

  const windows = useMemo(() => allWindows.filter((w) => SCENE_WINDOW_IDS.includes(w.id)), [allWindows]);
  const cursorPathRaw = useCursorPath();
  const cursorStyle = useCursorStyle();
  const enabledScenes = useMemo(() => props.scenes.filter((s) => s.enabled), [props.scenes]);
  const pendingRev = getPendingRevision();
  const cursorActions = useMemo(() => {
    const merged = applyPendingEdits(cursorPathRaw);
    const offset = getSceneStartFrame(enabledScenes, "chaos", props.overlap);
    const sceneEntries = filterCursorPath(merged, allWindows.filter((w) => SCENE_WINDOW_IDS.includes(w.id) || w.sceneId === "chaos").map((w) => w.id), offset, DURATION, "chaos");
    return mapCursorPath(sceneEntries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorPathRaw, enabledScenes, props.overlap, pendingRev, DURATION, allWindows]);

  const mcStart = windows.find((w) => w.id === "spreadsheet")?.animateAt ?? 150;

  const getRect = (id: string) => {
    const def = allWindows.find((d) => d.id === id);
    if (!def) return undefined;
    const pose = resolveWindowPose(def, frame, props.easing);
    if (!pose.visible) {
      return { left: def.startX, top: def.startY, width: def.startW, height: def.startH };
    }
    return { left: pose.left, top: pose.top, width: pose.width, height: pose.height };
  };

  const sorted = useMemo(
    () => [...windows].sort((a, b) => a.zIndex - b.zIndex),
    [windows],
  );

  const notificationWindows = useMemo(
    () => windows.filter((w) => w.id.startsWith("notification-")),
    [windows],
  );

  return (
    <>
      {sorted.map((def) => {
        const pose = resolveWindowPose(def, frame, props.easing);
        if (!pose.visible) return null;

        let content: React.ReactNode;

        if (def.id.startsWith("sticky-")) {
          const idx = parseInt(def.id.split("-")[1], 10);
          const note = STICKY_NOTES[idx];
          if (!note) return null;
          content = (
            <div
              data-editor-id={def.id}
              data-editor-type="sticky-note"
              style={{
                width: "100%", height: "100%",
                backgroundColor: note.color, borderRadius: 4,
                padding: 16, fontFamily: F.sans, fontSize: 14,
                fontWeight: 500, color: "#333", lineHeight: 1.4,
                boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              }}
            >
              {note.text}
            </div>
          );
        } else if (def.id.startsWith("notification-")) {
          const idx = parseInt(def.id.split("-")[1], 10);
          const note = NOTIFICATIONS[idx];
          if (!note) return null;
          content = (
            <NotificationToast
              id={def.id}
              title={note.title}
              body={note.body}
              accent={NOTIFICATION_COLORS[def.id]}
            />
          );
        } else {
          content = (
            <Window id={def.id} title={def.title}>
              <ContentViewport width={pose.width} height={pose.height - 42} designWidth={def.id === "spreadsheet" ? 700 : 620}>{WINDOW_CONTENT[def.id]}</ContentViewport>
            </Window>
          );
        }

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
            {content}
          </div>
        );
      })}

      {/* Typing sound during spreadsheet/chat activity */}
      <Sequence from={8} durationInFrames={SFX.typing.durationInFrames} layout="none">
        <SoundEffect src={staticFile(SFX.typing.src)} volume={SFX.typing.volume} />
      </Sequence>

      {/* Notification dings — timing derived from windowLayout enterAt */}
      {notificationWindows.map((w) => (
        <Sequence key={`notif-sfx-${w.id}`} from={w.enterAt} durationInFrames={SFX.notification.durationInFrames} layout="none">
          <SoundEffect src={staticFile(SFX.notification.src)} volume={SFX.notification.volume} />
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
    </>
  );
};
