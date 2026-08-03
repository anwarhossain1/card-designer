"use client";

import type { FabricObject } from "fabric";
import { Field, FieldGroup } from "@/components/ui/Field";
import { NumberInput, Slider } from "@/components/ui/inputs";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { pxToInches, round } from "@/lib/utils/units";

/**
 * Transform properties shared by every element kind, so rotation and opacity
 * live in exactly one place regardless of what is selected.
 */
export function ArrangeProperties({ target }: { target: FabricObject }) {
  const { update } = useCanvasActions();

  const angle = Math.round(target.angle ?? 0);
  const opacity = Math.round((target.opacity ?? 1) * 100);

  return (
    <FieldGroup title="Arrange">
      <Field label="Rotation" stacked>
        <div className="flex items-center gap-2">
          <Slider
            value={angle}
            min={0}
            max={360}
            onChange={(value) => update({ angle: value })}
          />
          <NumberInput
            className="w-16"
            value={angle}
            min={0}
            max={360}
            suffix="°"
            onChange={(value) => update({ angle: value })}
          />
        </div>
      </Field>

      <Field label="Opacity" stacked>
        <div className="flex items-center gap-2">
          <Slider
            value={opacity}
            min={0}
            max={100}
            onChange={(value) => update({ opacity: value / 100 })}
          />
          <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-ink-500">
            {opacity}%
          </span>
        </div>
      </Field>

      <p className="text-[11px] text-ink-400">
        {round(pxToInches(target.getScaledWidth()), 2)} ×{" "}
        {round(pxToInches(target.getScaledHeight()), 2)} in on the card
      </p>
    </FieldGroup>
  );
}
