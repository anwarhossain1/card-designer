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

/** Which bottom sheet the mobile shell is showing, if any. */
export type MobileSheet = "panel" | "properties" | "more";

interface UiState {
  /** null = the panel drawer is collapsed. */
  activePanel: PanelId | null;
  view: ViewOptions;
  /** Mobile only; the desktop shell shows panels side by side instead. */
  mobileSheet: MobileSheet | null;
  openPanel: (panel: PanelId) => void;
  togglePanel: (panel: PanelId) => void;
  closePanel: () => void;
  toggleView: (key: keyof ViewOptions) => void;
  openSheet: (sheet: MobileSheet) => void;
  closeSheet: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activePanel: "templates",
  view: { grid: false, safeArea: true, bleed: true, snap: true },
  mobileSheet: null,

  openPanel: (panel) => set({ activePanel: panel }),

  togglePanel: (panel) =>
    set((state) => ({
      activePanel: state.activePanel === panel ? null : panel,
    })),

  closePanel: () => set({ activePanel: null }),

  toggleView: (key) =>
    set((state) => ({ view: { ...state.view, [key]: !state.view[key] } })),

  openSheet: (mobileSheet) => set({ mobileSheet }),
  closeSheet: () => set({ mobileSheet: null }),
}));
