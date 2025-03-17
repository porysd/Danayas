// import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
// import { Booking } from './Booking';
// import { z } from 'zod';

// export const bookingAddOn = sqliteTable('BOOKING_ADD_ONS', {
//   addOnId: integer('addOnId').primaryKey({ autoIncrement: true }),
//   bookingId: integer('bookingId').references(() => Booking.bookingId).notNull(),
//   itemName: text('itemName').notNull(),
//   quantity: integer('quantity').notNull(),
//   price: real('price').notNull(),
//   totalPrice: real('totalPrice').notNull(),
// });

// // Zod Schema
// // export const BookingAddOnSchema = z.object({
// //   addOnId: z.number().int().optional(),
// //   bookingId: z.number().int(),
// //   itemName: z.string(),
// //   quantity: z.number().int(),
// //   price: z.number(),
// // });
