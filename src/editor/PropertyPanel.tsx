import React from "react";
import type { CinematicProps, WindowLayout } from "../schema";
import { persistUpdate } from "./updateProps";

interface PropertyPanelProps {
  selectedId: string;
  selectedType: string;
  props: CinematicProps;
  containerRef: React.RefObject<HTMLElement | null>;
}

const PANEL_FONT = "system-ui, -apple-system, sans-serif";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "4px 6px",
  fontSize: 12,
  fontFamily: PANEL_FONT,
  backgroundColor: "#2A2A3A",
  color: "#E0E0F0",
  border: "1px solid #444",
  borderRadius: 4,
  outline: "none",
  boxSizing: "border-box",
};

// --- Shared Input Components ---

const Label: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ fontSize: 10, color: "#888", fontFamily: PANEL_FONT, marginBottom: 2 }}>
    {text}
  </div>
);

const Spacer: React.FC<{ size?: number }> = ({ size = 8 }) => <div style={{ height: size }} />;

const Row: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 6 }) => (
  <div style={{ display: "flex", gap }}>{children}</div>
);

const SectionTitle: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ fontWeight: 600, fontSize: 13, color: "#E0E0F0", marginBottom: 8, fontFamily: PANEL_FONT }}>
    {text}
  </div>
);

export const NumberInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  label: string;
  step?: number;
  min?: number;
  max?: number;
}> = ({ value, onChange, label, step = 1, min, max }) => (
  <div style={{ flex: 1, minWidth: 60 }}>
    <Label text={label} />
    <input
      type="number"
      value={value}
      step={step}
      min={min}
      max={max}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isFinite(n)) onChange(n);
      }}
      style={INPUT_STYLE}
    />
  </div>
);

export const TextInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  label: string;
}> = ({ value, onChange, label }) => (
  <div>
    <Label text={label} />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={INPUT_STYLE}
    />
  </div>
);

export const TextAreaInput: React.FC<{
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
  rows?: number;
}> = ({ value, onChange, label, rows = 3 }) => (
  <div>
    <Label text={label} />
    <textarea
      value={value.join("\n")}
      rows={rows}
      onChange={(e) => onChange(e.target.value.split("\n"))}
      style={{
        ...INPUT_STYLE,
        resize: "vertical",
        minHeight: 40,
      }}
    />
  </div>
);

export const SelectInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: { value: string; label: string }[];
}> = ({ value, onChange, label, options }) => (
  <div style={{ flex: 1, minWidth: 60 }}>
    <Label text={label} />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...INPUT_STYLE,
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%23888'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 6px center",
        paddingRight: 20,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

export const SliderInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  label: string;
  min: number;
  max: number;
  step?: number;
}> = ({ value, onChange, label, min, max, step = 1 }) => (
  <div>
    <Label text={label} />
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: "#4F8EF7" }}
      />
      <span style={{ fontSize: 11, color: "#A0A0C0", fontFamily: PANEL_FONT, minWidth: 28, textAlign: "right" }}>
        {value}
      </span>
    </div>
  </div>
);

export const ColorInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  label: string;
}> = ({ value, onChange, label }) => (
  <div>
    <Label text={label} />
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 24,
          height: 24,
          padding: 0,
          border: "1px solid #444",
          borderRadius: 4,
          backgroundColor: "transparent",
          cursor: "pointer",
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...INPUT_STYLE, flex: 1, fontFamily: "'JetBrains Mono', monospace" }}
      />
    </div>
  </div>
);

// --- Props Update Helpers ---

function updateWindowProp(
  _props: CinematicProps,
  windowId: string,
  updates: Partial<WindowLayout>,
) {
  persistUpdate((prev) => ({
    ...prev,
    windowLayout: prev.windowLayout.map((w) =>
      w.id === windowId ? { ...w, ...updates } : w,
    ),
  }));
}

function updateHeadlineProp(
  _props: CinematicProps,
  field: "pain" | "resolution" | "closer",
  value: string[],
) {
  persistUpdate((prev) => ({
    ...prev,
    headlines: { ...prev.headlines, [field]: value },
  }));
}

function updateBrandColor(
  _props: CinematicProps,
  colorKey: string,
  value: string,
) {
  persistUpdate((prev) => ({
    ...prev,
    brand: {
      ...prev.brand,
      colors: { ...prev.brand.colors, [colorKey]: value },
    },
  }));
}

// --- Window Panel ---

