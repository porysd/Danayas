import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const PublicEntryRateTable = sqliteTable("PUBLIC_ENTRY_RATE", {
  rateId: integer("rateId").primaryKey({ autoIncrement: true }),
  rate: real("rate").notNull(),
  category: text("category", { enum: ["adult", "kid"] }).notNull(),
  mode: text("mode", { enum: ["day-time", "night-time"] }).notNull(),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
});
