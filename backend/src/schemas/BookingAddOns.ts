// import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
// import { BookingsTable } from './Booking';


// export const bookingAddOn = sqliteTable('BOOKING_ADD_ONS', {
//   addOnId: integer('addOnId').primaryKey({ autoIncrement: true }),
//   bookingId: integer('bookingId').references(() => BookingsTable.bookingId).notNull(),
//   itemName: text('itemName').notNull(), // Airconditioned Room, Extra Chairs, Nipa Hut, etc.
//   quantity: integer('quantity').notNull(),
//   price: real('price').notNull(),
//   totalPrice: real('totalPrice').notNull(),
//   status: text('status').notNull() // active, inactive
// });

// // Zod Schema
// // export const BookingAddOnSchema = z.object({
// //   addOnId: z.number().int().optional(),
// //   bookingId: z.number().int(),
// //   itemName: z.string(),
// //   quantity: z.number().int(),
// //   price: z.number(),
// // });
