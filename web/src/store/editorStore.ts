import { create } from "zustand";
import { createId } from "@/lib/utils/id";
import type { SideId } from "@/types/document";

/**
 * Document-level editor state. Deliberately holds no Fabric objects — the
 * canvas owns geometry, this owns everything the chrome needs to render.
 */
interface EditorState {
  documentId: string;
  documentName: string;
  /**
   * When the design was first created, not when this tab opened. It belongs to
   * the document, so a copy taken from the server brings its own — which is
   * why it lives here rather than in a ref beside the autosave.
   */
  documentCreatedAt: string;
  templateId: string | null;
  /** Which side the canvas is showing. The other side lives in useCardSides. */
  activeSide: SideId;
  /** Ids of the currently selected elements (see ElementMeta.id). */
  selection: string[];
  lastSavedAt: string | null;
  isDirty: boolean;

  setDocumentName: (name: string) => void;
  setTemplateId: (id: string | null) => void;
  /** Records the swap; useCardSides.switchSide is what actually performs it. */
  setActiveSide: (side: SideId) => void;
  setSelection: (ids: string[]) => void;
  markDirty: () => void;
  markSaved: (at?: string) => void;
  /** Adopts a stored document's identity after its scene has been loaded. */
  hydrate: (doc: {
    documentId: string;
    documentName: string;
    documentCreatedAt: string;
    templateId: string | null;
    lastSavedAt: string | null;
  }) => void;
  reset: () => void;
}

const initial = () => ({
  documentId: createId("doc"),
  documentName: "Untitled card",
  documentCreatedAt: new Date().toISOString(),
  templateId: null as string | null,
  activeSide: "front" as SideId,
  selection: [] as string[],
  lastSavedAt: null as string | null,
  isDirty: false,
});

export const useEditorStore = create<EditorState>((set) => ({
  ...initial(),

  setDocumentName: (documentName) => set({ documentName, isDirty: true }),
  setTemplateId: (templateId) => set({ templateId, isDirty: true }),
  // Not dirty: which side you are looking at is not part of the saved design.
  setActiveSide: (activeSide) => set({ activeSide, selection: [] }),
  setSelection: (selection) => set({ selection }),
  markDirty: () => set({ isDirty: true }),
  markSaved: (at) =>
    set({ lastSavedAt: at ?? new Date().toISOString(), isDirty: false }),
  hydrate: (doc) => set({ ...doc, isDirty: false }),
  reset: () => set(initial()),
}));
