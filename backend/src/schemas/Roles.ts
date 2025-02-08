import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const Role = sqliteTable("role", {
  id: integer("id").primaryKey({autoIncrement: true}),
  name: text("name").notNull().unique()
});