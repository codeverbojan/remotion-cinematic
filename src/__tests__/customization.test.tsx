import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CinematicSchema, LayoutDescriptorSchema } from "../schema";
import { VideoPropsProvider } from "../VideoPropsContext";
import { ProductContent } from "../primitives/ProductContent";
import { ScenePush } from "../primitives/ScenePush";
import { SoundEffect } from "../engine/audio/SoundEffect";
import { Closer } from "../scenes/Closer";
import { projectForStorage, projectForTimeline } from "../project";
import { filterCursorPath } from "../engine/choreography/filterCursorPath";
import { getSceneStartFrame, getTotalFrames } from "../engine/types";
import { createPreset } from "../presets";
import { resolveWindowPose } from "../engine/choreography/resolveWindowPose";
import { panelInteractionKeyframes } from "../engine/ui-state/interactionKeyframes";
import { layoutForOutput } from "../canvas";
import { ContentViewport } from "../primitives/ContentViewport";
import { contentWarnings } from "../contentChecks";

let frame = 160;
vi.mock("remotion", async (original) => ({
  ...await original<typeof import("remotion")>(),
  useCurrentFrame: () => frame,
  getRemotionEnvironment: () => ({isStudio: false, isRendering: true}),
  Audio: ({volume}: {volume: number}) => <span data-audio-volume={volume} />,
  Img: ({src, style}: {src: string; style: React.CSSProperties}) => <img src={src} style={style} />,
  OffthreadVideo: ({src}: {src: string}) => <video src={src} />,
}));

const render = (props: ReturnType<typeof CinematicSchema.parse>, child: React.ReactNode) => renderToStaticMarkup(<VideoPropsProvider value={props}>{child}</VideoPropsProvider>);

