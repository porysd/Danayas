import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const DiscountsTable = sqliteTable('DISCOUNT_PROMOS', {
  discountPromoId: integer('discountPromoId').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  percentage: real('percentage').notNull(),
  typeFor: text('type', {enum: ['pwd', 'student', 'senior']}).notNull(),
});
