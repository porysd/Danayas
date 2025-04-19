import { sqliteTable, text, integer, check, real } from 'drizzle-orm/sqlite-core';
import { sql } from "drizzle-orm";
import { BookingsTable } from "./Booking";
import { PaymentsTable } from "./Payment";
import { PackagesTable } from "./Packages";
import { DiscountsTable } from "./Discounts";
import { UsersTable } from "./User";

export const BillingsTable = sqliteTable("BILLING", {
    billingId: integer('billingId').primaryKey({ autoIncrement: true}),
    paymentId: integer('paymentId').references(() => PaymentsTable.paymentId).notNull(), // Payment
    checkInDate: text('checkInDate').notNull(), // Booking
    checkOutDate: text('checkOutDate').notNull(), // Booking
    mode: text('mode', {enum: ['day-time', 'night-time', 'whole-day']}).notNull(), // Booking
    arrivalTime: text('arrivalTime').notNull(), // Booking
    catering: integer('catering').notNull(), // Booking
    firstName: text('firstName'),  // Booking
    lastName: text('lastName'),  // Booking
    contactNo: text('contactNo'),  // Booking
    emailAddress: text('emailAddress'),  // Booking
    address: text('address'),  // Booking
    inclusion: text('inclusion').notNull(), // Package
    price: real('price').notNull(), // Package
    paymentTerms: text('paymentTerms', {enum: ['installment', 'full-payment']}).notNull(), // Payment
    totalAmount: real('totalAmountDue').notNull(), // Booking
    reference: text('reference'), // Payment
    imageUrl: text("imageUrl"), // Payment
    createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
});