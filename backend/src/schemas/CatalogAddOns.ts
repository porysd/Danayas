import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const CatalogAddOnsTable = sqliteTable('CATALOG_ADD_ONS', {
  catalogAddOnId: integer('CatalogAddOnId').primaryKey({ autoIncrement: true }),
  itemName: text('itemName').notNull(), // Airconditioned Room, Extra Chairs, Nipa Hut, etc.
  price: real('price').notNull(),
  status: text('status', { enum: ["active", "inactive"] }).notNull(), // active, inactive
  createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
});
