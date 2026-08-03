"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useEditorCanvas, type EditorCanvasApi } from "@/hooks/useEditorCanvas";

const CanvasContext = createContext<EditorCanvasApi | null>(null);

/**
 * Owns the single canvas instance for the editor. Toolbar, zoom bar and future
 * panels reach the canvas through this context instead of prop drilling.
 */
export function CanvasProvider({ children }: { children: ReactNode }) {
  const api = useEditorCanvas();

  return (
    <CanvasContext.Provider value={api}>{children}</CanvasContext.Provider>
  );
}

export function useCanvas(): EditorCanvasApi {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used inside <CanvasProvider>");
  }
  return context;
}
