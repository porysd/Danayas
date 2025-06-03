import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const usePaymentStore = defineStore("payment", {
  state: () => ({
    payments: [],
    pending: [],
    valid: [],
    invalid: [],
    voided: [],
  }),

  actions: {
    // Fetch All Payments
    async fetchPayments() {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        this.payments = [];
        this.pending = [];
        this.valid = [];
        this.invalid = [];
        this.voided = [];
        const limit = 50;
        let page = 1;
        let hasMoreData = true;
        let allPayments = [];

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
            allPayments = allPayments.concat(paymentData.items);
            if (paymentData.items.length < limit) {
              hasMoreData = false;
            } else {
              page++;
            }
          } else {
            hasMoreData = false;
          }
        }

        this.payments = allPayments.reverse();
        this.pending = allPayments.filter((p) => p.paymentStatus === "pending");
        this.valid = allPayments.filter((p) => p.paymentStatus === "valid");
        this.invalid = allPayments.filter((p) => p.paymentStatus === "invalid");
        this.voided = allPayments.filter((p) => p.paymentStatus === "voided");
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    },

    // Add PAYMENT
    async addPayment(paymentDetails) {
      const formData = new FormData();
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      for (const key in paymentDetails) {
        formData.append(key, paymentDetails[key]);
      }

      const res = await fetch("http://localhost:3000/payments", {
        method: "POST",
        headers: {
          // "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create payment: ${errorText}`);
      }

      const newPayment = await res.json();
      this.payments.push(newPayment);

      return newPayment;
    },

    // Update PAYMENT
    async updatePayment(payment) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;
      try {
        const response = await fetch(
          `http://localhost:3000/payments/${payment.paymentId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify(payment),
          }
        );

        if (!response.ok) throw new Error("Failed to update payment");

        const index = this.payments.findIndex(
          (p) => p.paymentId === payment.paymentId
        );
        if (index !== -1) {
          Object.assign(this.payments[index], payment);
        }

        await this.fetchPayments();
      } catch (err) {
        console.error(err);
      }
    },

    // Get PAYMENT by ID
    async getPaymentById(paymentId) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      try {
        const res = await fetch(`http://localhost:3000/payments/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch payment: ${errorText}`);
        }

        const payment = await res.json();
        return payment;
      } catch (err) {
        console.error("Error fetching payment by ID:", err);
        throw err;
      }
    },

    // Override Amount PIN is required
    async overrideAmount(payment) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      try {
        const response = await fetch(
          `http://localhost:3000/payments/${payment.paymentId}/override-tendered`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify(payment),
          }
        );

        if (!response.ok) throw new Error("Failed to override amount");

        const index = this.payments.findIndex(
          (p) => p.paymentId === payment.paymentId
        );
        if (index !== -1) {
          Object.assign(this.payments[index], payment);
        }

        await this.fetchPayments();
      } catch (err) {
        console.error(err);
      }
    },
  },
});

// Delete Payment by Id
// const deletePaymentHandler = async (payment) => {
//   try {
//     const response = await fetch(`http://localhost:3000/payments/${payment.userId}`, {
//       method: 'delete',
//     });
//     if (!response.ok) throw new Error('Failed to delete payment');
//     payment.value = payment.value.filter(c => c.userId !== payment.userId);
//   } catch (error) {
//     console.error('Error deleting payment:', error);
//   }
// };
