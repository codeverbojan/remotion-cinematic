import React from "react";
import type { WindowLayout } from "../schema";

const SNAP_THRESHOLD = 6;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Guides {
  x: number[];
  y: number[];
}

export function computeSnapGuides(
  box: Box,
  others: WindowLayout[],
  canvasW: number,
  canvasH: number,
): Guides {
  const xCandidates: number[] = [canvasW / 2];
  const yCandidates: number[] = [canvasH / 2];

  for (const o of others) {
    xCandidates.push(o.startX, o.startX + o.startW / 2, o.startX + o.startW);
    yCandidates.push(o.startY, o.startY + o.startH / 2, o.startY + o.startH);
  }

  const boxEdgesX = [box.x, box.x + box.w / 2, box.x + box.w];
  const boxEdgesY = [box.y, box.y + box.h / 2, box.y + box.h];

  const matchedX: number[] = [];
  const matchedY: number[] = [];

  for (const cx of xCandidates) {
    for (const bx of boxEdgesX) {
      if (Math.abs(bx - cx) <= SNAP_THRESHOLD) {
        matchedX.push(cx);
        break;
      }
    }
  }

  for (const cy of yCandidates) {
    for (const by of boxEdgesY) {
      if (Math.abs(by - cy) <= SNAP_THRESHOLD) {
        matchedY.push(cy);
        break;
      }
    }
  }

  return { x: matchedX, y: matchedY };
}

export function applySnap(box: Box, guides: Guides): { x: number; y: number } {
  let { x, y } = box;
  const boxEdgesX = [box.x, box.x + box.w / 2, box.x + box.w];
  const boxEdgesY = [box.y, box.y + box.h / 2, box.y + box.h];

  let bestDx = Infinity;
  for (const gx of guides.x) {
    for (let i = 0; i < boxEdgesX.length; i++) {
      const d = Math.abs(boxEdgesX[i] - gx);
      if (d < bestDx && d <= SNAP_THRESHOLD) {
        bestDx = d;
        x = box.x + (gx - boxEdgesX[i]);
      }
    }
  }

  let bestDy = Infinity;
  for (const gy of guides.y) {
    for (let i = 0; i < boxEdgesY.length; i++) {
      const d = Math.abs(boxEdgesY[i] - gy);
      if (d < bestDy && d <= SNAP_THRESHOLD) {
        bestDy = d;
        y = box.y + (gy - boxEdgesY[i]);
      }
    }
  }

  return { x, y };
}

export const SnapGuides: React.FC<{ guides: Guides; canvasW: number; canvasH: number }> = ({
  guides,
  canvasW,
  canvasH,
}) => {
  const uniqueX = [...new Set(guides.x)];
  const uniqueY = [...new Set(guides.y)];

  return (
    <>
      {uniqueX.map((x) => (
        <div
          key={`x-${x}`}
          style={{
            position: "absolute",
            left: `${(x / canvasW) * 100}%`,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: "#FF6B6B",
            opacity: 0.7,
            pointerEvents: "none",
            zIndex: 99998,
          }}
        />
      ))}
      {uniqueY.map((y) => (
        <div
          key={`y-${y}`}
          style={{
            position: "absolute",
            top: `${(y / canvasH) * 100}%`,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "#FF6B6B",
            opacity: 0.7,
            pointerEvents: "none",
            zIndex: 99998,
          }}
        />
      ))}
    </>
  );
};
