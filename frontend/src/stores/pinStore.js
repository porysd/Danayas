import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";
import { formatDate } from "../utility/dateFormat";

export const usePinStore = defineStore("pin", {
  state: () => ({
    pin: [],
  }),

  actions: {
    async addPin(setPin) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const res = await fetch("http://localhost:3000/pin/set", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify(setPin),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error("failed to set pin");
      }

      const newPin = result;

      return newPin;
    },

    async verifyPin(pin) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const res = await fetch("http://localhost:3000/pin/verify", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({ pin }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error("failed to verify pin");
      }

      const newPin = result;

      return newPin;
    },
  },
});
