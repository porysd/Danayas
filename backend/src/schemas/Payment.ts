import { sqliteTable, text, integer, real, check } from 'drizzle-orm/sqlite-core';
import { BookingsTable } from './Booking';
import { sql } from 'drizzle-orm';

export const PaymentsTable = sqliteTable('PAYMENT', {
  paymentId: integer('paymentId').primaryKey({ autoIncrement: true }),
  bookingId: integer('bookingId').references(() => BookingsTable.bookingId).notNull(),
  imageUrl: text("imageUrl").notNull(),
  discountAmount: real('discountAmount'),
  downpaymentAmount: real('downpaymentAmount').notNull(),
  amountPaid: real('amountPaid').notNull(),
  totalAmountDue: real('totalAmountDue').notNull(),
  mode: text('mode', {enum:['gcash', 'cash']}).notNull(),
  reference: text('reference'),
  paymentStatus: text('paymentStatus', {enum:['refund', 'partially-paid', 'paid', 'failed']}).notNull().default('partially-paid'),
  paidAt: text('paidAt').notNull().default(sql`(current_timestamp)`),
}, 
)