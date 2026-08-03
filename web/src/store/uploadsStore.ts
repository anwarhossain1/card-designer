import { create } from "zustand";
import type { UploadedAsset } from "@/lib/uploads/readFile";

/**
 * The upload library for this session.
 *
 * Assets live in memory only; a design keeps its own copy of every image as a
 * data URL, so reopening a saved card still shows the artwork even after the
 * library is empty.
 */
interface UploadsState {
  assets: UploadedAsset[];
  add: (asset: UploadedAsset) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useUploadsStore = create<UploadsState>((set) => ({
  assets: [],
  add: (asset) => set((state) => ({ assets: [asset, ...state.assets] })),
  remove: (id) =>
    set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),
  clear: () => set({ assets: [] }),
}));
