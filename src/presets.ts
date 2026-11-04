import { CinematicSchema, LayoutDescriptorSchema } from "./schema";
import type { CinematicProps } from "./schema";
import { DEFAULT_SCENES, defaultSceneForWindow } from "./sceneDefaults";
import { layoutForOutput } from "./canvas";

export const PRESET_NAMES = ["feature", "walkthrough", "before-after"] as const;
export type PresetName = typeof PRESET_NAMES[number];
const PRESETS: Record<PresetName, {scenes: [string, number][]; pain: string[]; resolution: string[]; closer: string[]}> = {
  feature: { scenes: [["product-reveal", 300], ["closer", 165]], pain: ["Meet your next", "favorite feature."], resolution: ["Less searching.", "More doing."], closer: ["Your next move, clearer."] },
  walkthrough: { scenes: [["chaos", 180], ["product-reveal", 300], ["feature-showcase", 270], ["headline-resolution", 120], ["closer", 90]], pain: ["Too many tabs.", "Not enough clarity."], resolution: ["One place.", "A clear next step."], closer: ["Make room for better work."] },
  "before-after": { scenes: [["chaos", 240], ["product-reveal", 240], ["closer", 150]], pain: ["Before: scattered.", "And hard to follow."], resolution: ["After: connected.", "And easy to act on."], closer: ["From scattered to sorted."] },
};

export function createPreset(name: PresetName, options: {format?: CinematicProps["outputFormat"]; brandName?: string; screenshots?: string[]} = {}): CinematicProps {
  const preset = PRESETS[name];
  const props = CinematicSchema.parse({ outputFormat: options.format ?? "landscape", brand: { name: options.brandName ?? "Orbit" }, headlines: {pain: preset.pain, resolution: preset.resolution, closer: preset.closer}, cta: "Explore Orbit" });
  props.scenes = preset.scenes.map(([id, durationInFrames], index) => ({...DEFAULT_SCENES.find((s) => s.id === id)!, durationInFrames, enterFrom: index === 0 ? "none" : "bottom", exitTo: index === preset.scenes.length - 1 ? "none" : "top"}));
  const factors = new Map(props.scenes.map((scene) => [scene.id, scene.durationInFrames / DEFAULT_SCENES.find((s) => s.id === scene.id)!.durationInFrames]));
  props.cursorPath = props.cursorPath.filter((e) => e.sceneId && factors.has(e.sceneId)).map((e) => ({...e, at: Math.round(e.at * factors.get(e.sceneId!)!), duration: e.duration === undefined ? undefined : Math.max(1, Math.round(e.duration * factors.get(e.sceneId!)!))}));
  props.windowLayout = props.windowLayout.filter((w) => factors.has(defaultSceneForWindow(w.id) ?? "")).map((w) => {
    const factor = factors.get(defaultSceneForWindow(w.id)!)!;
    return {...w, enterAt: Math.round(w.enterAt * factor), enterDuration: Math.max(1, Math.round(w.enterDuration * factor)), animateAt: w.animateAt === undefined ? undefined : Math.round(w.animateAt * factor), animateDuration: Math.max(1, Math.round(w.animateDuration * factor)), exitAt: w.exitAt === undefined ? undefined : Math.round(w.exitAt * factor)};
  });
  props.productFeatures = [
    {title: "Every request, one home.", description: "See incoming work and ownership together."},
    {title: "Know what comes next.", description: "Keep priorities visible and work moving."},
    {title: "Close the loop.", description: "Follow progress from first request to done."},
  ];
  props.appDescriptor = LayoutDescriptorSchema.parse({
    layout: "sidebar",
    sidebar: {width: 180, items: [{label: "Overview", active: true}, {label: "Requests", badge: "24"}, {label: "Activity"}], avatar: {name: "Alex Chen"}},
    topBar: {title: `${props.brand.name} / Overview`, search: false, tabs: [], actions: [{label: "New request", variant: "primary"}]},
    content: {columnCount: 2, gap: 20, panels: [
      {type: "stat", label: "Requests completed", value: "128", delta: "+24 this week"},
      {type: "stat", label: "Ready for review", value: "08", delta: "All assigned"},
      {type: "list", title: "Up next", items: [{label: "Website refresh", description: "Design review · Today", badge: "Ready"}, {label: "Customer onboarding", description: "Alex · Tomorrow", badge: "In progress"}, {label: "Launch checklist", description: "Sam · Friday", badge: "Review"}]},
      {type: "messages", title: "Team activity", messageVariant: "chat", messages: [{from: "Alex", text: "Homepage is ready for review.", timestamp: "9:41"}, {from: "Sam", text: "Feedback added. Everything is in one place.", timestamp: "9:43"}]},
    ]},
  });
  props.cta = `Explore ${props.brand.name}`;
  if (options.screenshots?.[0]) {
    props.productMedia = {type: "image", src: options.screenshots[0], fit: "contain", focusX: 50, focusY: 50, zoom: 1, startFrom: 0};
    props.productFeatures = props.productFeatures.map((feature, index) => ({...feature, media: {...props.productMedia!, src: options.screenshots![index] ?? options.screenshots![0]}}));
  }
  return CinematicSchema.parse(layoutForOutput(props, true));
}
