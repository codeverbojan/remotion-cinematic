import type { CinematicProps, WindowLayout } from "./schema";

export const OUTPUT_SIZES = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
} as const;
export const outputSize = (format: CinematicProps["outputFormat"]) => OUTPUT_SIZES[format];

/** Reflow the three product windows; proportionally adapt custom geometry. */
export function layoutForOutput(props: CinematicProps, resetBuiltins = false): CinematicProps {
  const size = outputSize(props.outputFormat);
  const from = props.layoutCanvas;
  if (!resetBuiltins && from.width === size.width && from.height === size.height) return props;
  const sx = size.width / from.width;
  const sy = size.height / from.height;
  const uniform = Math.min(sx, sy);
  const windows = props.windowLayout.map((win): WindowLayout => {
    const scaled = { ...win, startX: Math.round(win.startX * sx), startY: Math.round(win.startY * sy), startW: Math.round(win.startW * uniform), startH: Math.round(win.startH * uniform), endX: win.endX === undefined ? undefined : Math.round(win.endX * sx), endY: win.endY === undefined ? undefined : Math.round(win.endY * sy), endW: win.endW === undefined ? undefined : Math.round(win.endW * uniform), endH: win.endH === undefined ? undefined : Math.round(win.endH * uniform) };
    if (props.outputFormat === "landscape") {
      if (win.id === "product-window") return {...scaled, startX: 192, startY: 40, startW: 1536, startH: 1000, endX: 72, endY: 160, endW: 1152, endH: 762};
      if (win.id === "top-panel") return {...scaled, startX: 1290, startY: 80, startW: 560, startH: 440};
      if (win.id === "left-panel") return {...scaled, startX: 1290, startY: 560, startW: 560, startH: 440};
      if (/^feature-[0-2]$/.test(win.id)) return {...scaled, startX: 80 + Number(win.id.slice(-1)) * 600, startY: 260, startW: 560, startH: 560};
    }
    if (props.outputFormat === "portrait") {
      if (win.id === "spreadsheet") return {...scaled, startX: 160, startY: 180, startW: 860, startH: 430, endX: 160, endY: -700};
      if (win.id === "email") return {...scaled, startX: 60, startY: 660, startW: 820, startH: 430, endX: -950, endY: 660};
      if (win.id === "chat") return {...scaled, startX: 200, startY: 1120, startW: 820, startH: 420, endX: 1200, endY: 1120};
      if (win.id.startsWith("sticky-")) { const i = Number(win.id.slice(-1)); return {...scaled, startX: 40 + i * 220, startY: 70 + i * 40, startW: 240, startH: 180, endY: -300}; }
      if (win.id.startsWith("notification-")) { const i = Number(win.id.slice(-1)); return {...scaled, startX: 500, startY: 1520 + i * 120, startW: 520, startH: 110, endX: 1200}; }

      if (win.id === "product-window") return { ...scaled, startX: 54, startY: 636, startW: 972, startH: 650, endX: 54, endY: 120, endW: 972, endH: 650 };
      if (win.id === "top-panel") return { ...scaled, startX: 54, startY: 840, startW: 972, startH: 470 };
      if (win.id === "left-panel") return { ...scaled, startX: 54, startY: 1370, startW: 972, startH: 470 };
      if (/^feature-[0-2]$/.test(win.id)) return { ...scaled, startX: 54, startY: 100 + Number(win.id.slice(-1)) * 580, startW: 972, startH: 530 };
    }
    if (props.outputFormat === "square") {
      if (/^feature-[0-2]$/.test(win.id)) {
        const i = Number(win.id.slice(-1));
        return {...scaled, startX: i === 1 ? 566 : 54, startY: i < 2 ? 60 : 520, startW: i < 2 ? 460 : 972, startH: i < 2 ? 400 : 500};
      }

      if (win.id === "product-window") return { ...scaled, startX: 54, startY: 215, startW: 972, startH: 650, endX: 124, endY: 40, endW: 832, endH: 562 };
      if (win.id === "top-panel") return { ...scaled, startX: 54, startY: 640, startW: 460, startH: 400 };
      if (win.id === "left-panel") return { ...scaled, startX: 566, startY: 640, startW: 460, startH: 400 };
    }
    return scaled;
  });
  return { ...props, layoutCanvas: size, windowLayout: windows, cursorPath: props.cursorPath.map((entry) => {
    const win = windows.find((w) => w.id === entry.target);
    return { ...entry, positionX: entry.positionX === undefined ? undefined : entry.positionX * sx, positionY: entry.positionY === undefined ? undefined : entry.positionY * sy, toX: entry.toX === undefined ? undefined : win?.endX ?? entry.toX * sx, toY: entry.toY === undefined ? undefined : win?.endY ?? entry.toY * sy };
  }) };
}
