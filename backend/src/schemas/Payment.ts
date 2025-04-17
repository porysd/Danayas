import { sqliteTable, text, integer, real, check } from 'drizzle-orm/sqlite-core';
import { BookingsTable } from './Booking';
import { sql } from 'drizzle-orm';

export const PaymentsTable = sqliteTable('PAYMENT', {
  paymentId: integer('paymentId').primaryKey({ autoIncrement: true }),
  bookingId: integer('bookingId').references(() => BookingsTable.bookingId).notNull(), /////
  imageUrl: text("imageUrl"), ////////
  downPaymentAmount: real('downPaymentAmount'),
  amountPaid: real('amountPaid').notNull(),
  remainingBalance: real('remainingBalance').notNull(),
  mode: text('mode', {enum:['gcash', 'cash']}).notNull(), //////////
  reference: text('reference'), ////////////
  senderName: text('senderName').notNull(), /////////////
  refundAmount: real('refundAmount'),
  paymentStatus: text('paymentStatus', {enum:['partially-paid', 'paid', 'voided']}).notNull(),
  refundStatus: text('refundStatus', {enum:['none', 'pending', 'partial', 'fullRefunded', 'cancelled']}).notNull().default('none'),
  paidAt: text('paidAt').notNull().default(sql`(current_timestamp)`),
}, 
)