import React, { useCallback, useMemo } from "react";
import { getRemotionEnvironment } from "remotion";
import { C, F } from "../tokens";
import { useBrand, useVideoProps, updateProp } from "../VideoPropsContext";
import { InlineEdit } from "../editor";
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
  const brand = useBrand();
  const props = useVideoProps();
  const surface = brand?.colors?.surface ?? C.surface;
  const bg = brand?.colors?.background ?? C.bg;
  const textMuted = brand?.colors?.textMuted ?? C.textMuted;

  const isStudio = useMemo(() => {
    try { return getRemotionEnvironment().isStudio; } catch { return false; }
  }, []);

  const isInLayout = props.windowLayout.some((w) => w.id === id);
  const canEditTitle = isStudio && isInLayout && title;

  const onTitleChange = useCallback(
    (value: string) => {
      updateProp((prev) => ({
        ...prev,
        windowLayout: prev.windowLayout.map((w) =>
          w.id === id ? { ...w, title: value } : w,
        ),
      }));
    },
    [id],
  );

  const titleStyle: React.CSSProperties = {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    color: textMuted,
    fontFamily: F.sans,
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginRight: 44,
  };

  const titleContent = title ? <span style={titleStyle}>{title}</span> : null;

  return (
    <div
      data-cursor-target={id}
      data-editor-id={id}
      data-editor-type="window"
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        overflow: "hidden",
        border: `1px solid ${C.windowBorder}`,
        backgroundColor: surface,
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
          backgroundColor: bg,
          borderBottom: `1px solid ${C.windowBorder}`,
          gap: 12,
        }}
      >
        <TrafficLights />
        {canEditTitle ? (
          <InlineEdit value={title} onChange={onTitleChange} style={titleStyle}>
            {titleContent}
          </InlineEdit>
        ) : titleContent}
      </div>
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {children}
      </div>
    </div>
  );
};

export { CHROME_HEIGHT };
