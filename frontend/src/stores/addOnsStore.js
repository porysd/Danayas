import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useAddOnsStore = defineStore("addOns", {
  state: () => ({
    addOns: [],
  }),

  actions: {
    // Fetch All Add Ons
    async fetchAllAddOns() {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;
      this.addOns = [];
      const limit = 50;
      let page = 1;
      let hasMoreData = true;

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

        const format = {
          bookingId: Number(addOnDetails.bookingId),
          catalogAddOnId: Number(addOnDetails.catalogAddOnId),
        };

        const res = await fetch("http://localhost:3000/bookingaddon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(format),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to create addOn data:", errorText);
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
