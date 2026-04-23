import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../tokens";

interface TypeWriterProps {
  text: string;
  delay?: number;
  speed?: number;
  cursor?: boolean;
  cursorBlinkRate?: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  style?: React.CSSProperties;
}

export interface TypeWriterPose {
  visibleChars: number;
  cursorVisible: boolean;
  done: boolean;
}

export function getTypeWriterPose(
  frame: number,
  delay: number,
  textLength: number,
  speed: number,
  cursorBlinkRate: number,
): TypeWriterPose {
  const rel = frame - delay;
  if (rel < 0) return { visibleChars: 0, cursorVisible: true, done: false };

  const visibleChars = Math.min(Math.floor(rel / speed), textLength);
  const done = visibleChars >= textLength;
  const cursorVisible = done
    ? Math.floor(rel / cursorBlinkRate) % 2 === 0
    : true;

  return { visibleChars, cursorVisible, done };
}

export const TypeWriter: React.FC<TypeWriterProps> = ({
  text,
  delay = 0,
  speed = 2,
  cursor = true,
  cursorBlinkRate = 8,
  fontSize = 24,
  color = C.text,
  fontFamily = F.mono,
  style,
}) => {
  const frame = useCurrentFrame();
  const pose = getTypeWriterPose(frame, delay, text.length, speed, cursorBlinkRate);

  return (
    <span
      style={{
        fontSize,
        color,
        fontFamily,
        whiteSpace: "pre",
        ...style,
      }}
    >
      {text.slice(0, pose.visibleChars)}
      {cursor && (
        <span style={{ opacity: pose.cursorVisible ? 1 : 0 }}>▎</span>
      )}
    </span>
  );
};
