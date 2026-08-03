import { Group, Rect, Textbox, type FabricObject } from "fabric";
import { CANVAS_WIDTH } from "@/config/document";
import { attachMeta, createMeta } from "@/lib/canvas/meta";
import type { FieldRole } from "@/types/element";

/**
 * Layout primitives for template modules.
 *
 * Templates position everything in card coordinates (336 × 192 at 96 DPI) and
 * carry the same metadata as hand-placed elements, so every piece is editable,
 * lockable and listed in the layers panel exactly like the user's own work.
 */

export interface TextSpec {
  role: FieldRole;
  content: string;
  left: number;
  top: number;
  size: number;
  width: number;
  family?: string;
  weight?: number;
  color?: string;
  /** Fabric charSpacing: 1/1000 em. */
  spacing?: number;
  lineHeight?: number;
  align?: "left" | "center" | "right";
  italic?: boolean;
}

/** Label shown in the layers panel; the field name reads better than content. */
const ROLE_LABEL: Partial<Record<FieldRole, string>> = {
  name: "Name",
  title: "Job title",
  company: "Company",
  phone: "Phone",
  email: "Email",
  website: "Website",
  address: "Address",
};

export function text({
  role,
  content,
  left,
  top,
  size,
  width,
  family = "Inter",
  weight = 400,
  color = "#11141c",
  spacing = 0,
  lineHeight = 1.2,
  align = "left",
  italic = false,
}: TextSpec): Textbox {
  const textbox = new Textbox(content, {
    left,
    top,
    width,
    fontFamily: family,
    fontSize: size,
    fontWeight: weight,
    fontStyle: italic ? "italic" : "normal",
    fill: color,
    charSpacing: spacing,
    lineHeight,
    textAlign: align,
    objectCaching: false,
    splitByGrapheme: false,
  });

  return attachMeta(
    textbox,
    createMeta({ kind: "text", name: ROLE_LABEL[role] ?? content, role }),
  );
}

/** Centres a text block horizontally on the card. */
export const centred = (spec: Omit<TextSpec, "left">): TextSpec => ({
  ...spec,
  left: (CANVAS_WIDTH - spec.width) / 2,
  align: spec.align ?? "center",
});

export interface ShapeSpec {
  left: number;
  top: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  name?: string;
  opacity?: number;
}

export function block({
  left,
  top,
  width,
  height,
  fill = "",
  stroke = "",
  strokeWidth = 0,
  radius = 0,
  name = "Shape",
  opacity = 1,
}: ShapeSpec): Rect {
  const rect = new Rect({
    left,
    top,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    strokeUniform: true,
    rx: radius,
    ry: radius,
    opacity,
    objectCaching: false,
  });

  return attachMeta(
    rect,
    createMeta({ kind: "shape", name, role: "decoration" }),
  );
}

export interface LogoSpec {
  left: number;
  top: number;
  size: number;
  fill?: string;
  stroke?: string;
  textColor: string;
  initials?: string;
  radius?: number;
}

/**
 * Logo slot. A grouped placeholder rather than a bare rectangle, so it reads as
 * one element in the layer list and can be deleted in a single step once the
 * user drops in their own mark.
 */
export function logoSlot({
  left,
  top,
  size,
  fill = "",
  stroke = "",
  textColor,
  initials = "NW",
  radius = 8,
}: LogoSpec): FabricObject {
  const frame = new Rect({
    left: 0,
    top: 0,
    width: size,
    height: size,
    fill,
    stroke,
    strokeWidth: stroke ? 1 : 0,
    strokeUniform: true,
    rx: radius,
    ry: radius,
    objectCaching: false,
  });

  const label = new Textbox(initials, {
    left: 0,
    top: size / 2 - size * 0.16,
    width: size,
    fontFamily: "Inter",
    fontSize: size * 0.34,
    fontWeight: 700,
    fill: textColor,
    textAlign: "center",
    charSpacing: 40,
    objectCaching: false,
  });

  const group = new Group([frame, label], { objectCaching: false });
  group.set({ left, top });

  return attachMeta(
    group,
    createMeta({ kind: "group", name: "Logo placeholder", role: "logo" }),
  );
}
