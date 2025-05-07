import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const TermsAndConditionTable = sqliteTable("TERMS_AND_CONDITION", {
  termsId: integer("termsId").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`current_timestamp`),
  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`(current_timestamp)`)
    .$onUpdateFn(() => new Date().toUTCString()),
});
