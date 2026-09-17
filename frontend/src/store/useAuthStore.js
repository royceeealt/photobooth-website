import { create } from "zustand";
import { api } from "../lib/api.js";

// Zustand store for auth state. Token persisted to localStorage so refresh
// doesn't kick the user back to login.
const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("auth_token") || null,
  isAuthenticated: !!localStorage.getItem("auth_token"),
  status: "idle", // idle | loading | error
  error: null,

  login: async (email, password) => {
    set({ status: "loading", error: null });
    try {
      // TODO: hit POST /api/auth/login
      const { user, token } = await api.post("/auth/login", { email, password });
      localStorage.setItem("auth_token", token);
      set({ user, token, isAuthenticated: true, status: "idle" });
    } catch (err) {
      set({ status: "error", error: err.message });
      throw err;
    }
  },

  signup: async (username, email, password) => {
    set({ status: "loading", error: null });
    try {
      // TODO: hit POST /api/auth/signup
      const { user, token } = await api.post("/auth/signup", { username, email, password });
      localStorage.setItem("auth_token", token);
      set({ user, token, isAuthenticated: true, status: "idle" });
    } catch (err) {
      set({ status: "error", error: err.message });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
