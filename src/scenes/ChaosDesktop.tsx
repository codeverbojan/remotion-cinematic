import React, { useEffect, useMemo, useRef } from "react";
import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
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
import { persistUpdate } from "../editor/updateProps";
import { applyPendingEdits, getPendingRevision } from "../editor/pendingCursorEdits";
import type { WindowLayout } from "../schema";
import { C, F } from "../tokens";

const DURATION = 260;

const SCENE_WINDOW_IDS = [
  "spreadsheet", "email", "chat",
  "sticky-0", "sticky-1", "sticky-2",
  "notification-0", "notification-1", "notification-2",
];

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

const ELEMENT_DEFAULTS: WindowLayout[] = [
  { id: "sticky-0", title: "Sticky Note", startX: 30, startY: 20, startW: 200, startH: 160, endX: -100, endY: -180, enterAt: 0, enterDuration: 12, enterFrom: "scale", animateAt: 150, animateDuration: 25, exitDuration: 12, zIndex: 0, rotation: -3 },
  { id: "sticky-1", title: "Sticky Note", startX: 260, startY: 35, startW: 200, startH: 160, endX: 60, endY: -200, enterAt: 8, enterDuration: 12, enterFrom: "scale", animateAt: 150, animateDuration: 25, exitDuration: 12, zIndex: 0, rotation: 2.5 },
  { id: "sticky-2", title: "Sticky Note", startX: 140, startY: 190, startW: 200, startH: 160, endX: -60, endY: -160, enterAt: 16, enterDuration: 12, enterFrom: "scale", animateAt: 150, animateDuration: 25, exitDuration: 12, zIndex: 0, rotation: -4 },
  { id: "notification-0", title: "Notification", startX: 1530, startY: 30, startW: 360, startH: 80, endX: 2030, enterAt: 90, enterDuration: 10, enterFrom: "slide-right", animateAt: 150, animateDuration: 25, exitDuration: 12, zIndex: 10 },
  { id: "notification-1", title: "Notification", startX: 1530, startY: 132, startW: 360, startH: 80, endX: 2030, enterAt: 104, enterDuration: 10, enterFrom: "slide-right", animateAt: 150, animateDuration: 25, exitDuration: 12, zIndex: 10 },
  { id: "notification-2", title: "Notification", startX: 1530, startY: 234, startW: 360, startH: 80, endX: 2030, enterAt: 118, enterDuration: 10, enterFrom: "slide-right", animateAt: 150, animateDuration: 25, exitDuration: 12, zIndex: 10 },
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
  const frame = useCurrentFrame();
  const headlines = useHeadlines();
  const props = useVideoProps();
  const allWindows = useWindowLayout();

  const windows = useMemo(() => {
    const seen = new Set<string>();
    const deduped: typeof allWindows = [];
    for (const w of allWindows) {
      if (!seen.has(w.id)) { seen.add(w.id); deduped.push(w); }
    }
    const missing = ELEMENT_DEFAULTS.filter((d) => !seen.has(d.id));
    const merged = missing.length > 0 ? [...deduped, ...missing] : deduped;
    return merged.filter((w) => SCENE_WINDOW_IDS.includes(w.id));
  }, [allWindows]);

  const migrated = useRef(false);
  useEffect(() => {
    if (migrated.current) return;
    const existingIds = new Set(allWindows.map((w) => w.id));
    const missing = ELEMENT_DEFAULTS.filter((d) => !existingIds.has(d.id));
    if (missing.length > 0) {
      migrated.current = true;
      persistUpdate((prev) => {
        const prevIds = new Set(prev.windowLayout.map((w) => w.id));
        const toAdd = missing.filter((d) => !prevIds.has(d.id));
        if (toAdd.length === 0) return prev;
        return { ...prev, windowLayout: [...prev.windowLayout, ...toAdd] };
      });
    }
  }, [allWindows]);
  const cursorPathRaw = useCursorPath();
  const cursorStyle = useCursorStyle();
  const enabledScenes = useMemo(() => props.scenes.filter((s) => s.enabled), [props.scenes]);
  const pendingRev = getPendingRevision();
  const cursorActions = useMemo(() => {
    const merged = applyPendingEdits(cursorPathRaw);
    const offset = getSceneStartFrame(enabledScenes, "chaos", props.overlap);
    const sceneEntries = filterCursorPath(merged, SCENE_WINDOW_IDS, offset, DURATION);
    return sceneEntries.length > 0 ? mapCursorPath(sceneEntries) : CURSOR_ACTIONS;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorPathRaw, enabledScenes, props.overlap, pendingRev]);

  const mcStart = windows.find((w) => w.id === "spreadsheet")?.animateAt ?? 150;

  const getRect = (id: string) => {
    const def = windows.find((d) => d.id === id);
    if (!def) return undefined;
    const pose = resolveWindowPose(def, frame);
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
    <ScenePush duration={DURATION} overlap={SCENE_OVERLAP} enterFrom="none" exitTo="top">
      {sorted.map((def) => {
        const pose = resolveWindowPose(def, frame);
        if (!pose.visible) return null;

        let content: React.ReactNode;

        if (def.id.startsWith("sticky-")) {
          const idx = parseInt(def.id.split("-")[1], 10);
          const note = STICKY_NOTES[idx];
          if (!note) return null;
          const rotation = def.rotation ?? 0;
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
                transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
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
              {WINDOW_CONTENT[def.id]}
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
              transform: `scale(${pose.scale}) translate(${pose.translateX}px, ${pose.translateY}px) translateZ(0)`,
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
        <Audio src={staticFile(SFX.typing.src)} volume={SFX.typing.volume} />
      </Sequence>

      {/* Notification dings — timing derived from windowLayout enterAt */}
      {notificationWindows.map((w) => (
        <Sequence key={`notif-sfx-${w.id}`} from={w.enterAt} durationInFrames={SFX.notification.durationInFrames} layout="none">
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
