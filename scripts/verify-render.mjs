import { bundle } from '@remotion/bundler';
import { openBrowser, selectComposition, renderStill, renderMedia, makeCancelSignal } from '@remotion/renderer';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';


const full = process.argv.includes('--videos');
const directory = resolve('out/verification');
await mkdir(directory, {recursive: true});
let browser;
const {cancel, cancelSignal} = makeCancelSignal();
const abort = () => { cancel(); void browser?.close({silent: true}); };
process.once('SIGINT', abort);
process.once('SIGTERM', abort);
try {
  const serveUrl = await bundle({entryPoint: resolve('src/index.ts'), outDir: resolve('out/verification-bundle')});
  browser = await openBrowser('chrome', {logLevel: 'error'});
  for (const [preset, format] of [['feature', 'landscape'], ['walkthrough', 'portrait'], ['before-after', 'square']]) {
    const inputProps = JSON.parse(await readFile(resolve(`examples/${preset}.json`), "utf8"));
    await writeFile(resolve(directory, `${preset}.json`), JSON.stringify(inputProps, null, 2)+'\n');
    const composition = await selectComposition({serveUrl, id: 'CinematicDemo', inputProps, puppeteerInstance: browser, logLevel: 'error'});
    const frame = preset === 'feature' ? 240 : preset === 'walkthrough' ? 620 : 390;
    await renderStill({serveUrl, composition, inputProps, puppeteerInstance: browser, frame, scale: 0.6, imageFormat: 'png', output: resolve(directory, `${preset}-${format}.png`), cancelSignal, logLevel: 'error'});
    console.log(`Verified ${preset}: ${composition.width}×${composition.height}, ${composition.durationInFrames} frames; still ${frame}`);
    if (full) {
      await renderMedia({serveUrl, composition, inputProps, puppeteerInstance: browser, codec: 'h264', outputLocation: resolve(directory, `${preset}.mp4`), concurrency: 1, scale: 2/3, crf: 21, cancelSignal, logLevel: 'error'});
      console.log(`Rendered ${preset}.mp4`);
    }
  }
} finally {
  await browser?.close({silent: true});
  process.removeListener('SIGINT', abort);
  process.removeListener('SIGTERM', abort);
}
