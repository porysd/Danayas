import {
  sqliteTable,
  text,
  integer,
  real,
  check,
} from "drizzle-orm/sqlite-core";
import { BookingsTable } from "./Booking";
import { sql } from "drizzle-orm";
import { UsersTable } from "./User";

export const PaymentsTable = sqliteTable("PAYMENT", {
  // PRIMARY & FOREIGN KEYS
  paymentId: integer("paymentId").primaryKey({ autoIncrement: true }),
  bookingId: integer("bookingId").references(() => BookingsTable.bookingId).notNull(),
  verifiedBy: integer("verifiedBy").references(() => UsersTable.userId),
  // PAYMENT DETAILS
  paymentMethod: text("mode", { enum: ["gcash", "cash"] }).notNull(),
  tenderedAmount: real("amount").notNull(),
  changeAmount: real("changeAmount").notNull().default(0),
  netPaidAmount: real("netPaidAmount").notNull(), 
  // TRANSACTION INFO
  senderName: text("senderName").notNull(),
  reference: text("reference"),
  imageUrl: text("imageUrl"),
  // STATUS & METADATA
  paymentStatus: text("paymentStatus", {enum: ["pending","valid","invalid", "voided"]}).notNull().default("pending"),
  remarks: text("remarks"),
  createdAt: text("createdAt").notNull().default(sql`(current_timestamp)`),
});
