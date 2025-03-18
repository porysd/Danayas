import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";

export const Role = sqliteTable("ROLE", {
  roleId: integer("roleId").primaryKey({ autoIncrement: true }),
  name: text("name", { enum: ["admin", "staff", "customer"] }).notNull()
    .unique(), // Admin, Staff, and Customer
});

//            cols
// rows
// rows
// rows

// ZOD
// export const RoleSchema = z.object({
//   roledId: z.number().int().optional(),
//   name: z.string(),
// });
