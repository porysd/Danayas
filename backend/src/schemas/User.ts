import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("USER", {
  userId: integer("userId").primaryKey({ autoIncrement: true }),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  contactNo: text("contactNo").notNull(),
  address: text("address").notNull(),
  dateReg: text("dateReg")
    .notNull()
    .$defaultFn(() => new Date().toUTCString()),
  status: text("status", { enum: ["active", "inactive"] })
    .notNull()
    .default("active"),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "staff", "customer"] })
    .notNull()
    .default("customer"),
});


// import { sqliteTable, text, integer, check } from 'drizzle-orm/sqlite-core';
// import { sql } from 'drizzle-orm';
// import { Role } from './Roles';
// import { z } from 'zod';

// export const User = sqliteTable('USER', {
//   userId: integer('userId').primaryKey({ autoIncrement: true}),
//   firstName: text('firstName').notNull(),
//   lastName: text('lastName').notNull(),
//   contactNo: text('contactNo').notNull(),
//   address: text('address').notNull(),
//   dateReg: text('dateReg').notNull().default(sql`(current_timestamp)`),
//   status: integer('status').default(1),
//   email: text('email').unique().notNull(),
//   password: text('password').notNull(),
//   roleId: integer('roleId').references(() => Role.roleId).notNull(),
// }, 

// (table) => [
//   check('statusCheck', sql`${table.status} in (0, 1)`)
// ]);


// ZOD
// export const UserSchema = z.object({
//   userId: z.number().int().optional(),
//   firstName: z.string(),
//   lastName: z.string(),
//   contactNo: z.string(),
//   address: z.string(),
//   dateReg: z.string(),
//   email: z.string().email(),
//   password: z.string().min(6),
//   roleId: z.number().int(),
//   status: z.number().refine((val) => [0, 1].includes(val), {
//     message: 'Status must be 0 (Inactive) or 1 (Active)',
//   }),
// });