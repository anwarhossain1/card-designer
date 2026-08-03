import { create } from "zustand";
import { createId } from "@/lib/utils/id";

/**
 * Document-level editor state. Deliberately holds no Fabric objects — the
 * canvas owns geometry, this owns everything the chrome needs to render.
 */
interface EditorState {
  documentId: string;
  documentName: string;
  templateId: string | null;
  /** Ids of the currently selected elements (see ElementMeta.id). */
  selection: string[];
  lastSavedAt: string | null;
  isDirty: boolean;

  setDocumentName: (name: string) => void;
  setTemplateId: (id: string | null) => void;
  setSelection: (ids: string[]) => void;
  markDirty: () => void;
  markSaved: (at?: string) => void;
  reset: () => void;
}

const initial = () => ({
  documentId: createId("doc"),
  documentName: "Untitled card",
  templateId: null as string | null,
  selection: [] as string[],
  lastSavedAt: null as string | null,
  isDirty: false,
});

export const useEditorStore = create<EditorState>((set) => ({
  ...initial(),

  setDocumentName: (documentName) => set({ documentName, isDirty: true }),
  setTemplateId: (templateId) => set({ templateId, isDirty: true }),
  setSelection: (selection) => set({ selection }),
  markDirty: () => set({ isDirty: true }),
  markSaved: (at) =>
    set({ lastSavedAt: at ?? new Date().toISOString(), isDirty: false }),
  reset: () => set(initial()),
}));
