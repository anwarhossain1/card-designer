"use client";

import { MousePointerSquareDashed } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

/**
 * Right sidebar. Renders the selected element's properties; with nothing
 * selected it explains what to do, the way Canva does.
 */
export function PropertiesPanel() {
  const selection = useEditorStore((state) => state.selection);

  return (
    <aside
      aria-label="Properties"
      className="flex w-72 shrink-0 flex-col border-l border-hairline bg-panel"
    >
      <div className="flex h-12 shrink-0 items-center border-b border-hairline px-3">
        <h2 className="text-sm font-semibold text-ink-800">Properties</h2>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
        {selection.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg bg-panel-muted px-4 py-10 text-center">
            <MousePointerSquareDashed className="h-6 w-6 text-ink-300" />
            <p className="text-sm text-ink-500">
              Select something on the card to edit its properties.
            </p>
          </div>
        ) : (
          <p className="text-sm text-ink-500">
            {selection.length} element{selection.length > 1 ? "s" : ""} selected.
          </p>
        )}
      </div>
    </aside>
  );
}
