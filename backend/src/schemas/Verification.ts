import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./schema";
import { sql } from "drizzle-orm";

export const VerificationTable = sqliteTable("VERIFICATION", {
  verificationId: integer("verificationId").primaryKey({ autoIncrement: true }),
  userId: integer("userId")
    .references(() => UsersTable.userId)
    .notNull(),
  tokenHashed: text("tokenHashed").notNull(),
  tokenType: text("tokenType", {
    enum: ["email_verification", "password_reset"],
  }).notNull(),
  isUsed: integer("isUsed").default(0).notNull(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
  expiresAt: text("expiresAt").notNull(),
});