const ENTRANCE_OPTIONS = [
  { value: "fade", label: "Fade" },
  { value: "scale", label: "Scale" },
  { value: "slide-up", label: "Slide Up" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
];

const SMALL_BTN_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "4px 8px",
  fontSize: 11,
  fontFamily: PANEL_FONT,
  backgroundColor: "#2A2A3A",
  color: "#A0A0C0",
  border: "1px solid #444",
  borderRadius: 4,
  cursor: "pointer",
};

const WindowPanel: React.FC<{ win: WindowLayout; props: CinematicProps }> = ({ win, props }) => {
  const set = (updates: Partial<WindowLayout>) => updateWindowProp(props, win.id, updates);
  const maxZ = Math.max(...props.windowLayout.map((w) => w.zIndex), 0);
  const minZ = Math.min(...props.windowLayout.map((w) => w.zIndex), 0);

  return (
    <>
      <SectionTitle text={win.title || win.id} />
      <TextInput label="Title" value={win.title} onChange={(v) => set({ title: v })} />
      <Spacer />

      <Row>
        <NumberInput label="X" value={win.startX} onChange={(v) => set({ startX: v })} />
        <NumberInput label="Y" value={win.startY} onChange={(v) => set({ startY: v })} />
      </Row>
      <Spacer size={4} />
      <Row>
        <NumberInput label="W" value={win.startW} onChange={(v) => set({ startW: v })} min={50} />
        <NumberInput label="H" value={win.startH} onChange={(v) => set({ startH: v })} min={50} />
      </Row>
      <Spacer />

      {win.endX !== undefined ? (
        <>
          <Row>
            <NumberInput label="End X" value={win.endX} onChange={(v) => set({ endX: v })} />
            <NumberInput label="End Y" value={win.endY ?? win.startY} onChange={(v) => set({ endY: v })} />
          </Row>
          <Spacer size={4} />
          <Row>
            <NumberInput label="End W" value={win.endW ?? win.startW} onChange={(v) => set({ endW: v })} min={50} />
            <NumberInput label="End H" value={win.endH ?? win.startH} onChange={(v) => set({ endH: v })} min={50} />
          </Row>
          <Spacer size={4} />
          <button
            onClick={() => set({ endX: undefined, endY: undefined, endW: undefined, endH: undefined })}
            style={{ ...SMALL_BTN_STYLE, color: "#F87171" }}
          >
            Remove End Position
          </button>
          <Spacer />
        </>
      ) : (
        <>
          <button
            onClick={() => set({ endX: win.startX, endY: win.startY, endW: win.startW, endH: win.startH })}
            style={SMALL_BTN_STYLE}
          >
            + Add End Position
          </button>
          <Spacer />
        </>
      )}

      <SelectInput
        label="Enter Style"
        value={win.enterFrom}
        onChange={(v) => set({ enterFrom: v as WindowLayout["enterFrom"] })}
        options={ENTRANCE_OPTIONS}
      />
      <Spacer size={4} />

      <Row>
        <NumberInput label="Enter At" value={win.enterAt} onChange={(v) => set({ enterAt: v })} min={0} />
        <NumberInput label="Enter Dur" value={win.enterDuration} onChange={(v) => set({ enterDuration: v })} min={1} />
      </Row>
      <Spacer size={4} />

      <Row>
        <NumberInput
          label="Exit At"
          value={win.exitAt ?? 0}
          onChange={(v) => set({ exitAt: v > 0 ? v : undefined })}
          min={0}
        />
        <NumberInput label="Exit Dur" value={win.exitDuration} onChange={(v) => set({ exitDuration: v })} min={1} />
      </Row>
      <Spacer size={4} />

      {win.animateAt !== undefined ? (
        <>
          <Row>
            <NumberInput label="Anim At" value={win.animateAt} onChange={(v) => set({ animateAt: v })} min={0} />
            <NumberInput label="Anim Dur" value={win.animateDuration} onChange={(v) => set({ animateDuration: v })} min={1} />
          </Row>
          <Spacer size={4} />
          <button
            onClick={() => set({ animateAt: undefined })}
            style={{ ...SMALL_BTN_STYLE, color: "#F87171" }}
          >
            Remove Animation
          </button>
          <Spacer size={4} />
        </>
      ) : (
        <>
          <button
            onClick={() => set({ animateAt: win.enterAt + win.enterDuration })}
            style={SMALL_BTN_STYLE}
          >
            + Add Animation
          </button>
          <Spacer size={4} />
        </>
      )}

      <Row>
        <NumberInput label="Z-Index" value={win.zIndex} onChange={(v) => set({ zIndex: v })} min={0} />
        <NumberInput label="Rotation" value={win.rotation ?? 0} onChange={(v) => set({ rotation: v === 0 ? undefined : v })} step={0.5} min={-180} max={180} />
      </Row>
      <Spacer size={4} />
      <Row gap={4}>
        <button
          onClick={() => set({ zIndex: maxZ + 1 })}
          disabled={win.zIndex >= maxZ}
          style={{ ...SMALL_BTN_STYLE, flex: 1, opacity: win.zIndex >= maxZ ? 0.4 : 1 }}
        >
          Bring Front
        </button>
        <button
          onClick={() => set({ zIndex: Math.max(0, minZ - 1) })}
          disabled={win.zIndex <= minZ}
          style={{ ...SMALL_BTN_STYLE, flex: 1, opacity: win.zIndex <= minZ ? 0.4 : 1 }}
        >
          Send Back
        </button>
      </Row>
      <Spacer />
      <ColorInput
        label="Window Body"
        value={props.brand.colors.surface}
        onChange={(v) => updateBrandColor(props, "surface", v)}
      />
      <Spacer size={4} />
      <ColorInput
        label="Window Chrome"
        value={props.brand.colors.background}
        onChange={(v) => updateBrandColor(props, "background", v)}
      />
      {win.sceneId && (
        <>
          <Spacer />
          <button
            onClick={() => {
              persistUpdate((prev) => ({
                ...prev,
                windowLayout: prev.windowLayout.filter((w) => w.id !== win.id),
                cursorPath: prev.cursorPath.filter((e) => e.target !== win.id),
              }));
            }}
            style={{ ...SMALL_BTN_STYLE, color: "#F87171", borderColor: "#F87171" }}
          >
            Delete Window
          </button>
        </>
      )}
    </>
  );
};

