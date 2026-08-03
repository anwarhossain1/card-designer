"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useEditorCanvas, type EditorCanvasApi } from "@/hooks/useEditorCanvas";
import {
  useCanvasSelection,
  type SelectionState,
} from "@/hooks/useCanvasSelection";

type CanvasContextValue = EditorCanvasApi & SelectionState;

const CanvasContext = createContext<CanvasContextValue | null>(null);

/**
 * Owns the single canvas instance and its selection state. Toolbar, panels and
 * the properties sidebar reach the canvas through this context instead of prop
 * drilling.
 */
export function CanvasProvider({ children }: { children: ReactNode }) {
  const canvas = useEditorCanvas();
  const selection = useCanvasSelection(canvas.canvasRef, canvas.isReady);

  const value = useMemo(
    () => ({ ...canvas, ...selection }),
    [canvas, selection],
  );

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}

export function useCanvas(): CanvasContextValue {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used inside <CanvasProvider>");
  }
  return context;
}
