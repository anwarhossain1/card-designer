"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useEditorCanvas, type EditorCanvasApi } from "@/hooks/useEditorCanvas";
import {
  useCanvasSelection,
  type SelectionState,
} from "@/hooks/useCanvasSelection";
import { useHistory, type HistoryState } from "@/hooks/useHistory";
import { useClipboard, type ClipboardState } from "@/hooks/useClipboard";

type CanvasContextValue = EditorCanvasApi &
  SelectionState &
  HistoryState &
  ClipboardState;

const CanvasContext = createContext<CanvasContextValue | null>(null);

/**
 * Owns the single canvas instance plus its selection, history and clipboard.
 * Toolbar, panels and the properties sidebar reach the canvas through this
 * context instead of prop drilling.
 */
export function CanvasProvider({ children }: { children: ReactNode }) {
  const canvas = useEditorCanvas();
  const selection = useCanvasSelection(canvas.canvasRef, canvas.isReady);
  const history = useHistory(canvas.canvasRef, canvas.isReady, selection.refresh);
  const clipboard = useClipboard(canvas.canvasRef, selection.refresh);

  const value = useMemo(
    () => ({ ...canvas, ...selection, ...history, ...clipboard }),
    [canvas, selection, history, clipboard],
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
