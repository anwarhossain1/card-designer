"use client";

import type { FabricObject, Rect } from "fabric";
import { Field, FieldGroup } from "@/components/ui/Field";
import { ColorInput, NumberInput, Slider } from "@/components/ui/inputs";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { useT } from "@/components/i18n/I18nProvider";
import { buildShadow, SHADOW_PRESET } from "@/lib/canvas/elements/shape";

const isRect = (object: FabricObject) => object.type === "rect";
const isLine = (object: FabricObject) => object.type === "line";

export function ShapeProperties({ target }: { target: FabricObject }) {
  const t = useT().editor.properties;
  const { update } = useCanvasActions();

  const fill = typeof target.fill === "string" ? target.fill : "#6c4cff";
  const stroke = typeof target.stroke === "string" ? target.stroke : "";
  const strokeWidth = target.strokeWidth ?? 0;
  const shadow = target.shadow;
  const radius = isRect(target) ? ((target as Rect).rx ?? 0) : 0;

  return (
    <>
      <FieldGroup title={t.fill}>
        {isLine(target) ? (
          <p className="text-[11px] text-ink-400">{t.lineOnlyNote}</p>
        ) : (
          <Field label={t.colour}>
            <ColorInput value={fill} onChange={(value) => update({ fill: value })} />
          </Field>
        )}
      </FieldGroup>

      <FieldGroup title={t.border}>
        <Field label={t.colour}>
          <ColorInput
            value={stroke || "#11141c"}
            onChange={(value) => update({ stroke: value })}
          />
        </Field>

        <Field label={t.width} stacked>
          <div className="flex items-center gap-2">
            <Slider
              value={strokeWidth}
              min={0}
              max={20}
              step={0.5}
              onChange={(value) =>
                update({
                  strokeWidth: value,
                  // A width without a colour would render nothing.
                  ...(stroke ? {} : { stroke: "#11141c" }),
                })
              }
            />
            <NumberInput
              className="w-14"
              value={strokeWidth}
              min={0}
              max={20}
              step={0.5}
              onChange={(value) => update({ strokeWidth: value })}
            />
          </div>
        </Field>

        {isRect(target) ? (
          <Field label={t.cornerRadius} stacked>
            <div className="flex items-center gap-2">
              <Slider
                value={radius}
                min={0}
                max={40}
                onChange={(value) => update({ rx: value, ry: value })}
              />
              <NumberInput
                className="w-14"
                value={radius}
                min={0}
                max={40}
                onChange={(value) => update({ rx: value, ry: value })}
              />
            </div>
          </Field>
        ) : null}
      </FieldGroup>

      <FieldGroup title={t.shadow}>
        <Field label={t.dropShadow}>
          <label className="flex items-center gap-2 text-xs text-ink-600">
            <input
              type="checkbox"
              checked={Boolean(shadow)}
              onChange={(event) =>
                update({ shadow: event.target.checked ? buildShadow() : null })
              }
              className="h-4 w-4 accent-brand-600"
            />
            {shadow ? t.on : t.off}
          </label>
        </Field>

        {shadow ? (
          <>
            <Field label={t.blur} stacked>
              <Slider
                value={shadow.blur ?? SHADOW_PRESET.blur}
                min={0}
                max={40}
                onChange={(value) => update({ shadow: buildShadow({ blur: value, offsetY: shadow.offsetY }) })}
              />
            </Field>
            <Field label={t.distance} stacked>
              <Slider
                value={shadow.offsetY ?? SHADOW_PRESET.offsetY}
                min={-20}
                max={20}
                onChange={(value) => update({ shadow: buildShadow({ blur: shadow.blur, offsetY: value }) })}
              />
            </Field>
          </>
        ) : null}
      </FieldGroup>
    </>
  );
}
