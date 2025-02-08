import { sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { Billing } from "./Billing";
import { Schedule } from "./Schedule";

export const BillingSchedule = sqliteTable("billing_schedule", {
  id: integer("id").primaryKey({autoIncrement: true}),
  billingId: integer("billingId").references(() => Billing.id).notNull(),
  scheduleId: integer("scheduleId").references(() => Schedule.id).notNull()
});
