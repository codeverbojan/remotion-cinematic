import type { FigmaNode } from "./figma-client";

interface SidebarItem {
  label: string;
  icon?: string;
  active?: boolean;
  badge?: string;
}

interface TopBarTab {
  label: string;
  active?: boolean;
}

interface TopBarAction {
  label: string;
  variant: "primary" | "secondary" | "ghost";
}

interface ContentPanel {
  type: "stat" | "table" | "list" | "messages" | "placeholder";
  title?: string;
  label?: string;
  value?: string;
  delta?: string;
  columns?: string[];
  rows?: string[][];
  statusColumn?: number;
  items?: Array<{ label: string; description?: string; badge?: string }>;
  messages?: Array<{
    from: string;
    text: string;
    subject?: string;
    timestamp?: string;
  }>;
  messageVariant?: "chat" | "email";
  height?: number;
}

export interface ConvertedDescriptor {
  layout: "sidebar" | "topbar" | "minimal";
  sidebar?: {
    width: number;
    items: SidebarItem[];
    avatar?: { name: string };
  };
  topBar?: {
    title: string;
    search: boolean;
    searchPlaceholder?: string;
    tabs: TopBarTab[];
    actions: TopBarAction[];
  };
  content: {
    columnCount: number;
    gap: number;
    panels: ContentPanel[];
  };
}

function getVisibleChildren(node: FigmaNode): FigmaNode[] {
  return (node.children ?? []).filter((c) => c.visible !== false);
}

function getAllTextNodes(node: FigmaNode): FigmaNode[] {
  const result: FigmaNode[] = [];
  if (node.type === "TEXT") result.push(node);
  for (const child of node.children ?? []) {
    result.push(...getAllTextNodes(child));
  }
  return result;
}

function getFirstText(node: FigmaNode): string {
  const texts = getAllTextNodes(node);
  return texts[0]?.characters ?? "";
}

function getNodeBounds(node: FigmaNode) {
  return node.absoluteBoundingBox ?? { x: 0, y: 0, width: 0, height: 0 };
}

function isNarrowLeft(
  child: FigmaNode,
  parent: FigmaNode,
): boolean {
  const cb = getNodeBounds(child);
  const pb = getNodeBounds(parent);
  if (pb.width === 0 || pb.height === 0) return false;
  const widthRatio = cb.width / pb.width;
  const heightRatio = cb.height / pb.height;
  const leftOffset = cb.x - pb.x;
  return widthRatio < 0.25 && leftOffset < pb.width * 0.1 && heightRatio > 0.6;
}

function isWideTop(
  child: FigmaNode,
  parent: FigmaNode,
): boolean {
  const cb = getNodeBounds(child);
  const pb = getNodeBounds(parent);
  if (pb.width === 0 || pb.height === 0) return false;
  const heightRatio = cb.height / pb.height;
  const topOffset = cb.y - pb.y;
  const widthRatio = cb.width / pb.width;
  return heightRatio < 0.15 && topOffset < pb.height * 0.05 && widthRatio > 0.5;
}

function isFrameOrGroup(node: FigmaNode): boolean {
  return ["FRAME", "GROUP", "COMPONENT", "INSTANCE", "SECTION"].includes(
    node.type,
  );
}

function detectSidebar(
  children: FigmaNode[],
  parent: FigmaNode,
): { sidebar: FigmaNode; rest: FigmaNode[] } | null {
  const frames = children.filter(isFrameOrGroup);
  for (const frame of frames) {
    if (isNarrowLeft(frame, parent)) {
      return {
        sidebar: frame,
        rest: children.filter((c) => c.id !== frame.id),
      };
    }
  }
  return null;
}

function detectTopBar(
  children: FigmaNode[],
  parent: FigmaNode,
): { topBar: FigmaNode; rest: FigmaNode[] } | null {
  const frames = children.filter(isFrameOrGroup);
  for (const frame of frames) {
    if (isWideTop(frame, parent)) {
      return {
        topBar: frame,
        rest: children.filter((c) => c.id !== frame.id),
      };
    }
  }
  return null;
}

function parseSidebar(node: FigmaNode): ConvertedDescriptor["sidebar"] {
  const bounds = getNodeBounds(node);
  const children = getVisibleChildren(node);
  const items: SidebarItem[] = [];

  for (const child of children) {
    const texts = getAllTextNodes(child);
    if (texts.length > 0) {
      const label = texts[0].characters ?? "";
      if (label.trim()) {
        items.push({ label: label.trim() });
      }
    }
  }

  if (items.length === 0) {
    const texts = getAllTextNodes(node);
    for (const t of texts) {
      const label = (t.characters ?? "").trim();
      if (label) items.push({ label });
    }
  }

  if (items.length > 0) {
    items[0].active = true;
  }

  return {
    width: Math.round(Math.min(400, Math.max(100, bounds.width))),
    items,
  };
}

