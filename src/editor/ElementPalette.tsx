import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSceneAtFrame } from "../engine";
import { persistUpdate } from "./updateProps";
import type { CinematicProps, WindowLayout } from "../schema";

interface ElementPaletteProps {
  props: CinematicProps;
  frame: number;
}

const TOOLBAR_FONT = "system-ui, -apple-system, sans-serif";

interface WindowTemplate {
  label: string;
  icon: string;
  defaults: Omit<WindowLayout, "id" | "enterAt">;
}

const TEMPLATES: WindowTemplate[] = [
  {
    label: "Window",
    icon: "▢",
    defaults: {
      title: "New Window",
      startX: 460,
      startY: 240,
      startW: 1000,
      startH: 600,
      enterDuration: 12,
      enterFrom: "scale",
      animateDuration: 18,
      exitDuration: 12,
      zIndex: 1,
    },
  },
  {
    label: "Small Card",
    icon: "▫",
    defaults: {
      title: "Card",
      startX: 660,
      startY: 340,
      startW: 600,
      startH: 400,
      enterDuration: 12,
      enterFrom: "scale",
      animateDuration: 18,
      exitDuration: 12,
      zIndex: 2,
    },
  },
  {
    label: "Full Width",
    icon: "▬",
    defaults: {
      title: "Full Width",
      startX: 60,
      startY: 120,
      startW: 1800,
      startH: 840,
      enterDuration: 14,
      enterFrom: "slide-up",
      animateDuration: 18,
      exitDuration: 12,
      zIndex: 1,
    },
  },
  {
    label: "Left Panel",
    icon: "◧",
    defaults: {
      title: "Panel",
      startX: 60,
      startY: 120,
      startW: 500,
      startH: 840,
      enterDuration: 12,
      enterFrom: "slide-left",
      animateDuration: 18,
      exitDuration: 12,
      zIndex: 1,
    },
  },
  {
    label: "Right Panel",
    icon: "◨",
    defaults: {
      title: "Panel",
      startX: 1360,
      startY: 120,
      startW: 500,
      startH: 840,
      enterDuration: 12,
      enterFrom: "slide-right",
      animateDuration: 18,
      exitDuration: 12,
      zIndex: 1,
    },
  },
];

function generateId(existing: WindowLayout[]): string {
  const ids = new Set(existing.map((w) => w.id));
  let i = 1;
  while (ids.has(`window-${i}`)) i++;
  return `window-${i}`;
}

export const ElementPalette: React.FC<ElementPaletteProps> = ({
  props,
  frame,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const enabledScenes = useMemo(
    () => props.scenes.filter((s) => s.enabled),
    [props.scenes],
  );

  const currentScene = useMemo(
    () => getSceneAtFrame(enabledScenes, frame, props.overlap),
    [enabledScenes, frame, props.overlap],
  );

  const handleAdd = useCallback(
    (template: WindowTemplate) => {
      const currentProps = propsRef.current;
      const id = generateId(currentProps.windowLayout);
      const sceneRange = getSceneAtFrame(
        enabledScenes,
        frame,
        currentProps.overlap,
      );
      const sceneRelativeFrame = sceneRange
        ? Math.max(0, frame - sceneRange.startFrame)
        : 0;
      const newWindow: WindowLayout = {
        ...template.defaults,
        id,
        enterAt: sceneRelativeFrame,
        sceneId: sceneRange?.id,
      } as WindowLayout;

      persistUpdate((prev) => ({ ...prev, windowLayout: [...prev.windowLayout, newWindow] }));

      setOpen(false);
    },
    [frame, enabledScenes],
  );

  const handleRemove = useCallback(
    (id: string) => {
      persistUpdate((prev) => ({
        ...prev,
        windowLayout: prev.windowLayout.filter((w) => w.id !== id),
        cursorPath: prev.cursorPath.filter((e) => e.target !== id),
      }));
    },
    [],
  );

  return (
    <div
      ref={wrapperRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 100001,
        fontFamily: TOOLBAR_FONT,
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "6px 12px",
          fontSize: 11,
          fontFamily: TOOLBAR_FONT,
          backgroundColor: open ? "#6366F1" : "#1A1A28",
          color: "#E0E0F0",
          border: open ? "1px solid #818CF8" : "1px solid #333",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: open ? 600 : 400,
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        + Elements
      </button>

      {open && (
        <div
          style={{
            marginTop: 6,
            width: 200,
            backgroundColor: "#1A1A28",
            border: "1px solid #333",
            borderRadius: 8,
            padding: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#888",
              marginBottom: 6,
              paddingLeft: 4,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Add to: {currentScene?.id ?? "—"}
          </div>

          {!currentScene && (
            <div style={{ fontSize: 11, color: "#F87171", padding: "4px 8px" }}>
              Scrub to a scene to add windows
            </div>
          )}

          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              onClick={() => currentScene && handleAdd(t)}
              disabled={!currentScene}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "6px 8px",
                fontSize: 12,
                fontFamily: TOOLBAR_FONT,
                backgroundColor: "transparent",
                color: currentScene ? "#E0E0F0" : "#555",
                border: "none",
                borderRadius: 4,
                cursor: currentScene ? "pointer" : "default",
                textAlign: "left",
                opacity: currentScene ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (currentScene) (e.currentTarget as HTMLElement).style.backgroundColor = "#2A2A3A";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
                {t.icon}
              </span>
              <span>{t.label}</span>
            </button>
          ))}

          {props.windowLayout.some((w) => w.sceneId) && (
            <>
              <div
                style={{
                  height: 1,
                  backgroundColor: "#333",
                  margin: "8px 0",
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  color: "#888",
                  marginBottom: 6,
                  paddingLeft: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Added Windows ({props.windowLayout.filter((w) => w.sceneId).length})
              </div>

              {props.windowLayout.filter((w) => w.sceneId).map((w) => (
                <div
                  key={w.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "4px 8px",
                    fontSize: 11,
                    color: "#A0A0C0",
                    borderRadius: 4,
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>
                    {w.title || w.id}
                  </span>
                  <span style={{ fontSize: 9, color: "#666", flexShrink: 0 }}>
                    {w.sceneId}
                  </span>
                  <button
                    onClick={() => handleRemove(w.id)}
                    title={`Remove ${w.id}`}
                    style={{
                      padding: "1px 4px",
                      fontSize: 10,
                      fontFamily: TOOLBAR_FONT,
                      backgroundColor: "transparent",
                      color: "#666",
                      border: "none",
                      borderRadius: 3,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#EF4444";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#666";
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export { generateId };
