import { describe, expect, it } from 'vitest';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
const require = createRequire(import.meta.url);
// Use the installed Remotion writer to catch source-format incompatibilities.
const {updateDefaultProps} = require(join(dirname(require.resolve('@remotion/studio-server')), 'codemods/update-default-props.js'));
import { applyProject, readProjectSource, replaceProjectSource } from './project-file';
import { createPreset } from '../presets';
import { injectDescriptor } from './inject';
import { updateSavedProps } from '../editor/updateProps';

const root = () => readFileSync('src/Root.tsx', 'utf8');
describe('real Studio project file workflow', () => {
  it('loads a preset, saves consecutive edits with Remotion’s writer, and reloads intact', async () => {
    let source = replaceProjectSource(root(), createPreset('feature', {brandName: 'Acme', format: 'portrait'}));
    for (const updater of [
      (p: ReturnType<typeof readProjectSource>) => ({...p, cta: 'Book a demo'}),
      (p: ReturnType<typeof readProjectSource>) => ({...p, cursorScale: 2, music: {...p.music, enabled: false}}),
    ]) {
      const props = updateSavedProps(readProjectSource(source), updater);
      source = (await updateDefaultProps({input: source, compositionId: 'CinematicDemo', newDefaultProps: props, enumPaths: []})).output;
    }
    expect(readProjectSource(source)).toMatchObject({brand: {name: 'Acme'}, outputFormat: 'portrait', cta: 'Book a demo', cursorScale: 2, music: {enabled: false}});
  });
  it('validates before writing and leaves a recoverable backup', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cinematic-project-'));
    try {
      mkdirSync(join(directory, 'src'));
      const target = join(directory, 'src/Root.tsx');
      writeFileSync(target, root());
      expect(() => applyProject({outputFormat: 'invalid'}, directory)).toThrow();
      expect(readFileSync(target, 'utf8')).toBe(root());
      applyProject(createPreset('before-after'), directory);
      expect(readFileSync(target+'.bak', 'utf8')).toBe(root());
      expect(readProjectSource(readFileSync(target, 'utf8')).scenes).toHaveLength(3);
    } finally { rmSync(directory, {recursive: true, force: true}); }
  });
  it('injects validated JSON into a loadable project and rejects malformed content', () => {
    const descriptor = readProjectSource(root()).appDescriptor;
    descriptor.topBar!.title = 'Imported real product';
    expect(readProjectSource(injectDescriptor(root(), descriptor)).appDescriptor.topBar!.title).toBe('Imported real product');
    expect(() => injectDescriptor(root(), {layout: 'broken'} as never)).toThrow();
  });
});
