import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

export const PackagesTable = sqliteTable('PACKAGES', {
  packageId: integer('packageId').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  imageUrl: text('imageUrl'),
  price: real('price').notNull(),
  inclusion: text('inclusion').notNull(),
  status: text('status', {enum: ['active', 'inactive']}).notNull(),
  mode: text('mode', {enum: ['day-time', 'night-time', 'whole-day']}),
  isPromo: integer('isPromo').notNull().default(0),
  promoStart: text('promoStart'), 
  promoEnd: text('promoEnd'),
  createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
  updatedAt: text('updatedAt').notNull().default(sql`(current_timestamp)`).$onUpdateFn(() => new Date().toUTCString()),
});