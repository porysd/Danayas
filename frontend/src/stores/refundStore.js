import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useRefundStore = defineStore("refund", {
  state: () => ({
    refunds: [],
    pending: [],
    completed: [],
    failed: [],
  }),

  actions: {
    // Fetch All Payments
    async fetchRefunds() {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        this.refunds = [];
        this.pending = [];
        this.completed = [];
        this.failed = [];
        const limit = 50;
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const response = await fetch(
            `http://localhost:3000/refund?limit=${limit}&page=${page}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );
          const refundData = await response.json();

          if (refundData.items && refundData.items.length > 0) {
            this.refunds = refundData.items;

            this.pending = refundData.items.filter(
              (p) => p.refundStatus === "pending"
            );

            this.completed = refundData.items.filter(
              (p) => p.refundStatus === "completed"
            );

            this.failed = refundData.items.filter(
              (p) => p.refundStatus === "failed"
            );

            this.refundData.unshift(...refundData.items.reverse());
            if (refundData.length === 0) {
              hasMoreData = false;
            } else {
              page++;
            }
          } else {
            hasMoreData = false;
          }
        }
      } catch (error) {
        console.error("Error fetching refunds:", error);
      }
    },

    // Add PAYMENT
    async addRefund(refundDetails) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;
      const res = await fetch("http://localhost:3000/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify(refundDetails),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create refund: ${errorText}`);
      }

      const newRefund = await res.json();
      this.refunds.push(newRefund);

      return newRefund;
    },

    // Update PAYMENT
    async updateRefund(refund) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;
      try {
        const response = await fetch(
          `http://localhost:3000/refund/${refund.refundId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify(refund),
          }
        );

        if (!response.ok) throw new Error("Failed to update refund");

        const index = this.refunds.findIndex(
          (p) => p.refundId === refund.refundId
        );
        if (index !== -1) {
          Object.assign(this.refunds[index], refund);
        }

        await this.fetchRefunds();
      } catch (err) {
        console.error(err);
      }
    },

    // Get PAYMENT by ID
    async getRefundById(refundId) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      try {
        const res = await fetch(`http://localhost:3000/refund/${refundId}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch refund: ${errorText}`);
        }

        const refund = await res.json();
        return refund;
      } catch (err) {
        console.error("Error fetching refund by ID:", err);
        throw err;
      }
    },
  },
});
