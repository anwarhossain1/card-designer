import type { CardSide } from "@/types/document";
import type { TemplateCategory } from "@/types/template";
import { ApiError, apiRequest } from "./client";

/**
 * Published templates made by admins. These sit beside the five bundled
 * templates rather than replacing them: the bundled set needs no network, so
 * the editor still has a catalogue offline or with the API down.
 */
export interface ServerTemplate {
  slug: string;
  name: string;
  category: TemplateCategory;
  description: string;
  palette: string[];
  fonts: string[];
  thumbnail: string | null;
}

export interface ServerTemplateWithSides extends ServerTemplate {
  sides: CardSide[];
}

/** Summaries only; the list leaves scenes out. */
export const listServerTemplates = () =>
  apiRequest<ServerTemplate[]>("/templates");

/** Null for an unknown or unpublished slug — a stale link, not a fault. */
export async function fetchServerTemplate(
  slug: string,
): Promise<ServerTemplateWithSides | null> {
  try {
    return await apiRequest<ServerTemplateWithSides>(
      `/templates/${encodeURIComponent(slug)}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
