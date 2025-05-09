import { db } from "./database";
import {
  UsersTable,
  PackagesTable,
  DiscountsTable,
  BookingsTable,
  PaymentsTable,
  CatalogAddOnsTable,
  BookingAddOnsTable,
} from "../schemas/schema.ts";
import { faker } from "@faker-js/faker";
import { grantPermission } from "../utils/permissionUtils.ts";
import { eq } from "drizzle-orm";

// Seed roles
const roles = ["admin", "staff", "customer"];

export default async function seed() {
  // TODO: generate base users with permissions enabled
  for (const role of roles) {
    try {
      await db
        .insert(UsersTable)
        .values({
          username: faker.internet.username(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          contactNo: faker.phone.number(),
          address: faker.location.streetAddress(),
          email: `${role}@email.com`,
          password: await Bun.password.hash(`${role}-123`),
          role: role as any,
        })
        .execute();
    } catch (e) {
      console.error(e);
      continue;
    }
  }
  // customers
  for (let i = 0; i < 10; i++) {
    try {
      const row = await db
        .insert(UsersTable)
        .values({
          username: faker.internet.username(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          contactNo: faker.phone.number(),
          address: faker.location.streetAddress(),
          email: faker.internet.email(),
          password: await Bun.password.hash(faker.internet.password()),
          role: "customer",
        })
        .returning()
        .execute();
      await grantPermission(row[0].userId, "PACKAGES", "read");
    } catch (e) {
      console.error(e);
      continue;
    }
  }
  // packages
  for (let i = 0; i < 10; i++) {
    try {
      const row = await db
        .insert(PackagesTable)
        .values({
          description: faker.word.words(20),
          inclusion: faker.word.words(10),
          price: faker.helpers.rangeToNumber({ min: 1000, max: 12000 }),
          name: faker.commerce.productName(),
          status: faker.helpers.arrayElement([
            "active",
            "inactive",
          ]),
          imageUrl: faker.image.urlLoremFlickr(),
          isPromo: faker.datatype.boolean() ? 1 : 0,
          promoStart: faker.date.recent().toISOString(), 
          promoEnd: faker.date.soon().toISOString(),
        })
        .returning()
        .execute();
      //await grantPermission(row[0].userId, "PACKAGES", "read");
    } catch (e) {
      console.error(e);
      continue;
    }
  }
  // discounts
  // for (let i = 0; i < 100; i++) {
  //   try {
  //     const row = await db
  //       .insert(DiscountsTable)
  //       .values({
  //         name: faker.commerce.product(),
  //         percentage: faker.helpers.rangeToNumber({ min: 0.1, max: 1.0 }),
  //         typeFor: faker.helpers.arrayElement(["pwd", "student", "senior"]),
  //       })
  //       .returning()
  //       .execute();
  //     //await grantPermission(row[0].userId, "PACKAGES", "read");
  //   } catch (e) {
  //     console.error(e);
  //     continue;
  //   }
  // }

  const uniqueDiscounts: {
    typeFor: "pwd" | "student" | "senior" | "birthday";
    name: string;
    percentage: number;
    status: "active" | "inactive";
  }[] = [
    { typeFor: "pwd", name: "PWD Discount", percentage: 0.2, status: "active" },
    { typeFor: "student", name: "Student Discount", percentage: 0.15, status: "active" },
    { typeFor: "senior", name: "Senior Citizen Discount", percentage: 0.25, status: "active" },
    { typeFor: "birthday", name: "Birthday Discount", percentage: 0.1, status: "active" }
  ];

  for (const discount of uniqueDiscounts) {
    try {
      const row = await db.insert(DiscountsTable).values(discount).execute();
      // console.log(`Inserted discount for ${discount.typeFor}`);
    } catch (e) {
      console.error(e);
      continue;
    }
  }

  const customers = (
    await db.query.UsersTable.findMany({
      where: eq(UsersTable.role, "customer"),
    })
  ).map((val) => val.userId);

  const packages = (await db.query.PackagesTable.findMany()).map(
    (val) => val.packageId
  );

  const admins = (
    await db.query.UsersTable.findMany({ where: eq(UsersTable.role, "admin") })
  ).map((val) => val.userId);
  const discounts = (await db.query.DiscountsTable.findMany()).map(
    (val) => val.discountId
  );

  const discountMap = new Map(
    (await db.query.DiscountsTable.findMany()).map((d) => [
      d.discountId,
      d.percentage,
    ])
  );
  const packageMap = new Map(
    (await db.query.PackagesTable.findMany()).map((p) => [
      p.packageId,
      p.price,
    ])
  );

  for (let i = 0; i < 10; i++) {
    try {
      const selectedPackageId = faker.helpers.arrayElement(packages)
      const packagePrice = packageMap.get(selectedPackageId) || 0;

      const selectedDiscountId = faker.helpers.arrayElement(discounts);
      const discountPercent = discountMap.get(selectedDiscountId) || 0;

      const discountAmount = packagePrice * discountPercent;
      const finalAmount = packagePrice - discountAmount;


      const row = await db
        .insert(BookingsTable)
        .values({
          userId: faker.helpers.arrayElement(customers),
          createdBy: faker.helpers.arrayElement(admins),
          checkInDate: faker.date.past().toISOString(),
          checkOutDate: faker.date.future().toISOString(),
          mode: faker.helpers.arrayElement([
            "day-time",
            "night-time",
            "whole-day",
          ]),
          packageId: selectedPackageId,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          arrivalTime: faker.date.recent().toISOString(),
          eventType: faker.helpers.arrayElement([
            "wedding",
            "birthday",
            "conference",
          ]),
          numberOfGuest: faker.helpers.rangeToNumber({ min: 10, max: 500 }),
          catering: faker.helpers.rangeToNumber({ min: 0, max: 1 }),
          contactNo: faker.phone.number(),
          emailAddress: faker.internet.email(),
          address: faker.location.streetAddress(),
          discountId: selectedDiscountId,
          paymentTerms: faker.helpers.arrayElement([
            "installment",
            "full-payment",
          ]),
          totalAmount: finalAmount,
          bookStatus: faker.helpers.arrayElement([
            "pending",
            "confirmed",
            "cancelled",
            "completed",
            "rescheduled",
          ]),
          reservationType: faker.helpers.arrayElement(["online", "walk-in"]),
          createdAt: faker.date.recent().toISOString(),
        })
        .execute();
      //await grantPermission(row[0].userId, "PACKAGES", "read");
    } catch (e) {
      console.error(e);
      continue;
    }
  }

  const bookingId = (await db.query.BookingsTable.findMany()).map(
    (val) => val.bookingId
  );

  for (let i = 0; i < 10; i++) {
    try {
      const row = await db
        .insert(PaymentsTable)
        .values({
          bookingId: faker.helpers.arrayElement(bookingId),
          imageUrl: faker.image.urlLoremFlickr(),
          discountAmount: faker.helpers.rangeToNumber({ min: 0, max: 500 }),
          downpaymentAmount: faker.helpers.rangeToNumber({
            min: 1000,
            max: 2000,
          }),
          amountPaid: faker.helpers.rangeToNumber({ min: 100, max: 5000 }),
          totalAmountDue: faker.helpers.rangeToNumber({
            min: 1000,
            max: 10000,
          }),
          mode: faker.helpers.arrayElement(["gcash", "cash"]),
          reference: faker.string.uuid(),
          paymentStatus: faker.helpers.arrayElement([
            "refund",
            "partially-paid",
            "paid",
            "failed",
          ]),
          paidAt: faker.date.recent().toISOString(),
        })
        .execute();
      //await grantPermission(row[0].userId, "PACKAGES", "read");
    } catch (e) {
      console.error(e);
      continue;
    }
  }

  for(let i = 0; i < 10; i++){
    try {
      const row = await db.insert(CatalogAddOnsTable).values({
        itemName: faker.commerce.productName(),
        price: faker.helpers.rangeToNumber({ min: 100, max: 500 }),
        status: faker.helpers.arrayElement([
          "active",
          "inactive",
        ]),
        createdAt: faker.date.recent().toISOString(),
      }).execute();
    }
    catch(e){
      console.error(e);
      continue;
    }
  }
  const bookings = (await db.query.BookingsTable.findMany()).map(
    (val) => val.bookingId
  );

  const catalogAddOn = (await db.query.CatalogAddOnsTable.findMany()).map(
    (val) => val.catalogAddOnId
  );

  // BOOKING ADD ONS
  for (let i = 0; i < 10; i++) {
    try {
      const bookingId = faker.helpers.arrayElement(bookings);
      const catalogAddOnId = faker.helpers.arrayElement(catalogAddOn);

      const selectedBooking = await db
        .select({ totalAmount: BookingsTable.totalAmount })
        .from(BookingsTable)
        .where(eq(BookingsTable.bookingId, bookingId))
        .then((rows) => rows[0]);
      const selectedCatalogAddOn = await db
        .select({ price: CatalogAddOnsTable.price })
        .from(CatalogAddOnsTable)
        .where(eq(CatalogAddOnsTable.catalogAddOnId, catalogAddOnId))
        .then((rows) => rows[0]);

      const price = selectedCatalogAddOn.price;

      const updatedTotalAmount = selectedBooking.totalAmount + price;

      const row = await db.insert(BookingAddOnsTable).values({
        bookingId: bookingId,
        catalogAddOnId: catalogAddOnId,
        price: price,
        createdAt: faker.date.recent().toISOString(),
      });

      const updatedBooking = await db
        .update(BookingsTable)
        .set({ totalAmount: updatedTotalAmount })
        .where(eq(BookingsTable.bookingId, bookingId))
        .returning()
        .execute();

      
    } catch (e) {
      console.error(e);
      continue;
    }
  }
}

//Note: remove seed() when not use.
seed(); //Call this function when seeding.

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
