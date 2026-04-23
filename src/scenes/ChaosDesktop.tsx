import React from "react";
import { Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Cursor } from "../engine";
import type { CursorAction } from "../engine";
import { Headline, ScenePush, Window } from "../primitives";
import {
  CHAT_MESSAGES,
  CURSOR_SFX,
  EMAIL_THREAD,
  HEADLINES,
  NOTIFICATIONS,
  SCENE_OVERLAP,
  SFX,
  SPREADSHEET_COLUMNS,
  SPREADSHEET_ROWS,
  STICKY_NOTES,
} from "../content";
import { C, EASE, F } from "../tokens";

const DURATION = 260;
const MC_START = 150;
const MC_DUR = 25;

interface WindowDef {
  id: string;
  title: string;
  enterAt: number;
  enterDur: number;
  x: number;
  y: number;
  w: number;
  h: number;
  mcX: number;
  mcY: number;
}

const WINDOW_DEFS: WindowDef[] = [
  {
    id: "spreadsheet", title: "Tracking Sheet",
    enterAt: 5, enterDur: 14,
    x: 500, y: 30, w: 1100, h: 500,
    mcX: 1450, mcY: -200,
  },
  {
    id: "email", title: "Email — Q2 Requests",
    enterAt: 30, enterDur: 14,
    x: 20, y: 200, w: 1020, h: 400,
    mcX: -680, mcY: 400,
  },
  {
    id: "chat", title: "Team Chat",
    enterAt: 60, enterDur: 14,
    x: 200, y: 350, w: 1200, h: 500,
    mcX: 900, mcY: 850,
  },
];

const CURSOR_ACTIONS: CursorAction[] = [
  { at: 0, action: "idle", position: { x: 960, y: 540 } },
  { at: 10, action: "moveTo", target: "spreadsheet", anchor: "center", duration: 12 },
  { at: 26, action: "click", target: "spreadsheet" },
  { at: 34, action: "moveTo", target: "email", anchor: "top-bar", duration: 12 },
  { at: 50, action: "click", target: "email" },
  { at: 58, action: "moveTo", target: "chat", anchor: "center", duration: 12 },
  { at: 76, action: "click", target: "chat" },
  { at: 84, action: "moveTo", target: "notification-0", anchor: "center", duration: 12 },
  { at: 100, action: "click", target: "notification-0" },
  { at: 108, action: "moveTo", target: "notification-1", anchor: "center", duration: 10 },
  { at: 122, action: "idle", position: { x: 960, y: 540 } },
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

const STATUS_COLORS: Record<string, string> = {
  Pending: C.warning,
  Shipped: C.success,
  Approved: C.success,
  Review: C.accent,
};

const SpreadsheetContent: React.FC = () => (
  <div style={{ fontFamily: F.mono, fontSize: 12, color: C.text, padding: 8 }}>
    <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, paddingBottom: 6, marginBottom: 4 }}>
      {SPREADSHEET_COLUMNS.map((col) => (
        <div key={col} style={{ flex: 1, fontWeight: 700, color: C.textMuted }}>{col}</div>
      ))}
    </div>
    {SPREADSHEET_ROWS.map((row, i) => (
      <div key={i} style={{ display: "flex", padding: "4px 0", borderBottom: `1px solid ${C.border}22` }}>
        {row.map((cell, j) => (
          <div key={j} style={{ flex: 1, color: j === 2 ? (STATUS_COLORS[cell] ?? C.textMuted) : C.text }}>{cell}</div>
        ))}
      </div>
    ))}
  </div>
);

