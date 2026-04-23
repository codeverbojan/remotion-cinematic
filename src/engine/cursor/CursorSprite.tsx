import React from "react";
import { interpolate } from "remotion";
import { EASE } from "../../tokens";

// Cursor SVGs from Phosphor Icons (MIT license)
// https://github.com/phosphor-icons/core

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

const SHADOW: React.CSSProperties = {
  filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.5)) drop-shadow(0 1px 3px rgba(0,0,0,0.35))",
};

const PhosphorIcon: React.FC<{ size: number; color: string; d: string }> = ({ size, color, d }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    style={SHADOW}
  >
    <path d={d} />
  </svg>
);

const PATHS = {
  default:
    "M168,132.69,214.08,115l.33-.13A16,16,0,0,0,213,85.07L52.92,32.8A15.95,15.95,0,0,0,32.8,52.92L85.07,213a15.82,15.82,0,0,0,14.41,11l.78,0a15.84,15.84,0,0,0,14.61-9.59l.13-.33L132.69,168,184,219.31a16,16,0,0,0,22.63,0l12.68-12.68a16,16,0,0,0,0-22.63ZM195.31,208,144,156.69a16,16,0,0,0-26,4.93c0,.11-.09.22-.13.32l-17.65,46L48,48l159.85,52.2-45.95,17.64-.32.13a16,16,0,0,0-4.93,26h0L208,195.31Z",
  pointer:
    "M196,88a27.86,27.86,0,0,0-13.35,3.39A28,28,0,0,0,144,74.7V44a28,28,0,0,0-56,0v80l-3.82-6.13A28,28,0,0,0,35.73,146l4.67,8.23C74.81,214.89,89.05,240,136,240a88.1,88.1,0,0,0,88-88V116A28,28,0,0,0,196,88Zm12,64a72.08,72.08,0,0,1-72,72c-37.63,0-47.84-18-81.68-77.68l-4.69-8.27,0-.05A12,12,0,0,1,54,121.61a11.88,11.88,0,0,1,6-1.6,12,12,0,0,1,10.41,6,1.76,1.76,0,0,0,.14.23l18.67,30A8,8,0,0,0,104,152V44a12,12,0,0,1,24,0v68a8,8,0,0,0,16,0V100a12,12,0,0,1,24,0v20a8,8,0,0,0,16,0v-4a12,12,0,0,1,24,0Z",
  grab:
    "M188,48a27.75,27.75,0,0,0-12,2.71V44a28,28,0,0,0-54.65-8.6A28,28,0,0,0,80,60v64l-3.82-6.13a28,28,0,0,0-48.6,27.82c16,33.77,28.93,57.72,43.72,72.69C86.24,233.54,103.2,240,128,240a88.1,88.1,0,0,0,88-88V76A28,28,0,0,0,188,48Zm12,104a72.08,72.08,0,0,1-72,72c-20.38,0-33.51-4.88-45.33-16.85C69.44,193.74,57.26,171,41.9,138.58a6.36,6.36,0,0,0-.3-.58,12,12,0,0,1,20.79-12,1.76,1.76,0,0,0,.14.23l18.67,30A8,8,0,0,0,96,152V60a12,12,0,0,1,24,0v60a8,8,0,0,0,16,0V44a12,12,0,0,1,24,0v76a8,8,0,0,0,16,0V76a12,12,0,0,1,24,0Z",
  grabbing:
    "M188,80a27.79,27.79,0,0,0-13.36,3.4,28,28,0,0,0-46.64-11A28,28,0,0,0,80,92v20H68a28,28,0,0,0-28,28v12a88,88,0,0,0,176,0V108A28,28,0,0,0,188,80Zm12,72a72,72,0,0,1-144,0V140a12,12,0,0,1,12-12H80v24a8,8,0,0,0,16,0V92a12,12,0,0,1,24,0v28a8,8,0,0,0,16,0V92a12,12,0,0,1,24,0v28a8,8,0,0,0,16,0V108a12,12,0,0,1,24,0Z",
  text:
    "M184,208a8,8,0,0,1-8,8H160a40,40,0,0,1-32-16,40,40,0,0,1-32,16H80a8,8,0,0,1,0-16H96a24,24,0,0,0,24-24V136H104a8,8,0,0,1,0-16h16V80A24,24,0,0,0,96,56H80a8,8,0,0,1,0-16H96a40,40,0,0,1,32,16,40,40,0,0,1,32-16h16a8,8,0,0,1,0,16H160a24,24,0,0,0-24,24v40h16a8,8,0,0,1,0,16H136v40a24,24,0,0,0,24,24h16A8,8,0,0,1,184,208Z",
} as const;

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
  const originY = shape === "default" ? 4 : 4;

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
      <PhosphorIcon size={size} color={color} d={PATHS[shape]} />
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
