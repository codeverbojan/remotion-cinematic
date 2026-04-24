#!/usr/bin/env node

import { parseFigmaUrl, fetchFigmaNode, FigmaApiError } from "./figma-client";
import { convertFigmaToDescriptor } from "./figma-to-descriptor";
import type { ConvertedDescriptor } from "./figma-to-descriptor";
import { screenshotToDescriptor } from "./screenshot-to-descriptor";
import { injectIntoRootTsx } from "./inject";
import * as fs from "fs";
import * as path from "path";

interface CliArgs {
  figmaUrl?: string;
  screenshot?: string;
  token?: string;
  out?: string;
  inject: boolean;
}

function printUsage(): void {
  console.error(`
Usage: cinematic-import <source> [options]

Sources (pick one):
  --figma-url=<url>       Figma frame URL
  --screenshot=<path>     Local screenshot image (PNG/JPG)

Options:
  --token=<token>         Figma token (or FIGMA_TOKEN env var)
  --out=<path>            Output JSON file path (default: stdout)
  --inject                Write descriptor into src/Root.tsx defaultProps
  --help                  Show this help message

Examples:
  cinematic-import --figma-url="https://figma.com/design/abc/App?node-id=1-2"
  cinematic-import --screenshot=./dashboard.png
  cinematic-import --figma-url="..." --inject
  cinematic-import --screenshot=./app.png --out=descriptor.json
`);
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { inject: false };

  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--figma-url=")) {
      args.figmaUrl = arg.slice("--figma-url=".length);
    } else if (arg.startsWith("--screenshot=")) {
      args.screenshot = arg.slice("--screenshot=".length);
    } else if (arg.startsWith("--token=")) {
      args.token = arg.slice("--token=".length);
    } else if (arg.startsWith("--out=")) {
      args.out = arg.slice("--out=".length);
    } else if (arg === "--inject") {
      args.inject = true;
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
  }

  return args;
}

async function importFromFigma(
  url: string,
  token: string,
): Promise<ConvertedDescriptor> {
  const parsed = parseFigmaUrl(url);
  if (!parsed) {
    console.error(`Error: Invalid Figma URL: ${url}`);
    console.error("Expected: https://figma.com/file/<key>/Name?node-id=<id>");
    process.exit(1);
  }

  if (!parsed.nodeId) {
    console.error("Error: Figma URL must include a node-id parameter");
    process.exit(1);
  }

  console.error("Fetching Figma frame...");
  const node = await fetchFigmaNode({
    token,
    fileKey: parsed.fileKey,
    nodeId: parsed.nodeId,
  });

  console.error(`Converting "${node.name}" (${node.type})...`);
  return convertFigmaToDescriptor(node);
}

async function importFromScreenshot(
  imagePath: string,
  apiKey: string,
): Promise<ConvertedDescriptor> {
  console.error(`Analyzing screenshot: ${imagePath}`);
  return screenshotToDescriptor(imagePath, apiKey);
}

function outputDescriptor(
  descriptor: ConvertedDescriptor,
  args: CliArgs,
): void {
  const json = JSON.stringify(descriptor, null, 2);

  if (args.inject) {
    const projectDir = process.cwd();
    const rootPath = injectIntoRootTsx(projectDir, descriptor);
    console.error(`Injected appDescriptor into ${rootPath}`);
    return;
  }

  if (args.out) {
    const outPath = path.resolve(args.out);
    fs.writeFileSync(outPath, json + "\n", "utf-8");
    console.error(`Written to ${outPath}`);
  } else {
    process.stdout.write(json + "\n");
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (!args.figmaUrl && !args.screenshot) {
    console.error("Error: provide --figma-url or --screenshot\n");
    printUsage();
    process.exit(1);
  }

  if (args.figmaUrl && args.screenshot) {
    console.error("Error: use --figma-url or --screenshot, not both");
    process.exit(1);
  }

  try {
    let descriptor: ConvertedDescriptor;

    if (args.figmaUrl) {
      const token = args.token ?? process.env.FIGMA_TOKEN;
      if (!token) {
        console.error("Error: Figma token required (--token or FIGMA_TOKEN env var)");
        process.exit(1);
      }
      descriptor = await importFromFigma(args.figmaUrl, token);
    } else {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.error("Error: ANTHROPIC_API_KEY env var required for screenshot mode");
        process.exit(1);
      }
      descriptor = await importFromScreenshot(args.screenshot!, apiKey);
    }

    outputDescriptor(descriptor, args);
  } catch (err) {
    if (err instanceof FigmaApiError) {
      console.error(`Figma API error (${err.status}): ${err.message}`);
      process.exit(1);
    }
    if (err instanceof Error) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
}

const isDirectRun = process.argv[1]?.endsWith("cli/index.ts") ||
  process.argv[1]?.endsWith("cinematic-import");

if (isDirectRun) {
  main();
}
