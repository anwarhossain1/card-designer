import { loadSVGFromString, util, type FabricObject } from "fabric";
import {
  buildIconSvg,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_STROKE,
  ICON_MAP,
  type IconDefinition,
} from "@/lib/icons/registry";
import type { FieldRole } from "@/types/element";
import { attachMeta, createMeta } from "../meta";

/** Rendered size on the card, in design pixels. */
const ICON_SIZE = 24;

/** Contact icons map to the field they sit beside; social ones are decoration. */
const ROLE_BY_ICON: Record<string, FieldRole> = {
  phone: "phone",
  email: "email",
  website: "website",
  location: "address",
};

export async function createIconElement(
  iconId: string,
  color = DEFAULT_ICON_COLOR,
): Promise<FabricObject | null> {
  const definition = ICON_MAP.get(iconId);
  if (!definition) return null;

  const { objects } = await loadSVGFromString(
    buildIconSvg(definition.body, color),
  );

  const parts = objects.filter((object): object is FabricObject =>
    Boolean(object),
  );
  if (parts.length === 0) return null;

  const element = util.groupSVGElements(parts);
  const scale = ICON_SIZE / (element.width || ICON_SIZE);

  element.set({
    scaleX: scale,
    scaleY: scale,
    strokeUniform: true,
    objectCaching: false,
  });

  return attachMeta(
    element,
    createMeta({
      kind: "icon",
      name: definition.label,
      role: ROLE_BY_ICON[iconId] ?? "decoration",
    }),
  );
}

/**
 * An icon may be a group of parts or a single path when the glyph has one
 * element, so every read/write walks this list.
 */
function iconParts(object: FabricObject): FabricObject[] {
  const group = object as unknown as { getObjects?: () => FabricObject[] };
  return group.getObjects ? group.getObjects() : [object];
}

/**
 * Icons are stroke-drawn, so recolouring means walking the parts — setting
 * `stroke` on the group alone would not reach them.
 */
export function setIconColor(object: FabricObject, color: string) {
  iconParts(object).forEach((part) => part.set({ stroke: color }));
  object.set({ dirty: true });
}

export function getIconColor(object: FabricObject): string {
  const stroke = iconParts(object)[0]?.stroke;
  return typeof stroke === "string" && stroke ? stroke : DEFAULT_ICON_COLOR;
}

export function setIconStrokeWidth(object: FabricObject, width: number) {
  iconParts(object).forEach((part) => part.set({ strokeWidth: width }));
  object.set({ dirty: true });
}

export function getIconStrokeWidth(object: FabricObject): number {
  return iconParts(object)[0]?.strokeWidth ?? DEFAULT_ICON_STROKE;
}

export type { IconDefinition };