function parseTopBar(node: FigmaNode): ConvertedDescriptor["topBar"] {
  const texts = getAllTextNodes(node);
  const title = texts[0]?.characters?.trim() ?? "";
  const tabs: TopBarTab[] = [];
  const actions: TopBarAction[] = [];
  let hasSearch = false;

  const children = getVisibleChildren(node);
  for (const child of children) {
    const childTexts = getAllTextNodes(child);
    const childBounds = getNodeBounds(child);

    if (looksLikeSearchBar(child)) {
      hasSearch = true;
      continue;
    }

    if (looksLikeButton(child)) {
      const label = getFirstText(child) || "Action";
      actions.push({ label, variant: "primary" });
      continue;
    }

    if (looksLikeTabBar(child, children)) {
      for (let i = 0; i < childTexts.length; i++) {
        const tabLabel = (childTexts[i].characters ?? "").trim();
        if (tabLabel) tabs.push({ label: tabLabel, active: i === 0 });
      }
    }
  }

  return {
    title,
    search: hasSearch,
    tabs,
    actions,
  };
}

function looksLikeSearchBar(node: FigmaNode): boolean {
  const texts = getAllTextNodes(node);
  const text = texts.map((t) => (t.characters ?? "").toLowerCase()).join(" ");
  return text.includes("search") || text.includes("filter");
}

function looksLikeButton(node: FigmaNode): boolean {
  const bounds = getNodeBounds(node);
  if (!isFrameOrGroup(node)) return false;
  const hasText = getAllTextNodes(node).length > 0;
  const isSmall = bounds.width < 200 && bounds.height < 60;
  const hasRadius =
    node.cornerRadius !== undefined && node.cornerRadius > 0;
  const hasFill =
    node.fills?.some(
      (f) => f.type === "SOLID" && f.color && f.color.a > 0.5,
    ) ?? false;
  return hasText && isSmall && (hasRadius || hasFill);
}

function looksLikeTabBar(
  node: FigmaNode,
  siblings: FigmaNode[],
): boolean {
  if (!isFrameOrGroup(node)) return false;
  const children = getVisibleChildren(node);
  if (children.length < 2) return false;

  const allText = children.every(
    (c) => c.type === "TEXT" || getAllTextNodes(c).length > 0,
  );
  if (!allText) return false;

  const bounds = children.map(getNodeBounds);
  if (bounds.length < 2) return false;
  const yValues = bounds.map((b) => b.y);
  const ySpread = Math.max(...yValues) - Math.min(...yValues);
  return ySpread < 10;
}

function isStatCard(node: FigmaNode): boolean {
  const bounds = getNodeBounds(node);
  const texts = getAllTextNodes(node);
  if (texts.length < 2) return false;
  const isCompact = bounds.width < 500 && bounds.height < 300;
  const hasNumber = texts.some((t) =>
    /[\d$%€£¥]/.test(t.characters ?? ""),
  );
  return isCompact && hasNumber;
}

function isTable(node: FigmaNode): boolean {
  if (!isFrameOrGroup(node)) return false;
  const children = getVisibleChildren(node);
  if (children.length < 2) return false;

  const rows = children.filter(isFrameOrGroup);
  if (rows.length < 2) return false;

  const cellCounts = rows.map(
    (r) => getVisibleChildren(r).length,
  );
  const firstCount = cellCounts[0];
  if (firstCount < 3 || !cellCounts.every((c) => c === firstCount)) return false;

  const firstRowChildren = getVisibleChildren(rows[0]);
  const firstRowBounds = firstRowChildren.map(getNodeBounds);
  if (firstRowBounds.length < 3) return false;
  const xPositions = firstRowBounds.map((b) => b.x);
  const xSpread = Math.max(...xPositions) - Math.min(...xPositions);
  return xSpread > 50;
}

function parseTable(node: FigmaNode): ContentPanel {
  const children = getVisibleChildren(node).filter(isFrameOrGroup);
  if (children.length < 2) {
    return { type: "placeholder", title: node.name || "Table", height: 200 };
  }
  const headerRow = children[0];
  const dataRows = children.slice(1);

  const columns = getVisibleChildren(headerRow).map(
    (cell) => getFirstText(cell) || "Column",
  );

  const rows = dataRows.map((row) =>
    getVisibleChildren(row).map((cell) => getFirstText(cell) || ""),
  );

  const statusColumn = columns.findIndex((col) =>
    /status|state/i.test(col),
  );

  return {
    type: "table",
    title: getFirstText(node).includes(columns[0])
      ? undefined
      : getFirstText(node) || undefined,
    columns,
    rows,
    statusColumn: statusColumn >= 0 ? statusColumn : undefined,
  };
}

