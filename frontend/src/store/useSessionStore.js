import { create } from "zustand";

const defaultAvatarConfig = {
  body: "body_01",
  skinTone: null,
  hair: null,
  eyebrows: null,
  eyes: null,
  nose: null,
  lips: null,
  top: null,
  bottom: null,
  dresses: null,
  footwear: null,
  facialAccessories: null,
  accessories: null,

  // Custom sprite colours
  skinColor: "#B97856",
  hairColor: "#222222",
  topColor: "#B0B0B0",
  bottomColor: "#B0B0B0",
  lipsColor: "#B05A78",
  footwearColor: "#222222",
};

const useSessionStore = create((set) => ({
  // Photo strip setup
  stripCount: null,
  avatarCount: 1,

  // Character creator
  avatarView: "full",

  avatarConfig: defaultAvatarConfig,

  // Photos taken during the session
  capturedPhotos: [],

  // -------------------------
  // Strip setup
  // -------------------------

  setStripCount: (count) =>
    set({
      stripCount: count,
    }),

  setAvatarCount: (count) =>
    set({
      avatarCount: count,
    }),

  // -------------------------
  // Avatar creator
  // -------------------------

  setAvatarView: (view) =>
    set({
      avatarView: view,
    }),

  setAvatarItem: (category, itemId) =>
    set((state) => ({
      avatarConfig: {
        ...state.avatarConfig,
        [category]: itemId,
      },
    })),
    
  setAvatarColor: (category, color) =>
    set((state) => ({
      avatarConfig: {
        ...state.avatarConfig,
        [category]: color,
      },
    })),

  setAvatarDrawing: (drawing) =>
    set((state) => ({
      avatarConfig: {
        ...state.avatarConfig,
        drawing,
      },
    })),

  resetAvatar: () =>
    set({
      avatarConfig: { ...defaultAvatarConfig },
      avatarView: "full",
    }),

  // -------------------------
  // Captured photos
  // -------------------------

  addCapturedPhoto: (photo) =>
    set((state) => ({
      capturedPhotos: [
        ...state.capturedPhotos,
        photo,
      ],
    })),

  retakeLastPhoto: () =>
    set((state) => ({
      capturedPhotos: state.capturedPhotos.slice(0, -1),
    })),

  updatePhotoAvatarPlacement: (photoId, placement) =>
    set((state) => ({
      capturedPhotos: state.capturedPhotos.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              avatarPlacement: placement,
            }
          : photo
      ),
    })),

  // -------------------------
  // Reset entire session
  // -------------------------

  resetSession: () =>
    set({
      stripCount: null,
      avatarCount: 1,
      avatarView: "full",
      avatarConfig: { ...defaultAvatarConfig },
      capturedPhotos: [],
    }),
}));

export default useSessionStore;