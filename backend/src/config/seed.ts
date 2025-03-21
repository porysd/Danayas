
import { db } from "./database";
import { RolesTable, UsersTable, PackagesTable, DiscountsTable, BookingsTable } from "../schemas/schema.ts";
import { faker } from "@faker-js/faker";
import { grantPermission } from "../utils/permissionUtils.ts";
import { eq } from "drizzle-orm";

// Seed roles
const roles = ["admin", "staff", "customer"];

export default async function seed() {
  // TODO: generate base users with permissions enabled
  for (const role of roles) {
    try {
      await db.insert(UsersTable).values({
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
      const row = await db.insert(UsersTable).values({
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

  for (let i = 0; i < 100; i++){
    try {
      const row = await db.insert(PackagesTable).values({
        description: faker.word.words(20),
        price: faker.helpers.rangeToNumber({ min: 1000, max: 12000 }),
        name: faker.commerce.productName(),
        status: faker.helpers.arrayElement(['active', 'inactive', 'coming-soon', 'sold-out'])
      }).returning().execute();
      //await grantPermission(row[0].userId, "PACKAGES", "read");
    } catch (e) {
      console.error(e);
      continue;
    }
  }

  for (let i = 0; i < 100; i++){
    try {
      const row = await db.insert(DiscountsTable).values({
        name: faker.commerce.product(),
        percentage: faker.helpers.rangeToNumber({ min: 0.1, max: 1.0 }),
        typeFor: faker.helpers.arrayElement(['pwd', 'student', 'senior']),
      }).returning().execute();
      //await grantPermission(row[0].userId, "PACKAGES", "read");
    } catch (e) {
      console.error(e);
      continue;
    }
  }

  const customers = (await db.query.UsersTable.findMany({where: eq(UsersTable.role, "customer")})).map((val) => val.userId)
  const packages = (await db.query.PackagesTable.findMany()).map((val) => val.packageId)
  const admins = (await db.query.UsersTable.findMany({where: eq(UsersTable.role, "admin")})).map((val) => val.userId)
  const discounts = (await db.query.DiscountsTable.findMany()).map((val) => val.discountPromoId)

  for (let i = 0; i < 1000; i++){
    try {
      const row = await db.insert(BookingsTable).values({
        userId: faker.helpers.arrayElement(customers),
        createdBy: faker.helpers.arrayElement(admins),
        checkInDate: faker.date.past().toISOString(),
        checkOutDate: faker.date.future().toISOString(),
        mode: faker.helpers.arrayElement(['day-time', 'night-time', 'whole-day']),
        packageId: faker.helpers.arrayElement(packages),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        arrivalTime: faker.date.recent().toISOString(),
        eventType: faker.helpers.arrayElement(['wedding', 'birthday', 'conference']),
        numberOfGuest: faker.helpers.rangeToNumber({ min: 10, max: 500 }),
        catering: faker.helpers.rangeToNumber({ min: 0, max: 1}),
        contactNo: faker.phone.number(),
        emailAddress: faker.internet.email(),
        address: faker.location.streetAddress(),
        discountPromoId: faker.helpers.arrayElement(discounts),
        paymentTerms: faker.helpers.arrayElement(['installment', 'full-payment']),
        totalAmountDue: faker.helpers.rangeToNumber({ min: 1000, max: 10000 }),
        bookStatus: faker.helpers.arrayElement(['pending', 'confirmed', 'cancelled', 'completed']),
        reservationType: faker.helpers.arrayElement(['online', 'walk-in']),
        createdAt: faker.date.recent().toISOString()
      }).execute();
      //await grantPermission(row[0].userId, "PACKAGES", "read");
    } catch (e) {
      console.error(e);
      continue;
    }
  }
}
//Note: remove seed() when not use.
//seed() //Call this function when seeding.

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

// import { db } from "./database";
// import { rolesTable, usersTable } from "../schemas/schema.ts";
// import { faker } from "@faker-js/faker";
// import { grantPermission } from "../utils/permissionUtils.ts";

// // Seed roles
// const roles = ["admin", "staff", "customer"];

// export default async function seed() {
//   // TODO: generate base users with permissions enabled
//   for (const role of roles) {
//     try {
//       await db.insert(usersTable).values({
//         firstName: faker.person.firstName(),
//         lastName: faker.person.lastName(),
//         contactNo: faker.phone.number(),
//         address: faker.location.streetAddress(),
//         email: `${role}@email.com`,
//         password: await Bun.password.hash(`${role}-123`),
//         role: role as any,
//       }).execute();
//     } catch (e) {
//       console.error(e);
//       continue;
//     }
//   }

//   for (let i = 0; i < 100; i++) {
//     try {
//       const row = await db.insert(usersTable).values({
//         firstName: faker.person.firstName(),
//         lastName: faker.person.lastName(),
//         contactNo: faker.phone.number(),
//         address: faker.location.streetAddress(),
//         email: faker.internet.email(),
//         password: await Bun.password.hash(faker.internet.password()),
//         role: "customer",
//       }).returning().execute();
//       await grantPermission(row[0].userId, "PACKAGES", "read");
//     } catch (e) {
//       console.error(e);
//       continue;
//     }
//   }
// }
// seed();

// // TODO: generate fake customers with permissions enabled

// // TODO: generate fake packages

// // TODO: generate fake booking

// // TODO: generate fake payments

// /* Old Code
// export async function seedRoles() {
//   for (const roleName of roles) {
//     const existingRole = await db.select()
//       .from(Role)
//       .where(eq(Role.name, roleName));

//     if (existingRole.length === 0) {
//       await db.insert(Role).values({ name: roleName });
//       console.log(`Role "${roleName}" added.`);
//     } else {
//       console.log(`Role "${roleName}" already exists.`);
//     }
//   }
// }
// */
