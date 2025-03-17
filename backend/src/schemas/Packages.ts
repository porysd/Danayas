// import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
// import { sql } from 'drizzle-orm';
// import { z } from 'zod';

// export const Packages = sqliteTable('PACKAGES', {
//   packageId: integer('packageId').primaryKey({ autoIncrement: true }),
//   name: text('name').notNull(),
//   price: real('price').notNull(),
//   description: text('description').notNull(),
//   status: integer('status').notNull(),
//   createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
//   updatedAt: text('updatedAt').notNull().default(sql`(current_timestamp)`),
// });

// // ZOD
// // export const PackageSchema = z.object({
// //   packageId: z.number().int().optional(),
// //   name: z.string(),
// //   price: z.number(),
// //   description: z.string(),
// // });
