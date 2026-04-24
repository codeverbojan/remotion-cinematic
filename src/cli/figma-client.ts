export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  characters?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
  };
  fills?: Array<{
    type: string;
    color?: { r: number; g: number; b: number; a: number };
  }>;
  layoutMode?: "HORIZONTAL" | "VERTICAL" | "NONE";
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  cornerRadius?: number;
  visible?: boolean;
}

export interface FigmaNodesResponse {
  name: string;
  document: FigmaNode;
  nodes: Record<string, { document: FigmaNode }>;
}

export interface FigmaClientOptions {
  token: string;
  fileKey: string;
  nodeId: string;
}

export class FigmaApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "FigmaApiError";
  }
}

export function parseFigmaUrl(url: string): { fileKey: string; nodeId: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "figma.com" && !parsed.hostname.endsWith(".figma.com")) return null;

    const pathMatch = parsed.pathname.match(/\/(?:file|design)\/([a-zA-Z0-9]+)/);
    if (!pathMatch) return null;

    const fileKey = pathMatch[1];
    const rawNodeId = parsed.searchParams.get("node-id") ?? "";
    const nodeId = rawNodeId.replace(/-/g, ":");

    return { fileKey, nodeId };
  } catch {
    return null;
  }
}

export async function fetchFigmaNode(
  options: FigmaClientOptions,
): Promise<FigmaNode> {
  const { token, fileKey, nodeId } = options;
  const decodedNodeId = decodeURIComponent(nodeId);

  if (!decodedNodeId) {
    throw new FigmaApiError(400, "nodeId is required but was empty");
  }

  const encodedNodeId = encodeURIComponent(decodedNodeId);
  const url = `https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}/nodes?ids=${encodedNodeId}`;

  const response = await fetch(url, {
    headers: {
      "X-Figma-Token": token,
    },
    signal: AbortSignal.timeout(120_000),
  });

  if (response.status === 403) {
    throw new FigmaApiError(403, "Invalid Figma token or no access to this file");
  }
  if (response.status === 404) {
    throw new FigmaApiError(404, "Figma file or node not found");
  }
  if (response.status === 429) {
    throw new FigmaApiError(429, "Figma API rate limit exceeded — wait a moment and retry");
  }
  if (!response.ok) {
    throw new FigmaApiError(
      response.status,
      `Figma API error: ${response.status} ${response.statusText}`,
    );
  }

  let data: FigmaNodesResponse;
  try {
    data = (await response.json()) as FigmaNodesResponse;
  } catch {
    throw new FigmaApiError(response.status, "Failed to parse Figma API response as JSON");
  }

  const node = data.nodes[decodedNodeId]?.document;

  if (!node) {
    const available = Object.keys(data.nodes).join(", ");
    throw new FigmaApiError(
      404,
      `Node "${nodeId}" not found in response. Available: ${available}`,
    );
  }

  return node;
}
