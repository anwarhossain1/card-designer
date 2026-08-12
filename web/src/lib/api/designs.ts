import type { CardDocument } from "@/types/document";
import { ApiError, apiRequest } from "./client";

export interface DesignSummary {
  id: string;
  name: string;
  templateId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * The document as the API expects it: every field spelled out, and no `id` —
 * that travels in the URL. Listing the fields rather than spreading the rest
 * means a new local-only field cannot start leaking upward by accident.
 */
const toPayload = (doc: CardDocument) => ({
  schemaVersion: doc.schemaVersion,
  kind: doc.kind,
  name: doc.name,
  size: doc.size,
  bleed: doc.bleed,
  safeArea: doc.safeArea,
  templateId: doc.templateId,
  sides: doc.sides,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const listDesigns = () => apiRequest<DesignSummary[]>("/designs");

export const saveDesign = (doc: CardDocument) =>
  apiRequest<CardDocument>(`/designs/${doc.id}`, {
    method: "PUT",
    body: toPayload(doc),
  });

/**
 * The stored copy, or null when this owner has no such design.
 *
 * A 404 is a normal answer here — a card drawn in this browser and never
 * uploaded has no server copy yet — so it is not worth throwing over.
 */
export async function fetchDesign(id: string): Promise<CardDocument | null> {
  try {
    return await apiRequest<CardDocument>(`/designs/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