function parseStatCard(node: FigmaNode): ContentPanel {
  const texts = getAllTextNodes(node);
  let label = "";
  let value = "";
  let delta: string | undefined;

  for (const t of texts) {
    const text = (t.characters ?? "").trim();
    if (!text) continue;

    if (/^[+\-]\d/.test(text)) {
      delta = text;
    } else if (/[\d$€£¥%]/.test(text) && !label) {
      value = text;
    } else if (!label) {
      label = text;
    } else if (!value) {
      value = text;
    }
  }

  if (!value && label) {
    value = label;
    label = "";
  }

  return {
    type: "stat",
    title: label || undefined,
    label: label || "Metric",
    value: value || "—",
    delta,
  };
}

function isList(node: FigmaNode): boolean {
  if (!isFrameOrGroup(node)) return false;
  const children = getVisibleChildren(node).filter(isFrameOrGroup);
  if (children.length < 2) return false;

  const childBounds = children.map(getNodeBounds);
  const widths = childBounds.map((b) => b.width);
  const maxWidth = Math.max(...widths);
  const minWidth = Math.min(...widths);
  return maxWidth - minWidth < 20 && children.length >= 2;
}

function parseList(node: FigmaNode): ContentPanel {
  const children = getVisibleChildren(node).filter(isFrameOrGroup);
  const items = children.map((child) => {
    const texts = getAllTextNodes(child);
    return {
      label: texts[0]?.characters?.trim() ?? "Item",
      description: texts[1]?.characters?.trim(),
    };
  });

  return {
    type: "list",
    title: undefined,
    items,
  };
}

function parseContentPanel(node: FigmaNode): ContentPanel {
  if (isStatCard(node)) return parseStatCard(node);
  if (isTable(node)) return parseTable(node);
  if (isList(node)) return parseList(node);

  const bounds = getNodeBounds(node);
  return {
    type: "placeholder",
    title: getFirstText(node) || node.name || "Content",
    height: Math.round(Math.min(800, Math.max(80, bounds.height))),
  };
}

function estimateColumns(nodes: FigmaNode[]): number {
  if (nodes.length <= 1) return 1;
  const bounds = nodes.map(getNodeBounds);
  const firstRowY = Math.min(...bounds.map((b) => b.y));
  const firstRowCount = bounds.filter(
    (b) => Math.abs(b.y - firstRowY) < 15,
  ).length;
  return Math.min(6, Math.max(1, firstRowCount));
}

export function convertFigmaToDescriptor(
  rootNode: FigmaNode,
): ConvertedDescriptor {
  const children = getVisibleChildren(rootNode);

  let layout: ConvertedDescriptor["layout"] = "minimal";
  let sidebar: ConvertedDescriptor["sidebar"];
  let topBar: ConvertedDescriptor["topBar"];
  let contentNodes = children;

  const sidebarResult = detectSidebar(children, rootNode);
  if (sidebarResult) {
    layout = "sidebar";
    sidebar = parseSidebar(sidebarResult.sidebar);
    contentNodes = sidebarResult.rest;
  }

  const topBarResult = detectTopBar(contentNodes, rootNode);
  if (topBarResult) {
    if (layout === "minimal") layout = "topbar";
    topBar = parseTopBar(topBarResult.topBar);
    contentNodes = topBarResult.rest;
  }

  const contentFrames = contentNodes.filter(isFrameOrGroup);
  const panels: ContentPanel[] = [];

  for (const frame of contentFrames) {
    const panel = parseContentPanel(frame);
    if (panel.type !== "placeholder") {
      panels.push(panel);
      continue;
    }

    const innerChildren = getVisibleChildren(frame);
    const innerFrames = innerChildren.filter(isFrameOrGroup);

    if (innerFrames.length >= 1) {
      for (const inner of innerFrames) {
        panels.push(parseContentPanel(inner));
      }
    } else {
      panels.push(panel);
    }
  }

  if (panels.length === 0) {
    for (const node of contentNodes) {
      if (node.type === "TEXT") {
        panels.push({
          type: "placeholder",
          title: (node.characters ?? "Content").trim(),
          height: 200,
        });
      }
    }
  }

  const columnCount = estimateColumns(
    contentFrames.length > 0 ? contentFrames : contentNodes,
  );

  return {
    layout,
    sidebar,
    topBar,
    content: {
      columnCount,
      gap: 16,
      panels,
    },
  };
}
