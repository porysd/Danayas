import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';

export const Role = sqliteTable('ROLE', {
  roleId: integer('roleId').primaryKey({autoIncrement: true}),
  name: text('name').notNull().unique() // Admin, Staff, and Customer
});


// ZOD
// export const RoleSchema = z.object({
//   roledId: z.number().int().optional(),
//   name: z.string(),
// });