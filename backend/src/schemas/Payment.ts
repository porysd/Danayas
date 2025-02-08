import { sqliteTable, text, integer, real, check } from "drizzle-orm/sqlite-core";
import { User } from "./User";
import { Packages } from "./Packages";
import { sql } from "drizzle-orm";

export const Payment = sqliteTable("payment", {
  id: integer("id").primaryKey({autoIncrement: true}),
  userId: integer("userId").references(() => User.id),
  amount: real("amount").notNull(),
  isDiscount: integer("isDiscount").notNull(),
  packageId: integer("packageId").references(() => Packages.id),
  mode: text("mode").notNull(),
  reference: text("reference"),
  status: text("status").notNull(),
  downpaymentAmount: real("downpaymentAmount"),
  time: text("time").notNull()
},

(table) => [
    check("discountCheck", sql`${table.isDiscount} in (0, 1)`),
    check("modeCheck", sql`${table.mode} in ("gcash", "cash")`),
    check("statusCheck", sql`${table.status} in ("pending", "in progress", "done")`)
]

);
