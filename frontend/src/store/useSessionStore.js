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

  accessoryColor: "#222222",

  eyesColor: "#222222",
};


const createDefaultAvatar = () => ({
  ...defaultAvatarConfig,
});


const useSessionStore = create((set) => ({
  // =========================
  // Photo strip setup
  // =========================

  stripCount: null,

  avatarCount: 1,


  // =========================
  // Multiple saved avatars
  // =========================

  avatars: [
    createDefaultAvatar(),
  ],

  activeAvatarIndex: 0,


  // =========================
  // Currently selected avatar
  // =========================

  avatarView: "full",

  avatarConfig: createDefaultAvatar(),


  // =========================
  // Photos taken during session
  // =========================

  capturedPhotos: [],


  // =========================
  // Strip setup
  // =========================

  setStripCount: (count) =>
    set({
      stripCount: count,
    }),


  setAvatarCount: (count) =>
    set((state) => {
      const safeCount = Math.max(
        1,
        Math.min(5, Number(count) || 1)
      );

      const avatars = Array.from(
        { length: safeCount },
        (_, index) =>
          state.avatars?.[index]
            ? {
                ...state.avatars[index],
              }
            : createDefaultAvatar()
      );

      const activeIndex =
        Math.min(
          state.activeAvatarIndex || 0,
          safeCount - 1
        );

      return {
        avatarCount: safeCount,
        avatars,
        activeAvatarIndex: activeIndex,
        avatarConfig: {
          ...avatars[activeIndex],
        },
      };
    }),


  // =========================
  // Avatar selection
  // =========================

  setActiveAvatar: (index) =>
    set((state) => {
      if (
        index < 0 ||
        index >= state.avatars.length
      ) {
        return state;
      }

      return {
        activeAvatarIndex: index,

        avatarConfig: {
          ...state.avatars[index],
        },
      };
    }),


  // =========================
  // Save current avatar
  // =========================

  saveCurrentAvatar: () =>
    set((state) => {
      const avatars = [
        ...state.avatars,
      ];

      avatars[state.activeAvatarIndex] = {
        ...state.avatarConfig,
      };

      return {
        avatars,
      };
    }),


  // =========================
  // Avatar creator
  // =========================

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
      avatarConfig: createDefaultAvatar(),
      avatarView: "full",
    }),


  // =========================
  // Captured photos
  // =========================

  addCapturedPhoto: (photo) =>
    set((state) => ({
      capturedPhotos: [
        ...state.capturedPhotos,
        photo,
      ],
    })),


  retakeLastPhoto: () =>
    set((state) => ({
      capturedPhotos:
        state.capturedPhotos.slice(0, -1),
    })),


  updatePhotoAvatarPlacement: (
    photoId,
    placement
  ) =>
    set((state) => ({
      capturedPhotos:
        state.capturedPhotos.map(
          (photo) =>
            photo.id === photoId
              ? {
                  ...photo,
                  avatarPlacement:
                    placement,
                }
              : photo
        ),
    })),


  // =========================
  // Reset entire session
  // =========================

  resetSession: () =>
    set({
      stripCount: null,

      avatarCount: 1,

      avatars: [
        createDefaultAvatar(),
      ],

      activeAvatarIndex: 0,

      avatarView: "full",

      avatarConfig:
        createDefaultAvatar(),

      capturedPhotos: [],
    }),
}));


export default useSessionStore;