"use client";

import { CopyPlus, MousePointerSquareDashed, Trash2 } from "lucide-react";
import type { Textbox } from "fabric";
import { IconButton } from "@/components/ui/IconButton";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { getMeta } from "@/lib/canvas/meta";
import { TextProperties } from "./TextProperties";
import { ShapeProperties } from "./ShapeProperties";
import { IconProperties } from "./IconProperties";
import { ArrangeProperties } from "./ArrangeProperties";

/**
 * Right sidebar. Shows the selected element's properties; with nothing selected
 * it explains what to do, the way Canva does.
 */
export function PropertiesPanel() {
  const { selected } = useCanvas();
  const { remove, duplicate } = useCanvasActions();

  const target = selected[0];
  const meta = getMeta(target);
  const isMultiple = selected.length > 1;

  return (
    <aside
      aria-label="Properties"
      className="flex w-72 shrink-0 flex-col border-l border-hairline bg-panel"
    >
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-hairline px-3">
        <h2 className="truncate text-sm font-semibold text-ink-800">
          {selected.length === 0
            ? "Properties"
            : isMultiple
              ? `${selected.length} elements`
              : (meta?.name ?? "Element")}
        </h2>

        {selected.length > 0 ? (
          <div className="flex items-center gap-0.5">
            <IconButton
              size="sm"
              label="Duplicate (Ctrl+D)"
              onClick={() => void duplicate()}
            >
              <CopyPlus className="h-4 w-4" />
            </IconButton>
            <IconButton size="sm" label="Delete (Del)" onClick={remove}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        ) : null}
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {selected.length === 0 ? (
          <div className="m-3 flex flex-col items-center gap-3 rounded-lg bg-panel-muted px-4 py-10 text-center">
            <MousePointerSquareDashed className="h-6 w-6 text-ink-300" />
            <p className="text-sm text-ink-500">
              Select something on the card to edit its properties.
            </p>
          </div>
        ) : isMultiple ? (
          <p className="p-3 text-sm text-ink-500">
            Editing several elements at once is limited to duplicate and delete
            for now.
          </p>
        ) : target ? (
          <>
            {meta?.kind === "text" ? (
              <TextProperties target={target as Textbox} />
            ) : null}
            {meta?.kind === "shape" ? <ShapeProperties target={target} /> : null}
            {meta?.kind === "icon" ? <IconProperties target={target} /> : null}
            <ArrangeProperties target={target} />
          </>
        ) : null}
      </div>
    </aside>
  );
}
