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
import { useT } from "@/components/i18n/I18nProvider";

const FONT_OPTIONS = FONTS.map((font) => ({
  value: font.family,
  label: font.label,
}));

type Align = "left" | "center" | "right" | "justify";

export function TextProperties({ target }: { target: Textbox }) {
  const t = useT().editor.properties;
  const { update, updateFontFamily } = useCanvasActions();

  const alignOptions: { value: Align; label: string; icon: React.ReactNode }[] = [
    { value: "left", label: t.alignLeft, icon: <AlignLeft className="h-4 w-4" /> },
    { value: "center", label: t.alignCentre, icon: <AlignCenter className="h-4 w-4" /> },
    { value: "right", label: t.alignRight, icon: <AlignRight className="h-4 w-4" /> },
    { value: "justify", label: t.justify, icon: <AlignJustify className="h-4 w-4" /> },
  ];

  const family = target.fontFamily ?? "Inter";
  const weights = FONTS.find((font) => font.family === family)?.weights ?? [400];
  const weight = Number(target.fontWeight) || 400;
  const fill = typeof target.fill === "string" ? target.fill : "#11141c";

  return (
    <>
      <FieldGroup title={t.font}>
        <Field label={t.family} stacked>
          <Select
            ariaLabel={t.family}
            value={family}
            options={FONT_OPTIONS}
            onChange={(value) => void updateFontFamily(value)}
          />
        </Field>

        <div className="flex items-end gap-2">
          <Field label={t.size} stacked className="w-20">
            <NumberInput
              value={target.fontSize ?? 12}
              min={4}
              max={200}
              onChange={(value) => update({ fontSize: value })}
            />
          </Field>
          <Field label={t.weight} stacked className="flex-1">
            <Select
              ariaLabel={t.weight}
              value={weight}
              options={weights.map((option) => ({
                value: option,
                label: t.weights[option] ?? String(option),
              }))}
              onChange={(value) => update({ fontWeight: Number(value) })}
            />
          </Field>
        </div>

        <Field label={t.style}>
          <div className="flex items-center gap-0.5">
            <IconButton
              size="sm"
              label={t.bold}
              active={weight >= 600}
              onClick={() => update({ fontWeight: weight >= 600 ? 400 : 700 })}
            >
              <Bold className="h-4 w-4" />
            </IconButton>
            <IconButton
              size="sm"
              label={t.italic}
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
              label={t.underline}
              active={Boolean(target.underline)}
              onClick={() => update({ underline: !target.underline })}
            >
              <Underline className="h-4 w-4" />
            </IconButton>
          </div>
        </Field>

        <Field label={t.alignment} stacked>
          <SegmentedControl
            ariaLabel={t.alignment}
            value={(target.textAlign as Align) ?? "left"}
            options={alignOptions}
            onChange={(value) => update({ textAlign: value })}
          />
        </Field>
      </FieldGroup>

      <FieldGroup title={t.spacing}>
        <Field label={t.letterSpacing} stacked>
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

        <Field label={t.lineHeight} stacked>
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

      <FieldGroup title={t.appearance}>
        {/* Opacity and rotation live in the shared Arrange section. */}
        <Field label={t.colour}>
          <ColorInput value={fill} onChange={(value) => update({ fill: value })} />
        </Field>
      </FieldGroup>
    </>
  );
}
