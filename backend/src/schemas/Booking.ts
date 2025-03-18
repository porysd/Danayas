import { sqliteTable, text, integer, check, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { User } from './User';
import { Packages } from './Packages';
import { Discounts } from './Discounts';
import { z } from 'zod';

export const Booking = sqliteTable('BOOKING', {
  bookingId: integer('bookingId').primaryKey({ autoIncrement: true}),
  userId: integer('userId').references(() => User.userId).notNull(), // Admin, Staff, and Customer
  createdBy: integer('createdBy').references(() => User.userId).notNull(), // Admin or Staff
  checkInDate: text('checkInDate').notNull(),
  checkOutDate: text('checkOutDate').notNull(),
  mode: text('mode', {enum: ['day-time', 'night-time', 'whole-day']}).notNull(),
  packageId: integer('packageId').references(() => Packages.packageId).notNull(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  arrivalTime: text('arrivalTime').notNull(),
  eventType: text('eventType').notNull(),
  numberOfGuest: integer('numberOfGuest').notNull(),
  catering: integer('catering').notNull(),
  contactNo: text('contactNo').notNull(),
  emailAddress: text('emailAddress').notNull(),
  address: text('address').notNull(),
  discountPromoId: integer('discountPromoId').references(() => Discounts.discountPromoId).notNull(),
  paymentTerms: text('paymentTerms', {enum: ['installment', 'full-payment']}).notNull(),
  totalAmountDue: real('totalAmountDue').notNull(),
  bookStatus: text('bookStatus', {enum: ['pending', 'confirmed', 'cancelled', 'completed']}).notNull(),
  reservationType: text('reservationType', {enum: ['online', 'walk-in']}).notNull(), // Online or Walk-in
  createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
},
);


// ZOD
// export const BookingSchema = z.object({
//   bookingId: z.number().int().optional(),
//   userId: z.number().int(),
//   walkInId: z.number().int(),
//   mode: z.string(),
//   checkInDate: z.string(),
//   checkOutDate: z.string(),
//   bookStatus: z.enum(['pending', 'confirmed', 'canceled', 'completed']),
//   packageId: z.number().int().optional(),
//   baseRate: z.number().optional(),
//   discountPromoId: z.number().int().optional(),
//   createdBy: z.number().int().optional(),
// });


