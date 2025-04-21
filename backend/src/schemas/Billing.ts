import { sqliteTable, text, integer, check, real } from 'drizzle-orm/sqlite-core';
import { sql } from "drizzle-orm";
import { BookingsTable } from "./Booking";
import { PaymentsTable } from "./Payment";
import { PackagesTable } from "./Packages";
import { DiscountsTable } from "./Discounts";
import { UsersTable } from "./User";

export const BillingsTable = sqliteTable("BILLING", {
    billingId: integer('billingId').primaryKey({ autoIncrement: true}),
    bookingId: integer('paymentId').references(() => BookingsTable.bookingId).notNull(),
    createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
});