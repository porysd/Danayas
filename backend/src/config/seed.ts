import { db } from "./database";
import { Role, User } from "../schemas/schema.ts";
import { faker } from "@faker-js/faker";
import { grantPermission } from "../utils/permissionUtils.ts";

// Seed roles
const roles = ["Admin", "Staff", "Customer"];

export default async function seed() {
  // TODO: generate base users with permissions enabled
  for (const role of roles) {
    try {
      await db.insert(User).values({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        contactNo: faker.phone.number(),
        address: faker.location.streetAddress(),
        email: `${role}@email.com`,
        password: await Bun.password.hash(`${role}-123`),
        role: role as any,
      }).execute();
    } catch (e) {
      console.error(e);
      continue;
    }
  }

  for (let i = 0; i < 100; i++) {
    try {
      const row = await db.insert(User).values({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        contactNo: faker.phone.number(),
        address: faker.location.streetAddress(),
        email: faker.internet.email(),
        password: await Bun.password.hash(faker.internet.password()),
        role: "customer",
      }).returning().execute();
      await grantPermission(row[0].userId, "PACKAGES", "read");
    } catch (e) {
      console.error(e);
      continue;
    }
  }
}

// TODO: generate fake customers with permissions enabled

// TODO: generate fake packages

// TODO: generate fake booking

// TODO: generate fake payments

/* Old Code
export async function seedRoles() {
  for (const roleName of roles) {
    const existingRole = await db.select()
      .from(Role)
      .where(eq(Role.name, roleName));

    if (existingRole.length === 0) {
      await db.insert(Role).values({ name: roleName });
      console.log(`Role "${roleName}" added.`);
    } else {
      console.log(`Role "${roleName}" already exists.`);
    }
  }
}
*/
