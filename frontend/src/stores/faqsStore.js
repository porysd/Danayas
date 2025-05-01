import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useFaqsStore = defineStore("faqs", {
  state: () => ({
    faqs: [],
  }),

  actions: {
    // Fetch All FAQs
    async fetchAllFAQs() {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;
      try {
        this.faqs = [];
        const limit = 50;
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const res = await fetch(
            `http://localhost:3000/faqs?limit=${limit}&page=${page}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );

          if (!res.ok) {
            console.error("Failed to fetch user faqs");
            break;
          }
          const faqsData = await res.json();

          if (faqsData.items && faqsData.items.length > 0) {
            this.faqs.push(...faqsData.items);

            if (faqsData.length === 0) {
              hasMoreData = false;
            } else {
              page++;
            }
          } else {
            hasMoreData = false;
          }
        }
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      }
    },

    // Add FAQs
    async addFaqs(faqsData) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch("http://localhost:3000/faqs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(faqsData),
        });
        if (!res.ok) {
          throw new Error("Failed to add faqs");
        }
        const newFaqs = await res.json();
        this.faqs.push(newFaqs);

        await this.fetchAllFAQs();
      } catch (err) {
        console.error("Error adding FAQs:", err);
      }
    },

    // Update FAQs
    async updateFaqs(faqsData) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch(
          `http://localhost:3000/faqs/${faqsData.faqsId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify(faqsData),
          }
        );
        if (!res.ok) {
          throw new Error("Failed to update Faqs");
        }
        const updatedFaqs = await res.json();
        const index = this.faqs.findIndex(
          (c) => c.faqsId == updatedFaqs.faqsId
        );
        if (index !== -1) this.faqs[index] = updatedFaqs;
      } catch (err) {
        console.error("Error updating Faqs,", err);
      }
    },

    // Delete FAQs
    async deleteFaqs(faqsData) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;
        const res = await fetch(
          `http://localhost:3000/faqs/${faqsData.faqsId}`,
          {
            method: "Delete",
            headers: {
              "content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken},`,
            },
          }
        );
        if (!res.ok) {
          console.log("Failedd to delete Faqs");
        }
        this.faqs = this.faqs.filter((c) => c.faqsId !== faqsData.faqsId);
      } catch (err) {
        console.log("Error deleting faqs", err);
      }
    },

    // Get FAQs by ID
    async getFaqsById(faqsId) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch(`http://localhost:3000/faqs/${faqsId}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
        if (!res.ok) {
          console.error("Failed to fetch Faqs");
          return;
        }
        const data = await res.json();
        return data;
      } catch (err) {
        console.error("Error fetching faqs", err);
      }
    },
  },
});
