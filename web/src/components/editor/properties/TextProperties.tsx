"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react";
import type { Textbox } from "fabric";
import { Field, FieldGroup } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import {
  ColorInput,
  NumberInput,
  SegmentedControl,
  Select,
  Slider,
} from "@/components/ui/inputs";
import { FONTS } from "@/config/fonts";
import { useCanvasActions } from "@/hooks/useCanvasActions";

const FONT_OPTIONS = FONTS.map((font) => ({
  value: font.family,
  label: font.label,
}));

const ALIGN_OPTIONS = [
  { value: "left", label: "Align left", icon: <AlignLeft className="h-4 w-4" /> },
  { value: "center", label: "Align centre", icon: <AlignCenter className="h-4 w-4" /> },
  { value: "right", label: "Align right", icon: <AlignRight className="h-4 w-4" /> },
  { value: "justify", label: "Justify", icon: <AlignJustify className="h-4 w-4" /> },
] as const;

const WEIGHT_LABELS: Record<number, string> = {
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
};

export function TextProperties({ target }: { target: Textbox }) {
  const { update, updateFontFamily } = useCanvasActions();

  const family = target.fontFamily ?? "Inter";
  const weights = FONTS.find((font) => font.family === family)?.weights ?? [400];
  const weight = Number(target.fontWeight) || 400;
  const fill = typeof target.fill === "string" ? target.fill : "#11141c";

  return (
    <>
      <FieldGroup title="Font">
        <Field label="Family" stacked>
          <Select
            ariaLabel="Font family"
            value={family}
            options={FONT_OPTIONS}
            onChange={(value) => void updateFontFamily(value)}
          />
        </Field>

        <div className="flex items-end gap-2">
          <Field label="Size" stacked className="w-20">
            <NumberInput
              value={target.fontSize ?? 12}
              min={4}
              max={200}
              onChange={(value) => update({ fontSize: value })}
            />
          </Field>
          <Field label="Weight" stacked className="flex-1">
            <Select
              ariaLabel="Font weight"
              value={weight}
              options={weights.map((option) => ({
                value: option,
                label: WEIGHT_LABELS[option] ?? String(option),
              }))}
              onChange={(value) => update({ fontWeight: Number(value) })}
            />
          </Field>
        </div>

        <Field label="Style">
          <div className="flex items-center gap-0.5">
            <IconButton
              size="sm"
              label="Bold"
              active={weight >= 600}
              onClick={() => update({ fontWeight: weight >= 600 ? 400 : 700 })}
            >
              <Bold className="h-4 w-4" />
            </IconButton>
            <IconButton
              size="sm"
              label="Italic"
              active={target.fontStyle === "italic"}
              onClick={() =>
                update({
                  fontStyle: target.fontStyle === "italic" ? "normal" : "italic",
                })
              }
            >
              <Italic className="h-4 w-4" />
            </IconButton>
            <IconButton
              size="sm"
              label="Underline"
              active={Boolean(target.underline)}
              onClick={() => update({ underline: !target.underline })}
            >
              <Underline className="h-4 w-4" />
            </IconButton>
          </div>
        </Field>

        <Field label="Alignment" stacked>
          <SegmentedControl
            ariaLabel="Text alignment"
            value={(target.textAlign as (typeof ALIGN_OPTIONS)[number]["value"]) ?? "left"}
            options={[...ALIGN_OPTIONS]}
            onChange={(value) => update({ textAlign: value })}
          />
        </Field>
      </FieldGroup>

      <FieldGroup title="Spacing">
        <Field label="Letter spacing" stacked>
          <div className="flex items-center gap-2">
            <Slider
              value={target.charSpacing ?? 0}
              min={-100}
              max={600}
              step={10}
              onChange={(value) => update({ charSpacing: value })}
            />
            <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-ink-500">
              {Math.round((target.charSpacing ?? 0) / 10)}
            </span>
          </div>
        </Field>

        <Field label="Line height" stacked>
          <div className="flex items-center gap-2">
            <Slider
              value={target.lineHeight ?? 1.16}
              min={0.7}
              max={2.5}
              step={0.05}
              onChange={(value) => update({ lineHeight: value })}
            />
            <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-ink-500">
              {(target.lineHeight ?? 1.16).toFixed(2)}
            </span>
          </div>
        </Field>
      </FieldGroup>

      <FieldGroup title="Appearance">
        <Field label="Colour">
          <ColorInput value={fill} onChange={(value) => update({ fill: value })} />
        </Field>

        <Field label="Opacity" stacked>
          <div className="flex items-center gap-2">
            <Slider
              value={Math.round((target.opacity ?? 1) * 100)}
              min={0}
              max={100}
              onChange={(value) => update({ opacity: value / 100 })}
            />
            <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-ink-500">
              {Math.round((target.opacity ?? 1) * 100)}%
            </span>
          </div>
        </Field>
      </FieldGroup>
    </>
  );
}
