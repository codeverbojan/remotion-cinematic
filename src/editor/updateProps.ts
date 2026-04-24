import type { CinematicProps } from "../schema";
import { CinematicSchema } from "../schema";

const PROP_SERVER_URL = "http://localhost:3099";
const DEBOUNCE_MS = 3000;

const SCHEMA_DEFAULTS = CinematicSchema.parse({});

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let latestProps: CinematicProps | null = null;

function backupToServer(props: CinematicProps) {
  fetch(`${PROP_SERVER_URL}/save-props`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(props),
  }).catch(() => {
    // Prop server not running — silent fallback
  });
}

function scheduleBackup(props: CinematicProps) {
  latestProps = props;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (latestProps) {
      backupToServer(latestProps);
      latestProps = null;
    }
  }, DEBOUNCE_MS);
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (latestProps) {
      const body = JSON.stringify(latestProps);
      navigator.sendBeacon(
        `${PROP_SERVER_URL}/save-props`,
        new Blob([body], { type: "application/json" }),
      );
    }
  });
}

export function persistUpdate(
  updater: (prev: CinematicProps) => CinematicProps,
) {
  let updateDefaultProps: (opts: unknown) => Promise<void>;
  try {
    updateDefaultProps = require("@remotion/studio").updateDefaultProps;
  } catch {
    return;
  }
  updateDefaultProps({
    compositionId: "CinematicDemo",
    defaultProps: (current: Record<string, unknown>) => {
      const prev = { ...SCHEMA_DEFAULTS, ...current } as CinematicProps;
      if (!Array.isArray(prev.windowLayout)) prev.windowLayout = SCHEMA_DEFAULTS.windowLayout;
      if (!Array.isArray(prev.cursorPath)) prev.cursorPath = SCHEMA_DEFAULTS.cursorPath;
      if (!Array.isArray(prev.scenes)) prev.scenes = SCHEMA_DEFAULTS.scenes;
      const updated = updater(prev);
      delete (updated as Record<string, unknown>).savedDefaultProps;
      delete (updated as Record<string, unknown>).unsavedDefaultProps;
      delete (updated as Record<string, unknown>).schema;
      return updated;
    },
  }).catch((err: unknown) => {
    console.error("[persistUpdate] updateDefaultProps failed:", err);
  });
}
