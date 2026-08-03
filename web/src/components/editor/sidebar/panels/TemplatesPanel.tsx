"use client";

import { useEffect, useState } from "react";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { useEditorStore } from "@/store/editorStore";
import { TEMPLATES } from "@/lib/templates";
import { renderTemplatePreview } from "@/lib/templates/preview";
import type { CardTemplate } from "@/types/template";

function TemplateCard({ template }: { template: CardTemplate }) {
  const { selectTemplate } = useCanvasActions();
  const activeTemplateId = useEditorStore((state) => state.templateId);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void renderTemplatePreview(template).then((url) => {
      if (!cancelled) setPreview(url);
    });
    return () => {
      cancelled = true;
    };
  }, [template]);

  const isActive = activeTemplateId === template.id;

  return (
    <button
      type="button"
      onClick={() => void selectTemplate(template)}
      className={cn(
        "w-full rounded-lg border bg-panel p-2 text-left transition-colors",
        "hover:border-brand-300 focus-visible:outline-2 focus-visible:outline-brand-400",
        isActive ? "border-brand-400 ring-1 ring-brand-200" : "border-hairline",
      )}
    >
      <span className="block aspect-[3.5/2] w-full overflow-hidden rounded-md bg-panel-muted">
        {preview ? (
          // Data URL from our own offscreen render — no optimizer involved.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={`${template.name} template preview`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${template.palette[0]}, ${template.palette[1] ?? template.palette[0]})`,
            }}
          />
        )}
      </span>
      <span className="mt-2 block text-xs font-semibold text-ink-800">
        {template.name}
        {isActive ? <span className="ml-1.5 font-normal text-brand-600">· in use</span> : null}
      </span>
      <span className="mt-0.5 block text-[11px] leading-snug text-ink-500">
        {template.description}
      </span>
    </button>
  );
}

export function TemplatesPanel() {
  const { canvasRef } = useCanvas();
  // No confirm dialog: applying is a single undoable step, and the notice says so.
  const hasContent = (canvasRef.current?.getObjects().length ?? 0) > 0;

  return (
    <div className="space-y-3">
      {hasContent ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
          Applying a template replaces what is on the card. Undo brings your
          design back.
        </p>
      ) : null}

      <ul className="space-y-3">
        {TEMPLATES.map((template) => (
          <li key={template.id}>
            <TemplateCard template={template} />
          </li>
        ))}
      </ul>

      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.discardActiveObject();
          canvas.remove(...canvas.getObjects());
          canvas.requestRenderAll();
          useEditorStore.getState().setTemplateId(null);
        }}
      >
        <FilePlus2 className="h-4 w-4" />
        Start from blank
      </Button>
    </div>
  );
}
