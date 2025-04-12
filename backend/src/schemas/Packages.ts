import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

export const PackagesTable = sqliteTable('PACKAGES', {
  packageId: integer('packageId').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: real('price').notNull(),
  description: text('description').notNull(),
  status: text('status', {enum: ['active', 'inactive', 'coming-soon', 'sold-out']}).notNull(),
  createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
  updatedAt: text('updatedAt').notNull().default(sql`(current_timestamp)`).$onUpdateFn(() => new Date().toUTCString()),
});