import { bundle } from '@remotion/bundler';
import { openBrowser, selectComposition, renderStill, renderMedia, makeCancelSignal } from '@remotion/renderer';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
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
    if (process.argv.includes('--sizing')) {
      const start = preset === 'feature' ? 30 : preset === 'walkthrough' ? 200 : 255;
      await renderStill({serveUrl, composition, inputProps, puppeteerInstance: browser, frame: start, scale: 0.6, imageFormat: 'png', output: resolve(directory, `${preset}-opening.png`), cancelSignal, logLevel: 'error'});
    }
    console.log(`Verified ${preset}: ${composition.width}×${composition.height}, ${composition.durationInFrames} frames; still ${frame}`);
    if (full) {
      let lastProgress = -1;
      await renderMedia({serveUrl, composition, inputProps, puppeteerInstance: browser, codec: 'h264', outputLocation: resolve(directory, `${preset}.mp4`), concurrency: 1, scale: 2/3, crf: 21, cancelSignal, logLevel: 'error', onProgress: ({progress}) => { const step = Math.floor(progress * 10); if (step > lastProgress) { console.log(`${preset}: ${step * 10}%`); lastProgress = step; } }});
      console.log(`Rendered ${preset}.mp4`);
    }
  }
  if (full) {
    // Exercise OffthreadVideo with an actual encoded recording, not a mocked tag.
    await copyFile(resolve(directory, 'feature.mp4'), resolve(serveUrl, 'public/verification-recording.mp4'));
    const inputProps = JSON.parse(await readFile(resolve('examples/feature.json'), 'utf8'));
    inputProps.productMedia = {type: 'video', src: 'verification-recording.mp4', fit: 'contain', focusX: 50, focusY: 50, zoom: 1, startFrom: 60};
    const composition = await selectComposition({serveUrl, id: 'CinematicDemo', inputProps, puppeteerInstance: browser, logLevel: 'error'});
    await renderStill({serveUrl, composition, inputProps, puppeteerInstance: browser, frame: 30, scale: 0.6, imageFormat: 'png', output: resolve(directory, 'recording-input.png'), cancelSignal, logLevel: 'error'});
    console.log('Verified real screen recording input');
  }
} finally {
  await browser?.close({silent: true});
  process.removeListener('SIGINT', abort);
  process.removeListener('SIGTERM', abort);
}
