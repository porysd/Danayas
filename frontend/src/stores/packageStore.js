import { defineStore } from "pinia";

export const usePackageStore = defineStore("package", {
  state: () => ({
    packages: [],
    promos: [],
  }),

  actions: {
    // Fetch All PACKAGES Only
    async fetchAllPackages() {
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
              //   Authorization: `Bearer ${auth.accessToken}`,
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
            (pk) => pk.isPromo === 0
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
              //   Authorization: `Bearer ${auth.accessToken}`,
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
            (pk) => pk.isPromo === 1
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
      const formatPackage = {
        ...packageT,
        price: packageT.price ? Number(packageT.price) : null,
      };

      try {
        const response = await fetch("http://localhost:3000/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formatPackage),
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

    // Update a PACKAGE
    async updatePackage(updatedPackage) {
      const updatePackage = {
        ...updatedPackage,
        isPromo: false,
        promoStart: null,
        promoEnd: null,
        price: updatedPackage.price ? Number(updatedPackage.price) : null,
      };

      try {
        const response = await fetch(
          `http://localhost:3000/packages/${updatedPackage.packageId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatePackage),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to edit package: ${errorText}`);
        }

        await this.fetchAllPackages();
      } catch (error) {
        console.error("Error editing package:", error);
      }
    },

    // Update a PROMO
    async updatePromo(updatedPromo) {
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
      try {
        const response = await fetch(
          `http://localhost:3000/packages/${packageT.packageId}`,
          {
            method: "DELETE",
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
  },
});
