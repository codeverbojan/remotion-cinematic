import * as fs from "fs";
import * as path from "path";
import type { ConvertedDescriptor } from "./figma-to-descriptor";

export function findRootTsx(startDir: string): string | null {
  const candidate = path.join(startDir, "src", "Root.tsx");
  if (fs.existsSync(candidate)) return candidate;
  return null;
}

export function injectDescriptor(
  rootTsxContent: string,
  descriptor: ConvertedDescriptor,
): string {
  const descriptorJson = JSON.stringify(descriptor);

  const pattern = /"appDescriptor"\s*:\s*\{/;
  const match = rootTsxContent.match(pattern);
  if (!match || match.index === undefined) {
    throw new Error(
      'Could not find "appDescriptor" in Root.tsx defaultProps. ' +
        "Make sure the composition has an appDescriptor field in defaultProps.",
    );
  }

  const braceStart = match.index + match[0].length - 1;

  let depth = 0;
  let braceEnd = -1;
  for (let i = braceStart; i < rootTsxContent.length; i++) {
    const ch = rootTsxContent[i];
    if (ch === '"') {
      i++;
      while (i < rootTsxContent.length) {
        if (rootTsxContent[i] === "\\") {
          i++;
        } else if (rootTsxContent[i] === '"') {
          break;
        }
        i++;
      }
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        braceEnd = i;
        break;
      }
    }
  }

  if (braceEnd === -1) {
    throw new Error("Could not find matching closing brace for appDescriptor in Root.tsx");
  }

  return (
    rootTsxContent.slice(0, braceStart) +
    descriptorJson +
    rootTsxContent.slice(braceEnd + 1)
  );
}

export function injectIntoRootTsx(
  projectDir: string,
  descriptor: ConvertedDescriptor,
): string {
  const rootPath = findRootTsx(projectDir);
  if (!rootPath) {
    throw new Error(`Could not find src/Root.tsx in ${projectDir}`);
  }

  const content = fs.readFileSync(rootPath, "utf-8");
  const updated = injectDescriptor(content, descriptor);
  fs.writeFileSync(rootPath + ".bak", content, "utf-8");
  fs.writeFileSync(rootPath, updated, "utf-8");
  return rootPath;
}
