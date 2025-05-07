import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const FaqsTable = sqliteTable("FAQS", {
  faqsId: integer("faqsId").primaryKey({ autoIncrement: true }),
  question: text("Question").notNull(),
  answer: text("Answer").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`(current_timestamp)`)
    .$onUpdateFn(() => new Date().toUTCString()),
});
