"use client";

import type { FabricObject } from "fabric";
import { Field, FieldGroup } from "@/components/ui/Field";
import { ColorInput, NumberInput, Slider } from "@/components/ui/inputs";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { getIconColor, getIconStrokeWidth } from "@/lib/canvas/elements/icon";

export function IconProperties({ target }: { target: FabricObject }) {
  const { setIconStyle } = useCanvasActions();

  const color = getIconColor(target);
  const weight = getIconStrokeWidth(target);

  return (
    <FieldGroup title="Icon">
      <Field label="Colour">
        <ColorInput value={color} onChange={(value) => setIconStyle({ color: value })} />
      </Field>

      <Field label="Line weight" stacked>
        <div className="flex items-center gap-2">
          <Slider
            value={weight}
            min={0.5}
            max={4}
            step={0.25}
            onChange={(value) => setIconStyle({ strokeWidth: value })}
          />
          <NumberInput
            className="w-14"
            value={weight}
            min={0.5}
            max={4}
            step={0.25}
            onChange={(value) => setIconStyle({ strokeWidth: value })}
          />
        </div>
      </Field>
    </FieldGroup>
  );
}
