# Scene authoring

`CinematicDemo.tsx` selects scene components and wraps each one in a shared `SceneProvider` and `ScenePush`. Duration, overlap, directions, background and transition sound come from the saved project. Scene components render their content without another transition wrapper.

| Scene ID | Content |
|---|---|
| `chaos` | Scattered windows, messages, notifications, pain headline |
| `product-reveal` | Main product view and two supporting detail windows |
| `feature-showcase` | Three feature windows and a focus camera |
| `headline-resolution` | Resolution headline |
| `closer` | Logo, closing headline, brand name and CTA |

Default timings live in `src/sceneDefaults.ts`. Presets compose these scenes in `src/presets.ts`. Their lengths can be changed in Studio; cursor and window actions remain at their local frames unless explicitly retimed. Content warnings flag actions beyond the scene.

## Add a scene

1. Create a React component in `src/scenes/` and export it from `src/scenes/index.ts`.
2. Register its ID in `SCENE_COMPONENTS` in `CinematicDemo.tsx`.
3. Add a scene entry to the project with a unique ID, duration and directions.
4. Add windows with `sceneId` matching the new scene. `DynamicWindows` renders windows not already claimed by a built-in scene.

Use `useCurrentFrame()` for the local scene frame, `useSceneConfig()` for its duration, and `useCanvas()` for output dimensions. Avoid fixed 1920×1080 assumptions. `C` and `F` from `tokens.ts` resolve through the current theme.

```tsx
import React from "react";
import { useCurrentFrame } from "remotion";
import { useSceneConfig } from "../SceneContext";
import { useCanvas } from "../VideoPropsContext";

export const MyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useSceneConfig();
  const canvas = useCanvas();
  return <div style={{position: "absolute", left: canvas.width * 0.1, top: canvas.height * 0.3}}>
    Step {Math.min(3, 1 + Math.floor(frame / (durationInFrames / 3)))}
  </div>;
};
```

## Windows and cursor actions

Window coordinates and entrance/movement frames live in `windowLayout`. Use `resolveWindowPose(definition, frame, easing)` for geometry; prefer an explicit `sceneId` for newly added windows. Built-in IDs are mapped in `defaultSceneForWindow`.

A stored cursor entry is local to its `sceneId`:

```json
{"sceneId":"product-reveal","at":74,"action":"click","target":"top-panel","anchor":"center","curve":"arc"}
```

`VideoPropsProvider` maps local actions to composition time for the overlay. A scene uses `filterCursorPath` with its ID, target window IDs, offset and duration, then `mapCursorPath` to recover its local cursor actions. `projectForStorage` reverses that mapping when saving. Legacy entries without `sceneId` remain absolute.

## Visible responses

A click should visibly change something. `generatePressKeyframes` supplies transient press state to compatible components. The product reveal derives panel expansion from actual cursor click times via `panelInteractionKeyframes`; editing a click time moves the response with it.

For custom tabs, row selections, searches and other behavior, derive `UIKeyframe[]` from your cursor actions and wrap the relevant components in `UIStateProvider`. Use exactly matching component IDs. Descriptor IDs are prefixed by their instance ID (for example `product-app-tabs`) so multiple windows do not share state accidentally. A reconstructed app does not infer navigation logic from a screenshot.

Use the shared `SoundEffect` component for scene effects so the global SFX toggle and volume apply. Keep music in `AudioManager`. Always use deterministic frame-based animation; avoid wall-clock timers and `Math.random()`.

## Verify changes

Run `npm run check`, then `npm run verify:render`. For timing or audio changes, export the full examples with `npm run verify:render -- --videos` and inspect transitions, click responses, text and the final hold. Run one project stack and one automation browser at a time; close owned verification processes after use.
