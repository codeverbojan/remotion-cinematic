import React, { useEffect, useMemo } from "react";
import { useLayout } from "./LayoutContext";

interface LayoutWindowProps {
  id: string;
  zone: string;
  width: number;
  height: number;
  margin?: number;
  avoidZones?: string[];
  align?: {
    horizontal?: "start" | "center" | "end";
    vertical?: "start" | "center" | "end";
  };
  stackIndex?: number;
  stackPitch?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const EMPTY_AVOID: string[] = [];

export const LayoutWindow: React.FC<LayoutWindowProps> = ({
  id,
  zone,
  width,
  height,
  margin = 0,
  avoidZones = EMPTY_AVOID,
  align,
  stackIndex,
  stackPitch,
  children,
  style,
}) => {
  const { zones, register, unregister } = useLayout();

  const rect = useMemo(
    () =>
      zones.placeWindow({
        id,
        slotId: zone,
        width,
        height,
        margin,
        avoidZones,
        align,
        stackIndex,
        stackPitch,
      }),
    [zones, id, zone, width, height, margin, avoidZones, align, stackIndex, stackPitch],
  );

  useEffect(() => {
    register(id, rect);
    return () => unregister(id);
  }, [id, rect, register, unregister]);

  return (
    <div
      data-cursor-target={id}
      style={{
        position: "absolute",
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
