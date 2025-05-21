import {
  sqliteTable,
  text,
  integer,
  real,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { BookingsTable, UsersTable, PublicEntryTable } from "./schema";

export const RefundsTable = sqliteTable("REFUND", {
  // PRIMARY & FOREIGN KEYS
  refundId: integer("refundId").primaryKey({ autoIncrement: true }),
  bookingId: integer("bookingId").references(() => BookingsTable.bookingId),
  publicEntryId: integer("publicEntryId").references(
    () => PublicEntryTable.publicEntryId
  ),
  verifiedBy: integer("verifiedBy").references(() => UsersTable.userId),
  // REFUND DETAILS
  refundMethod: text("mode", { enum: ["gcash", "cash"] }),
  refundAmount: real("amount").notNull(),
  refundStatus: text("refundStatus", {
    enum: ["pending", "completed", "failed"],
  })
    .notNull()
    .default("pending"),
  refundReason: text("refundReason").notNull(),
  // TRANSACTION INFO
  senderName: text("senderName"),
  reference: text("reference"),
  imageUrl: text("imageUrl"),
  // STATUS & METADATA
  remarks: text("remarks"),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
});