const EmailContent: React.FC = () => (
  <div style={{ fontFamily: F.sans, fontSize: 13, color: C.text, padding: 12 }}>
    <div style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, marginBottom: 8 }}>
      {EMAIL_THREAD[0].subject}
    </div>
    {EMAIL_THREAD.map((msg, i) => (
      <div key={i} style={{ marginBottom: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}22` }}>
        <div style={{ fontSize: 12, color: C.accent, marginBottom: 4 }}>{msg.from}</div>
        <div style={{ color: C.textMuted }}>{msg.body}</div>
      </div>
    ))}
  </div>
);

const ChatContent: React.FC = () => (
  <div style={{ fontFamily: F.sans, fontSize: 13, color: C.text, padding: 12 }}>
    {CHAT_MESSAGES.map((msg, i) => (
      <div key={i} style={{ marginBottom: 8 }}>
        <span style={{ fontWeight: 600, color: C.brandLight, marginRight: 8 }}>{msg.from}</span>
        <span style={{ color: C.textMuted }}>{msg.text}</span>
      </div>
    ))}
  </div>
);

const CONTENT_MAP: Record<string, React.FC> = {
  spreadsheet: SpreadsheetContent,
  email: EmailContent,
  chat: ChatContent,
};

export const ChaosDesktop: React.FC = () => {
  const frame = useCurrentFrame();
  const mcProg = interpolate(frame, [MC_START, MC_START + MC_DUR], [0, 1], EASE.snappy);

  const getRect = (id: string) => {
    if (id.startsWith("notification-")) {
      const idx = parseInt(id.split("-")[1], 10);
      const mcSlide = interpolate(mcProg, [0, 1], [0, 500], EASE.snappy);
      return { left: 1920 - 30 - 360 + mcSlide, top: 30 + idx * 102, width: 360, height: 80 };
    }
    const def = WINDOW_DEFS.find((d) => d.id === id);
    if (!def) return undefined;
    const x = interpolate(mcProg, [0, 1], [def.x, def.mcX], EASE.snappy);
    const y = interpolate(mcProg, [0, 1], [def.y, def.mcY], EASE.snappy);
    return { left: x, top: y, width: def.w, height: def.h };
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
              left: sX, top: sY,
              opacity: enterProg,
              transform: `scale(${enterScale}) translateY(${enterTY}px)`,
              transformOrigin: "top left",
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

      {/* Main windows */}
      {WINDOW_DEFS.map((def) => {
        const enterProg = interpolate(frame, [def.enterAt, def.enterAt + def.enterDur], [0, 1], EASE.snappy);
        const x = interpolate(mcProg, [0, 1], [def.x, def.mcX], EASE.snappy);
        const y = interpolate(mcProg, [0, 1], [def.y, def.mcY], EASE.snappy);
        const enterScale = interpolate(enterProg, [0, 1], [0.92, 1], EASE.snappy);
        const enterTY = interpolate(enterProg, [0, 1], [30, 0], EASE.snappy);
        const Content = CONTENT_MAP[def.id];

        return (
          <div
            key={def.id}
            data-cursor-target={def.id}
            style={{
              position: "absolute",
              left: x, top: y,
              width: def.w, height: def.h,
              opacity: enterProg,
              transform: `translateY(${enterTY}px) scale(${enterScale})`,
              transformOrigin: "top left",
            }}
          >
            <Window id={def.id} title={def.title}>
              {Content && <Content />}
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
            data-cursor-target={`notification-${i}`}
            style={{
              position: "absolute",
              right: 30, top: 30 + i * 102,
              width: 360, padding: "14px 18px",
              borderRadius: 10, backgroundColor: C.surface,
              border: `1px solid ${C.windowBorder}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              opacity: enterProg,
              transform: `translateX(${enterSlide + mcSlide}px)`,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: NOTIFICATION_COLORS[i] ?? C.text, fontFamily: F.sans }}>
              {note.title}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, fontFamily: F.sans, marginTop: 4 }}>
              {note.body}
            </div>
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
      <Sequence from={MC_START} layout="none">
        <Headline
          lines={HEADLINES.pain}
          fontSize={104}
          lineDelay={18}
          entranceDuration={12}
          yRise={80}
          wordStream={{ stagger: 3, duration: 5, yRise: 50 }}
        />
      </Sequence>

      <Cursor actions={CURSOR_ACTIONS} getRect={getRect} sfx={CURSOR_SFX} />
    </ScenePush>
  );
};
