import React from "react";
import { interpolate } from "remotion";
import { EASE } from "../../tokens";

export type CursorShape = "default" | "pointer" | "grab" | "grabbing" | "text";

interface CursorSpriteProps {
  size?: number;
  color?: string;
  scale?: number;
  rotation?: number;
  pulseOpacity?: number;
  pulseScale?: number;
  shape?: CursorShape;
  shapeProgress?: number;
}

const SHADOW_STYLE: React.CSSProperties = {
  filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.45)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
};

const DefaultArrow: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={SHADOW_STYLE}
  >
    <path
      d="M12 4L12 82L30 64L44 92L56 86L42 58L64 56L12 4Z"
      fill={color}
      stroke="#1a1a2e"
      strokeWidth="4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

const PointerHand: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={SHADOW_STYLE}
  >
    {/* Index finger pointing up, fist curled below — classic link cursor */}
    <path
      d="M44 6C40 6 37 10 37 14L37 38
         C33 36 28 37 26 40C23 44 24 48 24 50
         L24 68C24 82 34 94 50 94
         C66 94 76 82 76 68L76 50
         C76 46 73 42 68 42L68 48L68 42
         C64 42 61 42 58 44L58 48L58 44
         C55 42 52 42 49 44L49 14
         C49 10 46 6 42 6Z"
      fill={color}
      stroke="#1a1a2e"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    {/* Finger separators */}
    <line x1="58" y1="48" x2="58" y2="58" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.15" strokeLinecap="round" />
    <line x1="68" y1="48" x2="68" y2="58" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.15" strokeLinecap="round" />
  </svg>
);

const GrabHand: React.FC<{ size: number; color: string; closed: boolean }> = ({ size, color, closed }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={SHADOW_STYLE}
  >
    {closed ? (
      <path
        d="M22 52C22 48 24 44 28 42L28 40C28 36 31 34 35 34L35 34
           C35 34 36 30 40 30C43 30 44 33 44 33C44 33 45 30 49 30
           C52 30 54 33 54 33C54 33 56 30 59 30C62 30 64 33 64 36
           L64 38C68 38 72 42 72 46L72 66C72 80 62 92 48 92L42 92
           C30 92 22 82 22 70Z"
        fill={color}
        stroke="#1a1a2e"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M28 50C28 50 28 46 28 42C28 36 32 32 36 34L36 34
           L36 20C36 14 40 10 44 12L44 12L44 16
           C44 16 44 10 48 8C52 6 56 10 56 14L56 16
           C56 16 56 10 60 8C64 6 68 10 68 16L68 18
           C68 18 68 12 72 10C76 8 80 12 80 18L80 56
           C80 74 68 92 50 92L44 92C30 92 22 80 22 66
           L22 54C22 48 26 46 28 50Z"
        fill={color}
        stroke="#1a1a2e"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const TextBeam: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={SHADOW_STYLE}
  >
    <line x1="50" y1="14" x2="50" y2="86" stroke={color} strokeWidth="5" strokeLinecap="round" />
    <path d="M34 14C34 14 42 14 50 14C58 14 66 14 66 14" stroke={color} strokeWidth="5" strokeLinecap="round" />
    <path d="M34 86C34 86 42 86 50 86C58 86 66 86 66 86" stroke={color} strokeWidth="5" strokeLinecap="round" />
    <line x1="50" y1="14" x2="50" y2="86" stroke="#1a1a2e" strokeWidth="7" strokeLinecap="round" opacity="0.15" />
  </svg>
);

export function getCursorShape(
  actionType: string,
  isMovingToClick: boolean,
  isDragging: boolean,
): CursorShape {
  switch (actionType) {
    case "click": return "pointer";
    case "drag": return isDragging ? "grabbing" : "grab";
    default:
      return isMovingToClick ? "pointer" : "default";
  }
}

export const CursorSprite: React.FC<CursorSpriteProps> = ({
  size = 52,
  color = "#FFFFFF",
  scale = 1,
  rotation = 0,
  pulseOpacity = 0,
  pulseScale = 1,
  shape = "default",
  shapeProgress = 1,
}) => {
  const morphScale = interpolate(shapeProgress, [0, 1], [0.85, 1], EASE.smooth);
  const morphOpacity = interpolate(shapeProgress, [0, 1], [0.5, 1], EASE.smooth);

  const originX = shape === "default" ? 6 : size / 2;
  const originY = shape === "default" ? 2 : 2;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: `scale(${scale * morphScale}) rotate(${rotation}deg) translateZ(0)`,
        transformOrigin: `${originX}px ${originY}px`,
        willChange: "transform",
        opacity: morphOpacity,
      }}
    >
      {shape === "default" && <DefaultArrow size={size} color={color} />}
      {shape === "pointer" && <PointerHand size={size} color={color} />}
      {shape === "grab" && <GrabHand size={size} color={color} closed={false} />}
      {shape === "grabbing" && <GrabHand size={size} color={color} closed={true} />}
      {shape === "text" && <TextBeam size={size} color={color} />}
      {pulseOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            left: -8,
            top: -8,
            width: size + 16,
            height: size + 16,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.25)",
            transform: `scale(${pulseScale}) translateZ(0)`,
            opacity: pulseOpacity,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
