// stores/bookingStore.js
import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";
import { formatDate } from "../utility/dateFormat";

export const useBookingStore = defineStore("booking", {
  state: () => ({
    bookings: [],
    // onlineBooking: [],
    // walkInBooking: [],
    bookingPending: [],
    bookingReserved: [],
    bookingRescheduled: [],
    bookingCancellation: [],
    bookingCancelled: [],
    bookingCompleted: [],
  }),

  actions: {
    // Fetch All BOOKINGS
    async fetchUserBookings() {
      // const auth = useAuthStore();
      // if (!auth.isLoggedIn) return;

      this.bookings = [];
      this.bookingPending = [];
      this.bookingReserved = [];
      this.bookingRescheduled = [];
      this.bookingCancellation = [];
      this.bookingCancelled = [];
      this.bookingCompleted = [];
      const limit = 50;
      let page = 1;
      let hasMoreData = true;
      let allBookings = [];

      while (hasMoreData) {
        const res = await fetch(
          `http://localhost:3000/bookings?limit=${limit}&page=${page}`,
          {
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch user bookings");
          break;
        }

        const bookingData = await res.json();

        if (bookingData.items && bookingData.items.length > 0) {
          allBookings = allBookings.concat(bookingData.items);
          if (bookingData.items.length < limit) {
            hasMoreData = false;
          } else {
            page++;
          }
        } else {
          hasMoreData = false;
        }
      }

      // After the loop, update all arrays ONCE
      this.bookings = allBookings.reverse();
      this.bookingPending = allBookings.filter(
        (b) => b.bookStatus === "pending"
      );
      this.bookingReserved = allBookings.filter(
        (b) => b.bookStatus === "reserved"
      );
      this.bookingRescheduled = allBookings.filter(
        (b) => b.bookStatus === "rescheduled"
      );
      this.bookingCancellation = allBookings.filter(
        (b) => b.bookStatus === "pending-cancellation"
      );
      this.bookingCancelled = allBookings.filter(
        (b) => b.bookStatus === "cancelled"
      );
      this.bookingCompleted = allBookings.filter(
        (b) => b.bookStatus === "completed"
      );
    },

    // Add BOOKING
    async addBooking(booking) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const role = auth.user.role;

      const formattedBooking = {
        ...booking,
        // userId: booking.userId ? Number(booking.userId) : null,
        userId: auth.user.userId,
        packageId: Number(booking.packageId),
        checkInDate: formatDate(booking.checkInDate),
        checkOutDate: formatDate(booking.checkOutDate),
        numberOfGuest: Number(booking.numberOfGuest),
        discountId: Number(booking.discountId),
        remainingBalance: booking.remainingBalance
          ? Number(booking.remainingBalance)
          : 0,
        amountPaid: booking.amountPaid ? Number(booking.amountPaid) : 0,
        catering:
          booking.catering === "true"
            ? true
            : booking.catering === "false"
            ? false
            : Boolean(booking.catering),
        reservationType: ["admin", "staff"].includes(role)
          ? "walk-in"
          : "online",
      };

      const res = await fetch("http://localhost:3000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify(formattedBooking),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to create booking");
      }

      const newBooking = result;
      this.bookings.push(newBooking);

      return newBooking;
    },

    // Update BOOKING STATUS
    async updateBookingStatus(booking) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const body = {
        bookStatus: booking.bookStatus,
        cancelCategory: booking.cancelCategory,
        cancelReason: booking.cancelReason,
        refundMethod: booking.refundMethod || null,
        receiveName: booking.receiveName || null,
      };

      // if (booking.bookStatus === "cancelled") {
      //   body.cancelCategory = booking.cancelCategory;
      //   if (booking.cancelCategory === "others") {
      //     body.cancelReason = booking.cancelReason;
      //   }
      // }

      const res = await fetch(
        `http://localhost:3000/bookings/${booking.bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const errorDetails = await res.text(); // Get response text for error details
        console.error("Error response from backend:", errorDetails);
        throw new Error("Failed to update booking status");
      }

      const updatedBooking = await res.json();
      const index = this.bookings.findIndex(
        (b) => b.bookingId === booking.bookingId
      );
      if (index !== -1) {
        this.bookings[index].bookStatus = booking.bookStatus;
      }

      await this.fetchUserBookings();
    },

    // Update BOOKING DATES
    async updateBookingDates(booking) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const body = {
        checkInDate: formatDate(booking.checkInDate),
        checkOutDate: formatDate(booking.checkOutDate),
        numberOfGuest: Number(booking.numberOfGuest),
      };

      const res = await fetch(
        `http://localhost:3000/bookings/${booking.bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update booking dates");
      }

      const updatedBooking = await res.json();
      const bookingData = updatedBooking.updatedBooking || updatedBooking;
      const index = this.bookings.findIndex(
        (b) => b.bookingId === bookingData.bookingId
      );
      if (index !== -1) {
        this.bookings[index] = { ...this.bookings[index], ...bookingData };
      }
      await this.fetchUserBookings();
    },

    //Delete BOOKING
    async deleteBooking(bookingId) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const res = await fetch(`http://localhost:3000/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete booking");
      }

      this.bookings = this.bookings.filter((b) => b.bookingId !== bookingId);
    },

    // Get BOOKING by ID
    async getBookingById(bookingId) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      try {
        const res = await fetch(`http://localhost:3000/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch booking: ${errorText}`);
        }

        const booking = await res.json();
        return booking;
      } catch (err) {
        console.error("Error fetching booking by ID:", err);
        throw err;
      }
    },
  },
});
