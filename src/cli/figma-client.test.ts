import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseFigmaUrl, fetchFigmaNode, FigmaApiError } from "./figma-client";

describe("parseFigmaUrl", () => {
  it("parses a standard Figma file URL with node-id", () => {
    const result = parseFigmaUrl(
      "https://www.figma.com/file/abc123xyz/MyDesign?node-id=42%3A99",
    );
    expect(result).toEqual({ fileKey: "abc123xyz", nodeId: "42:99" });
  });

  it("parses a /design/ URL format", () => {
    const result = parseFigmaUrl(
      "https://www.figma.com/design/XyZ789/Dashboard?node-id=0-1",
    );
    expect(result).toEqual({ fileKey: "XyZ789", nodeId: "0:1" });
  });

  it("returns empty nodeId when node-id param is missing", () => {
    const result = parseFigmaUrl(
      "https://www.figma.com/file/abc123xyz/MyDesign",
    );
    expect(result).toEqual({ fileKey: "abc123xyz", nodeId: "" });
  });

  it("returns null for non-Figma URLs", () => {
    expect(parseFigmaUrl("https://example.com/file/abc")).toBeNull();
  });

  it("returns null for invalid URLs", () => {
    expect(parseFigmaUrl("not-a-url")).toBeNull();
  });

  it("returns null for Figma URLs without file path", () => {
    expect(parseFigmaUrl("https://www.figma.com/about")).toBeNull();
  });

  it("rejects look-alike domains", () => {
    expect(parseFigmaUrl("https://notfigma.com/file/abc/Test")).toBeNull();
    expect(parseFigmaUrl("https://figma.com.evil.com/file/abc/Test")).toBeNull();
  });
});

describe("fetchFigmaNode", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetch(status: number, body: unknown) {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? "OK" : "Error",
      json: () => Promise.resolve(body),
    });
  }

  it("returns the node document on success", async () => {
    const nodeDoc = { id: "1:2", name: "Frame", type: "FRAME" };
    mockFetch(200, { nodes: { "1:2": { document: nodeDoc } } });

    const result = await fetchFigmaNode({ token: "tok", fileKey: "abc", nodeId: "1:2" });
    expect(result).toEqual(nodeDoc);
  });

  it("decodes pre-encoded node IDs for lookup", async () => {
    const nodeDoc = { id: "42:99", name: "Frame", type: "FRAME" };
    mockFetch(200, { nodes: { "42:99": { document: nodeDoc } } });

    const result = await fetchFigmaNode({ token: "tok", fileKey: "abc", nodeId: "42%3A99" });
    expect(result).toEqual(nodeDoc);
  });

  it("throws on empty nodeId", async () => {
    await expect(
      fetchFigmaNode({ token: "tok", fileKey: "abc", nodeId: "" }),
    ).rejects.toThrow("nodeId is required");
  });

  it("throws FigmaApiError on 403", async () => {
    mockFetch(403, {});
    await expect(
      fetchFigmaNode({ token: "bad", fileKey: "abc", nodeId: "1:2" }),
    ).rejects.toThrow("Invalid Figma token");
  });

  it("throws FigmaApiError on 404", async () => {
    mockFetch(404, {});
    await expect(
      fetchFigmaNode({ token: "tok", fileKey: "bad", nodeId: "1:2" }),
    ).rejects.toThrow("not found");
  });

  it("throws FigmaApiError on 429 rate limit", async () => {
    mockFetch(429, {});
    await expect(
      fetchFigmaNode({ token: "tok", fileKey: "abc", nodeId: "1:2" }),
    ).rejects.toThrow("rate limit");
  });

  it("throws when node is missing from response", async () => {
    mockFetch(200, { nodes: { "other:1": { document: { id: "other:1" } } } });
    await expect(
      fetchFigmaNode({ token: "tok", fileKey: "abc", nodeId: "1:2" }),
    ).rejects.toThrow('Node "1:2" not found');
  });
});
