import { useLayout } from "./LayoutContext";
import type { ComputedRect } from "./types";

export function useWindowRect(id: string): ComputedRect | undefined {
  const { getRect } = useLayout();
  return getRect(id);
}
