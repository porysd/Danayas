import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useTransactionStore = defineStore("transaction", {
  state: () => ({
    transactions: [],
    partially: [],
    full: [],
    voided: [],
    refund: [],
  }),

  actions: {
    // Fetch All Transaction
    async fetchTransaction() {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        this.transactions = [];
        this.partially = [];
        this.full = [];
        this.voided = [];
        this.refund = [];

        const limit = 50;
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const response = await fetch(
            `http://localhost:3000/transaction?limit=${limit}&page=${page}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );

          const transactionData = await response.json();

          if (transactionData.items && transactionData.items.length > 0) {
            this.transactions = transactionData.items;

            this.partially = transactionData.items.filter(
              (p) => p.transactionStatus === "partially-paid"
            );

            this.full = transactionData.items.filter(
              (p) => p.transactionStatus === "paid"
            );

            this.voided = transactionData.items.filter(
              (p) => p.transactionStatus === "voided"
            );

            this.refund = transactionData.items.filter(
              (p) => p.transactionStatus === "pending"
            );

            this.transactions.unshift(...transactionData.items.reverse());
            if (transactionData.length === 0) {
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

    // Add Transaction
    async addTransaction(transactions) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;
      try {
        const formatTransaction = {
          ...transactions,
          bookingId: Number(transactions.bookingId),
        };
        const response = await fetch(`http://localhost:3000/transaction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(formatTransaction),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create transactions: ${errorText}`);
        }

        const newTransactions = await response.json();
        this.transactions.push(newTransactions);

        return newTransactions;
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    },

    // Get TRANSACTION by ID
    async getTransactionById(transactionId) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      try {
        const res = await fetch(
          `http://localhost:3000/transaction/${transactionId}`,
          {
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch transaction: ${errorText}`);
        }

        const transaction = await res.json();
        return transaction;
      } catch (err) {
        console.error("Error fetching transaction by ID:", err);
        throw err;
      }
    },
  },
});
