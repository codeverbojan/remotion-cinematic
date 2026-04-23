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

const DefaultArrow: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="0 0 28 28" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#shadow)">
      <path
        d="M4 2L4 24L9.5 18.5L14.5 26L18.5 24L13.5 16L21 15L4 2Z"
        fill={color}
        stroke="#111"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <filter id="shadow" x="0" y="0" width="28" height="32" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.35" />
      </filter>
    </defs>
  </svg>
);

const PointerHand: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="0 0 28 28" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#shadow-p)">
      <path
        d="M14 2C14 2 15.5 1.5 16.5 2.5C17.5 3.5 17 5 17 5L17 10
           C17 10 18.5 9.5 19.5 10.5C20.5 11.5 20 13 20 13
           C20 13 21.5 12.5 22.5 13.5C23.5 14.5 23 16 23 16
           L23 20C23 23 20 26 16 26L13 26C10 26 7 24 7 20
           L7 14C7 12.5 8 11.5 9 11.5C10 11.5 11 12.5 11 14
           L11 10L11 5C11 3.5 12 2 14 2Z"
        fill={color}
        stroke="#111"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <line x1="14" y1="11" x2="14" y2="5" stroke="#ddd" strokeWidth="0.5" opacity="0.3" />
      <line x1="17" y1="13" x2="17" y2="11" stroke="#ddd" strokeWidth="0.5" opacity="0.3" />
      <line x1="20" y1="16" x2="20" y2="14" stroke="#ddd" strokeWidth="0.5" opacity="0.3" />
    </g>
    <defs>
      <filter id="shadow-p" x="0" y="0" width="28" height="32" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.35" />
      </filter>
    </defs>
  </svg>
);

const GrabHand: React.FC<{ size: number; color: string; closed: boolean }> = ({ size, color, closed }) => (
  <svg viewBox="0 0 28 28" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#shadow-g)">
      {closed ? (
        <path
          d="M8 15C8 15 8 12 10 11C11 10.3 12 11 12 11
             L12.5 10C12.5 10 13 9 14.5 9.5C15.5 9.8 15.5 11 15.5 11
             L16 10.5C16 10.5 16.5 9.5 18 10C19 10.3 19 11.5 19 11.5
             L19.5 11C19.5 11 20 10 21.5 10.5C22.5 10.8 22.5 12 22.5 12
             L22.5 18C22.5 22 19.5 25 16 25L13 25C10 25 8 23 8 20Z"
          fill={color}
          stroke="#111"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M10 14C10 14 10 12 10 11C10 9.5 11 8.5 12 9C12.5 9.2 12.5 10 12.5 10
             L12.5 7C12.5 5.5 13.5 5 14.5 5.5C15.2 5.8 15.5 7 15.5 7
             L15.5 6C15.5 4.8 16.5 4 17.5 4.5C18.3 4.9 18.5 6 18.5 6
             L18.5 6.5C18.5 5.5 19.5 4.8 20.5 5.3C21.3 5.7 21.5 7 21.5 7
             L21.5 17C21.5 21 18.5 25 15 25L13 25C10 25 8 22 8 19
             L8 15C8 13.5 9 13 10 14Z"
          fill={color}
          stroke="#111"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      )}
    </g>
    <defs>
      <filter id="shadow-g" x="0" y="0" width="28" height="32" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.35" />
      </filter>
    </defs>
  </svg>
);

const TextBeam: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="0 0 28 28" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#shadow-t)">
      <line x1="14" y1="4" x2="14" y2="24" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="10" y1="4" x2="18" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="24" x2="18" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </g>
    <defs>
      <filter id="shadow-t" x="0" y="0" width="28" height="32" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.35" />
      </filter>
    </defs>
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
  size = 36,
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

  const originX = shape === "default" ? 2 : size / 2;
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
            left: -6,
            top: -6,
            width: size + 12,
            height: size + 12,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.3)",
            transform: `scale(${pulseScale}) translateZ(0)`,
            opacity: pulseOpacity,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
