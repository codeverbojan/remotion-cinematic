import type { CinematicProps, WindowLayout } from "./schema";

export const OUTPUT_SIZES = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
} as const;
export const outputSize = (format: CinematicProps["outputFormat"]) => OUTPUT_SIZES[format];

/** Reflow the three product windows; proportionally adapt custom geometry. */
export function layoutForOutput(props: CinematicProps): CinematicProps {
  const size = outputSize(props.outputFormat);
  const from = props.layoutCanvas;
  if (from.width === size.width && from.height === size.height) return props;
  const sx = size.width / from.width;
  const sy = size.height / from.height;
  const windows = props.windowLayout.map((win): WindowLayout => {
    const scaled = { ...win, startX: Math.round(win.startX * sx), startY: Math.round(win.startY * sy), startW: Math.round(win.startW * sx), startH: Math.round(win.startH * sy), endX: win.endX === undefined ? undefined : Math.round(win.endX * sx), endY: win.endY === undefined ? undefined : Math.round(win.endY * sy), endW: win.endW === undefined ? undefined : Math.round(win.endW * sx), endH: win.endH === undefined ? undefined : Math.round(win.endH * sy) };
    if (props.outputFormat === "portrait") {
      if (win.id === "product-window") return { ...scaled, startX: 54, startY: 150, startW: 972, startH: 1560, endX: 54, endY: 120, endW: 972, endH: 720 };
      if (win.id === "top-panel") return { ...scaled, startX: 54, startY: 900, startW: 972, startH: 400 };
      if (win.id === "left-panel") return { ...scaled, startX: 54, startY: 1360, startW: 972, startH: 400 };
      if (/^feature-[0-2]$/.test(win.id)) return { ...scaled, startX: 54, startY: 100 + Number(win.id.slice(-1)) * 580, startW: 972, startH: 530 };
    }
    if (props.outputFormat === "square") {
      if (win.id === "product-window") return { ...scaled, startX: 54, startY: 54, startW: 972, startH: 972, endX: 54, endY: 54, endW: 972, endH: 460 };
      if (win.id === "top-panel") return { ...scaled, startX: 54, startY: 560, startW: 460, startH: 466 };
      if (win.id === "left-panel") return { ...scaled, startX: 566, startY: 560, startW: 460, startH: 466 };
    }
    return scaled;
  });
  return { ...props, layoutCanvas: size, windowLayout: windows, cursorPath: props.cursorPath.map((entry) => {
    const win = windows.find((w) => w.id === entry.target);
    return { ...entry, positionX: entry.positionX === undefined ? undefined : entry.positionX * sx, positionY: entry.positionY === undefined ? undefined : entry.positionY * sy, toX: entry.toX === undefined ? undefined : win?.endX ?? entry.toX * sx, toY: entry.toY === undefined ? undefined : win?.endY ?? entry.toY * sy };
  }) };
}
