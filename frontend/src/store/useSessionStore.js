import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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


const useSessionStore = create(persist((set) => ({
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
      avatarPlacements: [],
      propPlacements: [],
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

  // Skip avatar creation entirely: no avatars exist for this session.
  // (setAvatarCount can't represent this — it always keeps a minimum of 1.)
  skipAvatars: () =>
    set({
      avatarCount: 0,
      avatars: [],
      activeAvatarIndex: 0,
      avatarConfig: createDefaultAvatar(),
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
      // Replace all captured photos at once (used by upload, or to clear them).
  setCapturedPhotos: (photos) => set({ capturedPhotos: photos }),
      // =========================
  // Polaroid decorations
  // Positions are the CENTRE point, in Polaroid-canvas pixels (1080 wide).
  // avatarIndex points into avatars[]; the same avatar can be placed
  // any number of times.
  // =========================

  avatarPlacements: [],

  addAvatarPlacement: (placement) =>
    set((state) => ({
      avatarPlacements: [...state.avatarPlacements, placement],
    })),

  updateAvatarPlacement: (id, patch) =>
    set((state) => ({
      avatarPlacements: state.avatarPlacements.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    })),

  removeAvatarPlacement: (id) =>
    set((state) => ({
      avatarPlacements: state.avatarPlacements.filter((p) => p.id !== id),
    })),

  clearAvatarPlacements: () => set({ avatarPlacements: [] }),
    propPlacements: [],

  addPropPlacement: (placement) =>
    set((state) => ({
      propPlacements: [...state.propPlacements, placement],
    })),

  updatePropPlacement: (id, patch) =>
    set((state) => ({
      propPlacements: state.propPlacements.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    })),

  removePropPlacement: (id) =>
    set((state) => ({
      propPlacements: state.propPlacements.filter((p) => p.id !== id),
    })),

  clearPropPlacements: () => set({ propPlacements: [] }),
  replaceCapturedPhoto: (index, photo) =>
    set((state) => {
      if (index < 0 || index >= state.capturedPhotos.length) {
        return state;
      }

      const capturedPhotos = [...state.capturedPhotos];
      capturedPhotos[index] = photo;

      return { capturedPhotos };
    }),

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

    resetSession: () => {
    sessionStorage.removeItem("pixibooth-session");

    set({
      stripCount: null,
      avatarPlacements: [],
      propPlacements: [],

      avatarCount: 1,

      avatars: [
        createDefaultAvatar(),
      ],

      activeAvatarIndex: 0,

      avatarView: "full",

      avatarConfig:
        createDefaultAvatar(),

      capturedPhotos: [],
    });
  },
    }),
    {
      name: "pixibooth-session",
      storage: createJSONStorage(() => sessionStorage),

      // Only persist the small stuff. capturedPhotos is excluded on
      // purpose — it's too big for sessionStorage and is handled
      // separately (IndexedDB) in a later step.
      partialize: (state) => ({
        stripCount: state.stripCount,
        avatarCount: state.avatarCount,
        avatars: state.avatars,
        activeAvatarIndex: state.activeAvatarIndex,
        avatarView: state.avatarView,
        avatarConfig: state.avatarConfig,
        avatarPlacements: state.avatarPlacements,
        propPlacements: state.propPlacements,
      }),
    }
  )
);

export default useSessionStore;