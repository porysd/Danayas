import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useTermsStore = defineStore("terms", {
  state: () => ({
    terms: [],
  }),
  getters: {
    getTermId: (state) => (id) => {
      return state.terms.find((trm) => trm.termsId === id);
    },
  },

  actions: {
    //Fetch All Terms
    async fetchAlltermAndCondition() {
      // const auth = useAuthStore();
      // if (!auth.isLoggedIn) return;
      try {
        this.terms = [];
        const limit = 50;
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const res = await fetch(
            `http://localhost:3000/termAndCondition?limit=${limit}&page=${page}`,
            {
              headers: {
                "Content-Type": "application/json",
                // Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );
          if (!res.ok) {
            console.error("Failed to fetch terms and conditions");
            break;
          }
          const termsData = await res.json();

          if (termsData.items && termsData.items.length > 0) {
            this.terms.push(...termsData.items);

            if (termsData.length == 0) {
              hasMoreData = false;
            } else {
              page++;
            }
          } else {
            hasMoreData = false;
          }
        }
      } catch (err) {
        console.error("Error fetching terms and conditions", err);
      }
    },

    // Add Terms
    async addTerms(termsData) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch("http://localhost:3000/termAndCondition", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(termsData),
        });
        if (!res.ok) {
          throw new Error("Failed to add Terms");
        }
        const newTerms = await res.json();
        this.terms.push(newTerms);

        await this.fetchAlltermAndCondition();
      } catch (err) {
        console.error("Error adding Terms:", err);
      }
    },
    // Update Terms
    async updateTerms(termsData) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch(
          `http://localhost:3000/termAndCondition/${termsData.termsId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify(termsData),
          }
        );
        if (!res.ok) {
          throw new Error("Failed to update terms and conditions");
        }
        const updatedTerms = await res.json();
        const index = this.terms.findIndex(
          (c) => c.termsId == updatedTerms.termsId
        );
        if (index !== -1) this.terms[index] = updatedTerms;
      } catch (err) {
        console.error("Error updating terms and condition,", err);
      }
    },

    // delete Terms
    async deleteTerms(termsData) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        console.log("Deleting termsData:", termsData);
        console.log("Deleting termsId:", termsData.termsId);
        const res = await fetch(
          `http://localhost:3000/termAndCondition/${termsData.termsId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );
        if (!res.ok) {
          console.log("Failed to delete terms and conditions");
        }
        this.terms = this.terms.filter((c) => c.termsId !== termsData.termsId);
      } catch (err) {
        console.log("Error deleting terms and condition", err);
      }
    },
  },
});
