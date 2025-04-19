import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useAddOnsStore = defineStore("addOns", {
  state: () => ({
    addOns: [],
  }),

  actions: {
    async fetchAllAddOns() {
      this.addOns = [];
      const limit = 50;
      let page = 1;
      let hasMoreData = true;
      const auth = useAuthStore();

      while (hasMoreData) {
        const res = await fetch(
          `http://localhost:3000/bookingaddon?limit=${limit}&page=${page}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch user addOns");
          break;
        }
        const addOnsData = await res.json();

        if (addOnsData.items && addOnsData.items.length > 0) {
          this.addOns.push(...addOnsData.items);

          if (addOnsData.length === 0) {
            hasMoreData = false;
          } else {
            page++;
          }
        } else {
          hasMoreData = false;
        }
      }
    },

    // Add AddON
    async addAddOn(addOnDetails) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch("http://localhost:3000/bookingaddon ", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(addOnDetails),
        });

        if (!res.ok) {
          console.error("Failed to create addOn data");
          return;
        }

        this.addOns = await res.json();
        await this.fetchAllAddOns();
      } catch (error) {
        console.error("Error adding addOn:", error);
      }
    },
  },
});
