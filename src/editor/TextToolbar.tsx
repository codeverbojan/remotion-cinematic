import React, { useCallback } from "react";

const TOOLBAR_FONT = "system-ui, -apple-system, sans-serif";

const TOOLBAR_STYLE: React.CSSProperties = {
  position: "absolute",
  bottom: "calc(100% + 8px)",
  left: 0,
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 8px",
  background: "#1E1E2E",
  borderRadius: 6,
  border: "1px solid #444",
  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
  zIndex: 9999,
  whiteSpace: "nowrap",
  fontFamily: TOOLBAR_FONT,
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  color: "#888",
  fontFamily: TOOLBAR_FONT,
};

const SMALL_INPUT: React.CSSProperties = {
  width: 52,
  padding: "3px 5px",
  fontSize: 11,
  fontFamily: TOOLBAR_FONT,
  backgroundColor: "#2A2A3A",
  color: "#E0E0F0",
  border: "1px solid #444",
  borderRadius: 4,
  outline: "none",
  textAlign: "center",
};

const WEIGHT_BTN: React.CSSProperties = {
  padding: "3px 8px",
  fontSize: 11,
  fontFamily: TOOLBAR_FONT,
  border: "1px solid #444",
  borderRadius: 4,
  cursor: "pointer",
  outline: "none",
  minWidth: 28,
  textAlign: "center",
};

const DIVIDER: React.CSSProperties = {
  width: 1,
  height: 20,
  backgroundColor: "#444",
  margin: "0 2px",
};

const WEIGHT_OPTIONS = [400, 500, 600, 700] as const;

export interface TextToolbarValues {
  fontSize?: number;
  fontWeight?: number;
  color?: string;
}

interface TextToolbarProps {
  values: TextToolbarValues;
  onChange: (values: Partial<TextToolbarValues>) => void;
  showFontSize?: boolean;
  showFontWeight?: boolean;
  showColor?: boolean;
  position?: "above" | "below";
}

export const TextToolbar: React.FC<TextToolbarProps> = ({
  values,
  onChange,
  showFontSize = true,
  showFontWeight = true,
  showColor = true,
  position = "above",
}) => {
  const handleFontSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseInt(e.target.value, 10);
      if (!isNaN(v) && v > 0) onChange({ fontSize: v });
    },
    [onChange],
  );

  const handleFontSizeDelta = useCallback(
    (delta: number) => {
      const current = values.fontSize ?? 88;
      onChange({ fontSize: Math.max(8, current + delta) });
    },
    [values.fontSize, onChange],
  );

  const cycleWeight = useCallback(() => {
    const current = values.fontWeight ?? 500;
    const idx = WEIGHT_OPTIONS.indexOf(current as typeof WEIGHT_OPTIONS[number]);
    const next = WEIGHT_OPTIONS[(idx + 1) % WEIGHT_OPTIONS.length];
    onChange({ fontWeight: next });
  }, [values.fontWeight, onChange]);

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ color: e.target.value });
    },
    [onChange],
  );

  const stopProp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const posStyle: React.CSSProperties = position === "below"
    ? { top: "calc(100% + 8px)", bottom: undefined }
    : { bottom: "calc(100% + 8px)", top: undefined };

  return (
    <div
      style={{ ...TOOLBAR_STYLE, ...posStyle }}
      onMouseDown={stopProp}
      onClick={stopProp}
      onDoubleClick={stopProp}
    >
      {showFontSize && (
        <>
          <span style={LABEL_STYLE}>Size</span>
          <button
            style={{ ...WEIGHT_BTN, backgroundColor: "#2A2A3A", color: "#E0E0F0" }}
            onClick={() => handleFontSizeDelta(-2)}
            title="Decrease font size"
          >
            −
          </button>
          <input
            type="number"
            value={values.fontSize ?? 88}
            onChange={handleFontSizeChange}
            onKeyDown={(e) => e.stopPropagation()}
            style={SMALL_INPUT}
            min={8}
            step={2}
          />
          <button
            style={{ ...WEIGHT_BTN, backgroundColor: "#2A2A3A", color: "#E0E0F0" }}
            onClick={() => handleFontSizeDelta(2)}
            title="Increase font size"
          >
            +
          </button>
        </>
      )}

      {showFontSize && showFontWeight && <div style={DIVIDER} />}

      {showFontWeight && (
        <>
          <span style={LABEL_STYLE}>Wt</span>
          <button
            style={{
              ...WEIGHT_BTN,
              backgroundColor: "#2A2A3A",
              color: "#E0E0F0",
              fontWeight: values.fontWeight ?? 500,
            }}
            onClick={cycleWeight}
            title={`Font weight: ${values.fontWeight ?? 500} (click to cycle)`}
          >
            {values.fontWeight ?? 500}
          </button>
        </>
      )}

      {(showFontSize || showFontWeight) && showColor && <div style={DIVIDER} />}

      {showColor && (
        <>
          <span style={LABEL_STYLE}>Color</span>
          <input
            type="color"
            value={values.color ?? "#F5F5FF"}
            onChange={handleColorChange}
            onKeyDown={(e) => e.stopPropagation()}
            style={{
              width: 24,
              height: 24,
              padding: 0,
              border: "1px solid #444",
              borderRadius: 4,
              cursor: "pointer",
              backgroundColor: "transparent",
            }}
          />
        </>
      )}
    </div>
  );
};
