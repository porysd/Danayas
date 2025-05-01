import { sqliteTable, text, integer, check, real } from 'drizzle-orm/sqlite-core';
import { sql } from "drizzle-orm";
import { BookingsTable } from "./Booking";
import { PaymentsTable } from "./Payment";
import { PackagesTable } from "./Packages";
import { DiscountsTable } from "./Discounts";
import { UsersTable } from "./User";

export const TransactionsTable = sqliteTable("TRANSACTION", {
    transactionId: integer('transactionId').primaryKey({ autoIncrement: true}),
    bookingId: integer('bookingId').references(() => BookingsTable.bookingId).notNull(),
    transactionStatus: text("transactionStatus", {enum: ["partially-paid", "paid", "voided"]}).notNull(),
    refundStatus: text("refundStatus", {enum: ["none", "pending", "refunded"],}).notNull().default("none"),
    remainingBalance: real("remainingBalance").notNull(),
    createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
});