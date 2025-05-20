import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";
import { formatDate } from "../utility/dateFormat";

export const usePublicRateStore = defineStore("pubilcRateEntry", {
  state: () => ({
    rates: [],
  }),

  actions: {
    // Fetch all Rates
    async fetchAllRates() {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        this.rates = [];

        const limit = 50;
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const res = await fetch(
            `http://localhost:3000/publicentryrates?limit=${limit}&page=${page}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );

          if (!res.ok) {
            console.error("Failed to fetch rates");
            break;
          }

          const ratesData = await res.json();

          if (ratesData.items && ratesData.items.length > 0) {
            this.rates = Array.isArray(this.rates) ? this.rates : [];
            this.rates.push(...ratesData.items);

            if (ratesData.length === 0) {
              hasMoreData = false;
            } else {
              page++;
            }
          } else {
            hasMoreData = false;
          }
        }
      } catch (e) {
        console.error("Error fetching rates", e);
      }
    },
    // Add Rates
    async addRates(p) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const format = {
        ...p,
        rate: p.rate ? Number(p.price) : null,
      };

      const res = await fetch("http://localhost:3000/publicentryrates", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringfy(format),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to create rate");
      }

      const newRate = result;
      this.rates.push(newRate);

      return newRate;
    },

    // Update Rates
    async updateRates(p) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const res = await fetch(
        `http://localhost:3000/publicentryrates/${p.rateId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accesToken}`,
          },
          body: JSON.stringify(p),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update rates");
      }

      const updateRates = await res.json();
      const index = this.rates.findIndex(
        (p) => p.rateId === updateRates.rateId
      );

      if (index != -1) {
        this.rates[index] = updateRates;
      }
      await this.fetchAllRates();
    },

    //Delete Rates
    async deleteRates(p) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const res = await fetch(
        `http://localhost:3000/publicentryrates/${p.rateId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete rates");
      }
      this.rates = this.rates.filter((p) => p.rateId !== p.rateId);

      await this.fetchAllRates();
    },

    // Get Rate by Id
    async getRateById(p) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const res = await fetch(
        `http://localhost:3000/publicentryrates/${p.rateId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to get rates");
      }

      const data = await res.json();
      return data;
    },
  },
});
