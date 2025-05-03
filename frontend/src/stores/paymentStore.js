import { defineStore } from "pinia";
import { useTransactionStore } from "./transactionStore";
import { useAuthStore } from "./authStore";

export const usePaymentStore = defineStore("payment", {
  state: () => ({
    payments: [],
    valid: [],
    voided: [],
  }),

  actions: {
    // Fetch All Payments
    async fetchPayments() {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        this.payments = [];
        this.valid = [];
        this.voided = [];
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

            this.valid = paymentData.items.filter(
              (p) => p.paymentStatus === "valid"
            );

            this.voided = paymentData.items.filter(
              (p) => p.paymentStatus === "voided"
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
      const transactionStore = useTransactionStore();
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;
      const res = await fetch("http://localhost:3000/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify(paymentDetails),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create payment: ${errorText}`);
      }

      const newPayment = await res.json();
      this.payments.push(newPayment);

      const transaction = transactionStore.transactions.find(
        (t) => t.transactionId === newPayment.transactionId
      );

      if (transaction) {
        transaction.paymentStatus = newPayment.paymentStatus;
        transaction.remainingBalance = newPayment.remainingBalance;
        transaction.amountPaid = newPayment.amountPaid;
      }
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
