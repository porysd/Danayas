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
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

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

      while (hasMoreData) {
        const res = await fetch(
          `http://localhost:3000/bookings?limit=${limit}&page=${page}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch user bookings");
          break;
        }

        const bookingData = await res.json();

        if (bookingData.items && bookingData.items.length > 0) {
          this.bookings = bookingData.items;

          this.bookingPending = bookingData.items.filter(
            (booking) => booking.bookStatus === "pending"
          );
          this.bookingCancelled = bookingData.items.filter(
            (booking) => booking.bookStatus === "cancelled"
          );
          this.bookingReserved = bookingData.items.filter(
            (booking) => booking.bookStatus === "reserved"
          );
          this.bookingCancellation = bookingData.items.filter(
            (booking) => booking.bookStatus === "pending-cancellation"
          );
          this.bookingCompleted = bookingData.items.filter(
            (booking) => booking.bookStatus === "completed"
          );
          this.bookingRescheduled = bookingData.items.filter(
            (booking) => booking.bookStatus === "rescheduled"
          );

          this.bookings = bookingData.items.reverse();

          if (bookingData.length === 0) {
            hasMoreData = false;
          } else {
            page++;
          }
        } else {
          hasMoreData = false;
        }
      }
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

      const body = { bookStatus: booking.bookStatus };

      if (booking.bookStatus === "cancelled") {
        body.cancelCategory = booking.cancelCategory;
        if (booking.cancelCategory === "others") {
          body.cancelReason = booking.cancelReason;
        }
      }

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

      const formattedCheckInDate = formatDate(booking.checkInDate);
      const formattedCheckOutDate = formatDate(booking.checkOutDate);

      const res = await fetch(
        `http://localhost:3000/bookings/${booking.bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({
            checkInDate: formattedCheckInDate,
            checkOutDate: formattedCheckOutDate,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update booking dates");
      }

      const updatedBooking = await res.json();
      const index = this.bookings.findIndex(
        (b) => b.bookingId === updatedBooking.bookingId
      );
      if (index !== -1) {
        this.bookings[index].checkInDate = updatedBooking.checkInDate;
        this.bookings[index].checkOutDate = updatedBooking.checkOutDate;
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
