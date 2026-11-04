export const DEFAULT_SCENE_OVERLAP = 15;
export const DEFAULT_SCENES = [
  { id: "chaos", enabled: true, durationInFrames: 260, enterFrom: "none", exitTo: "top", background: "dark" },
  { id: "product-reveal", enabled: true, durationInFrames: 150, enterFrom: "bottom", exitTo: "right", background: "dark" },
  { id: "feature-showcase", enabled: true, durationInFrames: 200, enterFrom: "left", exitTo: "top", background: "dark" },
  { id: "headline-resolution", enabled: true, durationInFrames: 120, enterFrom: "bottom", exitTo: "top", background: "gradient" },
  { id: "closer", enabled: true, durationInFrames: 90, enterFrom: "bottom", exitTo: "none", background: "light" },
] as const;

export function defaultSceneForWindow(id: string): string | undefined {
  if (["product-window", "top-panel", "left-panel"].includes(id)) return "product-reveal";
  if (id.startsWith("feature-")) return "feature-showcase";
  if (["spreadsheet", "email", "chat"].includes(id) || /^(sticky|notification)-/.test(id)) return "chaos";
  return undefined;
}
