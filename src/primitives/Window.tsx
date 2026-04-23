import React from "react";
import { C, F } from "../tokens";
import { TrafficLights } from "./TrafficLights";

interface WindowProps {
  id: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  chromeHeight?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const CHROME_HEIGHT = 40;

export const Window: React.FC<WindowProps> = ({
  id,
  title = "",
  width = "100%",
  height = "100%",
  chromeHeight = CHROME_HEIGHT,
  children,
  style,
}) => {
  return (
    <div
      data-cursor-target={id}
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        overflow: "hidden",
        border: `1px solid ${C.windowBorder}`,
        backgroundColor: C.surface,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
        ...style,
      }}
    >
      <div
        data-cursor-target={`${id}__top-bar`}
        style={{
          height: chromeHeight,
          minHeight: chromeHeight,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          backgroundColor: C.windowChrome,
          borderBottom: `1px solid ${C.windowBorder}`,
          gap: 12,
        }}
      >
        <TrafficLights />
        {title && (
          <span
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 13,
              color: C.textMuted,
              fontFamily: F.sans,
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginRight: 44,
            }}
          >
            {title}
          </span>
        )}
      </div>
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {children}
      </div>
    </div>
  );
};

export { CHROME_HEIGHT };
