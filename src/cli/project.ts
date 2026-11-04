import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync } from 'node:fs';
import { applyProject, readProjectSource } from './project-file';
try {
  const {values} = parseArgs({options: {load: {type: 'string'}, export: {type: 'string'}, help: {type: 'boolean'}}});
  if (values.help) console.log('npm run project -- --load=video.json\n  Validates and loads a project into Studio; backs up src/Root.tsx.\nnpm run project -- --export=customized.json\n  Exports current saved Studio settings to a new JSON file.');
  else if (values.load && !values.export) {
    const target = applyProject(JSON.parse(readFileSync(values.load, 'utf8')));
    console.log(`Loaded ${values.load} into ${target}. Previous settings: ${target}.bak\nPreview: npm run studio\nRender saved edits: npm run build`);
  } else if (values.export && !values.load) {
    const props = readProjectSource(readFileSync('src/Root.tsx', 'utf8'));
    writeFileSync(values.export, JSON.stringify(props, null, 2)+'\n', {flag: 'wx'});
    console.log(`Exported saved settings to ${values.export}`);
  } else throw new Error('Choose --load=<file> or --export=<file>.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
