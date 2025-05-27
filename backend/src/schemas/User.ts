import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const UsersTable = sqliteTable("USER", {
  userId: integer("userId").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  contactNo: text("contactNo").notNull(),
  address: text("address").notNull(),
  dateReg: text("dateReg")
    .notNull()
    .$defaultFn(() => new Date().toUTCString()),
  status: text("status", { enum: ["active", "inactive", "disable"] })
    .notNull()
    .default("active"),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  pin: text("pin"),
  role: text("role", { enum: ["admin", "staff", "customer"] })
    .notNull()
    .default("customer"),
});
