// import { sqliteTable, text, integer, check, real } from 'drizzle-orm/sqlite-core';
// import { sql } from 'drizzle-orm';
// import { User } from './User';
// import { Packages } from './Packages';
// import { Discounts } from './Discounts';
// import { z } from 'zod';

// export const Booking = sqliteTable('BOOKING', {
//   bookingId: integer('bookingId').primaryKey({ autoIncrement: true}),
//   userId: integer('userId').references(() => User.userId), // Admin, Staff, and Customer
//   createdBy: integer('createdBy').references(() => User.userId), // Admin or Staff
//   checkInDate: text('checkInDate').notNull(),
//   checkOutDate: text('checkOutDate').notNull(),
//   mode: text('mode').notNull(),
//   packageId: integer('packageId').references(() => Packages.packageId).notNull(),
//   firstName: text('firstName'),
//   lastName: text('lastName'),
//   arrivalTime: text('arrivalTime').notNull(),
//   eventType: text('eventType').notNull(),
//   numberOfGuest: integer('numberOfGuest').notNull(),
//   catering: text('catering').notNull(),
//   contactNo: text('contactNo'),
//   emailAddress: text('emailAddress'),
//   address: text('address'),
//   discountPromoId: integer('discountPromoId').references(() => Discounts.discountPromoId),
//   paymentTerms: text('paymentTerms').notNull(),
//   totalAmountDue: real('totalAmountDue').notNull(),
//   bookStatus: text('bookStatus').notNull(),
//   reservationType: text('reservationType').notNull(), // Online or Walk-in
//   createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
// },

// (table) => [
//   check('modeCheck', sql`${table.mode} in ('Day', 'Night', '22 hours')`),
//   check('statusCheck', sql`${table.bookStatus} in ('Pending', 'Confirmed', 'Cancelled', 'Completed')`)
// ]);


// // ZOD
// // export const BookingSchema = z.object({
// //   bookingId: z.number().int().optional(),
// //   userId: z.number().int(),
// //   walkInId: z.number().int(),
// //   mode: z.string(),
// //   checkInDate: z.string(),
// //   checkOutDate: z.string(),
// //   bookStatus: z.enum(['pending', 'confirmed', 'canceled', 'completed']),
// //   packageId: z.number().int().optional(),
// //   baseRate: z.number().optional(),
// //   discountPromoId: z.number().int().optional(),
// //   createdBy: z.number().int().optional(),
// // });


