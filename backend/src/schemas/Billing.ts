import { sqliteTable, text, integer, real, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { User } from "./User";
import { table } from "console";

export const Billing = sqliteTable("billing", {
  id: integer("id").primaryKey({autoIncrement: true}),
  userId: integer("userId").references(() => User.id),
  total: real("total").notNull(),
  issuer: text("issuer").notNull(),
  cashierId: integer("cashierId").references(() => User.id)
},

(table) => [
    check("issuerCheck", sql`${table.issuer} in ("System", "Receptionist")`)
]

);
