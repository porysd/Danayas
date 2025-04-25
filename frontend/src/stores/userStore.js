import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [],
    // isLoggedIn: false,
  }),

  getters: {},

  actions: {
    // Fetch All USER DATA for ADMIN and STAFF
    async fetchEmployee() {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;
        this.users = [];
        const limit = 50;
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const response = await fetch(
            `http://localhost:3000/users?limit=${limit}&page=${page}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to fetch users");

          const employee = await response.json();
          if (employee.items && employee.items.length > 0) {
            const employeeData = employee.items.filter(
              (user) => user.role === "admin" || user.role === "staff"
            );

            // this.users = Array.isArray(this.users) ? this.users : [];
            this.users.push(...employeeData);

            if (employee.items.length === 0) {
              hasMoreData = false;
            } else {
              page++;
            }
          } else {
            hasMoreData = false;
          }
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    },

    // Fetch All USER DATA for CUSTOMER
    async fetchCustomer() {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;
        this.users = [];
        const limit = 50;
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const response = await fetch(
            `http://localhost:3000/users?limit=${limit}&page=${page}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to fetch users");

          const customer = await response.json();
          if (customer.items && customer.items.length > 0) {
            const regularUsers = customer.items.filter(
              (user) => user.role === "customer"
            );

            // this.users = Array.isArray(this.users) ? this.users : [];
            this.users.push(...regularUsers);

            if (customer.items.length === 0) {
              hasMoreData = false;
            } else {
              page++;
            }
          } else {
            hasMoreData = false;
          }
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    },

    // Fetch User by ID
    async getUserById(user) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        // Check if userId is provided
        if (!user || !user.userId) {
          console.error("User ID is missing");
          return;
        }

        const res = await fetch(`http://localhost:3000/users/${user.userId}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch user data");
          return;
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },

    // Add EMPLOYEE DATA
    async addEmployee(employeeDetails) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(employeeDetails),
        });

        if (!res.ok) {
          console.error("Failed to create user data");
          return;
        }

        this.users = await res.json();
        await this.fetchEmployee();
      } catch (error) {
        console.error("Error adding employee:", error);
      }
    },

    // Add CUSTOMER DATA
    async addCustomer(customerDetails) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(customerDetails),
        });

        if (!res.ok) {
          console.error("Failed to create user data");
          return;
        }

        this.users = await res.json();
        await this.fetchCustomer();
      } catch (error) {
        console.error("Error adding customer:", error);
      }
    },

    // Change Employee Role
    async changeRole(employee) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;
        const res = await fetch(
          `http://localhost:3000/users/${employee.userId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify(employee),
          }
        );
        if (!res.ok) throw new Error("Failed to change role");
        await this.fetchEmployee();
      } catch (error) {
        console.error("Error changing role:", error);
      }
    },

    // Disable USER ACCOUNT
    async disableUser(user) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;
        const res = await fetch(
          `http://localhost:3000/users/disable/${user.userId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );
        if (!res.ok) {
          console.error("Failed to create user data");
          return;
        }

        if (user.role === "customer") {
          await this.fetchCustomer();
        } else {
          await this.fetchEmployee();
        }
      } catch (error) {
        console.error("Error disabling user:", error);
      }
    },
    // Enable USER ACCOUNT
    async enableUser(user) {
      try {
        const auth = useAuthStore();
        if (!auth.isLoggedIn) return;

        const res = await fetch(
          `http://localhost:3000/users/enable/${user.userId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to enable user");
          return;
        }

        if (user.role === "customer") {
          await this.fetchCustomer();
        } else {
          await this.fetchEmployee();
        }
      } catch (error) {
        console.error("Error enabling user:", error);
      }
    },
  },
});
