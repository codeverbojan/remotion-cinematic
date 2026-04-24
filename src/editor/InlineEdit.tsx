import React, { useCallback, useEffect, useRef, useState } from "react";
import { getRemotionEnvironment } from "remotion";

interface InlineEditProps {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
  multiline?: boolean;
  toolbar?: React.ReactNode;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onChange,
  style,
  children,
  multiline = false,
  toolbar,
}) => {
  const env = getRemotionEnvironment();
  if (!env.isStudio) return <>{children}</>;
  return (
    <InlineEditInner
      value={value}
      onChange={onChange}
      style={style}
      multiline={multiline}
      toolbar={toolbar}
    >
      {children}
    </InlineEditInner>
  );
};

const InlineEditInner: React.FC<InlineEditProps> = ({
  value,
  onChange,
  style,
  children,
  multiline,
  toolbar,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    if (draft !== value) {
      onChange(draft);
    }
  }, [draft, value, onChange]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft(value);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Escape") {
        cancel();
      } else if (e.key === "Enter" && !multiline) {
        commit();
      } else if (e.key === "Enter" && e.metaKey && multiline) {
        commit();
      }
    },
    [commit, cancel, multiline],
  );

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditing(true);
  }, []);

  if (editing) {
    const inputStyle: React.CSSProperties = {
      ...style,
      background: "rgba(99, 102, 241, 0.12)",
      border: "1.5px solid rgba(99, 102, 241, 0.5)",
      borderRadius: 4,
      outline: "none",
      padding: "2px 4px",
      margin: "-3px -5px",
      resize: "none",
      width: "calc(100% + 10px)",
      boxSizing: "border-box",
    };

    return (
      <div ref={wrapperRef} style={{ position: "relative", display: "inline-block" }}>
        {toolbar}
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            rows={draft.split("\n").length}
            style={inputStyle}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            style={inputStyle}
          />
        )}
      </div>
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        cursor: "text",
        borderRadius: 4,
        transition: "outline 0.15s",
        outline: "1.5px solid transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.outline = "1.5px dashed rgba(99, 102, 241, 0.4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.outline = "1.5px solid transparent";
      }}
    >
      {children}
    </div>
  );
};
