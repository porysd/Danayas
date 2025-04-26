import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useDiscountStore = defineStore("discount", {
  state: () => ({
    discounts: [],
  }),

  actions: {
    // Fetch All DISCOUNTS
    async fetchAllDiscounts() {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;
      this.discounts = [];
      const limit = 50;
      let page = 1;
      let hasMoreData = true;

      while (hasMoreData) {
        const res = await fetch(
          `http://localhost:3000/discounts?limit=${limit}&page=${page}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch discounts");
          break;
        }
        const discountsData = await res.json();

        if (discountsData.items && discountsData.items.length > 0) {
          this.discounts.push(...discountsData.items);

          if (discountsData.length === 0) {
            hasMoreData = false;
          } else {
            page++;
          }
        } else {
          hasMoreData = false;
        }
      }
    },

    // Add Discount
    async addDiscount(discount) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;
        const formatDiscount = {
          ...discount,
          percentage: discount.percentage ? Number(discount.percentage) : null,
        };
        const res = await fetch("http://localhost:3000/discounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(formatDiscount),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to create discount: ${errorText}`);
        }

        const newDiscount = await res.json();
        this.discounts.push(newDiscount);
      } catch (error) {
        console.error("Error adding discount:", error);
        throw error;
      }
    },

    // Update Discount
    async updateDiscount(discount) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;
        const res = await fetch(
          `http://localhost:3000/discounts/${discount.discountId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify(discount),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to update discount: ${errorText}`);
        }

        const updatedDiscount = await res.json();

        const index = this.discounts.findIndex(
          (d) => d.discountId === updatedDiscount.discountId
        );
        if (index !== -1) this.discounts[index] = updatedDiscount;
      } catch (error) {
        console.error("Error updating discount:", error);
        throw error;
      }
    },

    // Delete Discount
    async deleteDiscount(discount) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;
        const res = await fetch(
          `http://localhost:3000/discounts/${discount.discountId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to delete discount: ${errorText}`);
        }

        this.discounts = this.discounts.filter(
          (d) => d.discountId !== discount.discountId
        );
        // await this.fetchAllDiscounts();
      } catch (error) {
        console.error("Error deleting discount:", error);
        throw error;
      }
    },

    // Get DISCOUNT by ID
    async getDiscountById(discountId) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch(
          `http://localhost:3000/discounts/${discountId}`,
          {
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch discounts");
          return;
        }

        const data = await res.json();
        return data;
      } catch (err) {
        console.err("Error fetching discounts", err);
      }
    },
  },
});
