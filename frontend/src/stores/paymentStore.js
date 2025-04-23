import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const usePaymentStore = defineStore("payment", {
  state: () => ({
    payments: [],
    payPartially: [],
    payFull: [],
    payVoided: [],
    payRefund: [],
  }),

  actions: {
    async fetchPayments() {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        this.payments = [];
        this.payPartially = [];
        this.payFull = [];
        this.payVoided = [];
        this.payRefund = [];
        const limit = 50;
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const response = await fetch(
            `http://localhost:3000/payments?limit=${limit}&page=${page}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );
          const paymentData = await response.json();

          if (paymentData.items && paymentData.items.length > 0) {
            this.payments = paymentData.items;

            this.payPartially = paymentData.items.filter(
              (p) => p.paymentStatus === "partially-paid"
            );

            this.payFull = paymentData.items.filter(
              (p) => p.paymentStatus === "paid"
            );

            this.payVoided = paymentData.items.filter(
              (p) => p.paymentStatus === "voided"
            );

            this.payRefund = paymentData.items.filter(
              (p) => p.refundStatus === "pending"
            );

            this.payments.unshift(...paymentData.items.reverse());
            if (paymentData.length === 0) {
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

    // Add PAYMENT
    async addPayment(paymentDetails) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;
      const res = await fetch("http://localhost:3000/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentDetails),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create payment: ${errorText}`);
      }

      const newPayment = await res.json();
      this.payments.push(newPayment);
      return newPayment;
    },
  },
});
