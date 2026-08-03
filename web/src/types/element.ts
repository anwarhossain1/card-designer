/**
 * Element metadata.
 *
 * Fabric owns geometry and styling; we attach this small envelope to every
 * object so the layers panel, properties panel and templates can reason about
 * objects without inspecting Fabric internals.
 */

export type ElementKind =
  | "text"
  | "shape"
  | "image"
  | "icon"
  | "qr"
  | "group"
  /** The card's backdrop: always bottom-most, managed by the background panel. */
  | "background";

/** Semantic slot a template element fills, used to prefill/replace content. */
export type FieldRole =
  | "name"
  | "title"
  | "company"
  | "phone"
  | "email"
  | "website"
  | "address"
  | "logo"
  | "qr"
  | "decoration";

export interface ElementMeta {
  id: string;
  kind: ElementKind;
  /** Human label shown in the layers panel. */
  name: string;
  role: FieldRole;
  locked: boolean;
}

export type ShapeVariant =
  | "rect"
  | "roundedRect"
  | "circle"
  | "triangle"
  | "line";

export type TextVariant = "heading" | "subheading" | "paragraph" | "custom";

export type QrDataKind = "website" | "phone" | "email" | "vcard";

export interface QrPayload {
  kind: QrDataKind;
  website?: string;
  phone?: string;
  email?: string;
  vcard?: {
    firstName: string;
    lastName: string;
    title?: string;
    company?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}
