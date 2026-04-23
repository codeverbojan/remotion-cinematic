import React, { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { ComputedRect, ZoneSystem } from "./types";

interface LayoutContextValue {
  zones: ZoneSystem;
  register: (id: string, rect: ComputedRect) => void;
  unregister: (id: string) => void;
  getRect: (id: string) => ComputedRect | undefined;
}

const LayoutCtx = createContext<LayoutContextValue | null>(null);

export const LayoutProvider: React.FC<{
  zones: ZoneSystem;
  children: React.ReactNode;
}> = ({ zones, children }) => {
  const registry = useRef(new Map<string, ComputedRect>());

  const register = useCallback((id: string, rect: ComputedRect) => {
    registry.current.set(id, rect);
  }, []);

  const unregister = useCallback((id: string) => {
    registry.current.delete(id);
  }, []);

  const getRect = useCallback((id: string) => {
    return registry.current.get(id);
  }, []);

  const value = useMemo(
    () => ({ zones, register, unregister, getRect }),
    [zones, register, unregister, getRect],
  );

  return <LayoutCtx.Provider value={value}>{children}</LayoutCtx.Provider>;
};

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutCtx);
  if (!ctx) {
    throw new Error("useLayout must be used within a <LayoutProvider>");
  }
  return ctx;
}
