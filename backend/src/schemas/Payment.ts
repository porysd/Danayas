import {
  sqliteTable,
  text,
  integer,
  real,
  check,
} from "drizzle-orm/sqlite-core";
import { BookingsTable } from "./Booking";
import { sql } from "drizzle-orm";
import { TransactionsTable } from "./Transaction";

export const PaymentsTable = sqliteTable("PAYMENT", {
  paymentId: integer("paymentId").primaryKey({ autoIncrement: true }),
  transactionId: integer("transactionId").references(() => TransactionsTable.transactionId).notNull(),
  imageUrl: text("imageUrl"),
  downPaymentAmount: real("downPaymentAmount"),
  amountPaid: real("amountPaid").notNull(),
  category: text("category", { enum: ["payment", "refund"] }).notNull(),
  mode: text("mode", { enum: ["gcash", "cash"] }).notNull(),
  reference: text("reference"),
  senderName: text("senderName").notNull(),
  paymentStatus: text("paymentStatus", {enum: ["valid", "voided"]}).notNull().default("valid"),
  paidAt: text("paidAt").notNull().default(sql`(current_timestamp)`),
});
