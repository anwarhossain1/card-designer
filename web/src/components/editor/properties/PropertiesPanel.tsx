"use client";

import { CopyPlus, Lock, MousePointerSquareDashed, Trash2 } from "lucide-react";
import type { Textbox } from "fabric";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { useLayers } from "@/hooks/useLayers";
import { useT } from "@/components/i18n/I18nProvider";
import { getMeta } from "@/lib/canvas/meta";
import { TextProperties } from "./TextProperties";
import { ShapeProperties } from "./ShapeProperties";
import { IconProperties } from "./IconProperties";
import { ImageProperties } from "./ImageProperties";
import { QrProperties } from "./QrProperties";
import { ArrangeProperties } from "./ArrangeProperties";

/**
 * Right sidebar. Shows the selected element's properties; with nothing selected
 * it explains what to do, the way Canva does.
 */
export function PropertiesPanel() {
  const t = useT().editor;
  const { selected } = useCanvas();
  const { remove, duplicate } = useCanvasActions();
  const { toggleLock } = useLayers();

  const target = selected[0];
  const meta = getMeta(target);
  const isMultiple = selected.length > 1;

  return (
    <aside
      aria-label={t.properties.title}
      data-properties
      className="flex w-72 shrink-0 flex-col border-l border-hairline bg-panel"
    >
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-hairline px-3">
        <h2 className="truncate text-sm font-semibold text-ink-800">
          {selected.length === 0
            ? t.properties.title
            : isMultiple
              ? t.properties.multiple(selected.length)
              : (meta?.name ?? t.properties.title)}
        </h2>

        {selected.length > 0 ? (
          <div className="flex items-center gap-0.5">
            <IconButton
              size="sm"
              label={t.toolbar.duplicate}
              onClick={() => void duplicate()}
            >
              <CopyPlus className="h-4 w-4" />
            </IconButton>
            <IconButton size="sm" label={t.toolbar.delete} onClick={remove}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        ) : null}
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {selected.length === 0 ? (
          <div className="m-3 flex flex-col items-center gap-3 rounded-lg bg-panel-muted px-4 py-10 text-center">
            <MousePointerSquareDashed className="h-6 w-6 text-ink-300" />
            <p className="text-sm text-ink-500">{t.properties.empty}</p>
          </div>
        ) : isMultiple ? (
          <p className="p-3 text-sm text-ink-500">{t.properties.multipleNote}</p>
        ) : meta?.locked ? (
          <div className="m-3 space-y-3 rounded-lg bg-panel-muted px-4 py-6 text-center">
            <Lock className="mx-auto h-5 w-5 text-ink-400" />
            <p className="text-sm text-ink-500">{t.properties.lockedNote}</p>
            <Button size="sm" variant="outline" onClick={() => toggleLock(meta.id)}>
              {t.properties.unlock}
            </Button>
          </div>
        ) : target ? (
          <>
            {meta?.kind === "text" ? (
              <TextProperties target={target as Textbox} />
            ) : null}
            {meta?.kind === "shape" ? <ShapeProperties target={target} /> : null}
            {meta?.kind === "icon" ? <IconProperties target={target} /> : null}
            {meta?.kind === "image" ? <ImageProperties target={target} /> : null}
            {meta?.kind === "qr" ? (
              /* Keyed so switching between codes resets the edit draft. */
              <QrProperties key={meta.id} target={target} />
            ) : null}
            <ArrangeProperties target={target} />
          </>
        ) : null}
      </div>
    </aside>
  );
}
