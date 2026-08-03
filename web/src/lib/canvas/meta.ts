import type { FabricObject } from "fabric";
import { createId } from "@/lib/utils/id";
import type { ElementKind, ElementMeta, FieldRole } from "@/types/element";

/** A Fabric object carrying our metadata envelope. */
export type ElementObject = FabricObject & { meta?: ElementMeta };

/**
 * Custom properties Fabric must keep when serializing a scene. Anything the
 * editor adds to an object has to be listed here or it is lost on save.
 */
export const SERIALIZED_PROPERTIES = ["meta"];

export interface CreateMetaOptions {
  kind: ElementKind;
  name: string;
  role?: FieldRole;
  locked?: boolean;
}

export function createMeta({
  kind,
  name,
  role = "decoration",
  locked = false,
}: CreateMetaOptions): ElementMeta {
  return { id: createId(kind), kind, name, role, locked };
}

export function attachMeta<T extends FabricObject>(
  object: T,
  meta: ElementMeta,
): T {
  (object as ElementObject).meta = meta;
  return object;
}

export function getMeta(object: FabricObject | undefined): ElementMeta | null {
  return (object as ElementObject | undefined)?.meta ?? null;
}

export function getMetaId(object: FabricObject | undefined): string | null {
  return getMeta(object)?.id ?? null;
}

/** Renames an element — used by the layers panel and on content edits. */
export function setMetaName(object: FabricObject, name: string) {
  const meta = getMeta(object);
  if (meta) meta.name = name;
}

export function isLocked(object: FabricObject | undefined): boolean {
  return getMeta(object)?.locked ?? false;
}
