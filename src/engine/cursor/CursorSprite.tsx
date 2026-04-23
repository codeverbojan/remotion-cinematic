import React from "react";

interface CursorSpriteProps {
  size?: number;
  color?: string;
  scale?: number;
  rotation?: number;
  pulseOpacity?: number;
  pulseScale?: number;
}

export const CursorSprite: React.FC<CursorSpriteProps> = ({
  size = 28,
  color = "#FFFFFF",
  scale = 1,
  rotation = 0,
  pulseOpacity = 0,
  pulseScale = 1,
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: "2px 2px",
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
          fill={color}
          stroke="#000"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {pulseOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            left: -4,
            top: -4,
            width: size + 8,
            height: size + 8,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.4)",
            transform: `scale(${pulseScale})`,
            opacity: pulseOpacity,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
