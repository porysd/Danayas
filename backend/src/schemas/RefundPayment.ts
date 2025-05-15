import {
  sqliteTable,
  text,
  integer,
  real,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { RefundsTable, PaymentsTable } from "./schema";

export const RefundPaymentsTable = sqliteTable("REFUND_PAYMENT", {
    refundPaymentId: integer("refundPaymentId").primaryKey({ autoIncrement: true }),
    refundId: integer("refundId").references(() => RefundsTable.refundId).notNull(),
    paymentId: integer("paymentId").references(() => PaymentsTable.paymentId).notNull(),
    amountRefunded: real("amountRefunded").notNull(), // Amount refunded from this specific payment
    createdAt: text("createdAt").notNull().default(sql`(current_timestamp)`),
  });