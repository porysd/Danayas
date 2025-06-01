import { db } from "./database";
import { UsersTable } from "../schemas/schema.ts";
import { faker } from "@faker-js/faker";

async function createAdminAccount() {
  try {
    const adminData = {
      username: "admin",
      firstName: "Danayas",
      lastName: "Resorts",
      contactNo: "+63 991 216 6870",
      address: "#27 Daang Tubo, San Mateo, 1850 Rizal",
      email: "admin@gmail.com",
      password: await Bun.password.hash("admin123"),
      role: "admin" as const,
      pin: await Bun.password.hash("123456"),
    };

    // Insert into the database
    const result = await db
      .insert(UsersTable)
      .values(adminData)
      .returning()
      .execute();
  } catch (error) {
    console.error("Error creating admin account:", error);
  }
}

createAdminAccount();
