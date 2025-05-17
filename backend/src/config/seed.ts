import { db } from "./database";
import {
  UsersTable,
  PackagesTable,
  DiscountsTable,
  BookingsTable,
  PaymentsTable,
  CatalogAddOnsTable,
  BookingAddOnsTable,
  FaqsTable,
  TermsAndConditionTable,
} from "../schemas/schema.ts";
import { faker } from "@faker-js/faker";
import { grantPermission } from "../utils/permissionUtils.ts";
import { desc, and, ne, eq, like, or } from "drizzle-orm";

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
  const realPackages = [
    {
      name: "Teresa's Package (Events Venue)",
      inclusion:
        "- Swimming Pool\n- Tables and Chairs\n- Fully Airconditioned Events Venue (Teresa Hall)\n- Function Hall Ground Floor (Cruz Hall)",
      price: 12000,
      mode: "day-time",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 0,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Cruz Package (Package A)",
      inclusion:
        "- Swimming Pool\n- Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Nipa Hut\n- Griller\n- Kitchen Table\n- 2 Toilet and Bath",
      price: 7000,
      mode: "day-time",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 0,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Cruz Package (Package A)",
      inclusion:
        "- Swimming Pool\n- Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Nipa Hut\n- Griller\n- Kitchen Table\n- 2 Toilet and Bath",
      price: 9000,
      mode: "night-time",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 0,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Cruz Package (Package A)",
      inclusion:
        "- Swimming Pool\n- Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Nipa Hut\n- Griller\n- Kitchen Table\n- 2 Toilet and Bath",
      price: 14000,
      mode: "whole-day",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 0,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Cruz Package (Package B)",
      inclusion:
        "- Swimming Pool\n- Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Nipa Hut\n- Griller\n- Kitchen Table\n- 2 Toilet and Bath\n- Karaoke\n- 2 Airconditioned Rooms",
      price: 10000,
      mode: "day-time",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 0,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Cruz Package (Package B)",
      inclusion:
        "- Swimming Pool\n- Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Nipa Hut\n- Griller\n- Kitchen Table\n- 2 Toilet and Bath\n- Karaoke\n- 2 Airconditioned Rooms",
      price: 12000,
      mode: "night-time",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 0,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Cruz Package (Package B)",
      inclusion:
        "- Swimming Pool\n- Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Nipa Hut\n- Griller\n- Kitchen Table\n- 2 Toilet and Bath\n- Karaoke\n- 2 Airconditioned Rooms",
      price: 20000,
      mode: "whole-day",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 0,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Cruz Package (Package C - SMALL GROUP PACKAGES)",
      inclusion:
        "- Swimming Pool\n- 3 Sets Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Nipa Hut\n- Griller\n- 2 Toilet and Bath",
      price: 5000,
      mode: "day-time",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 1,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Cruz Package (Package C - SMALL GROUP PACKAGES)",
      inclusion:
        "- Swimming Pool\n- 3 Sets Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Nipa Hut\n- Griller\n- 2 Toilet and Bath",
      price: 7000,
      mode: "night-time",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 1,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Cruz Package (Package C - SMALL GROUP PACKAGES)",
      inclusion:
        "- Swimming Pool\n- 3 Sets Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Nipa Hut\n- Griller\n- 2 Toilet and Bath",
      price: 12000,
      mode: "whole-day",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 1,
      promoStart: null,
      promoEnd: null,
    },

    {
      name: "Package A (Private)",
      inclusion:
        "- Swimming Pool\n- Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Nipa Hut\n- Griller\n- 1 Airconditioned Room\n -Karaoke",
      price: 8000,
      mode: "day-time",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 1,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Package A (Private)",
      inclusion:
        "- Swimming Pool\n- Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Nipa Hut\n- Griller\n- 1 Airconditioned Room\n -Karaoke",
      price: 10000,
      mode: "night-time",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 1,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Package B (Private)",
      inclusion:
        "- Swimming Pool\n- Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Griller\n- 2 Airconditioned Room\n -Karaoke\n- 2 Toilet and Bath",
      price: 10000,
      mode: "day-time",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 1,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Package B (Private)",
      inclusion:
        "- Swimming Pool\n- Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Griller\n- 2 Airconditioned Room\n -Karaoke\n- 2 Toilet and Bath",
      price: 12000,
      mode: "day-time",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 1,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Small Package (Private)",
      inclusion:
        "- Swimming Pool\n- 5 Sets Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Griller\n -Karaoke",
      price: 6000,
      mode: "day-time",
      status: "active",
      imageUrl: "https://example.com/images/conference-package.jpg",
      isPromo: 1,
      promoStart: null,
      promoEnd: null,
    },
    {
      name: "Small Package (Private)",
      inclusion:
        "- Swimming Pool\n- 5 Sets Tables and Chairs\n- Function Hall Ground Floor (Cruz Hall)\n- Griller\n -Karaoke\n- 1 Airconditioned Room",
      price: 7500,
      mode: "night-time",
      imageUrl: "https://example.com/images/conference-package.jpg",
      status: "active",
      isPromo: 1,
      promoStart: null,
      promoEnd: null,
    },
  ] as const;
  for (const packageData of realPackages) {
    try {
      const row = await db
        .insert(PackagesTable)
        .values(packageData)
        .returning()
        .execute();
    } catch (err) {
      continue;
    }
  }

  const uniqueDiscounts: {
    typeFor: "pwd" | "student" | "senior" | "birthday";
    name: string;
    percentage: number;
    status: "active" | "inactive";
  }[] = [
    { typeFor: "pwd", name: "PWD Discount", percentage: 20, status: "active" },
    {
      typeFor: "student",
      name: "Student Discount",
      percentage: 15,
      status: "active",
    },
    {
      typeFor: "senior",
      name: "Senior Citizen Discount",
      percentage: 25,
      status: "active",
    },
    {
      typeFor: "birthday",
      name: "Birthday Discount",
      percentage: 10,
      status: "active",
    },
  ];

  for (const discount of uniqueDiscounts) {
    try {
      const row = await db.insert(DiscountsTable).values(discount).execute();
      // console.log(Inserted discount for ${discount.typeFor});
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
    (await db.query.PackagesTable.findMany()).map((p) => [p.packageId, p.price])
  );

  // BOOKINGS
  for (let i = 0; i < 10; i++) {
    try {
      const selectedUserId = faker.helpers.arrayElement(customers);

      const selectedUser = await db
        .select({
          firstName: UsersTable.firstName,
          lastName: UsersTable.lastName,
          contactNo: UsersTable.contactNo,
          email: UsersTable.email,
          address: UsersTable.address,
        })
        .from(UsersTable)
        .where(eq(UsersTable.userId, selectedUserId))
        .then((rows) => rows[0]);

      const selectedPackageId = faker.helpers.arrayElement(packages);
      const packagePrice = packageMap.get(selectedPackageId) || 0;

      const selectedDiscountId = faker.helpers.arrayElement(discounts);
      const discountPercent = discountMap.get(selectedDiscountId) || 0;

      const discountAmount = packagePrice * discountPercent / 100;
      const finalAmount = packagePrice - discountAmount;

      const row = await db
        .insert(BookingsTable)
        .values({
          userId: selectedUserId,
          packageId: selectedPackageId,
          discountId: selectedDiscountId,
          bookStatus: faker.helpers.arrayElement([
            "pending",
            // "reserved",
            // "cancelled",
            // "completed",
            // "rescheduled",
            // "pending-cancellation",
          ]),
          checkInDate: faker.date.future().toISOString().split("T")[0],
          checkOutDate: faker.date.future().toISOString().split("T")[0],
          mode: faker.helpers.arrayElement([
            "day-time",
            "night-time",
            "whole-day",
          ]),
          reservationType: faker.helpers.arrayElement(["online", "walk-in"]),
          eventType: faker.helpers.arrayElement([
            "wedding",
            "birthday",
            "conference",
          ]),
          numberOfGuest: faker.helpers.rangeToNumber({ min: 10, max: 500 }),
          arrivalTime: faker.date.recent().toISOString(),
          catering: faker.helpers.rangeToNumber({ min: 0, max: 1 }),
          paymentTerms: faker.helpers.arrayElement(["installment", "full-payment"]),
          bookingPaymentStatus: faker.helpers.arrayElement(["unpaid"]),
          totalAmount: finalAmount,
          amountPaid: 0,
          remainingBalance: finalAmount,
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          contactNo: selectedUser.contactNo,
          emailAddress: selectedUser.email,
          address: selectedUser.address,
          createdAt: faker.date.recent().toISOString(),
        })
        .execute();
    } catch (e) {
      console.error(e);
      continue;
    }
  }

  // // PAYMENTS
  // const transactionId = (await db.query.TransactionsTable.findMany()).map(
  //   (val) => val.transactionId
  // );
  const bookingId = (await db.query.BookingsTable.findMany()).map(
    (val) => val.bookingId
  );
  

  for (let i = 0; i < 10; i++) {
    try {
      const booking = faker.helpers.arrayElement(bookingId);

      // Select Booking ID from the payments table
      const selectedBookingId = await db.query.BookingsTable.findFirst({
        where: eq(BookingsTable.bookingId, booking),
      });

      const reference = faker.string.uuid();
      const imageUrl = faker.image.urlLoremFlickr();
      const senderName = faker.person.fullName();
      const paymentStatus = "valid"

      if (!selectedBookingId) {
        continue;
      }
      if(selectedBookingId.bookingPaymentStatus === "paid") {
        continue;
      }
      if(selectedBookingId.bookStatus === "cancelled") {
        continue;
      }

      // Check if latest payment is existing through bookingId
      const latestPayment = await db.query.PaymentsTable.findFirst({
        where: eq(PaymentsTable.bookingId, booking),
        orderBy: [desc(PaymentsTable.createdAt)],
      });
      const paymentMethod = faker.helpers.arrayElement(["gcash"]);
      if (latestPayment){
        if (paymentMethod === "gcash"){
          const payment = (await db
            .insert(PaymentsTable)
            .values({
              bookingId: booking,
              verifiedBy: 1,
              paymentMethod: paymentMethod,
              tenderedAmount: selectedBookingId.remainingBalance,
              changeAmount: 0,
              netPaidAmount: selectedBookingId.remainingBalance,
              senderName: senderName,
              reference: reference,
              imageUrl: imageUrl,
              paymentStatus: paymentStatus,
            })
            .returning()
            .execute())[0];
            const amountPaid = selectedBookingId.amountPaid + payment.netPaidAmount;
            const remainingBalance = selectedBookingId.remainingBalance - payment.netPaidAmount;
            const bookingPaymentStatus = remainingBalance === 0 ? "paid" : "partially-paid";

            const updatedBooking = await db
            .update(BookingsTable)
            .set({
              amountPaid: amountPaid,
              remainingBalance: remainingBalance,
              bookingPaymentStatus: bookingPaymentStatus,
              bookStatus: "reserved",
            })
            .where(eq(BookingsTable.bookingId, payment.bookingId))
            .returning()
            .execute();

        }
      }
      else{
        if(selectedBookingId.paymentTerms === "installment"){
          if (paymentMethod === "gcash"){
            const payment = (await db
              .insert(PaymentsTable)
              .values({
                bookingId: booking,
                verifiedBy: 1,
                paymentMethod: paymentMethod,
                tenderedAmount: 2000,
                changeAmount: 0,
                netPaidAmount: 2000,
                senderName: senderName,
                reference: reference,
                imageUrl: imageUrl,
                paymentStatus: paymentStatus,
              })
              .returning()
              .execute())[0];
              const amountPaid = selectedBookingId.amountPaid + payment.netPaidAmount;
              const remainingBalance = selectedBookingId.remainingBalance - payment.netPaidAmount;
              const bookingPaymentStatus = remainingBalance === 0 ? "paid" : "partially-paid";
  
              const updatedBooking = await db
              .update(BookingsTable)
              .set({
                amountPaid: amountPaid,
                remainingBalance: remainingBalance,
                bookingPaymentStatus: bookingPaymentStatus,
                bookStatus: "reserved",
              })
              .where(eq(BookingsTable.bookingId, payment.bookingId))
              .returning()
              .execute();
          }
        }
        else{
          if (paymentMethod === "gcash"){
            const payment = (await db
              .insert(PaymentsTable)
              .values({
                bookingId: booking,
                verifiedBy: 1,
                paymentMethod: paymentMethod,
                tenderedAmount: selectedBookingId.remainingBalance,
                changeAmount: 0,
                netPaidAmount: selectedBookingId.remainingBalance,
                senderName: senderName,
                reference: reference,
                imageUrl: imageUrl,
                paymentStatus: paymentStatus,
              })
              .returning()
              .execute())[0];
              const amountPaid = selectedBookingId.amountPaid + payment.netPaidAmount;
              const remainingBalance = selectedBookingId.remainingBalance - payment.netPaidAmount;
              const bookingPaymentStatus = remainingBalance === 0 ? "paid" : "partially-paid";
  
              const updatedBooking = await db
              .update(BookingsTable)
              .set({
                amountPaid: amountPaid,
                remainingBalance: remainingBalance,
                bookingPaymentStatus: bookingPaymentStatus,
                bookStatus: "reserved",
              })
              .where(eq(BookingsTable.bookingId, payment.bookingId))
              .returning()
              .execute();
          }
        }
      }

      
      




    } catch (e) {
      console.error(e);
      continue;
    }
  }

  for (let i = 0; i < 10; i++) {
    try {
      const row = await db
        .insert(CatalogAddOnsTable)
        .values({
          itemName: faker.commerce.productName(),
          price: faker.helpers.rangeToNumber({ min: 100, max: 500 }),
          status: faker.helpers.arrayElement(["active", "inactive"]),
          createdAt: faker.date.recent().toISOString(),
        })
        .execute();
    } catch (e) {
      console.error(e);
      continue;
    }
  }
  

  const catalogAddOn = (await db.query.CatalogAddOnsTable.findMany()).map(
    (val) => val.catalogAddOnId
  );

  const bookings = (await db.query.BookingsTable.findMany()).map(
    (val) => val.bookingId
  );

  // BOOKING ADD ONS
  for (let i = 0; i < 10; i++) {
    try {
      const bookingId = faker.helpers.arrayElement(bookings);
      const catalogAddOnId = faker.helpers.arrayElement(catalogAddOn);

      const latestPayment = await db.query.PaymentsTable.findFirst({
        where: eq(PaymentsTable.bookingId, bookingId),
        orderBy: [desc(PaymentsTable.createdAt)],
      });

      const selectedBooking = await db
        .select({ totalAmount: BookingsTable.totalAmount, remainingBalance: BookingsTable.remainingBalance })
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

      const updatedBookingPaymentStatus = latestPayment ? "partially-paid" : "unpaid"
      const updatedBooking = await db
        .update(BookingsTable)
        .set({
          totalAmount: updatedTotalAmount, 
          bookingPaymentStatus: updatedBookingPaymentStatus, 
          remainingBalance: selectedBooking.remainingBalance + price 
        })
        .where(eq(BookingsTable.bookingId, bookingId))
        .returning()
        .execute();
    } catch (e) {
      console.error(e);
      continue;
    }
  }

  const realFAQs = [
    {
      question: "Where is Danayas Resorts Events Venue located?",
      answer:
        "We are conveniently located in #27 Jones St. Extension Dulong Bayan 2, San Mateo Rizal. Please contact us directly or visit our Facebook page for detailed directions.",
    },
    {
      question: "What are your rates?",
      answer:
        "Rates vary depending on the event type, package, and time (Daytime, Overnight, or Whole Day). Please message us directly for updated pricing.",
    },
    {
      question: "Are pencil bookings allowed?",
      answer:
        "We do not allow pencil bookings. A reservation is only confirmed once the required down payment is made.",
    },
    {
      question: "Is a deposit required for bookings?",
      answer:
        "Yes, a reservation fee of ₱3,000 is required to secure your booking. Without a down payment, your schedule will not be confirmed.",
    },
    {
      question: "Do you offer installment payment options?",
      answer:
        "Yes. We allow a reservation fee in advance, and full payment must be made upon arrival. Any excess charges will be settled at check-out.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept GCash and cash payments. Please message us for account details or confirmation of payment methods.",
    },
    {
      question: "How can I check for available dates?",
      answer:
        "You can look for the booking calendar in the website or inquire about available dates through our Facebook page or by calling/texting our official contact number.",
    },
    {
      question: "Can I modify or cancel my reservation?",
      answer:
        "You may request to reschedule your booking subject to availability. Cancellations do not qualify for a refund unless due to a natural disaster, in which 50% of your down payment may be refunded.",
    },
    {
      question: "Can I request a refund?",
      answer:
        "As stated in our policy, all reservation fees are non-refundable. However, 50% of the fee may be refunded if the cancellation is due to a natural disaster.",
    },
    {
      question: "What are your special packages?",
      answer:
        "We offer packages for birthdays, weddings, family reunions, team buildings, and more. Each package includes various amenities depending on the package type. Message us for details and custom package options.",
    },
    {
      question: "Do you offer discounts?",
      answer: "As of now, discount are still not being offer.",
    },
    {
      question: "What amenities does the resort have?",
      answer:
        "Danayas Resorts offers swimming pools, event halls, air-conditioned rooms, karaoke, grilling areas, parking, and more. Some facilities vary depending on the package or schedule.",
    },
    {
      question: "Are pets allowed?",
      answer:
        "Pets are allowed in general areas but not in the pool premises for hygiene and safety reasons.",
    },
    {
      question: "What is your smoking policy?",
      answer:
        "Smoking is allowed only in designated areas. Please dispose of cigarette butts properly to maintain the cleanliness of the resort.",
    },
    {
      question: "What happens if I arrive late for my check-in?",
      answer:
        "We allow up to 2 days grace period after the agreed schedule. Without prior notice, the reservation will be cancelled and the down payment forfeited.",
    },
  ] as const;

  for (const faqsData of realFAQs) {
    try {
      const row = await db
        .insert(FaqsTable)
        .values(faqsData)
        .returning()
        .execute();
    } catch (err) {
      continue;
    }
  }

  // For Terms and Condition
  for (let x = 0; x < 20; x++) {
    try {
      await db
        .insert(TermsAndConditionTable)
        .values({
          content: faker.lorem.paragraph(),
          createdAt: faker.date.past().toISOString(),
          updatedAt: faker.date.recent().toISOString(),
        })
        .execute();
      console.log(`Inserted Terms and Condition #${x + 1}`);
    } catch (e) {
      console.error(`Error inserting Terms and Condition #${x + 1}:`, e);
    }
  }
}

//Note: remove seed() when not use.
seed(); //Call this function when seeding.

// TODO: generate fake payments

// // for FAQS
// for (let i = 0; i < 20; i++) {
//   try {
//     await db
//       .insert(FaqsTable)
//       .values({
//         question: faker.lorem.sentence(),
//         answer: faker.lorem.paragraph(),
//         createdAt: faker.date.past().toISOString(),
//         updatedAt: faker.date.recent().toISOString(),
//       })
//       .execute();
//   } catch (e) {
//     console.error(`Error inserting FAQ #${i + 1}:`, e);
//     continue;
//   }
// }
/* Old Code
export async function seedRoles() {
  for (const roleName of roles) {
    const existingRole = await db.select()
      .from(Role)
      .where(eq(Role.name, roleName));

    if (existingRole.length === 0) {
      await db.insert(Role).values({ name: roleName });
      console.log(Role "${roleName}" added.);
    } else {
      console.log(Role "${roleName}" already exists.);
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
//         email: ${role}@email.com,
//         password: await Bun.password.hash(${role}-123),
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
//       console.log(Role "${roleName}" added.);
//     } else {
//       console.log(Role "${roleName}" already exists.);
//     }
//   }
// }
// */
