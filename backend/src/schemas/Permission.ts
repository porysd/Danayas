import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./User";

export const PermissionsTable = sqliteTable("permission_table", {
  permissionId: integer("permissionId").notNull().primaryKey({ autoIncrement: true }),
  userId: integer("userId").references(() => UsersTable.userId),
  table: text("table").notNull(),
  action: text("action", { enum: ["create", "read", "update", "delete"] })
    .notNull()
});
