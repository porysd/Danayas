import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useBillingStore = defineStore("billing", {
  state: () => ({
    billings: [],
  }),

  actions: {
    // Fetch All Billings
    async fetchBillings() {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        this.billings = [];

        const limit = 50;
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const response = await fetch(
            `http://localhost:3000/billing?limit=${limit}&page=${page}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );

          const billingData = await response.json();

          if (billingData.items && billingData.items.length > 0) {
            this.billings.unshift(...billingData.items.reverse);

            if (billingData.length === 0) {
              hasMoreData = false;
            } else {
              page++;
            }
          } else {
            hasMoreData = false;
          }
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    },

    // Add Billing
    async addBilling(billings) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;
      try {
        const response = await fetch(`http://localhost:3000/billing`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(billings),
        });

        if (!response.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to create billing: ${errorText}`);
        }

        const newBilling = await response.json();
        this.billings.push(newBilling);
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    },
  },
});
