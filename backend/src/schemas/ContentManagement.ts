import { sqliteTable, integer, text, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { User } from './User';
import { z } from 'zod';

export const contentManagement = sqliteTable('CONTENT_MANAGEMENT', {
  contentId: integer('contentId').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
  title: text('title').notNull(),
  content: text('content'),
  imageUrl: text('imageUrl'),
  managedBy: integer('managedBy').references(() => User.userId).notNull(),
  updatedAt: text('updatedAt').notNull().default(sql`(current_timestamp)`),
}, 

(table) => [
  check('categoryCheck', sql`${table.category} in ('FAQ', 'Gallery', 'Landing Page', 'Terms and Conditions', 'About Us')`)
]);

// ZOD
// export const ContentManagementSchema = z.object({
//   contentId: z.number().int().optional(),
//   category: z.enum(['FAQ', 'Gallery', 'Landing Page', 'Terms and Conditions', 'About Us', 'Contact Us']),
//   title: z.string(),
//   content: z.string().optional(),
//   imageUrl: z.string().optional(),
//   managedBy: z.number().int(),
// });
