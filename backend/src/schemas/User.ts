import { sqliteTable, text, integer, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { Role } from "./Roles";

export const User = sqliteTable("user", {
  id: integer("id").primaryKey({autoIncrement: true}),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  contactNo: text("contactNo").notNull(),
  address: text("address").notNull(),
  dateReg: text("dateReg").notNull(),
  status: integer("status").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  roleId: integer("roleId").references(() => Role.id).notNull()
},

(table) => [
    check("statusCheck", sql`${table.status} in (0, 1)`)
]

);