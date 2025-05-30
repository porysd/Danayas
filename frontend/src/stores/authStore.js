import { defineStore } from "pinia";

// TODO: Customer and Admin log ins (re-route)
export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    role: null,
    accessToken: null,
    refreshToken: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken,
  },

  actions: {
    setUser(userData) {
      console.log("User data set:", userData);
      this.user = userData;
      localStorage.setItem("user", JSON.stringify(userData));
    },

    setAccessToken(token) {
      this.accessToken = token;
      localStorage.setItem("accessToken", token);
    },

    setRefreshToken(token) {
      this.refreshToken = token;
      localStorage.setItem("refreshToken", token);
    },
    initializeAuth() {
      try {
        const user = localStorage.getItem("user");
        this.user = user ? JSON.parse(user) : null;
      } catch {
        this.user = null;
      }
      this.accessToken = localStorage.getItem("accessToken");
      this.refreshToken = localStorage.getItem("refreshToken");
    },

    logout() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
    reset() {
      this.logout();
    },
  },
});
