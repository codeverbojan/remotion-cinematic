import { C, F } from "../tokens";
import React from "react";
import { Img, OffthreadVideo, staticFile } from "remotion";
import { useVideoProps } from "../VideoPropsContext";
import type { ProductMedia } from "../schema";
import { AppFromDescriptor } from "./app-ui/AppFromDescriptor";

export function mediaSource(src: string): string {
  return /^(https?:|data:|blob:)/.test(src) ? src : staticFile(src.replace(/^\//, ""));
}

export const ProductContent: React.FC<{ featureIndex?: number; media?: ProductMedia; id?: string; summaryOnly?: boolean }> = ({ featureIndex, media, id = "product-app", summaryOnly = false }) => {
  const props = useVideoProps();
  const source = media ?? (featureIndex === undefined ? props.productMedia : props.productFeatures[featureIndex]?.media ?? props.productMedia);
  if (source) {
    const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: source.fit, objectPosition: `${source.focusX}% ${source.focusY}%`, transform: `scale(${source.zoom})`, transformOrigin: `${source.focusX}% ${source.focusY}%` };
    return <div data-product-media={source.type} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      {source.type === "video" ? <OffthreadVideo src={mediaSource(source.src)} startFrom={source.startFrom} muted style={style} /> : <Img src={mediaSource(source.src)} style={style} />}
    </div>;
  }
  if (featureIndex !== undefined) {
    const feature = props.productFeatures[featureIndex];
    const panels = props.appDescriptor.content.panels.filter((panel) => panel.type !== "placeholder");
    const panel = panels[featureIndex % Math.max(1, panels.length)];
    return <div style={{padding: 28, height: "100%", boxSizing: "border-box", fontFamily: F.sans, color: C.text, background: `linear-gradient(140deg, ${C.surface}, ${C.bgLight})`}}>
      <div style={{fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: C.accent, marginBottom: 16}}>0{featureIndex + 1} / {props.brand.name}</div>
      <div style={{fontSize: 28, fontWeight: 600, lineHeight: 1.15, marginBottom: 12}}>{feature?.title ?? "Product details"}</div>
      <div style={{fontSize: 17, lineHeight: 1.5, color: C.textMuted, marginBottom: 22}}>{feature?.description}</div>
      {!summaryOnly && panel && <AppFromDescriptor id={id} descriptor={{layout: "minimal", content: {columnCount: 1, gap: 16, panels: [panel]}}} />}
    </div>;
  }
  return <AppFromDescriptor id={id} descriptor={props.appDescriptor} style={{ height: "100%" }} />;
};
