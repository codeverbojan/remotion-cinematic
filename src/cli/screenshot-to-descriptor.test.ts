import { describe, it, expect, vi, afterEach } from "vitest";
import { screenshotToDescriptor } from "./screenshot-to-descriptor";
import * as fs from "fs";

vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  };
});

describe("screenshotToDescriptor", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("throws when image file does not exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await expect(
      screenshotToDescriptor("/fake/image.png", "sk-test"),
    ).rejects.toThrow("not found");
  });

  it("sends image to Claude API and parses response", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("fakepng"));

    const descriptor = {
      layout: "sidebar",
      content: { columnCount: 2, gap: 16, panels: [] },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [{ type: "text", text: JSON.stringify(descriptor) }],
        }),
    });

    const result = await screenshotToDescriptor("/test/app.png", "sk-test");

    expect(result.layout).toBe("sidebar");
    expect(result.content.panels).toEqual([]);

    const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]!.body as string);
    expect(body.model).toBe("claude-sonnet-4-20250514");
    expect(body.messages[0].content[0].type).toBe("image");
    expect(body.messages[0].content[0].source.media_type).toBe("image/png");
  });

  it("strips markdown code fences from response", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("fakepng"));

    const descriptor = { layout: "minimal", content: { columnCount: 1, gap: 8, panels: [] } };
    const wrappedResponse = "```json\n" + JSON.stringify(descriptor) + "\n```";

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [{ type: "text", text: wrappedResponse }],
        }),
    });

    const result = await screenshotToDescriptor("/test/app.png", "sk-test");
    expect(result.layout).toBe("minimal");
  });

  it("throws on API error", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("fakepng"));

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });

    await expect(
      screenshotToDescriptor("/test/app.png", "bad-key"),
    ).rejects.toThrow("Anthropic API error (401)");
  });

  it("throws on invalid JSON response", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("fakepng"));

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [{ type: "text", text: "not valid json" }],
        }),
    });

    await expect(
      screenshotToDescriptor("/test/app.png", "sk-test"),
    ).rejects.toThrow("Failed to parse");
  });

  it("throws when response has empty content array", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("fakepng"));

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [] }),
    });

    await expect(
      screenshotToDescriptor("/test/app.png", "sk-test"),
    ).rejects.toThrow("No content in Claude API response");
  });

  it("throws when response has no content field", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("fakepng"));

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await expect(
      screenshotToDescriptor("/test/app.png", "sk-test"),
    ).rejects.toThrow("No content in Claude API response");
  });

  it("detects JPEG media type from extension", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("fakejpg"));

    const descriptor = { layout: "minimal", content: { columnCount: 1, gap: 8, panels: [] } };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [{ type: "text", text: JSON.stringify(descriptor) }],
        }),
    });

    await screenshotToDescriptor("/test/app.jpg", "sk-test");

    const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]!.body as string);
    expect(body.messages[0].content[0].source.media_type).toBe("image/jpeg");
  });
});
