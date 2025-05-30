import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";
import { formatDate } from "../utility/dateFormat";

export const useBlockedStore = defineStore("blockedDates", {
  state: () => ({
    blocked: [],
  }),

  actions: {
    // Fetch All blocked
    async fetchAllBlocked() {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;
      this.blocked = [];
      const limit = 50;
      let page = 1;
      let hasMoreData = true;

      while (hasMoreData) {
        const res = await fetch(
          `http://localhost:3000/blockeddates?limit=${limit}&page=${page}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch blocked dates");
          break;
        }
        const blockedData = await res.json();

        if (blockedData.items && blockedData.items.length > 0) {
          this.blocked.push(...blockedData.items);

          if (blockedData.length === 0) {
            hasMoreData = false;
          } else {
            page++;
          }
        } else {
          hasMoreData = false;
        }
      }
    },

    // Add blocked
    async addBlocked(b) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch("http://localhost:3000/blockeddates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(b),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to create blocked dates: ${errorText}`);
        }

        const newBLocked = await res.json();
        this.blocked.push(newBLocked);
      } catch (error) {
        console.error("Error adding blocked dates:", error);
        throw error;
      }
    },

    // Update Blocked
    async updateBlocked(b) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const format = formatDate(b.blockedDates);

        const res = await fetch(
          `http://localhost:3000/blockeddates/${b.blockedDatesId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify({ ...b, blockedDates: format }),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to update blocked: ${errorText}`);
        }

        const updated = await res.json();

        const index = this.blocked.findIndex(
          (d) => d.blockedDatesId === updated.blockedDatesId
        );
        if (index !== -1) this.blocked[index] = updated;
      } catch (error) {
        console.error("Error updating bloceked:", error);
        throw error;
      }
    },

    // Delete
    async deleteBlockedDates(b) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;
        const res = await fetch(
          `http://localhost:3000/blockeddates/${b.blockedDatesId}`,
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
          throw new Error(`Failed to delete blocked: ${errorText}`);
        }

        this.blocked = this.blocked.filter(
          (d) => d.blockedDatesId !== b.blockedDatesId
        );
      } catch (error) {
        console.error("Error deleting blocked:", error);
        throw error;
      }
    },

    // Get blockeddates by ID
    async getBlockedById(b) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch(`http://localhost:3000/blockeddates/${b}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch blocked");
          return;
        }

        const data = await res.json();
        return data;
      } catch (err) {
        console.err("Error fetching blocked", err);
      }
    },
  },
});
