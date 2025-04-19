import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: (() => {
      const stored = localStorage.getItem("user");
      try {
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    })(),
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
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

    logout() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});
