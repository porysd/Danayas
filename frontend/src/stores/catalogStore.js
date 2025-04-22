import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useCatalogStore = defineStore("catalog", {
  state: () => ({
    catalog: [],
  }),

  actions: {
    // Fetch All CATALOG
    async fetchAllCatalogs() {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;
        this.catalog = [];
        const limit = 50;
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const res = await fetch(
            `http://localhost:3000/catalogaddon?limit=${limit}&page=${page}`,
            {
              headers: {
                "Content-Type": "application/json",
                // Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );

          if (!res.ok) {
            console.error("Failed to fetch user catalog");
            break;
          }
          const catalogData = await res.json();

          if (catalogData.items && catalogData.items.length > 0) {
            this.catalog = Array.isArray(this.catalog) ? this.catalog : [];
            this.catalog.push(...catalogData.items);

            if (catalogData.length === 0) {
              hasMoreData = false;
            } else {
              page++;
            }
          } else {
            hasMoreData = false;
          }
        }
      } catch (error) {
        console.error("Error fetching catalog:", error);
      }
    },

    // Add CATALOG
    // NOTE: NOT YET WORKING
    async addCatalog(catalogDetails) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;
        const formatCatalogAddOn = {
          ...catalogDetails,
          price: catalogDetails.price ? Number(catalogDetails.price) : null,
        };

        const res = await fetch("http://localhost:3000/catalogaddon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(formatCatalogAddOn),
        });

        if (!res.ok) {
          throw new Error("Failed to add catalog");
        }
        const newCatalog = await res.json();
        this.catalog.push(newCatalog);
      } catch (error) {
        console.error("Error adding catalog:", error);
      }
    },

    // Update CATALOG
    async updateCatalog(catalogDetails) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch(
          `http://localhost:3000/catalogaddon/${catalogDetails.catalogAddOnId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify(catalogDetails),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to update catalog");
        }

        const updatedCatalog = await res.json();
        const index = this.catalog.findIndex(
          (c) => c.catalogAddOnId === updatedCatalog.catalogAddOnId
        );
        if (index !== -1) this.catalog[index] = updatedCatalog;
      } catch (error) {
        console.error("Error updating catalog:", error);
      }
    },

    // Delete CATALOG
    async deleteCatalog(catalogDetails) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch(
          `http://localhost:3000/catalogaddon/${catalogDetails.catalogAddOnId}`,
          {
            method: "DELETE",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to delete catalog");
        }
        this.catalog = this.catalog.filter(
          (c) => c.catalogAddOnId !== catalogDetails.catalogAddOnId
        );
        // await this.fetchAllCatalogs();
      } catch (error) {
        console.error("Error deleting catalog:", error);
      }
    },
  },
});
