import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const usePackageStore = defineStore("package", {
  state: () => ({
    packages: [],
    promos: [],
  }),
  getters: {
    getPackageById: (state) => (id) => {
      return state.packages.find((pkg) => pkg.packageId === id);
    },
  },

  actions: {
    // Fetch All PACKAGES Only
    async fetchAllPackages() {
      // const auth = useAuthStore();
      // if (!auth.isLoggedIn) return;
      this.packages = [];
      const limit = 50;
      let page = 1;
      let hasMoreData = true;

      while (hasMoreData) {
        const res = await fetch(
          `http://localhost:3000/packages?limit=${limit}&page=${page}`,
          {
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch user packages");
          break;
        }
        const packagesData = await res.json();

        if (packagesData.items && packagesData.items.length > 0) {
          const regularPackages = packagesData.items.filter(
            (pk) => pk.isPromo === 0 || pk.isPromo === false
          );

          this.packages.push(...regularPackages);

          if (packagesData.length === 0) {
            hasMoreData = false;
          } else {
            page++;
          }
        } else {
          hasMoreData = false;
        }
      }
    },

    // Fetch All PROMOS Only
    async fetchAllPromos() {
      // const auth = useAuthStore();
      // if (!auth.isLoggedIn) return;
      this.promos = [];
      const limit = 50;
      let page = 1;
      let hasMoreData = true;

      while (hasMoreData) {
        const res = await fetch(
          `http://localhost:3000/packages?limit=${limit}&page=${page}`,
          {
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch user packages");
          break;
        }
        const packagesData = await res.json();

        if (packagesData.items && packagesData.items.length > 0) {
          const promoPackages = packagesData.items.filter(
            (pk) => pk.isPromo === 1 || pk.isPromo === true
          );

          this.promos.push(...promoPackages);

          if (packagesData.length === 0) {
            hasMoreData = false;
          } else {
            page++;
          }
        } else {
          hasMoreData = false;
        }
      }
    },

    // Add a new PACKAGE or PROMO
    async addPackage(packageT) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const formData = new FormData();
      for (const key in packageT) {
        formData.append(key, packageT[key]);
      }

      try {
        const response = await fetch("http://localhost:3000/packages", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to add package: ${errorText}`);
        }

        await this.fetchAllPackages();
        await this.fetchAllPromos();
      } catch (error) {
        console.error("Error adding package:", error);
      }
    },
    // Update a PROMO
    async updatePromo(updatedPromo) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      const updatePackage = {
        ...updatedPromo,
        isPromo: true,
        price: updatedPromo.price ? Number(updatedPromo.price) : null,
      };

      try {
        const response = await fetch(
          `http://localhost:3000/packages/${updatedPromo.packageId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify(updatePackage),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to edit package: ${errorText}`);
        }

        await this.fetchAllPromos();
      } catch (error) {
        console.error("Error editing package:", error);
      }
    },

    // Delete a PACKAGE or PROMO
    async deletePackage(packageT) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      try {
        const response = await fetch(
          `http://localhost:3000/packages/${packageT.packageId}`,
          {
            method: "DELETE",
            Authorization: `Bearer ${auth.accessToken}`,
          }
        );

        if (!response.ok) throw new Error("Failed to delete package");

        this.packages = this.packages.filter(
          (c) => c.packageId !== packageT.packageId
        );

        await this.fetchAllPackages();
        await this.fetchAllPromos();
      } catch (error) {
        console.error("Error deleting package:", error);
      }
    },

    // Get PACKAGE by ID
    async getPackageByID(packageId) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch(`http://localhost:3000/packages/${packageId}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch package");
          return;
        }

        const data = await res.json();
        return data;
      } catch (err) {
        console.error("Error fetching package", err);
      }
    },
  },
});
