import { createContext, useContext } from "react";

interface CursorInteraction {
  onCursorClick?: () => void;
}

const CursorInteractionContext = createContext<CursorInteraction>({});

export const CursorInteractionProvider = CursorInteractionContext.Provider;

export function useCursorInteraction(): CursorInteraction {
  return useContext(CursorInteractionContext);
}