describe("customized output", () => {
  it("creates independent defaults for each project", () => {
    const first = CinematicSchema.parse({});
    const second = CinematicSchema.parse({});
    first.scenes[0].enabled = false;
    first.windowLayout[0].startX = 999;
    first.cursorPath[0].at = 999;
    expect(second.scenes[0].enabled).toBe(true);
    expect(second.windowLayout[0].startX).not.toBe(999);
    expect(second.cursorPath[0].at).not.toBe(999);
  });
  it("renders imported descriptor content in the actual product content component", () => {
    const descriptor = LayoutDescriptorSchema.parse({layout: "minimal", content: {panels: [{type: "stat", label: "Imported metric", value: "42"}]}});
    const output = render(CinematicSchema.parse({appDescriptor: descriptor}), <ProductContent />);
    expect(output).toContain("Imported metric");
    expect(output).toContain("42");
    expect(output).not.toContain("Drop your product screenshot");
  });
  it("renders supplied images and recordings instead of generic UI", () => {
    const props = CinematicSchema.parse({productMedia: {type: "image", src: "screenshots/acme.png", fit: "cover", focusX: 25}});
    expect(render(props, <ProductContent />)).toContain("screenshots/acme.png");
    expect(render(props, <ProductContent />)).toContain("object-position:25% 50%");
    props.productMedia!.type = "video";
    expect(render(props, <ProductContent />)).toContain("<video");
  });
  it("uses the CTA and uploaded logo independently of the closing headline", () => {
    const props = CinematicSchema.parse({cta: "Book a demo", headlines: {closer: ["A better workflow"]}, brand: {logoUrl: "logos/acme.svg"}});
    const output = render(props, <Closer />);
    expect(output).toContain("Book a demo");
    expect(output).toContain("A better workflow");
    expect(output).toContain("logos/acme.svg");
  });
  it("holds a longer scene through its configured duration and supports zero overlap", () => {
    frame = 160;
    const props = CinematicSchema.parse({});
    const output = render(props, <ScenePush duration={300} overlap={15} exitTo="right" background="none"><span>Still visible</span></ScenePush>);
    expect(output).not.toContain("translate(");
    expect(() => render(props, <ScenePush duration={30} overlap={0}>Cut</ScenePush>)).not.toThrow();
  });
  it("mutes all shared sound effects without depending on music", () => {
    expect(render(CinematicSchema.parse({sfxEnabled: false}), <SoundEffect src="x.mp3" />)).toBe("");
    expect(render(CinematicSchema.parse({music: {enabled: false}, sfxVolume: 0.5}), <SoundEffect src="x.mp3" volume={0.4} />)).toContain('data-audio-volume="0.2"');
  });
  it("preserves scene-local cursor actions after removing and reordering scenes", () => {
    const props = CinematicSchema.parse({});
    const original = props.cursorPath.filter((e) => e.sceneId === "product-reveal");
    props.scenes = props.scenes.filter((s) => s.id !== "chaos").reverse();
    const runtime = projectForTimeline(props);
    const offset = getSceneStartFrame(props.scenes, "product-reveal", props.overlap);
    const local = filterCursorPath(runtime.cursorPath, ["product-window", "top-panel", "left-panel"], offset, 150, "product-reveal");
    expect(local).toEqual(original);
    expect(projectForStorage(runtime, props).cursorPath).toEqual(props.cursorPath);
  });
  it("keeps disabled scene actions intact when other actions are removed", () => {
    const props = CinematicSchema.parse({});
    props.scenes[0].enabled = false;
    const runtime = projectForTimeline(props);
    runtime.cursorPath = runtime.cursorPath.slice(1);
    expect(projectForStorage(runtime, props).cursorPath).toEqual(props.cursorPath.slice(1));
  });
  it("settles window motion exactly at its configured destination for every easing", () => {
    const props = CinematicSchema.parse({});
    const window = props.windowLayout.find((w) => w.id === "product-window")!;
    for (const easing of ["snappy", "cinematic", "elastic", "bounce", "spring", "smooth"] as const) {
      const pose = resolveWindowPose(window, 200, easing);
      expect(pose.left).toBe(window.endX);
      expect(pose.width).toBe(window.endW);
      expect(pose.opacity).toBe(1);
    }
  });
  it("keeps panel responses aligned with edited cursor clicks", () => {
    const keys = panelInteractionKeyframes([{at: 123, action: "click", target: "top-panel"}]);
    expect(keys).toContainEqual({at: 123, target: "top-inner-panel", set: {expanded: true}});
    expect(keys.some((k) => k.at === 74)).toBe(false);
  });
  it.each([["feature", 450], ["walkthrough", 900], ["before-after", 600]] as const)("builds the %s preset at the advertised duration", (name, frames) => {
    const props = createPreset(name, {format: "portrait"});
    expect(getTotalFrames(props.scenes, props.overlap)).toBe(frames);
    expect(props.layoutCanvas).toEqual({width: 1080, height: 1920});
    const product = props.windowLayout.find((w) => w.id === "product-window")!;
    expect(product.startX + product.startW).toBeLessThanOrEqual(1080);
    expect(projectForTimeline(props).windowLayout).toEqual(props.windowLayout);
  });
  it.each(["landscape", "portrait", "square"] as const)("keeps product window proportions in %s", (format) => {
    const props = createPreset("feature", {format});
    const win = props.windowLayout.find((w) => w.id === "product-window")!;
    expect(win.startW / (win.startH - 42)).toBeCloseTo(1.6, 1);
    expect(win.endW! / (win.endH! - 42)).toBeCloseTo(1.6, 1);
    expect(win.startX + win.startW).toBeLessThanOrEqual(props.layoutCanvas.width);
    expect(win.startY + win.startH).toBeLessThanOrEqual(props.layoutCanvas.height);
  });
  it("preserves custom window aspect ratios when switching formats", () => {
    const props = createPreset("feature");
    props.windowLayout.push({...props.windowLayout[0], id: "custom", startW: 800, startH: 400});
    props.outputFormat = "portrait";
    const win = layoutForOutput(props).windowLayout.find((w) => w.id === "custom")!;
    expect(win.startW / win.startH).toBe(2);
  });
  it("scales interface text and geometry together inside the window", () => {
    const output = renderToStaticMarkup(<ContentViewport width={1200} height={750}><span>Readable UI</span></ContentViewport>);
    expect(output).toContain('data-content-scale="1.5"');
    expect(output).toContain('width:800px;height:500px');
    expect(output).toContain('transform:scale(1.5)');
  });
  it("warns when an action or headline cannot fit its scene", () => {
    const props = CinematicSchema.parse({});
    props.scenes[0].durationInFrames = 30;
    expect(contentWarnings(props).some((w) => w.includes("reading time"))).toBe(true);
    expect(contentWarnings(props).some((w) => w.includes("cursor action"))).toBe(true);
  });
});
