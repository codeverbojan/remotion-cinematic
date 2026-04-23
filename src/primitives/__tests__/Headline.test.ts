import { describe, expect, it } from "vitest";
import { getHeadlinePose, getLineStartFrame } from "../Headline";

describe("getLineStartFrame", () => {
  it("returns 0 for the first line", () => {
    expect(getLineStartFrame(0, 10, 24)).toBe(0);
  });

  it("staggers lines by entranceDuration + lineDelay", () => {
    expect(getLineStartFrame(1, 10, 24)).toBe(34);
    expect(getLineStartFrame(2, 10, 24)).toBe(68);
  });

  it("handles zero lineDelay", () => {
    expect(getLineStartFrame(1, 10, 0)).toBe(10);
  });
});

describe("getHeadlinePose", () => {
  const base = {
    entranceDuration: 10,
    lineDelay: 24,
    yRise: 20,
    exitDuration: 10,
  };

  it("returns opacity 0 before line starts", () => {
    const pose = getHeadlinePose({ ...base, frame: -1, lineIndex: 0 });
    expect(pose.opacity).toBe(0);
    expect(pose.translateY).toBe(20);
  });

  it("returns opacity 1 after entrance completes", () => {
    const pose = getHeadlinePose({ ...base, frame: 10, lineIndex: 0 });
    expect(pose.opacity).toBe(1);
    expect(pose.translateY).toBe(0);
  });

  it("interpolates during entrance", () => {
    const pose = getHeadlinePose({ ...base, frame: 5, lineIndex: 0 });
    expect(pose.opacity).toBeGreaterThan(0);
    expect(pose.opacity).toBeLessThan(1);
    expect(pose.translateY).toBeGreaterThan(0);
    expect(pose.translateY).toBeLessThan(20);
  });

  it("second line starts after delay", () => {
    const poseBeforeStart = getHeadlinePose({ ...base, frame: 33, lineIndex: 1 });
    expect(poseBeforeStart.opacity).toBe(0);

    const poseAfterStart = getHeadlinePose({ ...base, frame: 44, lineIndex: 1 });
    expect(poseAfterStart.opacity).toBe(1);
  });

  it("fades out after exitAt", () => {
    const poseBeforeExit = getHeadlinePose({ ...base, frame: 50, lineIndex: 0, exitAt: 60 });
    expect(poseBeforeExit.opacity).toBe(1);

    const poseDuringExit = getHeadlinePose({ ...base, frame: 65, lineIndex: 0, exitAt: 60 });
    expect(poseDuringExit.opacity).toBeGreaterThan(0);
    expect(poseDuringExit.opacity).toBeLessThan(1);

    const poseAfterExit = getHeadlinePose({ ...base, frame: 70, lineIndex: 0, exitAt: 60 });
    expect(poseAfterExit.opacity).toBe(0);
  });

  it("exit does not exceed entrance opacity", () => {
    const pose = getHeadlinePose({ ...base, frame: 5, lineIndex: 0, exitAt: 5 });
    expect(pose.opacity).toBeLessThan(1);
  });

  it("holds at full opacity when no exitAt", () => {
    const pose = getHeadlinePose({ ...base, frame: 1000, lineIndex: 0 });
    expect(pose.opacity).toBe(1);
    expect(pose.translateY).toBe(0);
  });
});
