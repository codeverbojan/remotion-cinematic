# Screenshots

Product screenshots used in showcase scenes. The template's placeholder content (grey boxes with "Product screenshot placeholder") is designed to be replaced with your real product UI.

## Requirements

- **Format**: PNG (recommended) or JPEG
- **Resolution**: 2x your display size (e.g. 3840x2160 for a full-screen 1920x1080 shot, or proportional for cropped regions). This ensures sharp rendering when Remotion exports at 1080p.
- **Naming**: descriptive kebab-case — `dashboard.png`, `feature-catalog.png`, `settings-page.png`
- **Background**: transparent or match your `C.bg` color (`#0F0F14` by default) for seamless integration
- **No browser chrome**: crop screenshots to just the app content, unless you intentionally want browser chrome visible

## Capture tips

- Use browser DevTools device toolbar to set a consistent viewport (e.g. 1920x1080)
- macOS: `Cmd+Shift+4` then `Space` captures a specific window with shadow
- For full-page captures, use a browser extension or DevTools "Capture full size screenshot"
- If your app has a dark mode, use it — the default template tokens are dark-themed

## Usage in scenes

```tsx
import { Img, staticFile } from "remotion";

// Inside a Window component as content
<Window id="my-window" title="Dashboard">
  <Img
    src={staticFile("screenshots/dashboard.png")}
    style={{ width: "100%", height: "auto", borderRadius: 6 }}
  />
</Window>
```

Replace the placeholder content components (like `DashboardContent`, `FeatureContent`) in existing scenes with `<Img>` tags pointing to your screenshots.

## Workflow

1. Take screenshots of each feature you want to showcase (2x resolution)
2. Crop to the relevant area
3. Name by feature: `dashboard.png`, `billing.png`, `analytics.png`
4. Drop files in this directory (`public/screenshots/`)
5. Open the scene file (e.g. `src/scenes/ProductReveal.tsx`)
6. Replace the placeholder content component with:
   ```tsx
   <Img src={staticFile("screenshots/dashboard.png")} style={{ width: "100%", height: "auto" }} />
   ```
7. Run `npm run studio` to preview

## Which scenes use screenshots

| Scene | Where screenshots go |
|-------|---------------------|
| `ProductReveal` | Main window + side panels (replace `DashboardContent`, `TopPanelContent`, `LeftPanelContent`) |
| `FeatureShowcase` | Each feature window (replace `FeatureContent`) |

## Using with Claude

Ask Claude to integrate your screenshots:

> "Replace the placeholder content in ProductReveal with my dashboard screenshot at public/screenshots/dashboard.png"

> "Add a new FeatureShowcase scene that walks through billing.png, analytics.png, and settings.png"

Claude knows the `staticFile()` pattern and will wire everything up.
