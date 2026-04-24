import * as fs from "fs";
import * as path from "path";
import type { ConvertedDescriptor } from "./figma-to-descriptor";

const SYSTEM_PROMPT = `You are a UI analysis tool. Given a screenshot of a web application, output a JSON object describing its layout structure.

The JSON must match this exact schema (no extra fields):

{
  "layout": "sidebar" | "topbar" | "minimal",
  "sidebar": {                          // omit if no sidebar
    "width": number (100-400),
    "items": [{ "label": string, "icon": string?, "active": boolean?, "badge": string? }],
    "avatar": { "name": string }?
  },
  "topBar": {                           // omit if no top bar
    "title": string,
    "search": boolean,
    "tabs": [{ "label": string, "active": boolean? }],
    "actions": [{ "label": string, "variant": "primary" | "secondary" | "ghost" }]
  },
  "content": {
    "columnCount": number (1-6),
    "gap": number (0-40),
    "panels": [
      // stat: { "type": "stat", "title": string?, "label": string, "value": string, "delta": string? }
      // table: { "type": "table", "title": string?, "columns": string[], "rows": string[][], "statusColumn": number? }
      // list: { "type": "list", "title": string?, "items": [{ "label": string, "description": string?, "badge": string? }] }
      // messages: { "type": "messages", "title": string?, "messages": [{ "from": string, "text": string, "timestamp": string? }], "messageVariant": "chat" | "email" }
      // placeholder: { "type": "placeholder", "title": string, "height": number }
    ]
  }
}

Rules:
- Output ONLY the JSON object, no markdown, no explanation, no code fences.
- Use realistic sample data that matches what you see in the screenshot.
- For charts or images, use "placeholder" type.
- Detect the layout type: "sidebar" if there's a left navigation, "topbar" if only a top bar, "minimal" if neither.
- Set "active" on the currently selected sidebar item or tab.
- For tables, identify column headers and data rows. Set statusColumn if there's a status/state column.`;

function getMediaType(
  filePath: string,
): "image/png" | "image/jpeg" | "image/webp" | "image/gif" {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "image/png";
  }
}

export async function screenshotToDescriptor(
  imagePath: string,
  apiKey: string,
): Promise<ConvertedDescriptor> {
  const absPath = path.resolve(imagePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Screenshot file not found: ${absPath}`);
  }

  const imageData = fs.readFileSync(absPath);
  const base64 = imageData.toString("base64");
  const mediaType = getMediaType(absPath);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: "text",
              text: "Analyze this screenshot and output the layout descriptor JSON.",
            },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Anthropic API error (${response.status}): ${body.slice(0, 200)}`,
    );
  }

  const result = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  if (!result.content || result.content.length === 0) {
    throw new Error("No content in Claude API response");
  }

  const textBlock = result.content.find((c) => c.type === "text");
  if (!textBlock?.text) {
    throw new Error("No text response from Claude API");
  }

  let cleaned = textBlock.text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    return JSON.parse(cleaned) as ConvertedDescriptor;
  } catch {
    throw new Error(
      `Failed to parse Claude response as JSON. Response: ${cleaned.slice(0, 200)}`,
    );
  }
}
