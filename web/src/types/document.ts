/**
 * Document model.
 *
 * A `CardDocument` is the unit of work the editor loads, autosaves and exports.
 * `kind` exists so other print products (postcard, flyer, letterhead) can be
 * added later without changing the storage or export layer.
 */

export type DocumentKind = "business-card";

export type LengthUnit = "in" | "mm" | "px";

export interface DocumentSize {
  width: number;
  height: number;
  unit: LengthUnit;
}

/** Serialized Fabric scene. Kept opaque so canvas internals stay in lib/canvas. */
export type SceneJSON = Record<string, unknown>;

export interface CardSide {
  /** Reserved: "back" is not implemented in the MVP but the shape allows it. */
  id: "front" | "back";
  scene: SceneJSON | null;
}

export interface CardDocument {
  id: string;
  /** Schema version — bump when the scene format changes, migrate on load. */
  schemaVersion: number;
  kind: DocumentKind;
  name: string;
  size: DocumentSize;
  /** Print margins in inches. */
  bleed: number;
  safeArea: number;
  /** Template the document was created from, if any. */
  templateId: string | null;
  sides: CardSide[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentMeta {
  id: string;
  name: string;
  updatedAt: string;
  thumbnail?: string;
}
