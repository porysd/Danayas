// import { sqliteTable, text, integer, real, check } from 'drizzle-orm/sqlite-core';
// import { Booking } from './Booking';
// import { sql } from 'drizzle-orm';
// import { z } from 'zod';

// export const Payment = sqliteTable('PAYMENT', {
//   paymentId: integer('paymentId').primaryKey({ autoIncrement: true }),
//   bookingId: integer('bookingId').references(() => Booking.bookingId).notNull(),
//   discountAmount: real('discountAmount'),
//   downpaymentAmount: real('downpaymentAmount'),
//   amountPaid: real('amountPaid').notNull(),
//   totalAmountDue: real('totalAmountDue').notNull(),
//   mode: text('mode').notNull(),
//   reference: text('reference'),
//   paymentStatus: text('paymentStatus').notNull(),
//   paidAt: text('paidAt').notNull().default(sql`(current_timestamp)`),
// }, 

// (table) => [
//   check('modeCheck', sql`${table.mode} in ('gcash', 'cash')`),
//   check('paymentStatusCheck', sql`${table.paymentStatus} in ('pending', 'partially_paid', 'paid', 'failed')`)
// ]);


// // ZOD
// // export const PaymentSchema = z.object({
// //   paymentId: z.number().int().optional(),
// //   bookingId: z.number().int(),
// //   discountAmount: z.number().optional(),
// //   downpaymentAmount: z.number().optional(),
// //   amountPaid: z.number(),
// //   totalAmountDue: z.number(),
// //   mode: z.string(),
// //   reference: z.string().optional(),
// //   paymentStatus: z.enum(['pending', 'partially_paid', 'paid', 'failed']),
// // });

