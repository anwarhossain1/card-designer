import { create } from "zustand";

export type PanelId =
  | "templates"
  | "uploads"
  | "text"
  | "shapes"
  | "icons"
  | "background"
  | "qr"
  | "layers";

export interface ViewOptions {
  grid: boolean;
  safeArea: boolean;
  bleed: boolean;
  snap: boolean;
}

interface UiState {
  /** null = the panel drawer is collapsed. */
  activePanel: PanelId | null;
  view: ViewOptions;
  openPanel: (panel: PanelId) => void;
  togglePanel: (panel: PanelId) => void;
  closePanel: () => void;
  toggleView: (key: keyof ViewOptions) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activePanel: "templates",
  view: { grid: false, safeArea: true, bleed: true, snap: true },

  openPanel: (panel) => set({ activePanel: panel }),

  togglePanel: (panel) =>
    set((state) => ({
      activePanel: state.activePanel === panel ? null : panel,
    })),

  closePanel: () => set({ activePanel: null }),

  toggleView: (key) =>
    set((state) => ({ view: { ...state.view, [key]: !state.view[key] } })),
}));
