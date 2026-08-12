"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useEditorCanvas, type EditorCanvasApi } from "@/hooks/useEditorCanvas";
import {
  useCanvasSelection,
  type SelectionState,
} from "@/hooks/useCanvasSelection";
import { useHistory, type HistoryState } from "@/hooks/useHistory";
import { useClipboard, type ClipboardState } from "@/hooks/useClipboard";
import { useCardSides, type CardSidesState } from "@/hooks/useCardSides";
import { useDesignSync, type DesignSyncState } from "@/hooks/useDesignSync";
import {
  useDocumentPersistence,
  type PersistenceState,
} from "@/hooks/useDocumentPersistence";

type CanvasContextValue = EditorCanvasApi &
  SelectionState &
  HistoryState &
  ClipboardState &
  CardSidesState &
  DesignSyncState &
  PersistenceState;

const CanvasContext = createContext<CanvasContextValue | null>(null);

/**
 * Owns the single canvas instance plus its selection, history and clipboard.
 * Toolbar, panels and the properties sidebar reach the canvas through this
 * context instead of prop drilling.
 */
export function CanvasProvider({ children }: { children: ReactNode }) {
  const canvas = useEditorCanvas();
  const selection = useCanvasSelection(canvas.canvasRef, canvas.isReady);
  const sides = useCardSides(canvas.canvasRef, selection.refresh);
  const persistence = useDocumentPersistence(
    canvas.canvasRef,
    canvas.isReady,
    sides,
  );
  // Layered on top of the local save, never in place of it.
  const sync = useDesignSync(
    canvas.canvasRef,
    persistence.isHydrated,
    sides.seedSides,
  );
  /*
   * History waits for hydration so the undo baseline is the restored design,
   * and stands down mid-swap so the clear-then-load of a side switch is never
   * mistaken for the user deleting everything and drawing it again.
   */
  const history = useHistory(
    canvas.canvasRef,
    canvas.isReady && persistence.isHydrated && !sides.isSwitchingSide,
    selection.refresh,
    sides.activeSide,
  );
  const clipboard = useClipboard(canvas.canvasRef, selection.refresh);

  const value = useMemo(
    () => ({
      ...canvas,
      ...selection,
      ...sides,
      ...persistence,
      ...sync,
      ...history,
      ...clipboard,
    }),
    [canvas, selection, sides, persistence, sync, history, clipboard],
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
