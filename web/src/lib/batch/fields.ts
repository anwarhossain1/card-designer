import type { CardSide, SceneJSON } from "@/types/document";
import type { ElementMeta, FieldRole } from "@/types/element";

/**
 * Batch merge fields.
 *
 * A design exposes data slots two ways: explicit bindings (`meta.fieldKey`,
 * set from the Data panel) and the semantic roles templates already carry on
 * their text elements. Treating roles as implicit fields is what makes every
 * existing template batch-ready without editing a single element.
 */

/** Roles whose text is meaningful to substitute; decoration and artwork are not. */
export const BINDABLE_ROLES: FieldRole[] = [
  "name",
  "title",
  "company",
  "phone",
  "email",
  "website",
  "address",
];

export interface MergeField {
  /** What substitution matches on: a fieldKey, or a role name. */
  key: string;
  source: "field" | "role";
  /** How many elements across both sides this field fills. */
  elementCount: number;
}

/** A serialized scene object, as far as batch generation needs to see it. */
interface SceneObject {
  type?: string;
  text?: string;
  meta?: ElementMeta;
}

export function sceneObjects(scene: SceneJSON | null): SceneObject[] {
  const objects = (scene as { objects?: unknown } | null)?.objects;
  return Array.isArray(objects) ? (objects as SceneObject[]) : [];
}

const isTextObject = (object: SceneObject) =>
  object.meta?.kind === "text" && typeof object.text === "string";

/**
 * Every data slot on the card, explicit bindings first — they were placed on
 * purpose, so they lead the mapping table.
 */
export function collectMergeFields(sides: readonly CardSide[]): MergeField[] {
  const found = new Map<string, MergeField>();

  for (const side of sides) {
    for (const object of sceneObjects(side.scene)) {
      const meta = object.meta;
      if (!meta) continue;

      const key = meta.fieldKey?.trim();
      if (key && (isTextObject(object) || meta.kind === "qr")) {
        const id = `field:${key}`;
        const entry = found.get(id) ?? { key, source: "field" as const, elementCount: 0 };
        entry.elementCount += 1;
        found.set(id, entry);
        continue;
      }

      if (isTextObject(object) && BINDABLE_ROLES.includes(meta.role)) {
        const id = `role:${meta.role}`;
        const entry =
          found.get(id) ?? { key: meta.role, source: "role" as const, elementCount: 0 };
        entry.elementCount += 1;
        found.set(id, entry);
      }
    }
  }

  return [...found.values()].sort((a, b) =>
    a.source === b.source ? 0 : a.source === "field" ? -1 : 1,
  );
}

/** Does this element take the given field's value? */
export function elementMatchesField(
  meta: ElementMeta | undefined,
  field: MergeField,
): boolean {
  if (!meta) return false;
  return field.source === "field"
    ? meta.fieldKey?.trim() === field.key
    : !meta.fieldKey && meta.role === field.key;
}