// --- Headline Panel ---

function detectHeadlineField(
  selectedId: string,
): "pain" | "resolution" | "closer" | null {
  if (selectedId.includes("pain")) return "pain";
  if (selectedId.includes("resolution")) return "resolution";
  if (selectedId.includes("closer") || selectedId.includes("cta")) return "closer";
  return null;
}

const HeadlinePanel: React.FC<{ selectedId: string; props: CinematicProps }> = ({ selectedId, props }) => {
  const field = detectHeadlineField(selectedId);
  const lines = field ? props.headlines[field] : [];
  const fieldLabel = field ? field.charAt(0).toUpperCase() + field.slice(1) : "Headline";

  return (
    <>
      <SectionTitle text={`${fieldLabel} Headline`} />
      {field && (
        <>
          <TextAreaInput
            label="Lines (one per line)"
            value={lines}
            onChange={(v) => updateHeadlineProp(props, field, v)}
          />
          <Spacer />
        </>
      )}
      <ColorInput
        label="Text Color"
        value={props.brand.colors.text}
        onChange={(v) => updateBrandColor(props, "text", v)}
      />
      <Spacer />
      <TextInput
        label="Serif Font"
        value={props.brand.fontSerif}
        onChange={(v) => {
          persistUpdate((prev) => ({
            ...prev,
            brand: { ...prev.brand, fontSerif: v },
          }));
        }}
      />
    </>
  );
};

// --- Button Panel ---

const ButtonPanel: React.FC<{ selectedId: string; props: CinematicProps }> = ({ selectedId, props }) => {
  const isCta = selectedId.includes("cta") || selectedId.includes("closer");

  return (
    <>
      <SectionTitle text="Button" />
      {isCta && (
        <>
          <TextInput
            label="CTA Label"
            value={props.cta}
            onChange={(v) => {
              persistUpdate((prev) => ({ ...prev, cta: v }));
            }}
          />
          <Spacer />
        </>
      )}
      <ColorInput
        label="Primary Color"
        value={props.brand.colors.primary}
        onChange={(v) => updateBrandColor(props, "primary", v)}
      />
      <Spacer />
      <ColorInput
        label="Accent Color"
        value={props.brand.colors.accent}
        onChange={(v) => updateBrandColor(props, "accent", v)}
      />
    </>
  );
};

// --- Stat Card Panel ---

const StatCardPanel: React.FC<{ selectedId: string }> = ({ selectedId }) => (
  <>
    <SectionTitle text="Stat Card" />
    <div style={{ fontSize: 11, color: "#888", fontFamily: PANEL_FONT }}>
      ID: {selectedId}
    </div>
    <Spacer size={4} />
    <div style={{ fontSize: 11, color: "#666", fontFamily: PANEL_FONT }}>
      Edit stat values in the App Descriptor prop in Studio&apos;s right panel.
    </div>
  </>
);

