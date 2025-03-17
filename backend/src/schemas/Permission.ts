import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "./User";

export const permissionTable = sqliteTable("permission_table", {
  permissionId: integer("permissionId").notNull().primaryKey({ autoIncrement: true }),
  userId: integer("userId").references(() => usersTable.userId),
  table: text("table").notNull(),
  action: text("action", { enum: ["create", "read", "update", "delete"] })
    .notNull()
});
