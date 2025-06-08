import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";
import { formatDate } from "../utility/dateFormat";

export const useLogStore = defineStore("auditLogs", {
  state: () => ({
    logs: [],
  }),

  actions: {
    // Fetch all logs
    async fetchAllLogs() {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        this.logs = [];

        const limit = 50;
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const res = await fetch(
            `http://localhost:3000/auditLog?limit=${limit}&page=${page}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );

          if (!res.ok) {
            console.error("Failed to fetch logs");
            break;
          }

          const logsData = await res.json();

          if (logsData.items && logsData.items.length > 0) {
            this.logs = Array.isArray(this.logs) ? this.logs : [];

            this.logs.push(...logsData.items.reverse());

            if (logsData.length === 0) {
              hasMoreData = false;
            } else {
              page++;
            }
          } else {
            hasMoreData = false;
          }
        }

        this.logs.reverse();
      } catch (e) {
        console.error("Error fetching logs", e);
      }
    },
    // Get Logs by Id
    async getLogById(p) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const res = await fetch(
        `http://localhost:3000/auditLog/${p.auditLogId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to get logs");
      }

      const data = await res.json();
      return data;
    },
  },
});
