import { sqliteTable, text, integer, check, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { UsersTable } from "./User";

export const AuditLogsTable = sqliteTable("AUDIT_LOGS", {
  auditLogId: integer("auditLogId").primaryKey({ autoIncrement: true }),
  userId: integer("userId")
    .references(() => UsersTable.userId)
    .notNull(),
  action: text("action", { enum: ["create", "read", "update", "delete", "login", "logout", "status-change", "refund-issued", "payment-verified"] }).notNull(),
  tableName: text("tableName").notNull(),
  recordId: integer("recordId").notNull(),
  data: text("data"),
  remarks: text("remarks"),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
});
