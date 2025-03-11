import { sqliteTable, text, integer, real, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { Booking } from './Booking';
import { Payment } from './Payment';
import { z } from 'zod';

export const Billing = sqliteTable('BILLING', {
  billingId: integer('billingId').primaryKey({autoIncrement: true}),
  bookingId: integer('bookingId').references(() => Booking.bookingId).notNull(),
  paymentId: integer('paymentId').references(() => Payment.paymentId),
  totalAmount: real('totalAmount').notNull(),
  status: text('status').notNull(),
  createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
}, 

(table) => [
  check('statusCheck', sql`${table.status} in ('Unpaid', 'Partially Paid', 'Paid')`)
]);


// ZOD
// export const BillingSchema = z.object({
//   billingId: z.number().int().optional(),
//   bookingId: z.number().int(),
//   paymentId: z.number().int().optional(),
//   totalAmount: z.number(),
//   status: z.enum(['Unpaid', 'Partially Paid', 'Paid']),
// });
