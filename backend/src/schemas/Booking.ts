import { sqliteTable, text, integer, check, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { UsersTable } from './User';
import { PackagesTable } from './Packages';
import { DiscountsTable } from './Discounts';


export const BookingsTable = sqliteTable('BOOKING', {
  bookingId: integer('bookingId').primaryKey({ autoIncrement: true}),
  userId: integer('userId').references(() => UsersTable.userId).notNull(), // Admin, Staff, and Customer
  // createdBy: integer('createdBy').references(() => UsersTable.userId).notNull(), // Admin or Staff
  checkInDate: text('checkInDate').notNull(),
  checkOutDate: text('checkOutDate').notNull(),
  mode: text('mode', {enum: ['day-time', 'night-time', 'whole-day']}).notNull(),
  packageId: integer('packageId').references(() => PackagesTable.packageId).notNull(),
  firstName: text('firstName'), // Nullable for Online (Customer)
  lastName: text('lastName'), // Nullable for Online (Customer)
  arrivalTime: text('arrivalTime').notNull(),
  eventType: text('eventType').notNull(),
  numberOfGuest: integer('numberOfGuest').notNull(),
  catering: integer('catering').notNull(),
  contactNo: text('contactNo'), // Nullable for Online (Customer)
  emailAddress: text('emailAddress'), // Nullable for Online (Customer)
  address: text('address'), // Nullable for Online (Customer)
  discountId: integer('discountId').references(() => DiscountsTable.discountId), // Nullable if no discount applied
  paymentTerms: text('paymentTerms', {enum: ['installment', 'full-payment']}).notNull(),
  totalAmount: real('totalAmountDue').notNull(),
  bookStatus: text('bookStatus', {enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled']}).notNull(),
  reservationType: text('reservationType', {enum: ['online', 'walk-in']}).notNull(), // Online or Walk-in
  createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
},
);