// --- Scene Window Panel (read-only for hardcoded scene windows) ---

const SceneWindowPanel: React.FC<{
  selectedId: string;
  props: CinematicProps;
  containerRef: React.RefObject<HTMLElement | null>;
}> = ({ selectedId, props, containerRef }) => {
  const container = containerRef.current;
  let posInfo = "";
  if (container) {
    const el = container.querySelector(`[data-editor-id="${CSS.escape(selectedId)}"]`);
    if (el) {
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      const scale = cRect.width / 1920;
      const x = Math.round((eRect.left - cRect.left) / scale);
      const y = Math.round((eRect.top - cRect.top) / scale);
      const w = Math.round(eRect.width / scale);
      const h = Math.round(eRect.height / scale);
      posInfo = `${x}, ${y}  —  ${w} × ${h}`;
    }
  }

  return (
    <>
      <SectionTitle text={selectedId} />
      {posInfo && (
        <>
          <div style={{ fontSize: 11, color: "#A0A0C0", fontFamily: PANEL_FONT }}>
            {posInfo}
          </div>
          <Spacer size={4} />
        </>
      )}
      <div style={{ fontSize: 11, color: "#888", fontFamily: PANEL_FONT, lineHeight: 1.4 }}>
        This window is defined in scene code and is not part of the editable windowLayout props.
      </div>
      <Spacer />
      <ColorInput
        label="Window Body"
        value={props.brand.colors.surface}
        onChange={(v) => updateBrandColor(props, "surface", v)}
      />
      <Spacer size={4} />
      <ColorInput
        label="Window Chrome"
        value={props.brand.colors.background}
        onChange={(v) => updateBrandColor(props, "background", v)}
      />
    </>
  );
};

// --- Generic Panel ---

const GenericPanel: React.FC<{
  selectedId: string;
  selectedType: string;
  props: CinematicProps;
}> = ({ selectedId, selectedType, props }) => (
  <>
    <SectionTitle text={selectedId} />
    <div style={{ fontSize: 11, color: "#888", fontFamily: PANEL_FONT }}>
      Type: {selectedType}
    </div>
    <Spacer />
    <ColorInput
      label="Primary Color"
      value={props.brand.colors.primary}
      onChange={(v) => updateBrandColor(props, "primary", v)}
    />
    <Spacer size={4} />
    <ColorInput
      label="Text Color"
      value={props.brand.colors.text}
      onChange={(v) => updateBrandColor(props, "text", v)}
    />
  </>
);

// --- Panel Router ---

function getPanelContent(
  selectedId: string,
  selectedType: string,
  props: CinematicProps,
  containerRef: React.RefObject<HTMLElement | null>,
): React.ReactNode {
  if (selectedType === "window" || selectedType === "layout-window" || selectedType === "sticky-note" || selectedType === "notification-toast") {
    const win = props.windowLayout.find((w) => w.id === selectedId);
    if (win) {
      return <WindowPanel win={win} props={props} />;
    }
    return <SceneWindowPanel selectedId={selectedId} props={props} containerRef={containerRef} />;
  }

  switch (selectedType) {
    case "headline":
      return <HeadlinePanel selectedId={selectedId} props={props} />;
    case "button":
      return <ButtonPanel selectedId={selectedId} props={props} />;
    case "stat-card":
      return <StatCardPanel selectedId={selectedId} />;
    default:
      return <GenericPanel selectedId={selectedId} selectedType={selectedType} props={props} />;
  }
}

// --- Main Panel ---

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedId,
  selectedType,
  props,
  containerRef,
}) => {
  const container = containerRef.current;
  if (!container) return null;

  const el = container.querySelector(`[data-editor-id="${CSS.escape(selectedId)}"]`);
  if (!el) return null;

  const cRect = container.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();
  const scale = cRect.width / 1920;
  const elRight = (eRect.right - cRect.left) / scale;
  const elTop = (eRect.top - cRect.top) / scale;

  const panelLeft = Math.min(elRight + 12, 1920 - 200);
  const panelTop = Math.max(8, Math.min(elTop, 1080 - 400));

  return (
    <div
      style={{
        position: "absolute",
        left: panelLeft,
        top: panelTop,
        width: 200,
        maxHeight: 1080 - 16,
        overflowY: "auto",
        backgroundColor: "#1A1A28",
        border: "1px solid #333",
        borderRadius: 8,
        padding: 12,
        zIndex: 100000,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {getPanelContent(selectedId, selectedType, props, containerRef)}
    </div>
  );
};
