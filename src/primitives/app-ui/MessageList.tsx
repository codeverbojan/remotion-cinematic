import React from "react";
import { C, F } from "../../tokens";

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

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  variant = "chat",
  id,
  style,
}) => (
  <div
    data-cursor-target={id}
    style={{ fontFamily: F.sans, fontSize: 13, color: C.text, ...style }}
  >
    {variant === "email" && messages[0]?.subject && (
      <div style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, marginBottom: 8 }}>
        {messages[0].subject}
      </div>
    )}
    {messages.map((msg, i) => {
      if (variant === "email") {
        return (
          <div
            key={i}
            style={{
              marginBottom: 10,
              padding: "8px 0",
              borderBottom: `1px solid ${C.border}22`,
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
        <div key={i} style={{ marginBottom: 8 }}>
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
