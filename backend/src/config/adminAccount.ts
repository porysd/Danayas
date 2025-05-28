import { db } from "./database";
import { UsersTable } from "../schemas/schema.ts";
import { faker } from "@faker-js/faker";

async function createAdminAccount() {
  try {
    const adminData = {
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      contactNo: faker.phone.number(),
      address: faker.location.streetAddress(),
      email: "admin@example.com",
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
