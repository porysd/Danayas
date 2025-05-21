import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { UsersTable } from "./User";
import { PublicEntryRateTable } from "./PublicEntryRate";
import { DiscountsTable } from "./Discounts";

export const PublicEntryTable = sqliteTable("PUBLIC_ENTRY", {
  publicEntryId: integer("publicEntryId").primaryKey({ autoIncrement: true }),
  userId: integer("userId")
    .references(() => UsersTable.userId)
    .notNull(),
  discountId: integer("discountId").references(() => DiscountsTable.discountId),
  // PERSONAL INFORMATION
  firstName: text("firstName"), // Nullable for Online (Customer)
  lastName: text("lastName"), // Nullable for Online (Customer)
  contactNo: text("contactNo"), // Nullable for Online (Customer)
  address: text("address"), // Nullable for Online (Customer)
  // PUBLIC BOOKING DETAILS
  entryDate: text("entryDate").notNull(),
  mode: text("mode", { enum: ["day-time", "night-time"] }).notNull(),
  reservationType: text("reservationType", {
    enum: ["online", "walk-in"],
  }).notNull(),
  numAdults: integer("numAdults").notNull(),
  numKids: integer("numKids").notNull(),
  adultGuestNames: text("adultGuestNames").notNull(),
  kidGuestNames: text("kidGuestNames").notNull(),
  status: text("status", {
    enum: [
      "pending",
      "reserved",
      "cancelled",
      "completed",
      "rescheduled",
      "pending-cancellation",
    ],
  }).default("pending"),
  // ADULT AND KID RATES
  adultRateId: integer("adultRateId")
    .references(() => PublicEntryRateTable.rateId) // Foreign Key to the PublicEntryRateTable
    .notNull(),
  kidRateId: integer("kidRateId")
    .references(() => PublicEntryRateTable.rateId) // Foreign Key to the PublicEntryRateTable
    .notNull(),
  // PAYEMENT INFO
  totalAmount: real("totalAmount").notNull(),
  amountPaid: real("amountPaid").notNull(),
  remainingBalance: real("remainingBalance").notNull(),
  publicPaymentStatus: text("publicPaymentStatus", {
    enum: ["paid", "partially-paid", "unpaid"],
  })
    .notNull()
    .default("unpaid"),
  paymentTerms: text("paymentTerms", {
    enum: ["installment", "full-payment"],
  }).notNull(),
  //CANCEL INFO
  cancelCategory: text("cancelCategory", {
    enum: ["natural-disaster", "others"],
  }),
  cancelReason: text("cancelReason"),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
});
