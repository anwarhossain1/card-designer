import { Textbox } from "fabric";
import { CANVAS_WIDTH } from "@/config/document";
import { DEFAULT_FONT_FAMILY } from "@/config/fonts";
import type { FieldRole, TextVariant } from "@/types/element";
import { attachMeta, createMeta } from "../meta";

export interface TextPreset {
  variant: TextVariant;
  label: string;
  hint: string;
  defaultText: string;
  role: FieldRole;
  fontSize: number;
  fontWeight: number;
  charSpacing: number;
  lineHeight: number;
  width: number;
}

/**
 * Sizes are in design pixels on a 336 × 192 card (96 DPI), so a 24px heading
 * prints at roughly 18pt — the range business cards actually use.
 */
export const TEXT_PRESETS: TextPreset[] = [
  {
    variant: "heading",
    label: "Add a heading",
    hint: "Your name",
    defaultText: "Your Name",
    role: "name",
    fontSize: 24,
    fontWeight: 700,
    charSpacing: -10,
    lineHeight: 1.1,
    width: 200,
  },
  {
    variant: "subheading",
    label: "Add a subheading",
    hint: "Job title or company",
    defaultText: "Job Title",
    role: "title",
    fontSize: 12,
    fontWeight: 500,
    charSpacing: 80,
    lineHeight: 1.2,
    width: 180,
  },
  {
    variant: "paragraph",
    label: "Add body text",
    hint: "Contact details",
    defaultText: "hello@example.com",
    role: "email",
    fontSize: 9,
    fontWeight: 400,
    charSpacing: 0,
    lineHeight: 1.4,
    width: 150,
  },
  {
    variant: "custom",
    label: "Add a text box",
    hint: "Anything else",
    defaultText: "Text",
    role: "decoration",
    fontSize: 11,
    fontWeight: 400,
    charSpacing: 0,
    lineHeight: 1.3,
    width: 120,
  },
];

export const TEXT_PRESET_MAP = new Map(
  TEXT_PRESETS.map((preset) => [preset.variant, preset]),
);

/** Label shown in the layers panel; kept short. */
const elementName = (text: string) =>
  text.trim().split(/\s+/).slice(0, 4).join(" ") || "Text";

export function createTextElement(
  variant: TextVariant,
  text?: string,
): Textbox {
  const preset = TEXT_PRESET_MAP.get(variant) ?? TEXT_PRESETS[3]!;
  const content = text ?? preset.defaultText;

  const textbox = new Textbox(content, {
    width: Math.min(preset.width, CANVAS_WIDTH - 24),
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: preset.fontSize,
    fontWeight: preset.fontWeight,
    charSpacing: preset.charSpacing,
    lineHeight: preset.lineHeight,
    fill: "#11141c",
    textAlign: "left",
    objectCaching: false,
    splitByGrapheme: false,
  });

  return attachMeta(
    textbox,
    createMeta({ kind: "text", name: elementName(content), role: preset.role }),
  );
}
