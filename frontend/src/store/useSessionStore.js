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
  avatarCount: 1,

// Character creator
avatarView: "full",
avatarConfig: defaultAvatarConfig,

// Multiple avatars for the session
avatars: [
  { ...defaultAvatarConfig }
],
activeAvatarIndex: 0,

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
  set((state) => {
    const avatars = Array.from(
      { length: count },
      (_, index) =>
        state.avatars?.[index]
          ? { ...state.avatars[index] }
          : { ...defaultAvatarConfig }
    );

    return {
      avatarCount: count,
      avatars,
      activeAvatarIndex: 0,
      avatarConfig: { ...avatars[0] },
    };
  }),
    setActiveAvatar: (index) =>
  set((state) => {
    const avatar =
      state.avatars?.[index] || { ...defaultAvatarConfig };

    return {
      activeAvatarIndex: index,
      avatarConfig: { ...avatar },
    };
  }),

saveCurrentAvatar: () =>
  set((state) => {
    const avatars = [...state.avatars];

    avatars[state.activeAvatarIndex] = {
      ...state.avatarConfig,
    };

    return {
      avatars,
    };
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
    avatars: [
      { ...defaultAvatarConfig }
    ],
    activeAvatarIndex: 0,
    capturedPhotos: [],
  }),
}));

export default useSessionStore;