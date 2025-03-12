import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { User } from "./User";

export const Permission = sqliteTable("PERMISSION", {
  permissionId: integer("permissionId").notNull().primaryKey({
    autoIncrement: true,
  }),
  userId: integer("userId").references(() => User.userId),
  table: text("table").notNull(),
  action: text("action", { enum: ["create", "read", "update", "delete"] })
    .notNull(),
});

// greg - booking - create,read
// greg - booking - read
// greg - booking - write
