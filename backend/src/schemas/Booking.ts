import {
  sqliteTable,
  text,
  integer,
  check,
  real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { UsersTable } from "./User";
import { PackagesTable } from "./Packages";
import { DiscountsTable } from "./Discounts";

export const BookingsTable = sqliteTable("BOOKING", {
  // PRIMARY & FOREIGN KEYS
  bookingId: integer("bookingId").primaryKey({ autoIncrement: true }),
  userId: integer("userId").references(() => UsersTable.userId).notNull(), // Admin, Staff, and Customer
  packageId: integer("packageId").references(() => PackagesTable.packageId).notNull(),
  discountId: integer("discountId").references(() => DiscountsTable.discountId), // Nullable if no discount applied
  // BOOK STATUS
  bookStatus: text("bookStatus", {enum: ["pending", "reserved", "cancelled", "completed", "rescheduled", "pending-cancellation"],}).default("pending"),
  hasRescheduled: integer("hasRescheduled").default(0),
  // BOOKING DETAILS
  checkInDate: text("checkInDate").notNull(),
  checkOutDate: text("checkOutDate").notNull(),
  mode: text("mode", {enum: ["day-time", "night-time", "whole-day"],}).notNull(),
  reservationType: text("reservationType", {enum: ["online", "walk-in"],}).notNull(),
  eventType: text("eventType"),
  numberOfGuest: integer("numberOfGuest"),
  arrivalTime: text("arrivalTime"),
  catering: integer("catering"),
  // PAYMENT INFO
  paymentTerms: text("paymentTerms", {enum: ["installment", "full-payment"],}).notNull(),
  bookingPaymentStatus: text("bookingPaymentStatus", {enum: ["paid", "partially-paid", "unpaid"],}).notNull().default("unpaid"),
  totalAmount: real("totalAmount").notNull(),
  amountPaid: real("amountPaid").notNull(),
  remainingBalance: real("remainingBalance").notNull(),
  // CANCELLATION INFO (nullable if not cancelled)
  cancelCategory: text("cancelCategory", {enum: ["natural-disaster", "others"],}),
  cancelReason: text("cancelReason"), 
  // CUSTOMER INFORMATION (nullable for online)
  firstName: text("firstName"), 
  lastName: text("lastName"), 
  contactNo: text("contactNo"), 
  emailAddress: text("emailAddress"), 
  address: text("address"), 
  // SYSTEM METADATA
  createdAt: text("createdAt").notNull().default(sql`(current_timestamp)`),
});
