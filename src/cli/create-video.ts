import { parseArgs } from "node:util";
import { writeFileSync } from "node:fs";
import { createPreset, PRESET_NAMES } from "../presets";
import type { PresetName } from "../presets";
import { OUTPUT_SIZES } from "../canvas";

try {
  const {values} = parseArgs({options: {preset: {type: "string", default: "feature"}, format: {type: "string", default: "landscape"}, name: {type: "string", default: "Your Product"}, screenshots: {type: "string"}, out: {type: "string", default: "video.json"}, help: {type: "boolean"}}, strict: true});
  if (values.help) {
    console.log('Create a customized video project:\n  npm run init-video -- --preset=feature --format=portrait --name="Acme" --screenshots=screenshots/dashboard.png,screenshots/details.png --out=video.json\nPresets: feature (15s), walkthrough (30s), before-after (20s). Formats: landscape, portrait, square. Screenshot paths are relative to public/.');
  } else {
    if (!PRESET_NAMES.includes(values.preset as PresetName)) throw new Error(`Unknown preset: ${values.preset}`);
    if (!(values.format! in OUTPUT_SIZES)) throw new Error(`Unknown format: ${values.format}`);
    const props = createPreset(values.preset as PresetName, {format: values.format as keyof typeof OUTPUT_SIZES, brandName: values.name, screenshots: values.screenshots?.split(',').map((p) => p.trim()).filter(Boolean)});
    writeFileSync(values.out!, JSON.stringify(props, null, 2) + '\n', {flag: 'wx'});
    console.log(`Created ${values.out}. Edit: npm run project -- --load=${values.out}\nThen: npm run studio\nRender without editing: npm run build -- --props=${values.out}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
