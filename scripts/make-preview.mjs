import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const executable = process.env.FFMPEG_PATH ?? 'ffmpeg';
const input = resolve(process.argv[2] ?? 'out/verification/feature.mp4');
const output = resolve(process.argv[3] ?? 'out/verification/demo-preview.gif');
const result = spawnSync(executable, [
  '-hide_banner', '-loglevel', 'error', '-threads', '1', '-i', input,
  '-filter_complex_threads', '1', '-filter_complex',
  '[0:v]fps=10,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3',
  '-threads', '1', '-an', '-loop', '0', '-y', output,
], {stdio: 'inherit', timeout: 60000});
if (result.error) throw new Error(`Install standard FFmpeg or set FFMPEG_PATH to create the preview. ${result.error.message}`);
if (result.status !== 0) throw new Error(`Preview encoding failed (${result.signal ?? result.status})`);
console.log(`Created ${output}`);
