#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const result = spawnSync(process.execPath, ['--import', 'tsx', fileURLToPath(new URL('../src/cli/index.ts', import.meta.url)), ...process.argv.slice(2)], {stdio: 'inherit'});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
