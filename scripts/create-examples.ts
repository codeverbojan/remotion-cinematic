import {mkdirSync, writeFileSync} from 'node:fs';
import {createPreset} from '../src/presets';
mkdirSync('examples', {recursive: true});
for (const [preset, format, brandName] of [['feature','landscape','Orbit'], ['walkthrough','portrait','Tandem'], ['before-after','square','Relay']] as const) {
  const props = createPreset(preset, {format, brandName, screenshots: preset === 'before-after' ? ['screenshots/orbit-dashboard.svg', 'screenshots/relay-priorities.svg', 'screenshots/relay-activity.svg'] : undefined});
  if (preset === 'walkthrough') props.brand.colors.primary = '#E88854';
  if (preset === 'before-after') { props.brand.colors.primary = '#4EA87B'; props.brand.colors.accent = '#8DD8B0'; props.brand.colors.background = '#101917'; props.brand.colors.surface = '#21332F'; }
  writeFileSync(`examples/${preset}.json`, JSON.stringify(props, null, 2)+'\n');
}
