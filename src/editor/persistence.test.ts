import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveDefaultProps } from "@remotion/studio";
import { CinematicSchema } from "../schema";
import { getSaveStatus, persistUpdate } from "./updateProps";

vi.mock("@remotion/studio", () => ({ saveDefaultProps: vi.fn() }));

describe("project persistence", () => {
  beforeEach(() => { vi.mocked(saveDefaultProps).mockReset(); });

  it("preserves custom content across consecutive edits and a reload", async () => {
    let disk = JSON.stringify(CinematicSchema.parse({ brand: { name: "Acme" }, headlines: { pain: ["Custom headline"] }, cursorScale: 2 }));
    vi.mocked(saveDefaultProps).mockImplementation(async ({ defaultProps }) => {
      const savedDefaultProps = JSON.parse(disk);
      disk = JSON.stringify(defaultProps({ savedDefaultProps, unsavedDefaultProps: savedDefaultProps, schema: CinematicSchema }));
    });
    await persistUpdate((prev) => ({ ...prev, cta: "Start now" }));
    await persistUpdate((prev) => ({ ...prev, music: { ...prev.music, enabled: false } }));
    const reloaded = CinematicSchema.parse(JSON.parse(disk));
    expect(reloaded.brand.name).toBe("Acme");
    expect(reloaded.headlines.pain).toEqual(["Custom headline"]);
    expect(reloaded.cursorScale).toBe(2);
    expect(reloaded.cta).toBe("Start now");
    expect(reloaded.music.enabled).toBe(false);
    expect(getSaveStatus().state).toBe("saved");
  });

  it("serializes rapid edits before Studio receives the file update", async () => {
    const original = CinematicSchema.parse({});
    const saved: unknown[] = [];
    vi.mocked(saveDefaultProps).mockImplementation(async ({ defaultProps }) => {
      saved.push(defaultProps({ savedDefaultProps: original, unsavedDefaultProps: original, schema: CinematicSchema }));
    });
    await Promise.all([
      persistUpdate((prev) => ({ ...prev, cta: "Keep this" })),
      persistUpdate((prev) => ({ ...prev, cursorScale: 2 })),
    ]);
    expect(saved[1]).toMatchObject({ cta: "Keep this", cursorScale: 2 });
  });

  it("preserves sequential edits while the Studio snapshot is still stale", async () => {
    const original = CinematicSchema.parse({brand: {name: "Delayed HMR"}});
    let result: unknown;
    vi.mocked(saveDefaultProps).mockImplementation(async ({defaultProps}) => {
      result = defaultProps({savedDefaultProps: original, unsavedDefaultProps: original, schema: CinematicSchema});
    });
    await persistUpdate((p) => ({...p, cta: "Keep after await"}));
    await persistUpdate((p) => ({...p, cursorScale: 3}));
    expect(result).toMatchObject({cta: "Keep after await", cursorScale: 3});
  });

  it("preserves the latest save when HMR delivers an intermediate snapshot", async () => {
    let snapshot = CinematicSchema.parse({brand: {name: "Intermediate HMR"}});
    const saved: typeof snapshot[] = [];
    vi.mocked(saveDefaultProps).mockImplementation(async ({defaultProps}) => {
      saved.push(CinematicSchema.parse(defaultProps({savedDefaultProps: snapshot, unsavedDefaultProps: snapshot, schema: CinematicSchema})));
    });
    await persistUpdate((p) => ({...p, cta: "First"}));
    await persistUpdate((p) => ({...p, cursorScale: 2}));
    snapshot = saved[0];
    await persistUpdate((p) => ({...p, cursorRotation: 45}));
    expect(saved[2]).toMatchObject({cta: "First", cursorScale: 2, cursorRotation: 45});
  });

  it("reports write failures and recovers on the next save", async () => {
    vi.mocked(saveDefaultProps).mockRejectedValueOnce(new Error("Disk is read-only"));
    await persistUpdate((prev) => prev);
    expect(getSaveStatus()).toMatchObject({ state: "error", message: expect.stringContaining("read-only") });
    vi.mocked(saveDefaultProps).mockResolvedValueOnce();
    await persistUpdate((prev) => prev);
    expect(getSaveStatus().state).toBe("saved");
  });
});
