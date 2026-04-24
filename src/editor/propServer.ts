import { createServer } from "node:http";
import { writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));
const PROPS_PATH = resolve(DIR, "../defaultProps.ts");
const PORT = 3099;
const MAX_BODY_BYTES = 2 * 1024 * 1024;

function formatPropsFile(props: unknown): string {
  return [
    'import type { CinematicProps } from "./schema";',
    "",
    "export const DEFAULT_PROPS: CinematicProps = ",
    JSON.stringify(props, null, 2) + ";",
    "",
  ].join("\n");
}

const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === "POST" && req.url === "/save-props") {
    let body = "";
    let size = 0;
    let aborted = false;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        if (!aborted) {
          aborted = true;
          res.writeHead(413, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Payload too large" }));
          req.destroy();
        }
        return;
      }
      body += chunk.toString();
    });
    req.on("end", () => {
      if (aborted) return;
      try {
        const props = JSON.parse(body);
        const content = formatPropsFile(props);
        writeFileSync(PROPS_PATH, content, "utf-8");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  if (req.method === "GET" && req.url === "/props") {
    try {
      const content = readFileSync(PROPS_PATH, "utf-8");
      const match = content.match(
        /export const DEFAULT_PROPS:\s*CinematicProps\s*=\s*([\s\S]*);/,
      );
      if (match) {
        const parsed = JSON.parse(match[1]);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(parsed));
      } else {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Could not parse defaultProps.ts" }));
      }
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err) }));
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Prop backup server listening on http://localhost:${PORT}`);
});
