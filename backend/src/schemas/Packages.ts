import { sqliteTable, text, integer, real, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const Packages = sqliteTable("packages", {
  id: integer("id").primaryKey({autoIncrement: true}),
  name: text("name").notNull(),
  price: real("price").notNull(),
  isDiscount: integer("isDiscount").notNull(),
  discountAmount: real("discountAmount").default(0),
  description: text("description")
},
(table) => [
    check("discountCheck", sql`${table.isDiscount} in (0, 1)`)
]
);
