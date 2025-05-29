import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";
import { useBookingStore } from "./bookingStore";
import { usePublicEntryStore } from "./publicEntryStore";
import { usePaymentStore } from "./paymentStore";
import { useRefundStore } from "./refundStore";
import { filterRange } from "../utility/dateFilter.js";

export const useReportStore = defineStore("report", {
  state: () => ({
    bookings: [],
    publicEntry: [],
    payments: [],
    refunds: [],
    totalRevenue: 0,
    totalRefund: 0,
    netRevenue: 0,
  }),

  actions: {
    async fetchReportData() {
      const bookingStore = useBookingStore();
      const publicStore = usePublicEntryStore();
      const paymentStore = usePaymentStore();
      const refundStore = useRefundStore();

      await Promise.all([
        bookingStore.fetchUserBookings(),
        publicStore.fetchAllPublic(),
        paymentStore.fetchPayments(),
        refundStore.fetchRefunds(),
      ]);

      this.bookings = bookingStore.bookings;
      this.publicEntry = publicStore.public;
      this.payments = paymentStore.valid;
      this.refunds = refundStore.completed;
    },

    getTransactionByPeriod(period = "weekly") {
      const now = new Date();
      let from,
        to = now;

      switch (period) {
        case "weekly":
          from = new Date(now);
          from.setDate(now.getDate() - 7);
          break;
        case "monthly":
          from = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "annually":
          from = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          from = new Date(now);
          from.setDate(now.getDate() - 7);
      }

      const filteredPayments = this.payments.filter((p) =>
        filterRange(p.createdAt, from, to)
      );

      const filteredRefunds = this.refunds.filter((r) =>
        filterRange(r.createdAt, from, to)
      );

      const totalRevenue = filteredPayments.reduce(
        (sum, p) => sum + p.netPaidAmount,
        0
      );
      const totalRefund = filteredRefunds.reduce(
        (sum, r) => sum + r.refundAmount,
        0
      );
      const netRevenue = totalRevenue - totalRefund;

      this.payments = filteredPayments;
      this.refunds = filteredRefunds;
      this.totalRevenue = totalRevenue;
      this.totalRefund = totalRefund;
      this.netRevenue = netRevenue;
    },
  },
});
