import { create } from "zustand";
import { api } from "../lib/api.js";
import useSessionStore from "./useSessionStore.js";

const isGuestSession =
  sessionStorage.getItem("pixibooth-guest-mode") === "true";

const savedToken = isGuestSession
  ? null
  : localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    null;

if (isGuestSession) {
  // A guest must not inherit an account's saved credentials.
  localStorage.removeItem("auth_token");
  localStorage.removeItem("token");
}

const useAuthStore = create((set, get) => ({
  user: null,
  token: savedToken,
  isAuthenticated: false,
  isGuest: isGuestSession,
  authChecked: !savedToken,
  status: "idle",
  error: null,

  login: async (email, password) => {
    set({ status: "loading", error: null });

    try {
      const { user, token } = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("auth_token", token);
      localStorage.removeItem("token");
      sessionStorage.removeItem("pixibooth-guest-mode");

      set({
        user,
        token,
        isAuthenticated: true,
        isGuest: false,
        authChecked: true,
        status: "idle",
        error: null,
      });

      return user;
    } catch (error) {
      set({
        status: "error",
        error: error.message,
      });

      throw error;
    }
  },

  signup: async (username, email, password) => {
    set({ status: "loading", error: null });

    try {
      const { user, token } = await api.post("/auth/signup", {
        username: username.trim(),
        email: email.trim(),
        password,
      });

      localStorage.setItem("auth_token", token);
      localStorage.removeItem("token");
      sessionStorage.removeItem("pixibooth-guest-mode");

      set({
        user,
        token,
        isAuthenticated: true,
        isGuest: false,
        authChecked: true,
        status: "idle",
        error: null,
      });

      return user;
    } catch (error) {
      set({
        status: "error",
        error: error.message,
      });

      throw error;
    }
  },

  continueAsGuest: () => {
    // Clear any previously signed-in account.
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token");

    // Mark this browser tab as a guest session.
    sessionStorage.setItem("pixibooth-guest-mode", "true");

    // Do not carry another user's unfinished work into guest mode.
    useSessionStore.getState().resetSession();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: true,
      authChecked: true,
      status: "idle",
      error: null,
    });
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token");
    sessionStorage.removeItem("pixibooth-guest-mode");

    useSessionStore.getState().resetSession();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
      authChecked: true,
      status: "idle",
      error: null,
    });
  },

  loadUser: async () => {
    const token = get().token;

    if (!token) {
      set({ authChecked: true });
      return;
    }

    set({ authChecked: false });

    try {
      const { user } = await api.get("/auth/me");

      // Ignore a stale response after logout or account switching.
      if (get().token !== token) return;

      set({
        user,
        isAuthenticated: true,
        isGuest: false,
        authChecked: true,
      });
    } catch (error) {
      if (get().token !== token) return;

      // Fail closed if the backend cannot verify the token.
      if (error.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("token");

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isGuest: false,
          authChecked: true,
        });

        return;
      }

      set({
        user: null,
        isAuthenticated: false,
        authChecked: true,
      });
    }
  },
}));

useAuthStore.getState().loadUser();

export default useAuthStore;