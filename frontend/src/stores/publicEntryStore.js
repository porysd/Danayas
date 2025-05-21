import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";
import { formatDate } from "../utility/dateFormat";

export const usePublicEntryStore = defineStore("publicEntry", {
  state: () => ({
    public: [],
    pending: [],
    reserved: [],
    rescheduled: [],
    pendingCancellation: [],
    cancelled: [],
    completed: [],
  }),

  actions: {
    // Fetch all Public Entries
    async fetchAllPublic() {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        this.public = [];
        this.pending = [];
        this.reserved = [];
        this.rescheduled = [];
        this.pendingCancellation = [];
        this.cancelled = [];
        this.completed = [];
        const limit = 50;
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const res = await fetch(
            `http://localhost:3000/publicentry?limit=${limit}&page=${page}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );

          if (!res.ok) {
            console.error("Failed to fetch public entries");
            break;
          }

          const publicData = await res.json();

          if (publicData.items && publicData.items.length > 0) {
            this.public = publicData.items;

            this.pending = publicData.items.filter(
              (publics) => publics.status === "pending"
            );
            this.reserved = publicData.items.filter(
              (publics) => publics.status === "reserved"
            );
            this.rescheduled = publicData.items.filter(
              (publics) => publics.status === "rescheduled"
            );
            this.pendingCancellation = publicData.items.filter(
              (publics) => publics.status === "pending-cancellation "
            );
            this.cancelled = publicData.items.filter(
              (publics) => publics.status === "cancelled"
            );
            this.completed = publicData.items.filter(
              (publics) => publics.status === "completed"
            );

            if (publicData.length === 0) {
              hasMoreData = false;
            } else {
              page++;
            }
          } else {
            hasMoreData = false;
          }
        }
      } catch (e) {
        console.error("Error fetching public entries", e);
      }
    },
    // Add Public
    async addPublic(p) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const role = auth.user.role;

      const formatPublic = {
        ...p,
        userId: auth.user.userId,
        discountPromoId: Number(booking.discountPromoId),
        numAdult: Number(p.numAdult),
        numKids: Number(p.numKids),
        remainingBalance: booking.remainingBalance
          ? Number(booking.remainingBalance)
          : 0,
        amountPaid: booking.amountPaid ? Number(booking.amountPaid) : 0,
        reservationType: ["admin", "staff"].includes(role)
          ? "walk-in"
          : "online",
      };

      const res = await fetch("http://localhost:3000/publicentry", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringfy(formatPublic),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to create pubic entry");
      }

      const newPublic = result;
      this.public.push(newPublic);

      return newPublic;
    },

    // Update Public
    async updatePublic(p) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const formatEntryDate = formatDate(p.entryDate);

      const res = await fetch(
        `http://localhost:3000/publicentry/${p.publicEntryId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({ entryDate: formatEntryDate }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update public");
      }

      const updatePublic = await res.json();
      const index = this.public.findIndex(
        (p) => p.publicEntryId === updatePublic.publicEntryId
      );

      if (index != -1) {
        this.public[index].entryDate = updatePublic.entryDate;
      }
      await this.fetchAllPublic();
    },

    // Update BOOKING STATUS
    async updatePublicStatus(publics) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const body = { status: publics.status };

      if (publics.status === "cancelled") {
        body.cancelCategory = publics.cancelCategory;
        if (publics.cancelCategory === "others") {
          body.cancelReason = publics.cancelReason;
        }
      }

      const res = await fetch(
        `http://localhost:3000/publicentry/${publics.publicEntryId}/status`,
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
        throw new Error("Failed to update publics status");
      }

      const updatedBooking = await res.json();
      const index = this.public.findIndex(
        (b) => b.publicEntryId === publics.publicEntryId
      );
      if (index !== -1) {
        this.public[index].bookStatus = publics.status;
      }

      await this.fetchAllPublic();
    },

    //Delete Publci
    async deletePublic(p) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const res = await fetch(
        `http://localhost:3000/publicentry/${p.publicEntryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete public");
      }
      this.public = this.public.filter(
        (p) => p.publicEntryId !== p.publicEntryId
      );

      await this.fetchAllPublic();
    },

    // Get Public by Id
    async getPublicById(p) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const res = await fetch(
        `http://localhost:3000/publicentry/${p.publicEntryId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to get public");
      }

      const data = await res.json();
      return data;
    },
  },
});
