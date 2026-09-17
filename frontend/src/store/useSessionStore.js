import { create } from "zustand";

// Holds the state of the current photobooth session:
// how many shots, which avatar items were picked, and the confirmed photos
// (each with its own placed-avatar position/config).
const useSessionStore = create((set, get) => ({
  stripCount: null, // e.g. 3 | 4 | 6
  avatarConfig: {
    hair: null,
    skinTone: null,
    accessory: null,
  },
  capturedPhotos: [], // [{ id, imageDataUrl, avatarPlacement: {x, y, scale} }]

  setStripCount: (count) => set({ stripCount: count }),

  setAvatarItem: (category, itemId) =>
    set((state) => ({
      avatarConfig: { ...state.avatarConfig, [category]: itemId },
    })),

  addCapturedPhoto: (photo) =>
    set((state) => ({ capturedPhotos: [...state.capturedPhotos, photo] })),

  retakeLastPhoto: () =>
    set((state) => ({ capturedPhotos: state.capturedPhotos.slice(0, -1) })),

  updatePhotoAvatarPlacement: (photoId, placement) =>
    set((state) => ({
      capturedPhotos: state.capturedPhotos.map((p) =>
        p.id === photoId ? { ...p, avatarPlacement: placement } : p
      ),
    })),

  resetSession: () =>
    set({
      stripCount: null,
      avatarConfig: { hair: null, skinTone: null, accessory: null },
      capturedPhotos: [],
    }),
}));

export default useSessionStore;
