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
  bookingId: integer("bookingId").primaryKey({ autoIncrement: true }),
  userId: integer("userId")
    .references(() => UsersTable.userId)
    .notNull(), // Admin, Staff, and Customer
  checkInDate: text("checkInDate").notNull(),
  checkOutDate: text("checkOutDate").notNull(),
  mode: text("mode", {
    enum: ["day-time", "night-time", "whole-day"],
  }).notNull(),
  packageId: integer("packageId")
    .references(() => PackagesTable.packageId)
    .notNull(),
  firstName: text("firstName"), // Nullable for Online (Customer)
  lastName: text("lastName"), // Nullable for Online (Customer)
  arrivalTime: text("arrivalTime"),
  eventType: text("eventType"),
  numberOfGuest: integer("numberOfGuest"),
  catering: integer("catering"),
  contactNo: text("contactNo"), // Nullable for Online (Customer)
  emailAddress: text("emailAddress"), // Nullable for Online (Customer)
  address: text("address"), // Nullable for Online (Customer)
  discountId: integer("discountId").references(() => DiscountsTable.discountId), // Nullable if no discount applied
  paymentTerms: text("paymentTerms", {
    enum: ["installment", "full-payment"],
  }).notNull(),
  totalAmount: real("totalAmount").notNull(),
  bookStatus: text("bookStatus", {
    enum: [
      "pending",
      "reserved",
      "cancelled",
      "completed",
      "rescheduled",
      "pending-cancellation",
    ],
  }).default("pending"),
  reservationType: text("reservationType", {
    enum: ["online", "walk-in"],
  }).notNull(), // Online or Walk-in
  cancelReason: text("cancelReason"), // Nullable
  cancelCategory: text("cancelCategory", {
    enum: ["natural-disaster", "others"],
  }), // Nullable
  hasRescheduled: integer("hasRescheduled").default(0),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
});
