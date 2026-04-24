import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useUIState } from "../../engine/ui-state";
import { C, F, EASE } from "../../tokens";

export interface Message {
  from: string;
  text: string;
  subject?: string;
  timestamp?: string;
}

export interface MessageListProps {
  messages: Message[];
  variant?: "chat" | "email";
  id?: string;
  style?: React.CSSProperties;
}

interface MessageListUIState {
  visibleCount: number;
  revealedAt: number;
}

const DEFAULT_STATE: MessageListUIState = { visibleCount: -1, revealedAt: -1 };
const ENTRANCE_FRAMES = 8;

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  variant = "chat",
  id,
  style,
}) => {
  const frame = useCurrentFrame();
  const { visibleCount, revealedAt } = useUIState(id ?? "", DEFAULT_STATE);
  const showAll = visibleCount < 0;
  const count = showAll ? messages.length : Math.min(visibleCount, messages.length);
  const visibleMessages = messages.slice(0, count);
  const lastIdx = count - 1;

  return (
    <div
      data-cursor-target={id}
      data-editor-id={id}
      data-editor-type="message-list"
      style={{ fontFamily: F.sans, fontSize: 13, color: C.text, ...style }}
    >
      {variant === "email" && messages[0]?.subject && (
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, marginBottom: 8 }}>
          {messages[0].subject}
        </div>
      )}
      {visibleMessages.map((msg, i) => {
        const isNewMessage = !showAll && i === lastIdx && revealedAt >= 0;
        let entranceOpacity = 1;
        let entranceTY = 0;
        if (isNewMessage) {
          const elapsed = frame - revealedAt;
          entranceOpacity = interpolate(elapsed, [0, ENTRANCE_FRAMES], [0, 1], EASE.snappy);
          entranceTY = interpolate(elapsed, [0, ENTRANCE_FRAMES], [12, 0], EASE.snappy);
        }

        if (variant === "email") {
          return (
            <div
              key={i}
              style={{
                marginBottom: 10,
                padding: "8px 0",
                borderBottom: `1px solid ${C.border}22`,
                opacity: entranceOpacity,
                transform: entranceTY !== 0 ? `translateY(${Math.round(entranceTY)}px)` : undefined,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: C.accent }}>{msg.from}</span>
                {msg.timestamp && (
                  <span style={{ fontSize: 11, color: C.textDim }}>{msg.timestamp}</span>
                )}
              </div>
              <div style={{ color: C.textMuted }}>{msg.text}</div>
            </div>
          );
        }

        return (
          <div
            key={i}
            style={{
              marginBottom: 8,
              opacity: entranceOpacity,
              transform: entranceTY !== 0 ? `translateY(${Math.round(entranceTY)}px)` : undefined,
            }}
          >
            <span style={{ fontWeight: 600, color: C.brandLight, marginRight: 8 }}>
              {msg.from}
            </span>
            <span style={{ color: C.textMuted }}>{msg.text}</span>
            {msg.timestamp && (
              <span style={{ fontSize: 11, color: C.textDim, marginLeft: 8 }}>
                {msg.timestamp}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
