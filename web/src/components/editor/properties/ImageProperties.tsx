"use client";

import { FlipHorizontal, FlipVertical } from "lucide-react";
import type { FabricObject } from "fabric";
import { Field, FieldGroup } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { NumberInput, Slider } from "@/components/ui/inputs";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { buildShadow, SHADOW_PRESET } from "@/lib/canvas/elements/shape";
import { getImageRadius, setImageRadius } from "@/lib/canvas/elements/image";

export function ImageProperties({ target }: { target: FabricObject }) {
  const { canvasRef, refresh } = useCanvas();
  const { update } = useCanvasActions();

  const radius = getImageRadius(target);
  const shadow = target.shadow;

  const applyRadius = (value: number) => {
    setImageRadius(target, value);
    canvasRef.current?.requestRenderAll();
    refresh();
  };

  return (
    <>
      <FieldGroup title="Image">
        <Field label="Corner radius" stacked>
          <div className="flex items-center gap-2">
            <Slider value={radius} min={0} max={120} onChange={applyRadius} />
            <NumberInput
              className="w-14"
              value={radius}
              min={0}
              max={120}
              onChange={applyRadius}
            />
          </div>
        </Field>

        <Field label="Flip">
          <div className="flex items-center gap-0.5">
            <IconButton
              size="sm"
              label="Flip horizontally"
              active={Boolean(target.flipX)}
              onClick={() => update({ flipX: !target.flipX })}
            >
              <FlipHorizontal className="h-4 w-4" />
            </IconButton>
            <IconButton
              size="sm"
              label="Flip vertically"
              active={Boolean(target.flipY)}
              onClick={() => update({ flipY: !target.flipY })}
            >
              <FlipVertical className="h-4 w-4" />
            </IconButton>
          </div>
        </Field>
      </FieldGroup>

      <FieldGroup title="Shadow">
        <Field label="Drop shadow">
          <label className="flex items-center gap-2 text-xs text-ink-600">
            <input
              type="checkbox"
              checked={Boolean(shadow)}
              onChange={(event) =>
                update({ shadow: event.target.checked ? buildShadow() : null })
              }
              className="h-4 w-4 accent-brand-600"
            />
            {shadow ? "On" : "Off"}
          </label>
        </Field>

        {shadow ? (
          <Field label="Blur" stacked>
            <Slider
              value={shadow.blur ?? SHADOW_PRESET.blur}
              min={0}
              max={40}
              onChange={(value) =>
                update({ shadow: buildShadow({ blur: value, offsetY: shadow.offsetY }) })
              }
            />
          </Field>
        ) : null}
      </FieldGroup>
    </>
  );
}
