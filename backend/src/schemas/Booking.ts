import { sqliteTable, text, integer, check, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { UsersTable } from './User';
import { PackagesTable } from './Packages';
import { DiscountsTable } from './Discounts';

export const BookingsTable = sqliteTable('BOOKING', {
  bookingId: integer('bookingId').primaryKey({ autoIncrement: true}),
  userId: integer('userId').references(() => UsersTable.userId).notNull(), // Admin, Staff, and Customer
  createdBy: integer('createdBy').references(() => UsersTable.userId).notNull(), // Admin or Staff
  checkInDate: text('checkInDate').notNull(),
  checkOutDate: text('checkOutDate').notNull(),
  mode: text('mode', {enum: ['day-time', 'night-time', 'whole-day']}).notNull(),
  packageId: integer('packageId').references(() => PackagesTable.packageId).notNull(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  arrivalTime: text('arrivalTime').notNull(),
  eventType: text('eventType').notNull(),
  numberOfGuest: integer('numberOfGuest').notNull(),
  catering: integer('catering').notNull(),
  contactNo: text('contactNo').notNull(),
  emailAddress: text('emailAddress').notNull(),
  address: text('address').notNull(),
  discountPromoId: integer('discountPromoId').references(() => DiscountsTable.discountPromoId).notNull(),
  paymentTerms: text('paymentTerms', {enum: ['installment', 'full-payment']}).notNull(),
  totalAmountDue: real('totalAmountDue').notNull(),
  bookStatus: text('bookStatus', {enum: ['pending', 'confirmed', 'cancelled', 'completed']}).notNull(),
  reservationType: text('reservationType', {enum: ['online', 'walk-in']}).notNull(), // Online or Walk-in
  createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
},
);


