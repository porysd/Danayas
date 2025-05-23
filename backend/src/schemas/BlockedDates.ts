import {
  sqliteTable,
  text,
  integer,
  check,
  real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { UsersTable } from "./User";

export const BlockedDatesTable = sqliteTable("BLOCKED_DATES", {
  blockedDatesId: integer("blockedDatesId").primaryKey({ autoIncrement: true }),
  blockedDates: text("blockedDates").notNull(),
  category: text("category", {
    enum: [
      "maintenance",
      "holiday",
      "internal-use",
      "natural-disaster",
      "others",
    ],
  }).notNull(),
  others: text("others"),
  createdBy: integer("createdBy")
    .references(() => UsersTable.userId)
    .notNull(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
});
