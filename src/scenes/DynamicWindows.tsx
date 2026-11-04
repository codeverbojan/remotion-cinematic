import { ProductContent } from "../primitives/ProductContent";
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { resolveWindowPose } from "../engine";
import { Window } from "../primitives";
import { useWindowLayout, useVideoProps } from "../VideoPropsContext";

const CLAIMED_IDS = new Set([
  "spreadsheet", "email", "chat",
  "sticky-0", "sticky-1", "sticky-2",
  "notification-0", "notification-1", "notification-2",
  "product-window", "top-panel", "left-panel",
  "feature-0", "feature-1", "feature-2",
]);

interface DynamicWindowsProps {
  sceneId: string;
}

export const DynamicWindows: React.FC<DynamicWindowsProps> = ({ sceneId }) => {
  const frame = useCurrentFrame();
  const props = useVideoProps();
  const allWindows = useWindowLayout();

  const extraWindows = useMemo(
    () =>
      allWindows.filter(
        (w) => !CLAIMED_IDS.has(w.id) && w.sceneId === sceneId,
      ),
    [allWindows, sceneId],
  );

  if (extraWindows.length === 0) return null;

  const sorted = [...extraWindows].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <>
      {sorted.map((def) => {
        const pose = resolveWindowPose(def, frame, props.easing);
        if (!pose.visible) return null;

        return (
          <div
            key={def.id}
            data-cursor-target={def.id}
            style={{
              position: "absolute",
              left: pose.left,
              top: pose.top,
              width: pose.width,
              height: pose.height,
              opacity: pose.opacity,
              transform: `scale(${pose.scale}) translate(${pose.translateX}px, ${pose.translateY}px) rotate(${def.rotation ?? 0}deg) translateZ(0)`,
              transformOrigin: "top left",
              zIndex: def.zIndex,
              willChange: "transform",
            }}
          >
            <Window id={def.id} title={def.title}>
              <ProductContent media={def.media} id={`${def.id}-app`} width={pose.width} height={pose.height - 42} />
            </Window>
          </div>
        );
      })}
    </>
  );
};
